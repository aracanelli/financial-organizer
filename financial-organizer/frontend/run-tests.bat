@echo off
echo Running Tests for Financial Organizer...
echo.
echo Testing Cards Component...
npx jest src/__tests__/Cards.test.js --testEnvironment=jsdom
echo.
echo Testing Transactions Component...
npx jest src/__tests__/Transactions.test.js --testEnvironment=jsdom
echo.
echo Tests completed! 