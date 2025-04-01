from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import plaid
from plaid.api import plaid_api
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest

from app.core.config import settings
from app.db.models import Transaction, Card
from app.schemas.transaction import TransactionCreate

class PlaidService:
    def __init__(self):
        configuration = plaid.Configuration(
            host=plaid.Environment.Sandbox,
            api_key={
                'clientId': settings.PLAID_CLIENT_ID,
                'secret': settings.PLAID_SECRET,
            }
        )
        api_client = plaid.ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)

    async def create_link_token(self, user_id: str) -> str:
        """
        Create a link token for initializing the Plaid Link flow.
        """
        try:
            request = LinkTokenCreateRequest(
                user=LinkTokenCreateRequestUser(client_user_id=user_id),
                client_name='Financial Organizer',
                products=[Products('transactions')],
                country_codes=[CountryCode('US')],
                language='en'
            )
            response = self.client.link_token_create(request)
            return response.link_token
        except Exception as e:
            raise Exception(f"Error creating link token: {str(e)}")

    async def exchange_public_token(self, public_token: str) -> str:
        """
        Exchange a public token for an access token.
        """
        try:
            request = ItemPublicTokenExchangeRequest(public_token=public_token)
            response = self.client.item_public_token_exchange(request)
            return response.access_token
        except Exception as e:
            raise Exception(f"Error exchanging public token: {str(e)}")

    async def sync_transactions(
        self,
        access_token: str,
        user_id: int,
        card_id: int,
        db: Any
    ) -> List[Transaction]:
        """
        Sync transactions from Plaid for a given access token.
        """
        try:
            # Get transactions from the last 30 days
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=30)

            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date,
                options=TransactionsGetRequestOptions(
                    count=500,
                    offset=0
                )
            )

            response = self.client.transactions_get(request)
            transactions = response.transactions

            # Process and save transactions
            saved_transactions = []
            for plaid_transaction in transactions:
                # Check if transaction already exists
                existing = db.query(Transaction).filter(
                    Transaction.plaid_transaction_id == plaid_transaction.transaction_id
                ).first()

                if not existing:
                    transaction_data = TransactionCreate(
                        amount=float(plaid_transaction.amount),
                        description=plaid_transaction.name,
                        transaction_type="purchase",  # Default to purchase
                        category="other",  # Default category
                        merchant_name=plaid_transaction.merchant_name if plaid_transaction.merchant_name else "",
                        date=datetime.strptime(plaid_transaction.date, '%Y-%m-%d'),
                        card_id=card_id
                    )

                    transaction = Transaction(
                        **transaction_data.model_dump(),
                        user_id=user_id,
                        plaid_transaction_id=plaid_transaction.transaction_id
                    )
                    db.add(transaction)
                    saved_transactions.append(transaction)

            db.commit()
            return saved_transactions

        except Exception as e:
            raise Exception(f"Error syncing transactions: {str(e)}")

    async def get_account_balance(self, access_token: str) -> Dict[str, Any]:
        """
        Get account balance information.
        """
        try:
            from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
            request = AccountsBalanceGetRequest(access_token=access_token)
            response = self.client.accounts_balance_get(request)
            return response.accounts
        except Exception as e:
            raise Exception(f"Error getting account balance: {str(e)}") 