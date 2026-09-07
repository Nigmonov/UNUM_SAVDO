from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class SaleCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)

class SaleOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    total_amount: Decimal
    total_profit: Decimal
    created_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class CheckoutItem(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)

class CheckoutRequest(BaseModel):
    items: list[CheckoutItem] = Field(min_length=1)

class CheckoutResponse(BaseModel):
    items_count: int
    total_amount: Decimal
    total_profit: Decimal
    sales: list[SaleOut]
