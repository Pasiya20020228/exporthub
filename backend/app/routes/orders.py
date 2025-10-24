"""Order management endpoints."""

from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import SessionDep
from ..models import Order, Product
from ..schemas import OrderCreate, OrderRead

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=list[OrderRead])
async def list_orders(session: SessionDep) -> list[Order]:
    """Return all orders ordered by newest first."""

    result = await session.execute(select(Order).order_by(Order.created_at.desc()))
    return list(result.scalars().all())


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreate, session: SessionDep) -> Order:
    """Place a new order for a product."""

    product_result = await session.execute(
        select(Product).where(Product.id == payload.product_id).limit(1)
    )
    product = product_result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    total_price = (product.price or Decimal("0")) * payload.quantity

    db_order = Order(
        product_id=product.id,
        buyer_name=payload.buyer_name,
        quantity=payload.quantity,
        total_price=total_price,
    )
    session.add(db_order)
    await session.flush()
    await session.refresh(db_order)
    return db_order
