# Financial Organizer

A comprehensive application to manage personal finances, track expenses, and organize receipts.

## Features

- User authentication system
- Transaction management
- Credit/debit card tracking
- Receipt scanning and storage
- Data visualization for financial insights

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React, Material-UI
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/financial-organizer.git
   cd financial-organizer
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Initialize the database (first-time setup):
   ```bash
   # Copy the initialization script to the PostgreSQL container
   docker cp init_db.sql financial-organizer-postgres-1:/tmp/init_db.sql
   
   # Execute the script
   docker-compose exec postgres psql -U financialuser -d financialdb -f /tmp/init_db.sql
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Project Structure

```
financial-organizer/
├── backend/                # FastAPI application
│   ├── app/                # Application code
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── db/             # Database models and sessions
│   │   ├── schemas/        # Pydantic models
│   │   └── services/       # Business logic
│   ├── migrations/         # Alembic migrations
│   └── tests/              # Test files
├── frontend/               # React application
└── docker-compose.yml      # Docker Compose configuration
```

## Documentation

For more detailed information, check out these guides:

- [Authentication System](AUTHENTICATION_README.md)
- [API Documentation](http://localhost:8000/docs)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 