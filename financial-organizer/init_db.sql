-- Check if enum types exist and create if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transactiontype') THEN
        CREATE TYPE transactiontype AS ENUM ('purchase', 'payment', 'refund');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category') THEN
        CREATE TYPE category AS ENUM ('groceries', 'utilities', 'entertainment', 'transportation', 'shopping', 'other');
    END IF;
END
$$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    email VARCHAR UNIQUE,
    hashed_password VARCHAR,
    full_name VARCHAR,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index on users
CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- Create cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    user_id INTEGER REFERENCES users(id),
    card_number VARCHAR,
    card_type VARCHAR,
    last_four VARCHAR,
    expiry_date VARCHAR,
    plaid_item_id VARCHAR UNIQUE
);

-- Create index on cards
CREATE INDEX IF NOT EXISTS ix_cards_id ON cards (id);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    user_id INTEGER REFERENCES users(id),
    card_id INTEGER REFERENCES cards(id),
    amount FLOAT,
    description VARCHAR,
    transaction_type transactiontype,
    category category,
    merchant_name VARCHAR,
    date TIMESTAMP,
    plaid_transaction_id VARCHAR UNIQUE,
    receipt_path VARCHAR,
    ocr_data JSONB,
    grocery_items JSONB
);

-- Create index on transactions
CREATE INDEX IF NOT EXISTS ix_transactions_id ON transactions (id);

-- Create receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    transaction_id INTEGER REFERENCES transactions(id),
    file_path VARCHAR,
    ocr_data JSONB
);

-- Create index on receipts
CREATE INDEX IF NOT EXISTS ix_receipts_id ON receipts (id);

-- Record migration in alembic version table
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL,
    PRIMARY KEY (version_num)
);

-- Insert migration version
INSERT INTO alembic_version (version_num) 
SELECT '1a5b3c7d9e2f'
WHERE NOT EXISTS (SELECT 1 FROM alembic_version WHERE version_num = '1a5b3c7d9e2f'); 