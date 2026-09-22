import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.store import Store
from app.models.user import User

router = APIRouter(
    prefix="/agent",
    tags=["Agent"],
)


# -------------------------
# Pairing code vaqtinchalik
# -------------------------

_pairing_codes = {}


class PairRequest(BaseModel):
    store_id: int


class PairConfirmRequest(BaseModel):
    code: str
    device_id: str
    agent_name: str = "UNUM Agent"


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# -------------------------
# Pairing code yaratish
# -------------------------

@router.post("/pair/start")
def start_pairing(
    data: PairRequest,
    db: Session = Depends(get_db),
):
    store = db.query(Store).filter(
        Store.id == data.store_id
    ).first()

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Do‘kon topilmadi",
        )

    code = f"{secrets.randbelow(1_000_000):06d}"

    _pairing_codes[code] = {
        "store_id": store.id,
        "expires_at": datetime.utcnow() + timedelta(minutes=5),
    }

    return {
        "success": True,
        "code": code,
        "expires_in": 300,
    }


# -------------------------
# Agent pairing tasdiqlash
# -------------------------

@router.post("/pair/confirm")
def confirm_pairing(
    data: PairConfirmRequest,
    db: Session = Depends(get_db),
):
    pairing = _pairing_codes.get(data.code)

    if not pairing:
        raise HTTPException(
            status_code=400,
            detail="Pairing kodi noto‘g‘ri yoki mavjud emas",
        )

    if datetime.utcnow() > pairing["expires_at"]:
        del _pairing_codes[data.code]

        raise HTTPException(
            status_code=400,
            detail="Pairing kodi muddati tugagan",
        )

    store_id = pairing["store_id"]

    # Eski Agent shu device_id bilan mavjudmi?
    agent = db.query(Agent).filter(
        Agent.device_id == data.device_id
    ).first()

    token = secrets.token_urlsafe(32)

    if agent:
        agent.store_id = store_id
        agent.name = data.agent_name
        agent.token_hash = hash_token(token)
        agent.is_active = True
        agent.last_seen = datetime.utcnow()

    else:
        agent = Agent(
            store_id=store_id,
            device_id=data.device_id,
            name=data.agent_name,
            token_hash=hash_token(token),
            is_active=True,
            last_seen=datetime.utcnow(),
        )

        db.add(agent)

    db.commit()
    db.refresh(agent)

    # Kodni bir marta ishlatiladigan qilamiz
    del _pairing_codes[data.code]

    return {
        "success": True,
        "message": "UNUM Agent muvaffaqiyatli bog‘landi",
        "agent_id": agent.id,
        "store_id": agent.store_id,
        "token": token,
    }


# -------------------------
# Agent status
# -------------------------

@router.get("/status/{store_id}")
def agent_status(
    store_id: int,
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(
        Agent.store_id == store_id,
        Agent.is_active == True,
    ).first()

    if not agent:
        return {
            "connected": False,
            "status": "offline",
        }

    online = False

    if agent.last_seen:
        online = (
            datetime.utcnow() - agent.last_seen
        ).total_seconds() < 60


    return {
        "connected": True,
        "status": "online" if online else "offline",
        "agent_id": agent.id,
        "agent_name": agent.name,
        "last_seen": (
            agent.last_seen.isoformat()
            if agent.last_seen
            else None
        ),
    }