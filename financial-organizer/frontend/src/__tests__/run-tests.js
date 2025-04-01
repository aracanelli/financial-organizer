/**
 * Test Runner for Card and Transaction Tests
 * 
 * This script helps run the automated tests for the Cards and Transactions components.
 * To use this script:
 * 
 * 1. Navigate to the project root and run: 
 *    node src/__tests__/run-tests.js
 * 
 * 2. To run a specific test file only:
 *    node src/__tests__/run-tests.js --cards     (run only Cards.test.js)
 *    node src/__tests__/run-tests.js --trans     (run only Transactions.test.js)
 * 
 * Note: This script requires Jest to be installed. You may need to modify
 * the path to Jest based on your environment.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get command line arguments
const args = process.argv.slice(2);
const runCardsOnly = args.includes('--cards');
const runTransactionsOnly = args.includes('--trans');

// Define test files
const CARDS_TEST = 'Cards.test.js';
const TRANSACTIONS_TEST = 'Transactions.test.js';

// Function to run tests
function runTests(testFiles) {
  console.log('\n============================================');
  console.log('🧪 RUNNING TESTS FOR FINANCIAL ORGANIZER 🧪');
  console.log('============================================\n');
  
  for (const file of testFiles) {
    try {
      console.log(`\n📋 Running tests in ${file}...\n`);
      
      // Path to the test file
      const testFile = path.join(__dirname, file);
      
      // Check if the file exists
      if (!fs.existsSync(testFile)) {
        console.error(`❌ Error: Test file ${file} not found!`);
        continue;
      }
      
      // Run Jest for the specific test file
      execSync(`npx jest ${testFile} --testEnvironment=jsdom --colors`, { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' }
      });
      
      console.log(`\n✅ Tests in ${file} completed successfully!\n`);
    } catch (error) {
      console.error(`\n❌ Tests in ${file} failed with error: ${error.message}\n`);
    }
  }
  
  console.log('\n============================================');
  console.log('🏁 TESTING COMPLETED 🏁');
  console.log('============================================\n');
}

// Determine which tests to run
let testFiles = [];

if (runCardsOnly) {
  testFiles = [CARDS_TEST];
} else if (runTransactionsOnly) {
  testFiles = [TRANSACTIONS_TEST];
} else {
  testFiles = [CARDS_TEST, TRANSACTIONS_TEST];
}

// Run the tests
runTests(testFiles); 