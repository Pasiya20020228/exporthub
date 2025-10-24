"""Product management endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import SessionDep
from ..models import Product
from ..schemas import ProductCreate, ProductRead

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=list[ProductRead])
async def list_products(session: SessionDep) -> list[Product]:
    """Return all products ordered by newest first."""

    result = await session.execute(select(Product).order_by(Product.created_at.desc()))
    return list(result.scalars().all())


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate, session: SessionDep
) -> Product:
    """Create a new product listing."""

    db_product = Product(
        name=payload.name,
        description=payload.description,
        price=payload.price,
        seller_name=payload.seller_name,
    )
    session.add(db_product)
    await session.flush()
    await session.refresh(db_product)
    return db_product


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, session: SessionDep) -> Product:
    """Retrieve a single product by its identifier."""

    result = await session.execute(
        select(Product).where(Product.id == product_id).limit(1)
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
