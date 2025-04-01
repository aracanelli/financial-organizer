# Fixes Changelog

## Database Fixes (April 1, 2025)

### Transaction Type and Category Fix
- Fixed the `transactions` table schema to use VARCHAR instead of ENUMs for `transaction_type` and `category` columns
- Modified the transaction service to handle lowercase values for transaction types and categories
- Removed constraints tied to old enum types
- Updated the models.py file to reflect these changes

### Card Plaid Item ID Fix
- Removed the unique constraint on `plaid_item_id` in the `cards` table
- Updated the card service to generate unique IDs for empty `plaid_item_id` values
- Added UUID generation for manual card entries

## Frontend Fixes (April 1, 2025)

### Date Picker Component Fix
- Replaced problematic DatePicker component with standard HTML date input
- Fixed date formatting issues for compatibility with backend
- Updated TransactionDetail page to use proper date formatting

### Transaction Form Fixes
- Ensured all transaction types and categories are converted to lowercase
- Improved error handling for transaction creation and updates
- Fixed navigation between transaction pages

## Additional Improvements
- Enhanced error logging and reporting
- Improved Docker build process
- Fixed database migration issues 