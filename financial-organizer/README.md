# Financial Organizer

A full-stack application for managing and organizing financial transactions and receipts. This application allows users to track their expenses, categorize transactions, scan receipts for data extraction, and sync with bank accounts.

## Features

- User authentication and authorization
- Transaction tracking and categorization
- Receipt scanning and OCR (Optical Character Recognition) for data extraction
- Bank account integration using Plaid API
- Dashboard with financial summaries and insights
- Mobile-friendly responsive design

## Tech Stack

### Backend
- Python with FastAPI
- PostgreSQL database
- SQLAlchemy ORM
- Alembic for database migrations
- Pydantic for data validation
- JWT authentication
- Tesseract OCR for receipt scanning
- Plaid API for bank integration

### Frontend
- React.js
- Material-UI for UI components
- React Router for routing
- Axios for API requests
- Chart.js for data visualization
- Formik and Yup for form validation

### Infrastructure
- Docker and Docker Compose for containerization
- Nginx for serving the frontend and reverse proxy

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your system

### Setup and Running

1. Clone the repository
   ```
   git clone https://github.com/yourusername/financial-organizer.git
   cd financial-organizer
   ```

2. Configure environment variables (Optional)
   - Edit the `.env` file to configure your settings
   - Default configuration is provided for development

3. Build and start the application
   ```
   docker-compose up -d
   ```

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

5. Stop the application
   ```
   docker-compose down
   ```

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when the application is running. It provides a comprehensive overview of all available endpoints and their usage.

## Development

### Backend Development

The backend is built with FastAPI and follows a modular structure:
- `app/api`: API routes and endpoints
- `app/core`: Core functionality like config and security
- `app/db`: Database models and session management
- `app/schemas`: Pydantic schemas for data validation
- `app/services`: Business logic and external service integration

### Frontend Development

The frontend is built with React and follows a component-based architecture:
- `src/components`: Reusable UI components
- `src/contexts`: React contexts for state management
- `src/pages`: Page components
- `src/services`: API service integrations

## License

[MIT License](LICENSE)

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Plaid API](https://plaid.com/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) 