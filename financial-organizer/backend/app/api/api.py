from fastapi import APIRouter
from app.api.endpoints import auth, transactions, cards, receipts

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(cards.router, prefix="/cards", tags=["Cards"])
api_router.include_router(receipts.router, prefix="/receipts", tags=["Receipts"])
