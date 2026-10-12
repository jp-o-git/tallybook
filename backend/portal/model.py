import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    computed_field,
    field_validator,
)

ShortText = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
]
Sku = Annotated[
    str,
    StringConstraints(strip_whitespace=True, to_upper=True, min_length=1, max_length=40),
]


# ---------- Products ----------


class ProductCreate(BaseModel):
    sku: Sku
    products: ShortText
    category: ShortText
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    stocks: int = Field(default=0, ge=0)
    reorder_at: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    sku: Sku | None = None
    products: ShortText | None = None
    category: ShortText | None = None
    price: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    stocks: int | None = Field(default=None, ge=0)
    reorder_at: int | None = Field(default=None, ge=0)


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    sku: str
    products: str
    category: str
    price: float
    stocks: int
    reorder_at: int

    @field_validator("price", mode="before")
    @classmethod
    def price_to_float(cls, v):
        # Pydantic would send Decimal as a string. The frontend wants a number.
        return float(v)

    @computed_field
    @property
    def stock_status(self) -> str:
        if self.stocks == 0:
            return "Out of Stock"
        if self.stocks <= self.reorder_at:
            return "Low Stock"
        return "In Stock"


#--------- Orders ----------

OrderStatus = Literal["Pending", "Paid", "Fulfilled", "Cancelled"]


class OrderItemIn(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1)

class OrderCreate(BaseModel):
    customer_name: str
    items: list[OrderItemIn] = Field(min_length=1)
    status: Literal["Pending", "Paid"] = "Pending"

class StatusUpdate(BaseModel):
    status: Literal["Paid", "Fulfilled", "Cancelled"]


class OrderItemOut(BaseModel):
    product_id: uuid.UUID
    product_name: str
    quantity: int
    unit_price: float
    line_total: float


class OrderOut(BaseModel):
    order_number: str
    customer_name: str
    status: OrderStatus
    total: float
    created_at: datetime
    items: list[OrderItemOut]

#--------Report-------------

class RevenueComparison(BaseModel):
    previous_day: float
    change: float
    change_percent: float | None
    trend: Literal["up", "down", "unchanged"]


class TopSellingItem(BaseModel):
    product_id: uuid.UUID
    name: str
    sku: str
    units_sold: int


class StockAttentionItem(BaseModel):
    product_id: uuid.UUID
    name: str
    sku: str
    category: str
    current_stock: int
    reorder_at: int
    status: Literal["Low Stock", "Out of Stock"]


class DailySalesReport(BaseModel):
    report_type: Literal["daily_sales"]
    business_date: date
    timezone: Literal["Asia/Manila"]
    generated_at: datetime
    currency: Literal["PHP"]
    revenue: float
    revenue_comparison: RevenueComparison
    most_purchased_items: list[TopSellingItem]
    total_orders: int
    cancelled_orders: int
    fulfilled_orders: int
    ongoing_orders: int
    pending_orders: int
    paid_orders: int
    stock_attention_count: int
    stock_attention: list[StockAttentionItem]
