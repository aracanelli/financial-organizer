from typing import Optional
from pydantic import BaseModel

class CardBase(BaseModel):
    card_number: str
    card_type: str
    last_four: str
    expiry_date: str
    plaid_item_id: Optional[str] = None

class CardCreate(CardBase):
    pass

class CardUpdate(CardBase):
    pass

class CardInDBBase(CardBase):
    id: Optional[int] = None
    user_id: int

    class Config:
        from_attributes = True

class Card(CardInDBBase):
    pass

class CardInDB(CardInDBBase):
    pass 