import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Text,
    Numeric,
    DateTime,
    Integer,
    Boolean,
    Index,
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
    sku = Column(Text, nullable=False, unique=False)
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

    is_deleted = Column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    deleted_at = Column(DateTime(timezone=True), nullable=True)

    orders = relationship(
        "Order",
        back_populates="product",
    )

    __table_args__ = (
        Index(
            "uq_products_sku_active",
            "sku",
            unique=True,
            postgresql_where="is_deleted = false",
        ),
    )