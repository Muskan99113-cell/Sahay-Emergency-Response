
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()

        if "@" not in value:
            raise ValueError("Enter a valid email address")

        local_part, domain = value.rsplit("@", 1)

        if not local_part or not domain or "." not in domain:
            raise ValueError("Enter a valid email address")

        return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_login_email(cls, value: str) -> str:
        value = value.strip().lower()

        if "@" not in value:
            raise ValueError("Enter a valid email address")

        local_part, domain = value.rsplit("@", 1)

        if not local_part or not domain or "." not in domain:
            raise ValueError("Enter a valid email address")

        return value


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: Literal["citizen", "responder", "hospital", "authority", "admin"]
    is_active: bool
    created_at: datetime | None = None
