import uuid
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Sku = Annotated[
    str,
    StringConstraints(strip_whitespace=True, to_upper=True, min_length=1, max_length=40),
]


class ProductCreate(BaseModel):
    sku: Sku
    products: Text
    category: Text
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    stocks: int = Field(default=0, ge=0)
    reorder_at: int = Field(default=0, ge=0)


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    sku: str
    products: str
    category: str
    price: float
    stocks: int
    reorder_at: int
    stock_status: str

    @field_validator("price", mode="before")
    @classmethod
    def price_to_float(cls, v):
        # Pydantic would send Decimal as a string. The frontend wants a number.
        return float(v)

class ProductUpdate(BaseModel):
    sku: str | None = None
    products: str | None = None
    category: str | None = None
    price: float | None = Field(default=None, gt=0)
    stocks: int | None = Field(default=None, ge=0)
    reorder_at: int | None = Field(default=None, ge=0)