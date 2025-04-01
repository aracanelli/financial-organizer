from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Boolean, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import BaseModel

class TransactionType(enum.Enum):
    PURCHASE = "purchase"
    PAYMENT = "payment"
    REFUND = "refund"

class Category(enum.Enum):
    GROCERIES = "groceries"
    UTILITIES = "utilities"
    ENTERTAINMENT = "entertainment"
    TRANSPORTATION = "transportation"
    SHOPPING = "shopping"
    OTHER = "other"

class User(BaseModel):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="user")
    cards = relationship("Card", back_populates="user")
    recurring_transactions = relationship("RecurringTransaction", back_populates="user")

class Card(BaseModel):
    __tablename__ = "cards"

    user_id = Column(Integer, ForeignKey("users.id"))
    card_number = Column(String)
    card_type = Column(String)
    last_four = Column(String)
    expiry_date = Column(String)
    plaid_item_id = Column(String, unique=True)
    
    # Relationships
    user = relationship("User", back_populates="cards")
    transactions = relationship("Transaction", back_populates="card")

class Transaction(BaseModel):
    __tablename__ = "transactions"

    user_id = Column(Integer, ForeignKey("users.id"))
    card_id = Column(Integer, ForeignKey("cards.id"))
    amount = Column(Float)
    description = Column(String)
    transaction_type = Column(String)
    category = Column(String)
    merchant_name = Column(String)
    date = Column(DateTime)
    plaid_transaction_id = Column(String, unique=True)
    receipt_path = Column(String, nullable=True)
    ocr_data = Column(JSON, nullable=True)
    grocery_items = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    card = relationship("Card", back_populates="transactions")
    receipt = relationship("Receipt", back_populates="transaction", uselist=False)

class Receipt(BaseModel):
    __tablename__ = "receipts"

    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    file_path = Column(String)
    ocr_data = Column(JSON)

    # Relationships
    transaction = relationship("Transaction", back_populates="receipt")

class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    frequency = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    next_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="recurring_transactions") 