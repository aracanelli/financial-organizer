from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.db.models import TransactionType, Category

class TransactionBase(BaseModel):
    amount: float
    description: str
    transaction_type: str
    category: str
    merchant_name: str
    date: datetime
    receipt_path: Optional[str] = None
    ocr_data: Optional[Dict[str, Any]] = None
    grocery_items: Optional[Dict[str, Any]] = None

class TransactionCreate(TransactionBase):
    card_id: int

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDBBase(TransactionBase):
    id: Optional[int] = None
    user_id: int
    card_id: int
    plaid_transaction_id: Optional[str] = None

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass

class TransactionInDB(TransactionInDBBase):
    pass