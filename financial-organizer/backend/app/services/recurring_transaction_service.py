from typing import Any, Dict, List, Optional, Union
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.db.models import RecurringTransaction, Transaction
from app.schemas.recurring_transaction import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
)
from app.schemas.transaction import TransactionCreate


def get(db: Session, id: Any) -> Optional[RecurringTransaction]:
    return db.query(RecurringTransaction).filter(RecurringTransaction.id == id).first()


def get_multi(db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[RecurringTransaction]:
    return db.query(RecurringTransaction).filter(
        RecurringTransaction.user_id == user_id,
        RecurringTransaction.is_active == True,
    ).offset(skip).limit(limit).all()


def create(db: Session, *, obj_in: RecurringTransactionCreate, user_id: int) -> RecurringTransaction:
    # Determine the next_date based on the start_date
    next_date = obj_in.start_date
    if datetime.now().date() > next_date:
        # If start date is in the past, calculate the next occurrence
        next_date = calculate_next_date(obj_in.frequency, obj_in.start_date)
    
    db_obj = RecurringTransaction(
        user_id=user_id,
        amount=obj_in.amount,
        transaction_type=obj_in.transaction_type.lower(),
        category=obj_in.category.lower(),
        description=obj_in.description,
        frequency=obj_in.frequency,
        start_date=obj_in.start_date,
        end_date=obj_in.end_date,
        next_date=next_date,
        is_active=True
    )
    
    try:
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except Exception as e:
        db.rollback()
        raise e


def update(
    db: Session, *, db_obj: RecurringTransaction, obj_in: Union[RecurringTransactionUpdate, Dict[str, Any]]
) -> RecurringTransaction:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    # Handle possible recalculation of next_date if frequency or start_date changes
    recalculate_next_date = False
    if 'frequency' in update_data or 'start_date' in update_data:
        recalculate_next_date = True
    
    for field in update_data:
        if field == 'transaction_type' or field == 'category':
            value = update_data[field]
            if value:
                value = value.lower()
            setattr(db_obj, field, value)
        else:
            setattr(db_obj, field, update_data[field])
    
    if recalculate_next_date:
        db_obj.next_date = calculate_next_date(db_obj.frequency, db_obj.start_date)
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, id: int) -> RecurringTransaction:
    obj = db.query(RecurringTransaction).get(id)
    if not obj:
        return None
    
    # Soft delete by setting is_active to False
    obj.is_active = False
    db.add(obj)
    db.commit()
    return obj


def calculate_next_date(frequency: str, reference_date: date) -> date:
    """
    Calculate the next occurrence date based on frequency and a reference date.
    """
    today = datetime.now().date()
    next_date = reference_date
    
    while next_date <= today:
        if frequency == "daily":
            next_date += timedelta(days=1)
        elif frequency == "weekly":
            next_date += timedelta(days=7)
        elif frequency == "biweekly":
            next_date += timedelta(days=14)
        elif frequency == "monthly":
            # Move to next month, same day
            month = next_date.month + 1
            year = next_date.year
            if month > 12:
                month = 1
                year += 1
            
            # Handle edge cases like 31st of month
            day = min(next_date.day, get_days_in_month(year, month))
            next_date = date(year, month, day)
        elif frequency == "quarterly":
            # Move forward 3 months
            month = next_date.month + 3
            year = next_date.year
            if month > 12:
                month -= 12
                year += 1
            
            day = min(next_date.day, get_days_in_month(year, month))
            next_date = date(year, month, day)
        elif frequency == "yearly":
            next_date = date(next_date.year + 1, next_date.month, next_date.day)
    
    return next_date


def get_days_in_month(year: int, month: int) -> int:
    """
    Return the number of days in a given month and year.
    """
    if month == 2:  # February
        if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0):  # Leap year
            return 29
        return 28
    elif month in [4, 6, 9, 11]:  # April, June, September, November
        return 30
    else:
        return 31


def process_due_recurring_transactions(db: Session) -> List[Transaction]:
    """
    Process all recurring transactions that are due and create actual transactions.
    Returns a list of created transactions.
    """
    today = datetime.now().date()
    due_recurrings = db.query(RecurringTransaction).filter(
        RecurringTransaction.next_date <= today,
        RecurringTransaction.is_active == True,
    ).all()
    
    created_transactions = []
    
    for recurring in due_recurrings:
        # Check if end_date is reached
        if recurring.end_date and recurring.end_date < today:
            recurring.is_active = False
            db.add(recurring)
            continue
        
        # Create actual transaction
        transaction_data = TransactionCreate(
            amount=recurring.amount,
            transaction_type=recurring.transaction_type,
            category=recurring.category,
            description=f"{recurring.description} (Recurring)",
            date=today,
        )
        
        # Create transaction
        transaction = Transaction(
            user_id=recurring.user_id,
            amount=transaction_data.amount,
            transaction_type=transaction_data.transaction_type,
            category=transaction_data.category,
            description=transaction_data.description,
            date=transaction_data.date,
        )
        db.add(transaction)
        created_transactions.append(transaction)
        
        # Update next_date for the recurring transaction
        recurring.next_date = calculate_next_date(recurring.frequency, recurring.next_date)
        db.add(recurring)
    
    db.commit()
    
    # Refresh all objects
    for transaction in created_transactions:
        db.refresh(transaction)
    
    return created_transactions 