# Manual Testing Guide for Financial Organizer

This document provides step-by-step instructions for manually testing the key features of the Financial Organizer application, specifically adding credit cards and transactions.

## Prerequisites

1. Make sure the application is running (frontend and backend)
2. Login to the application with a valid user account
3. Clear existing test data if needed for a clean test environment

## Test 1: Adding a New Credit Card

### Steps:

1. **Navigate to the Cards Page**
   - Click on "Cards" in the main navigation menu
   - Verify you see the "Cards & Accounts" page with an "Add Card" button

2. **Open the Add Card Dialog**
   - Click the "Add Card" button
   - Verify a dialog opens with fields for:
     - Card Number
     - Card Type (dropdown)
     - Expiry Date

3. **Test Form Validation**
   - Click "Add" without filling any fields
   - Verify you see a validation error message "Card number is required"
   - Fill in the Card Number, but leave Expiry Date empty
   - Click "Add" again
   - Verify you see a validation error message about the missing expiry date
   - Enter an invalid expiry date format (e.g., "1225" instead of "12/25")
   - Verify the form validates the format and shows an appropriate error

4. **Successfully Add a Card**
   - Enter valid information:
     - Card Number: "4111111111111234" (test card number)
     - Card Type: "VISA" (select from dropdown)
     - Expiry Date: "12/25" (in MM/YY format)
   - Click "Add"
   - Verify you see a success message "Card added successfully"
   - Verify the new card appears in the cards list
   - Verify the card displays:
     - The card type (VISA)
     - The last four digits (1234)
     - The expiry date (12/25)

5. **View Card Details**
   - Observe that the card is displayed with the correct icon (credit card icon for VISA)
   - Verify that editing and delete icons are present

## Test 2: Adding a New Transaction

### Steps:

1. **Navigate to the Transactions Page**
   - Click on "Transactions" in the main navigation menu
   - Verify you see the Transactions page with an "Add Transaction" button

2. **Open the Add Transaction Dialog**
   - Click the "Add Transaction" button
   - Verify a dialog opens with fields for:
     - Amount
     - Description
     - Merchant Name
     - Transaction Type (dropdown)
     - Category (dropdown)
     - Transaction Date
     - Card (dropdown showing your available cards)

3. **Test Form Validation**
   - Click "Add" without filling any fields
   - Verify you see a validation error message "Please fill all required fields"
   - Fill in some but not all required fields, then try to submit
   - Verify appropriate validation messages appear

4. **Successfully Add a Transaction**
   - Enter valid information:
     - Amount: "50.25"
     - Description: "Grocery shopping"
     - Merchant Name: "Supermarket"
     - Transaction Type: "PURCHASE" (should be default)
     - Category: "GROCERIES" (should be default)
     - Transaction Date: Today's date (should be pre-filled)
     - Card: Select the VISA card you added in Test 1
   - Click "Add"
   - Verify you see a success message "Transaction added successfully"
   - Verify the transaction appears in the transactions list
   - Verify the transaction displays correctly with:
     - The correct amount ($50.25)
     - The description (Grocery shopping)
     - The merchant name (Supermarket)
     - The correct category and type
     - Today's date

5. **View Transaction Details**
   - Click the "View details" icon (eye icon) for your new transaction
   - Verify you're taken to the Transaction Detail page
   - Verify all details match what you entered
   - Verify the associated card information is displayed correctly

## Test 3: Verifying Dashboard Updates

### Steps:

1. **Navigate to the Dashboard**
   - Click on "Dashboard" or the app logo to go to the main dashboard
   - Verify the dashboard statistics reflect the new card and transaction:
     - Card count should show at least 1
     - Transaction count should show at least 1
     - Total Spent should include your $50.25 purchase
   - Verify your new transaction appears in the "Recent Transactions" list
   - Verify the transaction details match what you entered

## Additional Validation

- Try adding a transaction with a different transaction type (e.g., "REFUND")
- Verify the amount is color-coded correctly (red for purchases, green for refunds)
- Try adding another card of a different type (e.g., "MASTERCARD")
- Verify you can select different cards when creating transactions
- Try editing an existing transaction and verify the changes are saved correctly
- Try deleting a transaction and verify it's removed from the list

## Troubleshooting

If any test fails, check the browser console (F12) for error messages that might provide more information about what went wrong.

Common issues:
- Backend API endpoints not responding
- Authentication issues (token expired)
- Network connectivity problems
- Form validation errors not properly communicated to the user 