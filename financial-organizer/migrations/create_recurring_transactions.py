"""
Create recurring_transactions table migration script.
"""
from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, Date, DateTime, ForeignKey, MetaData, Table
from datetime import datetime
import os
import sys

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app.core.config import settings

def create_recurring_transactions_table():
    # Create an engine to connect to the database
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    # Create a metadata instance
    metadata = MetaData()
    
    # Define the recurring_transactions table
    recurring_transactions = Table(
        'recurring_transactions', 
        metadata,
        Column('id', Integer, primary_key=True, index=True),
        Column('user_id', Integer, ForeignKey('users.id')),
        Column('amount', Float, nullable=False),
        Column('transaction_type', String, nullable=False),
        Column('category', String, nullable=False),
        Column('description', String, nullable=True),
        Column('frequency', String, nullable=False),
        Column('start_date', Date, nullable=False),
        Column('end_date', Date, nullable=True),
        Column('next_date', Date, nullable=False),
        Column('is_active', Boolean, default=True),
        Column('created_at', DateTime, default=datetime.utcnow),
        Column('updated_at', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Create the table
    metadata.create_all(engine)
    print("Created recurring_transactions table")

if __name__ == "__main__":
    create_recurring_transactions_table() 