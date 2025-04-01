# PowerShell script to apply all the feature implementations

Write-Host "Applying features to the financial organizer app..." -ForegroundColor Green

# 1. Execute database migration for recurring transactions
Write-Host "1. Running database migration for recurring transactions..." -ForegroundColor Yellow
Copy-Item "migrations\create_recurring_transactions.py" "financial-organizer\migrations\"
cd financial-organizer\migrations
python create_recurring_transactions.py
cd ..
cd ..

# 2. Update backend files
Write-Host "2. Updating backend files..." -ForegroundColor Yellow

# Update main.py to include middleware
Write-Host "   - Updating main.py with middleware support..." -ForegroundColor Cyan
Copy-Item "backend\main.py.updated" "financial-organizer\backend\app\main.py" -Force

# Add recurring transactions endpoints
Write-Host "   - Adding recurring transactions API endpoints..." -ForegroundColor Cyan
$endpointsDir = "financial-organizer\backend\app\api\api_v1\endpoints"
if (-not (Test-Path $endpointsDir)) {
    New-Item -ItemType Directory -Path $endpointsDir -Force | Out-Null
}
Copy-Item "backend\app\api\api_v1\endpoints\recurring_transactions.py" "$endpointsDir\" -Force

# Update API router
Write-Host "   - Updating API router..." -ForegroundColor Cyan
Copy-Item "backend\app\api\api_v1\api.py.updated" "financial-organizer\backend\app\api\api_v1\api.py" -Force

# 3. Update frontend files
Write-Host "3. Updating frontend files..." -ForegroundColor Yellow

# Add SpendingVisualization component to frontend
Write-Host "   - Adding SpendingVisualization component..." -ForegroundColor Cyan
$componentsDir = "financial-organizer\frontend\src\components"
if (-not (Test-Path $componentsDir)) {
    New-Item -ItemType Directory -Path $componentsDir -Force | Out-Null
}
Copy-Item "frontend\src\components\SpendingVisualization.js" "$componentsDir\" -Force

# Add RecurringTransactionForm component
Write-Host "   - Adding RecurringTransactionForm component..." -ForegroundColor Cyan
Copy-Item "frontend\src\components\RecurringTransactionForm.js" "$componentsDir\" -Force

# Add RecurringTransactions page
Write-Host "   - Adding RecurringTransactions page..." -ForegroundColor Cyan
$pagesDir = "financial-organizer\frontend\src\pages"
if (-not (Test-Path $pagesDir)) {
    New-Item -ItemType Directory -Path $pagesDir -Force | Out-Null
}
Copy-Item "frontend\src\pages\RecurringTransactions.js" "$pagesDir\" -Force

# Update Dashboard with SpendingVisualization
Write-Host "   - Updating Dashboard with SpendingVisualization..." -ForegroundColor Cyan
Copy-Item "frontend\src\pages\Dashboard.js.updated" "$pagesDir\Dashboard.js" -Force

# Update App.js with new routes
Write-Host "   - Updating App.js with new routes..." -ForegroundColor Cyan
Copy-Item "frontend\src\App.js.updated" "financial-organizer\frontend\src\App.js" -Force

# Update SidebarMenu with new navigation items
Write-Host "   - Updating sidebar menu..." -ForegroundColor Cyan
Copy-Item "frontend\src\components\SidebarMenu.js.updated" "$componentsDir\SidebarMenu.js" -Force

# 4. Rebuild and restart containers
Write-Host "4. Rebuilding and restarting containers..." -ForegroundColor Yellow
cd financial-organizer
docker-compose down
docker-compose build
docker-compose up -d
cd ..

Write-Host "Features successfully applied!" -ForegroundColor Green
Write-Host "The following features are now active:" -ForegroundColor Green
Write-Host "- Automated testing in backend/tests/" -ForegroundColor White
Write-Host "- Rate limiting and input validation middleware" -ForegroundColor White
Write-Host "- Spending visualization dashboard" -ForegroundColor White
Write-Host "- Recurring transactions system" -ForegroundColor White
Write-Host ""
Write-Host "You can access these features through the updated UI navigation." -ForegroundColor White 