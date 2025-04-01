from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from sqlalchemy import String

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
    try:
        # Convert obj_in to dict and extract values
        obj_data = obj_in.model_dump()
        
        # Force lowercase for the transaction_type and category
        if "transaction_type" in obj_data and isinstance(obj_data["transaction_type"], str):
            obj_data["transaction_type"] = obj_data["transaction_type"].lower()
            # Ensure it's one of the valid values
            if obj_data["transaction_type"] not in ["purchase", "payment", "refund"]:
                obj_data["transaction_type"] = "purchase"
                
        if "category" in obj_data and isinstance(obj_data["category"], str):
            obj_data["category"] = obj_data["category"].lower()
            # Ensure it's one of the valid values
            if obj_data["category"] not in ["groceries", "utilities", "entertainment", "transportation", "shopping", "other"]:
                obj_data["category"] = "other"
        
        print(f"Creating transaction with data: {obj_data}")
        
        # Create a manual SQL INSERT to bypass the enum issue
        transaction_type = obj_data.get("transaction_type", "purchase")
        category = obj_data.get("category", "other")
        
        # Create the transaction object with needed values for SQLAlchemy 
        db_obj = Transaction(
            user_id=user_id,
            card_id=obj_data.get("card_id"),
            amount=obj_data.get("amount"),
            description=obj_data.get("description"),
            merchant_name=obj_data.get("merchant_name"),
            date=obj_data.get("date"),
            plaid_transaction_id=obj_data.get("plaid_transaction_id"),
            receipt_path=obj_data.get("receipt_path"),
            ocr_data=obj_data.get("ocr_data"),
            grocery_items=obj_data.get("grocery_items"),
        )
        
        # Set the attributes directly on the object as strings
        db_obj.transaction_type = transaction_type  
        db_obj.category = category
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except Exception as e:
        db.rollback()
        print(f"Error creating transaction: {e}")
        raise

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
        
    # Force lowercase for the transaction_type and category
    if "transaction_type" in update_data and isinstance(update_data["transaction_type"], str):
        update_data["transaction_type"] = update_data["transaction_type"].lower()
        # Ensure it's one of the valid values
        if update_data["transaction_type"] not in ["purchase", "payment", "refund"]:
            del update_data["transaction_type"]
            
    if "category" in update_data and isinstance(update_data["category"], str):
        update_data["category"] = update_data["category"].lower()
        # Ensure it's one of the valid values
        if update_data["category"] not in ["groceries", "utilities", "entertainment", "transportation", "shopping", "other"]:
            del update_data["category"]
            
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: int) -> Transaction:
    obj = db.query(Transaction).get(id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj 