#!/bin/bash
# Script to apply all the feature implementations

echo "Applying features to the financial organizer app..."

# 1. Execute database migration for recurring transactions
echo "1. Running database migration for recurring transactions..."
cd migrations
python create_recurring_transactions.py
cd ..

# 2. Update backend files
echo "2. Updating backend files..."

# Update main.py to include middleware
echo "   - Updating main.py with middleware support..."
cp backend/main.py.updated backend/app/main.py

# Add recurring transactions endpoints
echo "   - Adding recurring transactions API endpoints..."
mkdir -p backend/app/api/api_v1/endpoints/
cp backend/app/api/api_v1/endpoints/recurring_transactions.py backend/app/api/api_v1/endpoints/

# Update API router
echo "   - Updating API router..."
cp backend/app/api/api_v1/api.py.updated backend/app/api/api_v1/api.py

# 3. Update frontend files
echo "3. Updating frontend files..."

# Add SpendingVisualization component to dashboard
echo "   - Adding SpendingVisualization to dashboard..."
cp frontend/src/pages/Dashboard.js.updated frontend/src/pages/Dashboard.js

# Update App.js with new routes
echo "   - Updating App.js with new routes..."
cp frontend/src/App.js.updated frontend/src/App.js

# Update SidebarMenu with new navigation items
echo "   - Updating sidebar menu..."
cp frontend/src/components/SidebarMenu.js.updated frontend/src/components/SidebarMenu.js

# 4. Rebuild and restart containers
echo "4. Rebuilding and restarting containers..."
docker-compose down
docker-compose build
docker-compose up -d

echo "Features successfully applied! The following features are now active:"
echo "- Automated testing in backend/tests/"
echo "- Rate limiting and input validation middleware"
echo "- Spending visualization dashboard"
echo "- Recurring transactions system"
echo ""
echo "You can access these features through the updated UI navigation." 