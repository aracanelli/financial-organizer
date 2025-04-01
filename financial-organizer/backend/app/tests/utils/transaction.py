import random
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models import Transaction
from app.tests.utils.utils import random_lower_string

def create_random_transaction(db: Session, *, user_id: int) -> Transaction:
    """
    Create a random transaction for testing.
    """
    transaction_types = ["purchase", "deposit", "withdrawal", "transfer"]
    categories = ["groceries", "utilities", "entertainment", "dining", "transportation"]
    
    amount = round(random.uniform(10.0, 1000.0), 2)
    transaction_type = random.choice(transaction_types)
    category = random.choice(categories)
    description = random_lower_string()
    date = datetime.now() - timedelta(days=random.randint(0, 30))
    
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        transaction_type=transaction_type,
        category=category,
        description=description,
        date=date
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction 