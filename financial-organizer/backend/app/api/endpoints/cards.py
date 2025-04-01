from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import Card
from app.schemas.card import CardCreate, CardUpdate, Card as CardSchema
from app.services import card_service
from app.services.plaid_service import PlaidService

router = APIRouter()
plaid_service = PlaidService()

@router.get("/", response_model=List[CardSchema])
def read_cards(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve cards.
    """
    cards = card_service.get_multi(
        db=db, user_id=current_user.id
    )
    return cards

@router.post("/", response_model=CardSchema)
def create_card(
    *,
    db: Session = Depends(deps.get_db),
    card_in: CardCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new card.
    """
    card = card_service.create(
        db=db, obj_in=card_in, user_id=current_user.id
    )
    return card

@router.post("/link-token", response_model=dict)
async def create_link_token(
    *,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a Plaid Link token for initialization.
    """
    try:
        link_token = await plaid_service.create_link_token(str(current_user.id))
        return {"link_token": link_token}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error creating link token: {str(e)}"
        )

@router.post("/link", response_model=CardSchema)
async def link_card(
    *,
    db: Session = Depends(deps.get_db),
    public_token: str = Body(...),
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Link a new card using Plaid.
    """
    try:
        # Exchange public token for access token
        access_token = await plaid_service.exchange_public_token(public_token)
        
        # Get account information
        accounts = await plaid_service.get_account_balance(access_token)
        
        # Use the first account for card creation
        account = accounts[0]
        
        # Create card record
        card_data = CardCreate(
            card_number="****",  # Don't store full card number
            card_type=account.type if hasattr(account, 'type') else "unknown",
            last_four=account.mask[-4:] if hasattr(account, 'mask') and account.mask else "****",
            expiry_date="",  # Not available from Plaid
            plaid_item_id=access_token
        )
        
        card = card_service.create(
            db=db, obj_in=card_data, user_id=current_user.id
        )
        
        # Sync initial transactions
        await plaid_service.sync_transactions(
            access_token=access_token,
            user_id=current_user.id,
            card_id=card.id,
            db=db
        )
        
        return card
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error linking card: {str(e)}"
        )

@router.put("/{card_id}", response_model=CardSchema)
def update_card(
    *,
    db: Session = Depends(deps.get_db),
    card_id: int,
    card_in: CardUpdate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a card.
    """
    card = card_service.get(db=db, id=card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    card = card_service.update(
        db=db, db_obj=card, obj_in=card_in
    )
    return card

@router.delete("/{card_id}")
def delete_card(
    *,
    db: Session = Depends(deps.get_db),
    card_id: int,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a card.
    """
    card = card_service.get(db=db, id=card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    card = card_service.remove(db=db, id=card_id)
    return {"ok": True} 