from datetime import datetime

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True
    )

    slug: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True
    )

    parent_id: Mapped[int | None] = mapped_column(
        nullable=True,
        index=True
    )

    image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    products = relationship(
        "Product",
        back_populates="category"
    )
