from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class StoreCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = "Oziq-ovqat"
    address: str | None = None

class StoreOut(BaseModel):
    id: int
    name: str
    category: str
    address: str | None
    trial_ends_at: datetime
    model_config = ConfigDict(from_attributes=True)
