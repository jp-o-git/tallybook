import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

# Use the same imports as products.py for these
from shared_package.db_core.db_session import get_session
from .model import OrderCreate, OrderItemOut, OrderOut, StatusUpdate
from shared_package.db_core.models.products import Product
from shared_package.db_core.models.orders import Order
import logging

logger = logging.getLogger(__name__)

orders = APIRouter(prefix="/orders", tags=["orders"])

TRANSITIONS = {
    "Pending": {"Paid", "Cancelled"},
    "Paid": {"Fulfilled", "Cancelled"},
    "Fulfilled": set(),
    "Cancelled": set(),
}


def new_order_number() -> str:
    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"ORD-{day}-{uuid.uuid4().hex[:6].upper()}"


def rows_for(
    db: Session,
    order_number: str,
    lock: bool = False,
) -> list[Order]:
    stmt = (
        select(Order)
        .where(
            Order.order_number == order_number,
        )
        .options(selectinload(Order.product))
        .order_by(Order.id)
    )
    if lock:
        stmt = stmt.with_for_update()

    rows = db.scalars(stmt).all()
    if not rows:
        raise HTTPException(status_code=404, detail="Order not found.")
    return list(rows)


def to_receipt(rows: list[Order]) -> OrderOut:
    first = rows[0]
    items = [
        OrderItemOut(
            product_id=r.product_id,
            product_name=r.product.products,
            quantity=r.quantity,
            unit_price=float(r.unit_price),
            line_total=float(r.quantity * r.unit_price),
        )
        for r in rows
    ]

    total = sum(
        (r.quantity * r.unit_price for r in rows),
        Decimal("0"),
    )

    return OrderOut(
        order_number=first.order_number,
        customer_name=first.customer_name,
        status=first.order_status,
        total=float(total),
        created_at=first.created_at,
        items=items,
    )


@orders.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_session),
):
    # The 200 most recent receipts, then all of their rows
    recent = (
        select(Order.order_number)
        .group_by(Order.order_number)
        .order_by(func.max(Order.created_at).desc())
        .limit(200)
    )
    rows = db.scalars(
        select(Order)
        .where(
            Order.order_number.in_(recent),
        )
        .options(selectinload(Order.product))
        .order_by(Order.created_at.desc(), Order.order_number, Order.id)
    ).all()

    grouped: dict[str, list[Order]] = {}
    for row in rows:
        grouped.setdefault(row.order_number, []).append(row)

    return [to_receipt(group) for group in grouped.values()]


@orders.get("/{order_number}", response_model=OrderOut)
def get_order(
    order_number: str,
    db: Session = Depends(get_session),
):
    return to_receipt(rows_for(db, order_number))


@orders.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_session),
):
    # Merge repeated products into one line
    wanted: dict[uuid.UUID, int] = {}
    for line in payload.items:
        wanted[line.product_id] = wanted.get(line.product_id, 0) + line.quantity

    try:
        # Lock these product rows until we commit, so two orders can't both
        # take the last unit. Sorted by id so concurrent orders lock in the
        # same order and can't deadlock.
        products = db.scalars(
            select(Product)
            .where(
                Product.id.in_(list(wanted)),
                Product.is_deleted.is_(False),
            )
            .order_by(Product.id)
            .with_for_update()
        ).all()
        by_id = {p.id: p for p in products}

        if len(by_id) != len(wanted):
            raise HTTPException(
                status_code=404, detail="One or more products no longer exist."
            )

        short = [
            f"{by_id[pid].products}: only {by_id[pid].stocks} available, {qty} requested"
            for pid, qty in wanted.items()
            if by_id[pid].stocks < qty
        ]
        if short:
            raise HTTPException(
                status_code=409, detail="Not enough stock. " + "; ".join(short)
            )

        number = new_order_number()
        now = datetime.now(timezone.utc)

        for pid, qty in wanted.items():
            product = by_id[pid]
            db.add(
                Order(
                    order_number=number,
                    customer_name=payload.customer_name,
                    product_id=pid,
                    quantity=qty,
                    unit_price=product.price,
                    order_status="Pending",
                    created_at=now,
                )
            )
            product.stocks -= qty

        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        logger.exception("Database integrity error while creating order")

        raise HTTPException(
            status_code=409,
            detail="A database constraint failed while creating the order.",
        )

    return to_receipt(rows_for(db, number))


@orders.patch("/{order_number}/status", response_model=OrderOut)
def update_status(
    order_number: str,
    payload: StatusUpdate,
    db: Session = Depends(get_session),
):
    rows = rows_for(db, order_number, lock=True)
    current = rows[0].order_status

    if payload.status not in TRANSITIONS[current]:
        raise HTTPException(
            status_code=409,
            detail=f"A {current} order can't be changed to {payload.status}.",
        )

    if payload.status == "Cancelled":
        # Put the stock back
        ids = sorted({r.product_id for r in rows})
        locked = {
            p.id: p
            for p in db.scalars(
                select(Product)
                .where(Product.id.in_(ids))
                .order_by(Product.id)
                .with_for_update()
            )
        }
        for row in rows:
            locked[row.product_id].stocks += row.quantity

    # Every row of the receipt changes together
    for row in rows:
        row.order_status = payload.status

    db.commit()
    return to_receipt(rows_for(db, order_number))