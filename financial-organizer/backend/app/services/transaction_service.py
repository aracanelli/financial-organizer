from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session

from app.db.models import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate

def get(db: Session, id: Any) -> Optional[Transaction]:
    return db.query(Transaction).filter(Transaction.id == id).first()

def get_multi(
    db: Session, *, user_id: int, skip: int = 0, limit: int = 100
) -> List[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create(db: Session, *, obj_in: TransactionCreate, user_id: int) -> Transaction:
    db_obj = Transaction(
        **obj_in.model_dump(),
        user_id=user_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session,
    *,
    db_obj: Transaction,
    obj_in: Union[TransactionUpdate, Dict[str, Any]]
) -> Transaction:
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

def remove(db: Session, *, id: int) -> Transaction:
    obj = db.query(Transaction).get(id)
    db.delete(obj)
    db.commit()
    return obj 