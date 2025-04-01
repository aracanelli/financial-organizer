from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
from datetime import datetime

from app.api import deps
from app.db.models import Transaction
from app.schemas.receipt import ReceiptCreate, Receipt as ReceiptSchema
from app.services import receipt_service
from app.services.ocr_service import OCRService

router = APIRouter()
ocr_service = OCRService()

@router.post("/upload/{transaction_id}", response_model=ReceiptSchema)
async def upload_receipt(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    file: UploadFile = File(...),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload and process a receipt for a transaction.
    """
    # Verify transaction exists and belongs to user
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), "uploads")
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # Save the file
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"receipt_{transaction_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
    file_path = os.path.join(upload_dir, file_name)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error saving file: {str(e)}"
        )

    try:
        # Process the receipt with OCR
        ocr_data = await ocr_service.process_receipt(file_path)
        
        # If it's a grocery receipt, process it specifically
        if transaction.category == "groceries":
            ocr_data = await ocr_service.process_grocery_receipt(file_path)

        # Create receipt record
        receipt_data = ReceiptCreate(
            transaction_id=transaction_id,
            file_path=file_name,
            ocr_data=ocr_data
        )

        receipt = receipt_service.create(
            db=db, obj_in=receipt_data
        )

        # Update transaction with receipt path and OCR data
        transaction.receipt_path = file_name
        transaction.ocr_data = ocr_data
        if transaction.category == "groceries":
            transaction.grocery_items = ocr_data.get("items", [])
        
        db.commit()
        return receipt

    except Exception as e:
        # Clean up the uploaded file if processing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=400,
            detail=f"Error processing receipt: {str(e)}"
        )

@router.get("/{transaction_id}", response_model=ReceiptSchema)
def get_receipt(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get receipt for a transaction.
    """
    receipt = receipt_service.get_by_transaction(
        db=db, transaction_id=transaction_id
    )
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Verify transaction belongs to user
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return receipt 