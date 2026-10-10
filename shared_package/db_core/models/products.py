import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Text,
    Numeric,
    DateTime,
    Integer,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from shared_package.db_core.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    sku = Column(Text, nullable=False, unique=True)
    products = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stocks = Column(Integer, nullable=False, default=0)
    reorder_at = Column(Integer, nullable=False, default=0)

    stock_status = Column(
        Text,
        nullable=False,
        default="Out of Stock",
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    orders = relationship(
        "Order",
        back_populates="product",
    )