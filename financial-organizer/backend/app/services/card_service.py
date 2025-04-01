from typing import Any, Dict, List, Optional, Union
from uuid import uuid4

from sqlalchemy.orm import Session

from app.db.models import Card
from app.schemas.card import CardCreate, CardUpdate

def get(db: Session, id: Any) -> Optional[Card]:
    return db.query(Card).filter(Card.id == id).first()

def get_multi(db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[Card]:
    return db.query(Card).filter(Card.user_id == user_id).offset(skip).limit(limit).all()

def create(db: Session, *, obj_in: CardCreate, user_id: int) -> Card:
    # Generate a unique ID for plaid_item_id if empty
    plaid_item_id = obj_in.plaid_item_id if obj_in.plaid_item_id else f"manual_{uuid4()}"
    
    db_obj = Card(
        user_id=user_id,
        card_number=obj_in.card_number,
        card_type=obj_in.card_type,
        last_four=obj_in.last_four,
        expiry_date=obj_in.expiry_date,
        plaid_item_id=plaid_item_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, *, db_obj: Card, obj_in: Union[CardUpdate, Dict[str, Any]]) -> Card:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    # Handle plaid_item_id if it's empty
    if 'plaid_item_id' in update_data and not update_data['plaid_item_id']:
        update_data['plaid_item_id'] = f"manual_{uuid4()}"
    
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: int) -> Card:
    obj = db.query(Card).get(id)
    db.delete(obj)
    db.commit()
    return obj
