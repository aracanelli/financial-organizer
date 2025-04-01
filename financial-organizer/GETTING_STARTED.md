# Getting Started with Financial Organizer

This guide will help you set up and run the Financial Organizer application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:
- Docker and Docker Compose

## Setting Up the Application

1. Clone the repository to your local machine
2. Navigate to the project root directory

## Configuration

The application uses environment variables for configuration. These are defined in the `.env` file in the root directory.

### Required Configuration
- Database settings are already configured for local development
- JWT Secret key is provided with a default (change for production)

### Optional Configuration
- To enable Plaid integration (for bank account syncing):
  - Uncomment and set `PLAID_CLIENT_ID` and `PLAID_SECRET` with your Plaid API credentials
  - Sign up at [plaid.com](https://plaid.com/) to get credentials
- To enable OCR for receipt scanning:
  - Install Tesseract OCR on your system
  - Uncomment and set `OCR_API_KEY` if using a cloud OCR service

## Running the Application

1. Build and start the application:
   ```bash
   docker-compose up -d
   ```

2. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. To stop the application:
   ```bash
   docker-compose down
   ```

## Creating Your First User

1. Access the application at http://localhost:3000
2. Click on "Sign Up" to create a new user account
3. Log in with your new account credentials

## Adding Cards and Transactions

1. After logging in, navigate to the "Cards" section
2. Add a card manually or connect your bank (if Plaid is configured)
3. Once cards are added, you can add transactions in the "Transactions" section
4. For each transaction, you can upload a receipt image for processing

## Troubleshooting

- If the application fails to start, check the logs for errors:
  ```bash
  docker-compose logs
  ```

- For specific service logs:
  ```bash
  docker-compose logs backend
  docker-compose logs frontend
  docker-compose logs postgres
  ```

- If you encounter database errors, you can reset the database:
  ```bash
  docker-compose down -v
  docker-compose up -d
  ```

## Development

- All backend code is in the `backend` directory
- All frontend code is in the `frontend` directory
- Database migrations are managed through Alembic

To run migrations manually:
```bash
docker-compose exec backend alembic upgrade head
```

To create a new migration:
```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
``` 