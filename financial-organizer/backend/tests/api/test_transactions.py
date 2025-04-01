from fastapi.testclient import TestClient
import pytest
from sqlalchemy.orm import Session
import datetime

from app.app.services import transaction_service
from app.app.db.models import User, Transaction
from app.app.schemas.transaction import TransactionCreate, TransactionUpdate


@pytest.fixture
def test_transaction(db_session: Session, test_user: User):
    """Create a test transaction in the database."""
    transaction_data = {
        "amount": 100.50,
        "transaction_type": "expense",
        "category": "groceries",
        "description": "Weekly groceries",
        "date": datetime.date.today().isoformat()
    }
    transaction = transaction_service.create(
        db=db_session,
        obj_in=TransactionCreate(**transaction_data),
        user_id=test_user.id
    )
    return transaction


def test_create_transaction(client: TestClient, test_user: User):
    """Test creating a new transaction."""
    # Get token for the test user
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    
    transaction_data = {
        "amount": 75.25,
        "transaction_type": "expense",
        "category": "utilities",
        "description": "Electricity bill",
        "date": datetime.date.today().isoformat()
    }
    
    response = client.post(
        "/api/v1/transactions/",
        json=transaction_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 75.25
    assert data["category"] == "utilities"
    assert data["user_id"] == test_user.id


def test_get_transactions(client: TestClient, test_user: User, test_transaction: Transaction):
    """Test retrieving all transactions for a user."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    
    response = client.get(
        "/api/v1/transactions/",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["id"] == test_transaction.id


def test_update_transaction(client: TestClient, test_user: User, test_transaction: Transaction):
    """Test updating a transaction."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    
    update_data = {
        "amount": 120.75,
        "description": "Updated description"
    }
    
    response = client.patch(
        f"/api/v1/transactions/{test_transaction.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 120.75
    assert data["description"] == "Updated description"
    assert data["category"] == test_transaction.category  # Unchanged field


def test_delete_transaction(client: TestClient, test_user: User, test_transaction: Transaction):
    """Test deleting a transaction."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    
    response = client.delete(
        f"/api/v1/transactions/{test_transaction.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    
    # Verify it's gone
    response = client.get(
        f"/api/v1/transactions/{test_transaction.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404 