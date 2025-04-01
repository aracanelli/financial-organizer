"""Initial migration

Revision ID: 1a5b3c7d9e2f
Revises: 
Create Date: 2023-04-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '1a5b3c7d9e2f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = inspect(conn)
    
    # Check existing enums to avoid errors
    existing_enums = [enum['name'] for enum in inspector.get_enums()]
    
    # Create transaction_type enum if it doesn't exist
    if 'transactiontype' not in existing_enums:
        transaction_type = sa.Enum('purchase', 'payment', 'refund', name='transactiontype')
        transaction_type.create(op.get_bind())
    else:
        transaction_type = sa.Enum('purchase', 'payment', 'refund', name='transactiontype')
    
    # Create category enum if it doesn't exist
    if 'category' not in existing_enums:
        category = sa.Enum('groceries', 'utilities', 'entertainment', 'transportation', 'shopping', 'other', name='category')
        category.create(op.get_bind())
    else:
        category = sa.Enum('groceries', 'utilities', 'entertainment', 'transportation', 'shopping', 'other', name='category')
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    # Create cards table
    op.create_table('cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('card_number', sa.String(), nullable=True),
        sa.Column('card_type', sa.String(), nullable=True),
        sa.Column('last_four', sa.String(), nullable=True),
        sa.Column('expiry_date', sa.String(), nullable=True),
        sa.Column('plaid_item_id', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('plaid_item_id')
    )
    op.create_index(op.f('ix_cards_id'), 'cards', ['id'], unique=False)
    
    # Create transactions table
    op.create_table('transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('card_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('transaction_type', transaction_type, nullable=True),
        sa.Column('category', category, nullable=True),
        sa.Column('merchant_name', sa.String(), nullable=True),
        sa.Column('date', sa.DateTime(), nullable=True),
        sa.Column('plaid_transaction_id', sa.String(), nullable=True),
        sa.Column('receipt_path', sa.String(), nullable=True),
        sa.Column('ocr_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('grocery_items', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['card_id'], ['cards.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('plaid_transaction_id')
    )
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
    
    # Create receipts table
    op.create_table('receipts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('transaction_id', sa.Integer(), nullable=True),
        sa.Column('file_path', sa.String(), nullable=True),
        sa.Column('ocr_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_receipts_id'), 'receipts', ['id'], unique=False)


def downgrade():
    # Drop tables
    op.drop_index(op.f('ix_receipts_id'), table_name='receipts')
    op.drop_table('receipts')
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_table('transactions')
    op.drop_index(op.f('ix_cards_id'), table_name='cards')
    op.drop_table('cards')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
    
    # Drop enum types
    conn = op.get_bind()
    inspector = inspect(conn)
    existing_enums = [enum['name'] for enum in inspector.get_enums()]
    
    if 'transactiontype' in existing_enums:
        sa.Enum(name='transactiontype').drop(op.get_bind())
    if 'category' in existing_enums:
        sa.Enum(name='category').drop(op.get_bind()) 