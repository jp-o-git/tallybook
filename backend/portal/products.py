from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from shared_package.db_core.db_session import get_session
from shared_package.db_core.models.products import Product
from .model import ProductCreate, ProductOut, ProductUpdate

products = APIRouter(prefix="/products")

@products.get("", response_model=list[ProductOut])
def list_products(search: str = "", category: str = "", db: Session = Depends(get_session)):
    stmt = select(Product)

    q = search.strip()
    if q:
        term = f"%{q}%"
        stmt = stmt.where(or_(Product.products.ilike(term), Product.sku.ilike(term)))
    if category:
        stmt = stmt.where(Product.category.ilike(category))

    return db.scalars(stmt.order_by(Product.products)).all()


@products.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_session)):
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
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This SKU already exists.",
        )

    db.refresh(product)
    return product

@products.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_session),
):
    product = db.get(Product, product_id)

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
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This SKU already exists.",
        )

    db.refresh(product)
    return product