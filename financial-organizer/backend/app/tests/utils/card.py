import random
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models import Card

def create_random_card(db: Session, *, user_id: int) -> Card:
    """
    Create a random card for testing.
    """
    card_types = ["VISA", "MASTERCARD", "AMEX", "DISCOVER"]
    
    # Generate a random 16-digit card number
    card_number = ''.join([str(random.randint(0, 9)) for _ in range(16)])
    # Last four digits
    last_four = card_number[-4:]
    # Random card type
    card_type = random.choice(card_types)
    # Random expiry date
    month = random.randint(1, 12)
    year = random.randint(23, 30)
    expiry_date = f"{month:02d}/{year:02d}"
    
    # Generate a unique plaid_item_id
    plaid_item_id = f"test_{uuid.uuid4()}"
    
    card = Card(
        user_id=user_id,
        card_number=card_number,
        card_type=card_type,
        last_four=last_four,
        expiry_date=expiry_date,
        plaid_item_id=plaid_item_id
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card 