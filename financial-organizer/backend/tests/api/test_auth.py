import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.schemas.auth import UserCreate

def test_register_user(client: TestClient, db_session: Session):
    """Test the registration endpoint."""
    user_data = {
        "email": "newuser@example.com",
        "password": "newpassword123",
        "full_name": "New Test User"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["full_name"] == user_data["full_name"]
    assert "id" in data
    assert "password" not in data
    
def test_register_existing_user(client: TestClient, test_user):
    """Test registering a user with an email that already exists."""
    user_data = {
        "email": "test@example.com",  # Same as test_user fixture
        "password": "anotherpassword",
        "full_name": "Another User"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client: TestClient, test_user):
    """Test successful login."""
    login_data = {
        "username": "test@example.com",  # OAuth2 expects 'username' field
        "password": "testpassword"
    }
    
    response = client.post("/api/auth/login", data=login_data)  # Use data= for form data
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client: TestClient, test_user):
    """Test login with incorrect password."""
    login_data = {
        "username": "test@example.com",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_nonexistent_user(client: TestClient):
    """Test login with email that doesn't exist."""
    login_data = {
        "username": "nonexistent@example.com",
        "password": "somepassword"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"] 