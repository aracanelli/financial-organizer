from typing import Optional, Dict, Any
from pydantic import BaseModel

class ReceiptBase(BaseModel):
    transaction_id: int
    file_path: str
    ocr_data: Dict[str, Any]

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptUpdate(ReceiptBase):
    transaction_id: Optional[int] = None
    file_path: Optional[str] = None
    ocr_data: Optional[Dict[str, Any]] = None

class ReceiptInDBBase(ReceiptBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

class Receipt(ReceiptInDBBase):
    pass

class ReceiptInDB(ReceiptInDBBase):
    pass 