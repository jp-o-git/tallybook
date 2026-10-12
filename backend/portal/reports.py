from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from shared_package.db_core.db_session import get_session
from shared_package.db_core.models.orders import Order
from shared_package.db_core.models.products import Product
from .model import (
    DailySalesReport,
    RevenueComparison,
    StockAttentionItem,
    TopSellingItem,
)

reports = APIRouter(prefix="/reports", tags=["reports"])

BUSINESS_TIMEZONE = timezone(timedelta(hours=8), name="Asia/Manila")
SETTLED_STATUSES = ("Paid", "Fulfilled")


def business_day_bounds(day: date) -> tuple[datetime, datetime]:
    start = datetime.combine(day, time.min, tzinfo=BUSINESS_TIMEZONE)
    return start, start + timedelta(days=1)


def revenue_comparison(
    revenue_today: Decimal, revenue_yesterday: Decimal
) -> RevenueComparison:
    change = revenue_today - revenue_yesterday

    if change > 0:
        trend = "up"
    elif change < 0:
        trend = "down"
    else:
        trend = "unchanged"

    change_percent = (
        None
        if revenue_yesterday == 0 and change != 0
        else (
            0.0
            if revenue_yesterday == 0
            else round(float(change / revenue_yesterday * 100), 2)
        )
    )

    return RevenueComparison(
        previous_day=float(revenue_yesterday),
        change=float(change),
        change_percent=change_percent,
        trend=trend,
    )


@reports.get(
    "/daily-sales",
    response_model=DailySalesReport,
    summary="Get the daily sales report for n8n",
)
def daily_sales_report(
    db: Session = Depends(get_session),
) -> DailySalesReport:
    now = datetime.now(BUSINESS_TIMEZONE)
    today = now.date()
    today_start, tomorrow_start = business_day_bounds(today)
    yesterday_start, _ = business_day_bounds(today - timedelta(days=1))

    status_counts = db.execute(
        select(
            Order.order_status,
            func.count(func.distinct(Order.order_number)),
        )
        .where(
            Order.created_at >= today_start,
            Order.created_at < tomorrow_start,
        )
        .group_by(Order.order_status)
    ).all()
    counts_by_status = {status: count for status, count in status_counts}

    line_total = Order.quantity * Order.unit_price
    revenue_row = db.execute(
        select(
            func.coalesce(
                func.sum(
                    case(
                        (Order.created_at < today_start, line_total),
                        else_=Decimal("0"),
                    )
                ),
                Decimal("0"),
            ),
            func.coalesce(
                func.sum(
                    case(
                        (Order.created_at >= today_start, line_total),
                        else_=Decimal("0"),
                    )
                ),
                Decimal("0"),
            ),
        ).where(
            Order.created_at >= yesterday_start,
            Order.created_at < tomorrow_start,
            Order.order_status.in_(SETTLED_STATUSES),
        )
    ).one()
    revenue_yesterday = Decimal(str(revenue_row[0] or 0))
    revenue_today = Decimal(str(revenue_row[1] or 0))

    top_item_rows = db.execute(
        select(
            Product.id,
            Product.products,
            Product.sku,
            func.sum(Order.quantity).label("units_sold"),
        )
        .join(Order, Order.product_id == Product.id)
        .where(
            Order.created_at >= today_start,
            Order.created_at < tomorrow_start,
            Order.order_status != "Cancelled",
        )
        .group_by(Product.id, Product.products, Product.sku)
        .order_by(func.sum(Order.quantity).desc(), Product.products, Product.id)
    ).all()
    most_purchased_items: list[TopSellingItem] = []
    if top_item_rows:
        highest_units_sold = top_item_rows[0].units_sold
        most_purchased_items = [
            TopSellingItem(
                product_id=row.id,
                name=row.products,
                sku=row.sku,
                units_sold=row.units_sold,
            )
            for row in top_item_rows
            if row.units_sold == highest_units_sold
        ]

    low_stock_products = db.scalars(
        select(Product)
        .where(
            Product.is_deleted.is_(False),
            Product.stocks <= Product.reorder_at,
        )
        .order_by(Product.stocks, Product.products)
    ).all()
    stock_attention = [
        StockAttentionItem(
            product_id=product.id,
            name=product.products,
            sku=product.sku,
            category=product.category,
            current_stock=product.stocks,
            reorder_at=product.reorder_at,
            status="Out of Stock" if product.stocks == 0 else "Low Stock",
        )
        for product in low_stock_products
    ]

    cancelled_orders = counts_by_status.get("Cancelled", 0)
    fulfilled_orders = counts_by_status.get("Fulfilled", 0)
    pending_orders = counts_by_status.get("Pending", 0)
    paid_orders = counts_by_status.get("Paid", 0)

    return DailySalesReport(
        report_type="daily_sales",
        business_date=today,
        timezone="Asia/Manila",
        generated_at=now,
        currency="PHP",
        revenue=float(revenue_today),
        revenue_comparison=revenue_comparison(
            revenue_today, revenue_yesterday
        ),
        most_purchased_items=most_purchased_items,
        total_orders=sum(counts_by_status.values()),
        cancelled_orders=cancelled_orders,
        fulfilled_orders=fulfilled_orders,
        ongoing_orders=pending_orders + paid_orders,
        pending_orders=pending_orders,
        paid_orders=paid_orders,
        stock_attention_count=len(stock_attention),
        stock_attention=stock_attention,
    )
