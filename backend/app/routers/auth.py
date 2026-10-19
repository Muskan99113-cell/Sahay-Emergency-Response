
import os
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse
from app.security import (
    SESSION_COOKIE,
    SESSION_MINUTES,
    create_session_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password,
)


router = APIRouter(prefix="/api/auth", tags=["Authentication"])

AllowedRole = Literal[
    "citizen",
    "responder",
    "hospital",
    "authority",
    "admin",
]


class AdminCreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: AllowedRole


def set_session_cookie(response: Response, user_id: int) -> None:
    token = create_session_token(user_id)

    secure_cookie = (
        os.getenv("COOKIE_SECURE", "").lower() == "true"
        or os.getenv("VERCEL") == "1"
    )

    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        max_age=SESSION_MINUTES * 60,
        path="/",
    )


def normalize_email(email: str) -> str:
    return email.strip().lower()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    email = normalize_email(str(data.email))

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Public registration is always Citizen.
    # Never accept a privileged role from public signup.
    user = User(
        name=data.name.strip(),
        email=email,
        password_hash=hash_password(data.password),
        role="citizen",
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    set_session_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserResponse)
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    email = normalize_email(str(data.email))
    user = db.query(User).filter(User.email == email).first()

    if (
        not user
        or not user.is_active
        or not verify_password(data.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    set_session_cookie(response, user.id)
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=(
            os.getenv("COOKIE_SECURE", "").lower() == "true"
            or os.getenv("VERCEL") == "1"
        ),
        samesite="lax",
    )
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.post(
    "/admin/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_role_user(
    data: AdminCreateUserRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("admin")),
):
    """Create an account with a role, available only to an authenticated Admin."""
    email = normalize_email(str(data.email))

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=data.name.strip(),
        email=email,
        password_hash=hash_password(data.password),
        role=data.role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
