import hashlib
import hmac
import json
import secrets
import time
from urllib.parse import parse_qsl

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

TELEGRAM_INIT_DATA_MAX_AGE = 3600


class TelegramMiniAppRequest(BaseModel):
    init_data: str


def verify_telegram_init_data(init_data: str) -> dict:
    """
    Telegram Mini App initData ni tekshiradi.
    Tekshiruv muvaffaqiyatli bo'lsa Telegram user ma'lumotini qaytaradi.
    """

    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="TELEGRAM_BOT_TOKEN sozlanmagan",
        )

    if not init_data:
        raise HTTPException(
            status_code=400,
            detail="Telegram initData yuborilmadi",
        )

    try:
        parsed_data = dict(parse_qsl(init_data, keep_blank_values=True))
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Telegram initData noto'g'ri formatda",
        ) from exc

    received_hash = parsed_data.pop("hash", None)

    if not received_hash:
        raise HTTPException(
            status_code=401,
            detail="Telegram hash topilmadi",
        )

    data_check_string = "\n".join(
        f"{key}={value}"
        for key, value in sorted(parsed_data.items())
    )

    secret_key = hmac.new(
        key=b"WebAppData",
        msg=settings.TELEGRAM_BOT_TOKEN.encode(),
        digestmod=hashlib.sha256,
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise HTTPException(
            status_code=401,
            detail="Telegram imzosi tasdiqlanmadi",
        )

    auth_date = parsed_data.get("auth_date")

    if not auth_date:
        raise HTTPException(
            status_code=401,
            detail="Telegram auth_date topilmadi",
        )

    try:
        auth_timestamp = int(auth_date)
    except ValueError as exc:
        raise HTTPException(
            status_code=401,
            detail="Telegram auth_date noto'g'ri",
        ) from exc

    current_time = int(time.time())

    if current_time - auth_timestamp > TELEGRAM_INIT_DATA_MAX_AGE:
        raise HTTPException(
            status_code=401,
            detail="Telegram login ma'lumoti eskirgan",
        )

    user_raw = parsed_data.get("user")

    if not user_raw:
        raise HTTPException(
            status_code=401,
            detail="Telegram foydalanuvchi ma'lumoti topilmadi",
        )

    try:
        telegram_user = json.loads(user_raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail="Telegram user ma'lumoti noto'g'ri",
        ) from exc

    if not telegram_user.get("id"):
        raise HTTPException(
            status_code=401,
            detail="Telegram foydalanuvchi ID topilmadi",
        )

    return telegram_user


# ---------------------------------------------------------
# Eski email register
# ---------------------------------------------------------

@router.post("/register", response_model=TokenResponse)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Bu email allaqachon ro'yxatdan o'tgan",
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))

    return TokenResponse(access_token=token)


# ---------------------------------------------------------
# Eski email login
# ---------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email yoki parol noto'g'ri",
        )

    if not verify_password(
        data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Email yoki parol noto'g'ri",
        )

    token = create_access_token(str(user.id))

    return TokenResponse(access_token=token)


# ---------------------------------------------------------
# Lokal development login
# ---------------------------------------------------------

@router.post("/dev-login", response_model=TokenResponse)
def dev_login(
    db: Session = Depends(get_db),
):
    if not settings.DEV_MODE:
        raise HTTPException(
            status_code=404,
            detail="Test login o'chirilgan",
        )

    internal_email = "dev@unum.local"

    user = (
        db.query(User)
        .filter(User.email == internal_email)
        .first()
    )

    if not user:
        user = User(
            full_name="UNUM Test User",
            email=internal_email,
            hashed_password=hash_password(
                secrets.token_urlsafe(32)
            ),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(str(user.id))

    return TokenResponse(access_token=token)


# ---------------------------------------------------------
# TELEGRAM MINI APP LOGIN
# ---------------------------------------------------------

@router.post(
    "/telegram-miniapp",
    response_model=TokenResponse,
)
def telegram_miniapp_login(
    data: TelegramMiniAppRequest,
    db: Session = Depends(get_db),
):
    telegram_user = verify_telegram_init_data(
        data.init_data
    )

    telegram_id = str(
        telegram_user["id"]
    )

    internal_email = (
        f"telegram_{telegram_id}"
        "@telegram.unum.local"
    )

    user = (
        db.query(User)
        .filter(User.email == internal_email)
        .first()
    )

    if not user:
        first_name = (
            telegram_user.get("first_name")
            or ""
        )

        last_name = (
            telegram_user.get("last_name")
            or ""
        )

        username = (
            telegram_user.get("username")
            or ""
        )

        full_name = (
            f"{first_name} {last_name}".strip()
            or username
            or "Telegram foydalanuvchi"
        )

        user = User(
            full_name=full_name[:120],
            email=internal_email,
            hashed_password=hash_password("dev_password_123")


        )

        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(
        str(user.id)
    )

    return TokenResponse(
        access_token=token
    )