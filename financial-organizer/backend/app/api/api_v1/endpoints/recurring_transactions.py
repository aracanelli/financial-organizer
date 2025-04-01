from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, Path
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import services
from app.api import deps
from app.db.models import User
from app.schemas.recurring_transaction import (
    RecurringTransaction,
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[RecurringTransaction])
def read_recurring_transactions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve recurring transactions.
    """
    recurring_transactions = services.recurring_transaction_service.get_multi(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return recurring_transactions


@router.post("/", response_model=RecurringTransaction)
def create_recurring_transaction(
    *,
    db: Session = Depends(deps.get_db),
    recurring_transaction_in: RecurringTransactionCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new recurring transaction.
    """
    try:
        recurring_transaction = services.recurring_transaction_service.create(
            db=db, obj_in=recurring_transaction_in, user_id=current_user.id
        )
        return recurring_transaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating recurring transaction: {str(e)}")


@router.get("/{id}", response_model=RecurringTransaction)
def read_recurring_transaction(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="The ID of the recurring transaction to get"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get recurring transaction by ID.
    """
    recurring_transaction = services.recurring_transaction_service.get(db=db, id=id)
    if not recurring_transaction:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    if recurring_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return recurring_transaction


@router.put("/{id}", response_model=RecurringTransaction)
def update_recurring_transaction(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="The ID of the recurring transaction to update"),
    recurring_transaction_in: RecurringTransactionUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a recurring transaction.
    """
    recurring_transaction = services.recurring_transaction_service.get(db=db, id=id)
    if not recurring_transaction:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    if recurring_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        recurring_transaction = services.recurring_transaction_service.update(
            db=db, db_obj=recurring_transaction, obj_in=recurring_transaction_in
        )
        return recurring_transaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating recurring transaction: {str(e)}")


@router.delete("/{id}", response_model=RecurringTransaction)
def delete_recurring_transaction(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="The ID of the recurring transaction to delete"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a recurring transaction.
    """
    recurring_transaction = services.recurring_transaction_service.get(db=db, id=id)
    if not recurring_transaction:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    if recurring_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    recurring_transaction = services.recurring_transaction_service.remove(db=db, id=id)
    return recurring_transaction


@router.post("/{id}/process", response_model=RecurringTransaction)
def process_recurring_transaction(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="The ID of the recurring transaction to process"),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Manually process a recurring transaction.
    """
    recurring_transaction = services.recurring_transaction_service.get(db=db, id=id)
    if not recurring_transaction:
        raise HTTPException(status_code=404, detail="Recurring transaction not found")
    if recurring_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create a transaction from the recurring transaction
    from app.schemas.transaction import TransactionCreate
    transaction_in = TransactionCreate(
        amount=recurring_transaction.amount,
        transaction_type=recurring_transaction.transaction_type,
        category=recurring_transaction.category,
        description=f"{recurring_transaction.description} (Manual process)",
        date=services.recurring_transaction_service.datetime.now().date(),
    )
    
    # Create the transaction
    services.transaction_service.create(db=db, obj_in=transaction_in, user_id=current_user.id)
    
    # Update next_date for the recurring transaction
    recurring_transaction = services.recurring_transaction_service.update(
        db=db, 
        db_obj=recurring_transaction, 
        obj_in={
            "next_date": services.recurring_transaction_service.calculate_next_date(
                recurring_transaction.frequency, 
                services.recurring_transaction_service.datetime.now().date()
            )
        }
    )
    
    return recurring_transaction 