import base64
import hashlib
import hmac
import json
import secrets
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

TELEGRAM_AUTH_URL = "https://oauth.telegram.org/auth"
TELEGRAM_TOKEN_URL = "https://oauth.telegram.org/token"
TELEGRAM_JWKS_URL = "https://oauth.telegram.org/.well-known/jwks.json"
STATE_MAX_AGE_SECONDS = 600


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _signed_state(verifier: str, nonce: str) -> str:
    payload = {
        "v": verifier,
        "n": nonce,
        "ts": int(time.time()),
    }
    raw = _b64url(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(settings.SECRET_KEY.encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{sig}"


def _read_state(state: str) -> dict:
    try:
        raw, sig = state.rsplit(".", 1)
        expected = hmac.new(settings.SECRET_KEY.encode(), raw.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            raise ValueError("bad signature")
        padding = "=" * (-len(raw) % 4)
        payload = json.loads(base64.urlsafe_b64decode(raw + padding))
        if int(time.time()) - int(payload["ts"]) > STATE_MAX_AGE_SECONDS:
            raise ValueError("expired")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Telegram login holati yaroqsiz yoki eskirgan") from exc


def _post_form(url: str, data: dict, basic_auth: tuple[str, str] | None = None) -> dict:
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    if basic_auth:
        raw = f"{basic_auth[0]}:{basic_auth[1]}".encode()
        headers["Authorization"] = "Basic " + base64.b64encode(raw).decode()
    req = Request(url, data=urlencode(data).encode(), headers=headers, method="POST")
    try:
        with urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode())
    except HTTPError as exc:
        detail = exc.read().decode(errors="ignore")
        raise HTTPException(status_code=502, detail=f"Telegram token xatosi: {detail[:300]}") from exc
    except URLError as exc:
        raise HTTPException(status_code=502, detail="Telegram serveriga ulanib bo'lmadi") from exc


def _get_json(url: str) -> dict:
    try:
        with urlopen(url, timeout=15) as response:
            return json.loads(response.read().decode())
    except (HTTPError, URLError) as exc:
        raise HTTPException(status_code=502, detail="Telegram kalitlarini olib bo'lmadi") from exc


def _verify_telegram_id_token(id_token: str, nonce: str) -> dict:
    try:
        header = jwt.get_unverified_header(id_token)
        kid = header.get("kid")
        jwks = _get_json(TELEGRAM_JWKS_URL)
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
        if not key:
            raise HTTPException(status_code=401, detail="Telegram imzo kaliti topilmadi")
        claims = jwt.decode(
            id_token,
            key,
            algorithms=["RS256"],
            audience=str(settings.TELEGRAM_CLIENT_ID),
            issuer="https://oauth.telegram.org",
        )
        token_nonce = claims.get("nonce")
        if token_nonce and token_nonce != nonce:
            raise HTTPException(status_code=401, detail="Telegram nonce mos kelmadi")
        return claims
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Telegram ID token tasdiqlanmadi") from exc


# Eski email login endpointlarini hozircha saqlaymiz: mavjud akkauntlar buzilmaydi.
@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=409, detail="Bu email allaqachon ro'yxatdan o'tgan")
    user = User(full_name=data.full_name, email=data.email, hashed_password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/dev-login", response_model=TokenResponse)
def dev_login(db: Session = Depends(get_db)):
    if not settings.DEV_MODE:
        raise HTTPException(status_code=404, detail="Test login o'chirilgan")
    internal_email = "dev@unum.local"
    user = db.query(User).filter(User.email == internal_email).first()
    if not user:
        user = User(
            full_name="UNUM Test User",
            email=internal_email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.get("/telegram/start")
def telegram_start():
    if not settings.TELEGRAM_CLIENT_ID or not settings.TELEGRAM_CLIENT_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Telegram Web Login hali sozlanmagan. .env ichiga TELEGRAM_CLIENT_ID va TELEGRAM_CLIENT_SECRET qo'shing.",
        )

    verifier = _b64url(secrets.token_bytes(48))
    challenge = _b64url(hashlib.sha256(verifier.encode()).digest())
    nonce = _b64url(secrets.token_bytes(24))
    state = _signed_state(verifier, nonce)

    query = urlencode({
        "client_id": settings.TELEGRAM_CLIENT_ID,
        "redirect_uri": settings.TELEGRAM_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid profile",
        "state": state,
        "nonce": nonce,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    })
    return {"auth_url": f"{TELEGRAM_AUTH_URL}?{query}"}


@router.get("/telegram/callback")
def telegram_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    payload = _read_state(state)

    tokens = _post_form(
        TELEGRAM_TOKEN_URL,
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.TELEGRAM_REDIRECT_URI,
            "client_id": settings.TELEGRAM_CLIENT_ID,
            "code_verifier": payload["v"],
        },
        basic_auth=(str(settings.TELEGRAM_CLIENT_ID), settings.TELEGRAM_CLIENT_SECRET),
    )

    id_token = tokens.get("id_token")
    if not id_token:
        raise HTTPException(status_code=401, detail="Telegram ID token qaytarmadi")

    claims = _verify_telegram_id_token(id_token, payload["n"])
    telegram_sub = str(claims.get("sub") or "").strip()
    if not telegram_sub:
        raise HTTPException(status_code=401, detail="Telegram foydalanuvchi ID topilmadi")

    # DB migratsiyasiz ishlashi uchun Telegram identifikatori ichki, ko'rinmaydigan email kalitiga aylanadi.
    internal_email = f"telegram_{telegram_sub}@telegram.unum.local"
    user = db.query(User).filter(User.email == internal_email).first()

    if not user:
        full_name = (
            claims.get("name")
            or " ".join(filter(None, [claims.get("given_name"), claims.get("family_name")]))
            or claims.get("preferred_username")
            or "Telegram foydalanuvchi"
        )
        user = User(
            full_name=str(full_name)[:120],
            email=internal_email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    app_token = create_access_token(str(user.id))
    frontend_callback = f"{settings.FRONTEND_ORIGIN.rstrip('/')}/auth/telegram/callback?token={app_token}"
    return RedirectResponse(frontend_callback, status_code=302)
