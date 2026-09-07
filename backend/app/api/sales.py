from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.api.stores import owned_store
from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale
from app.schemas.sale import SaleCreate, SaleOut, CheckoutRequest, CheckoutResponse

router = APIRouter(prefix="/stores/{store_id}/sales", tags=["Sales"])

def _make_sale(store_id: int, product: Product, quantity: int) -> Sale:
    qty = Decimal(quantity)
    total = product.sale_price * qty
    profit = (product.sale_price - product.cost_price) * qty
    return Sale(
        store_id=store_id,
        product_id=product.id,
        quantity=quantity,
        unit_price=product.sale_price,
        unit_cost=product.cost_price,
        total_amount=total,
        total_profit=profit,
    )

@router.post("", response_model=SaleOut)
def create_sale(store_id: int, data: SaleCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_store(store_id, db, user)
    product = db.query(Product).filter(Product.id == data.product_id, Product.store_id == store_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    if product.stock_qty < data.quantity:
        raise HTTPException(status_code=400, detail="Omborda mahsulot yetarli emas")
    sale = _make_sale(store_id, product, data.quantity)
    product.stock_qty -= data.quantity
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

@router.post("/checkout", response_model=CheckoutResponse)
def checkout(store_id: int, data: CheckoutRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_store(store_id, db, user)
    requested: dict[int, int] = {}
    for item in data.items:
        requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

    products = db.query(Product).filter(Product.store_id == store_id, Product.id.in_(requested.keys())).with_for_update().all()
    by_id = {p.id: p for p in products}
    if len(by_id) != len(requested):
        raise HTTPException(status_code=404, detail="Savatchadagi mahsulotlardan biri topilmadi")

    for product_id, quantity in requested.items():
        if by_id[product_id].stock_qty < quantity:
            raise HTTPException(status_code=400, detail=f"{by_id[product_id].name}: omborda yetarli emas")

    sales = []
    total_amount = Decimal("0")
    total_profit = Decimal("0")
    try:
        for product_id, quantity in requested.items():
            product = by_id[product_id]
            sale = _make_sale(store_id, product, quantity)
            product.stock_qty -= quantity
            db.add(sale)
            sales.append(sale)
            total_amount += sale.total_amount
            total_profit += sale.total_profit
        db.commit()
        for sale in sales:
            db.refresh(sale)
    except Exception:
        db.rollback()
        raise

    return CheckoutResponse(items_count=sum(requested.values()), total_amount=total_amount, total_profit=total_profit, sales=sales)

@router.get("", response_model=list[SaleOut])
def list_sales(store_id: int, limit: int = 100, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_store(store_id, db, user)
    limit = max(1, min(limit, 300))
    return db.query(Sale).filter(Sale.store_id == store_id).order_by(Sale.created_at.desc()).limit(limit).all()
