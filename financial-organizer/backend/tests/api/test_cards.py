from fastapi.testclient import TestClient
import pytest
from sqlalchemy.orm import Session

from app.db.models import Card
from app.core.config import settings
from app.tests.utils.utils import random_lower_string
from app.tests.utils.user import create_random_user
from app.tests.utils.card import create_random_card


def test_create_card(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    data = {
        "card_number": "4111111111111111",
        "card_type": "VISA",
        "last_four": "1111",
        "expiry_date": "12/25",
        "plaid_item_id": ""
    }
    response = client.post(
        f"{settings.API_V1_STR}/cards/", headers=superuser_token_headers, json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["card_number"] == "4111111111111111"
    assert content["card_type"] == "VISA"
    assert content["last_four"] == "1111"
    assert content["expiry_date"] == "12/25"
    assert "id" in content
    assert "user_id" in content
    assert "plaid_item_id" in content
    # Check that empty plaid_item_id was handled correctly
    assert content["plaid_item_id"].startswith("manual_")


def test_read_card(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    card = create_random_card(db=db, user_id=user.id)
    response = client.get(
        f"{settings.API_V1_STR}/cards/{card.id}", headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == card.id
    assert content["card_number"] == card.card_number
    assert content["card_type"] == card.card_type
    assert content["last_four"] == card.last_four
    assert content["expiry_date"] == card.expiry_date


def test_read_cards(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    card1 = create_random_card(db=db, user_id=user.id)
    card2 = create_random_card(db=db, user_id=user.id)
    response = client.get(
        f"{settings.API_V1_STR}/cards/", headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 2
    # Check that our created cards are in the list
    card_ids = [c["id"] for c in content]
    assert card1.id in card_ids
    assert card2.id in card_ids


def test_update_card(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    card = create_random_card(db=db, user_id=user.id)
    data = {
        "card_type": "MASTERCARD",
        "expiry_date": "06/27",
    }
    response = client.put(
        f"{settings.API_V1_STR}/cards/{card.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == card.id
    assert content["card_type"] == "MASTERCARD"
    assert content["expiry_date"] == "06/27"
    # These should remain unchanged
    assert content["card_number"] == card.card_number
    assert content["last_four"] == card.last_four


def test_delete_card(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    card = create_random_card(db=db, user_id=user.id)
    response = client.delete(
        f"{settings.API_V1_STR}/cards/{card.id}", headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify card is deleted
    card_in_db = db.query(Card).filter(Card.id == card.id).first()
    assert card_in_db is None 