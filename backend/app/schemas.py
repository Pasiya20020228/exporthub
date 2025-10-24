
"""Pydantic schemas for the ExportHub commerce APIs."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


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


class ProductUpdate(BaseModel):
    """Partial payload for updating an existing product."""

    name: str | None = Field(None, max_length=120)
    description: str | None = Field(None, max_length=10_000)
    price: Decimal | None = Field(None, ge=0)
    seller_name: str | None = Field(None, max_length=80)


class OrderBase(BaseModel):
    quantity: int = Field(..., gt=0)


class OrderCreate(OrderBase):
    """Payload for placing an order."""

    product_id: int


class OrderRead(OrderBase):
    """API representation of an order."""

    id: int
    product_id: int
    user_id: int
    buyer_name: str
    total_price: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: str})


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., max_length=120)


class UserCreate(UserBase):
    """Payload for registering a new user account."""

    password: str = Field(..., min_length=8, max_length=128)
    role: Literal["buyer", "seller", "admin"] = "buyer"


class UserRead(UserBase):
    """Public representation of a user account."""

    id: int
    role: Literal["buyer", "seller", "admin"]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    """Credentials required to sign into the platform."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginResponse(BaseModel):
    """Authentication payload returned after a successful login."""

    token: str
    user: UserRead


__all__ = [
    "LoginRequest",
    "LoginResponse",
    "OrderCreate",
    "OrderRead",
    "ProductCreate",
    "ProductRead",
    "ProductUpdate",
    "UserCreate",
    "UserRead",
]
