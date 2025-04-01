from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate, Transaction as TransactionSchema
from app.services import transaction_service

router = APIRouter()

@router.get("/", response_model=List[TransactionSchema])
def read_transactions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve transactions.
    """
    transactions = transaction_service.get_multi(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return transactions

@router.post("/", response_model=TransactionSchema)
def create_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_in: TransactionCreate,
    current_user: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Create new transaction.
    """
    transaction = transaction_service.create(
        db=db, obj_in=transaction_in, user_id=current_user.id
    )
    return transaction

@router.put("/{transaction_id}", response_model=TransactionSchema)
def update_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    transaction_in: TransactionUpdate,
    current_user: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Update a transaction.
    """
    transaction = transaction_service.get(db=db, id=transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    transaction = transaction_service.update(
        db=db, db_obj=transaction, obj_in=transaction_in
    )
    return transaction

@router.get("/{transaction_id}", response_model=TransactionSchema)
def read_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    current_user: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Get transaction by ID.
    """
    transaction = transaction_service.get(db=db, id=transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return transaction

@router.delete("/{transaction_id}")
def delete_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    current_user: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a transaction.
    """
    transaction = transaction_service.get(db=db, id=transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    transaction = transaction_service.remove(db=db, id=transaction_id)
    return {"ok": True} 