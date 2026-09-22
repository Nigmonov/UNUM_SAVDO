from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.store import Store
from app.schemas.store import StoreCreate, StoreOut

router = APIRouter(prefix="/stores", tags=["Stores"])


@router.post("", response_model=StoreOut)
def create_store(
    data: StoreCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing_store = (
        db.query(Store)
        .filter(Store.owner_id == user.id)
        .first()
    )

    if existing_store:
        raise HTTPException(
            status_code=409,
            detail="Sizda allaqachon do'kon mavjud"
        )

    store = Store(
        name=data.name,
        category=data.category,
        address=data.address,
        owner_id=user.id,
    )

    db.add(store)
    db.commit()
    db.refresh(store)

    return store


@router.get("/me", response_model=StoreOut)
def my_store(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    store = (
        db.query(Store)
        .filter(Store.owner_id == user.id)
        .first()
    )

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Do'kon hali yaratilmagan"
        )

    return store


@router.get("", response_model=list[StoreOut])
def my_stores(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Store)
        .filter(Store.owner_id == user.id)
        .order_by(Store.id.desc())
        .all()
    )


def owned_store(
    store_id: int,
    db: Session,
    user: User,
) -> Store:
    store = (
        db.query(Store)
        .filter(
            Store.id == store_id,
            Store.owner_id == user.id,
        )
        .first()
    )

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Do'kon topilmadi"
        )

    return store