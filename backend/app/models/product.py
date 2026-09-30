from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Numeric,
    Integer,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    store_id: Mapped[int] = mapped_column(
        ForeignKey(
            "stores.id",
            ondelete="CASCADE"
        ),
        index=True
    )

    category_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "categories.id",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    name: Mapped[str] = mapped_column(
        String(180),
        index=True
    )

    barcode: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
        index=True
    )

    # Mahsulot rasmi
    image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    cost_price: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        default=0
    )

    sale_price: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        default=0
    )

    stock_qty: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    min_stock_qty: Mapped[int] = mapped_column(
        Integer,
        default=5
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    store = relationship(
        "Store",
        back_populates="products"
    )

    category = relationship(
        "Category",
        back_populates="products"
    )