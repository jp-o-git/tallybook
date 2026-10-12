import uuid
from datetime import timezone, datetime

from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from shared_package.db_core.db_session import get_session
from shared_package.db_core.models.products import Product
from .model import ProductCreate, ProductOut, ProductUpdate

products = APIRouter(prefix="/products")

def active_product(db: Session, product_id: uuid.UUID) -> Product:
    product = db.scalar(
        select(Product).where(
            Product.id == product_id,
            Product.is_deleted.is_(False),
        )
    )
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product

def sku_conflict(err: IntegrityError) -> HTTPException:
    # Only blame the SKU when the SKU index is what failed
    if "uq_products_sku_active" in str(err.orig):
        return HTTPException(status_code=409, detail="This SKU already exists.")
    return HTTPException(status_code=409, detail="Could not save the product.")

@products.get("", response_model=list[ProductOut])
def list_products(
    search: str = "",
    category: str = "",
    db: Session = Depends(get_session),
):
    stmt = select(Product).where(
        Product.is_deleted.is_(False),
    )

    q = search.strip()
    if q:
        term = f"%{q}%"
        stmt = stmt.where(
            or_(
                Product.products.ilike(term),
                Product.sku.ilike(term),
            )
        )

    if category:
        stmt = stmt.where(Product.category.ilike(category))

    return db.scalars(stmt.order_by(Product.products)).all()

@products.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_session),
):
    product_data = payload.model_dump()

    if product_data["stocks"] == 0:
        product_data["stock_status"] = "Out of Stock"
    elif product_data["stocks"] <= product_data["reorder_at"]:
        product_data["stock_status"] = "Low Stock"
    else:
        product_data["stock_status"] = "In Stock"

    product = Product(**product_data)
    db.add(product)

    try:
        db.commit()
    except IntegrityError as err:
        db.rollback()
        raise sku_conflict(err)

    db.refresh(product)
    return product

@products.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdate,
    db: Session = Depends(get_session),
):
    product = active_product(db, product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(product, field, value)

    # Update stock status after editing the quantity or reorder threshold.
    if product.stocks == 0:
        product.stock_status = "Out of Stock"
    elif product.stocks <= product.reorder_at:
        product.stock_status = "Low Stock"
    else:
        product.stock_status = "In Stock"

    try:
        db.commit()
    except IntegrityError as err:
        db.rollback()
        raise sku_conflict(err)

    db.refresh(product)
    return product

@products.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_session),
):
    product = active_product(db, product_id)

    # Archive, don't remove. Past orders still point at this row.
    product.is_deleted = True
    product.deleted_at = datetime.now(timezone.utc)

    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)