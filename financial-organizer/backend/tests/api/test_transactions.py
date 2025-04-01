from fastapi.testclient import TestClient
import pytest
from sqlalchemy.orm import Session

from app.db.models import Transaction
from app.core.config import settings
from app.tests.utils.utils import random_lower_string
from app.tests.utils.user import create_random_user
from app.tests.utils.transaction import create_random_transaction


def test_create_transaction(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    data = {
        "amount": 125.50,
        "transaction_type": "purchase",
        "category": "groceries",
        "description": "Weekly grocery shopping",
        "date": "2025-04-01",
    }
    response = client.post(
        f"{settings.API_V1_STR}/transactions/", headers=superuser_token_headers, json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["amount"] == 125.5
    assert content["transaction_type"] == "purchase"
    assert content["category"] == "groceries"
    assert content["description"] == "Weekly grocery shopping"
    assert "id" in content
    assert "user_id" in content


def test_read_transaction(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    transaction = create_random_transaction(db=db, user_id=user.id)
    response = client.get(
        f"{settings.API_V1_STR}/transactions/{transaction.id}", headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == transaction.id
    assert content["amount"] == transaction.amount
    assert content["transaction_type"] == transaction.transaction_type
    assert content["category"] == transaction.category
    assert content["description"] == transaction.description


def test_read_transactions(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    transaction1 = create_random_transaction(db=db, user_id=user.id)
    transaction2 = create_random_transaction(db=db, user_id=user.id)
    response = client.get(
        f"{settings.API_V1_STR}/transactions/", headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 2
    # Check that our created transactions are in the list
    transaction_ids = [t["id"] for t in content]
    assert transaction1.id in transaction_ids
    assert transaction2.id in transaction_ids


def test_update_transaction(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    transaction = create_random_transaction(db=db, user_id=user.id)
    data = {
        "amount": 200.75,
        "description": "Updated description",
    }
    response = client.put(
        f"{settings.API_V1_STR}/transactions/{transaction.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == transaction.id
    assert content["amount"] == 200.75
    assert content["description"] == "Updated description"
    # These should remain unchanged
    assert content["transaction_type"] == transaction.transaction_type
    assert content["category"] == transaction.category


def test_delete_transaction(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    transaction = create_random_transaction(db=db, user_id=user.id)
    response = client.delete(
        f"{settings.API_V1_STR}/transactions/{transaction.id}", headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify transaction is deleted
    transaction_in_db = db.query(Transaction).filter(Transaction.id == transaction.id).first()
    assert transaction_in_db is None 