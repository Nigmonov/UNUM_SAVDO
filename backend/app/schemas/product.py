from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    barcode: str | None = None
    cost_price: Decimal = Field(ge=0)
    sale_price: Decimal = Field(ge=0)
    stock_qty: int = Field(ge=0)
    min_stock_qty: int = Field(default=5, ge=0)

class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=180)
    barcode: str | None = None
    cost_price: Decimal | None = Field(default=None, ge=0)
    sale_price: Decimal | None = Field(default=None, ge=0)
    stock_qty: int | None = Field(default=None, ge=0)
    min_stock_qty: int | None = Field(default=None, ge=0)

class ProductOut(ProductCreate):
    id: int
    store_id: int
    model_config = ConfigDict(from_attributes=True)
