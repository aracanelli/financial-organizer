from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session

from app.db.models import Receipt
from app.schemas.receipt import ReceiptCreate, ReceiptUpdate

def get(db: Session, id: Any) -> Optional[Receipt]:
    return db.query(Receipt).filter(Receipt.id == id).first()

def get_by_transaction(db: Session, transaction_id: int) -> Optional[Receipt]:
    return db.query(Receipt).filter(Receipt.transaction_id == transaction_id).first()

def get_multi(
    db: Session, *, transaction_id: int, skip: int = 0, limit: int = 100
) -> List[Receipt]:
    return (
        db.query(Receipt)
        .filter(Receipt.transaction_id == transaction_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create(db: Session, *, obj_in: ReceiptCreate) -> Receipt:
    db_obj = Receipt(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session,
    *,
    db_obj: Receipt,
    obj_in: Union[ReceiptUpdate, Dict[str, Any]]
) -> Receipt:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: int) -> Receipt:
    obj = db.query(Receipt).get(id)
    db.delete(obj)
    db.commit()
    return obj 