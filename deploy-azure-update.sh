#!/bin/bash

# Azure Cloud Shell Deployment Script
# Updates deployed cATO application with enhanced NIST controls data
# Run this script in Azure Cloud Shell

set -e

echo "🚀 Starting cATO application update with enhanced NIST controls..."

# Configuration
RESOURCE_GROUP="your-resource-group-name"  # Update with your resource group
WEBAPP_NAME="your-webapp-name"             # Update with your web app name
STORAGE_ACCOUNT="your-storage-account"     # Update with your storage account

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "azure.yaml" ]; then
    print_error "Please run this script from the root of your cATO application directory"
    exit 1
fi

print_status "Found cATO application files"

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_warning "Installing dependencies..."
    npm install
fi

# Step 3: Update NIST controls data from CSV
print_status "Processing NIST controls CSV data..."
if [ -f "scripts/update-nist-controls.cjs" ]; then
    node scripts/update-nist-controls.cjs
    print_status "NIST controls data updated successfully"
else
    print_error "Missing update-nist-controls.cjs script"
    exit 1
fi

# Step 4: Build the application
print_status "Building application..."
npm run build

# Step 5: Deploy to Azure Static Web Apps
print_status "Deploying to Azure Static Web Apps..."

# Check if Azure CLI is logged in
if ! az account show > /dev/null 2>&1; then
    print_warning "Please log in to Azure CLI first: az login"
    exit 1
fi

# Deploy using Azure Static Web Apps CLI or direct deployment
if command -v swa &> /dev/null; then
    # Using SWA CLI
    swa deploy ./dist --app-name $WEBAPP_NAME
else

    # Using Azure CLI to get deployment token and deploy
    print_status "Getting deployment token..."
    DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" --output tsv)
    
    # Deploy using Azure REST API
    print_status "Uploading build artifacts..."
    
    # Create deployment package
    cd dist
    zip -r ../deployment.zip .
    cd ..
    
    # Upload to Azure
    curl -X POST \
        -H "Content-Type: application/zip" \
        -H "Authorization: Bearer $DEPLOYMENT_TOKEN" \
        --data-binary @deployment.zip \
        "https://$WEBAPP_NAME.azurestaticapps.net/api/zipdeploy"
    
    rm deployment.zip
fi

# Step 6: Update database schema if needed
print_status "Checking for database updates..."

# If using Azure SQL Database
if [ ! -z "$DATABASE_CONNECTION_STRING" ]; then
    print_status "Updating database schema..."
    
    # Run database migration script
    if [ -f "database/migrate-nist-controls.sql" ]; then
        sqlcmd -S $SQL_SERVER -d $DATABASE_NAME -U $SQL_USERNAME -P $SQL_PASSWORD -i database/migrate-nist-controls.sql
        print_status "Database schema updated"
    fi
fi

# Step 7: Verify deployment
print_status "Verifying deployment..."
WEBAPP_URL="https://$WEBAPP_NAME.azurestaticapps.net"

# Wait a moment for deployment to complete
sleep 30

# Check if the site is responding
if curl -f -s $WEBAPP_URL > /dev/null; then
    print_status "✅ Deployment successful!"
    echo ""
    echo "🌐 Your updated cATO application is available at:"
    echo "   $WEBAPP_URL"
    echo ""
    echo "📊 New features include:"
    echo "   • Enhanced NIST 800-53 Rev 5 controls (134 total)"
    echo "   • Azure Commercial remediation guidance"
    echo "   • Azure Government remediation guidance"
    echo "   • Improved control filtering and search"
else
    print_error "Deployment verification failed. Please check the Azure portal for details."
    exit 1
fi

echo ""
print_status "Deployment completed successfully! 🎉"
