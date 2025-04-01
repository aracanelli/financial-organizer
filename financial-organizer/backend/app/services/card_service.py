from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session

from app.db.models import Card
from app.schemas.card import CardCreate, CardUpdate

def get(db: Session, id: Any) -> Optional[Card]:
    return db.query(Card).filter(Card.id == id).first()

def get_multi(
    db: Session, *, user_id: int, skip: int = 0, limit: int = 100
) -> List[Card]:
    return (
        db.query(Card)
        .filter(Card.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create(db: Session, *, obj_in: CardCreate, user_id: int) -> Card:
    db_obj = Card(
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
    db_obj: Card,
    obj_in: Union[CardUpdate, Dict[str, Any]]
) -> Card:
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

def remove(db: Session, *, id: int) -> Card:
    obj = db.query(Card).get(id)
    db.delete(obj)
    db.commit()
    return obj 