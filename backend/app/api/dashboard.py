from datetime import datetime, time
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.api.stores import owned_store
from app.models.user import User
from app.models.product import Product
from app.models.sale import Sale

router = APIRouter(prefix="/stores/{store_id}/dashboard", tags=["Dashboard"])

@router.get("")
def dashboard(store_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    store = owned_store(store_id, db, user)
    start = datetime.combine(datetime.now().date(), time.min)
    totals = db.query(
        func.coalesce(func.sum(Sale.total_amount), 0),
        func.coalesce(func.sum(Sale.total_profit), 0),
        func.count(Sale.id),
    ).filter(Sale.store_id == store_id, Sale.created_at >= start).one()

    low_stock = db.query(Product).filter(
        Product.store_id == store_id,
        Product.stock_qty <= Product.min_stock_qty,
    ).order_by(Product.stock_qty.asc()).limit(8).all()

    return {
        "store": store.name,
        "today_sales": float(totals[0]),
        "today_profit": float(totals[1]),
        "transactions": int(totals[2]),
        "low_stock": [{"id": p.id, "name": p.name, "stock_qty": p.stock_qty} for p in low_stock],
        "insight": "UNUM ma'lumot to'plagan sari savdo va zaxira bo'yicha aniq tavsiyalar shu yerda chiqadi.",
    }
