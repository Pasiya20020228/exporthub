"""Pydantic schemas for the ExportHub commerce APIs."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., max_length=120)
    description: str = Field(..., max_length=10_000)
    price: Decimal = Field(..., ge=0)
    seller_name: str = Field(..., max_length=80)


class ProductCreate(ProductBase):
    """Payload for creating a new product listing."""


class ProductRead(ProductBase):
    """API representation of a product."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: str})


class OrderBase(BaseModel):
    buyer_name: str = Field(..., max_length=80)
    quantity: int = Field(..., gt=0)


class OrderCreate(OrderBase):
    """Payload for placing an order."""

    product_id: int


class OrderRead(OrderBase):
    """API representation of an order."""

    id: int
    product_id: int
    total_price: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: str})


__all__ = [
    "OrderCreate",
    "OrderRead",
    "ProductCreate",
    "ProductRead",
]
