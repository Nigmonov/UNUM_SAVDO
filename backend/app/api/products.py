from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.api.stores import owned_store
from app.models.user import User
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/stores/{store_id}/products", tags=["Products"])

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(store_id: int, data: ProductCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_store(store_id, db, user)
    if data.barcode:
        exists = db.query(Product).filter(Product.store_id == store_id, Product.barcode == data.barcode).first()
        if exists:
            raise HTTPException(status_code=409, detail="Bu barcode bilan mahsulot mavjud")
    product = Product(store_id=store_id, **data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("", response_model=list[ProductOut])
def list_products(
    store_id: int,
    q: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    owned_store(store_id, db, user)
    query = db.query(Product).filter(Product.store_id == store_id)
    if q:
        needle = f"%{q.strip()}%"
        query = query.filter(or_(Product.name.ilike(needle), Product.barcode.ilike(needle)))
    return query.order_by(Product.name).limit(300).all()

@router.get("/barcode/{barcode}", response_model=ProductOut)
def product_by_barcode(store_id: int, barcode: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_store(store_id, db, user)
    product = db.query(Product).filter(Product.store_id == store_id, Product.barcode == barcode).first()
    if not product:
        raise HTTPException(status_code=404, detail="Barcode bo'yicha mahsulot topilmadi")
    return product

@router.patch("/{product_id}", response_model=ProductOut)
def update_product(store_id: int, product_id: int, data: ProductUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_store(store_id, db, user)
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    patch = data.model_dump(exclude_unset=True)
    if patch.get("barcode"):
        exists = db.query(Product).filter(Product.store_id == store_id, Product.barcode == patch["barcode"], Product.id != product_id).first()
        if exists:
            raise HTTPException(status_code=409, detail="Bu barcode boshqa mahsulotga tegishli")
    for key, value in patch.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(store_id: int, product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_store(store_id, db, user)
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    db.delete(product)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="Bu mahsulotda savdo tarixi bor. O'chirish o'rniga qoldiring.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
