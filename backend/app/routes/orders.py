"""Order management endpoints."""

from __future__ import annotations

from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from ..dependencies import SessionDep, UserDep, get_optional_user
from ..models import Order, Product, User
from ..schemas import OrderCreate, OrderRead

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=list[OrderRead])
async def list_orders(
    session: SessionDep,
    current_user: Optional[User] = Depends(get_optional_user),
) -> list[Order]:
    """Return all orders ordered by newest first."""

    query = select(Order).order_by(Order.created_at.desc())
    if current_user and current_user.role != "admin":
        query = query.where(Order.user_id == current_user.id)

    result = await session.execute(query)
    return list(result.scalars().all())


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate, session: SessionDep, current_user: UserDep
) -> Order:
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
        user_id=current_user.id,
        buyer_name=current_user.full_name,
        quantity=payload.quantity,
        total_price=total_price,
    )
    session.add(db_order)
    await session.flush()
    await session.refresh(db_order)
    return db_order
