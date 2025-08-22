#!/bin/bash

# Simple Azure Static Web Apps deployment using Azure CLI (RECOMMENDED)
# Usage: ./deploy-simple.sh "YOUR_DEPLOYMENT_TOKEN_HERE"

if [ -z "$1" ]; then
    echo "❌ Error: Deployment token required"
    echo "Usage: $0 \"YOUR_DEPLOYMENT_TOKEN_HERE\""
    echo ""
    echo "To get your deployment token:"
    echo "1. Go to Azure Portal → Static Web Apps → stapp-tlgsnk5eym2h2"
    echo "2. Click 'Manage deployment token'"
    echo "3. Copy the token and run: $0 \"paste-token-here\""
    exit 1
fi

DEPLOYMENT_TOKEN="$1"
APP_NAME="stapp-tlgsnk5eym2h2"
RESOURCE_GROUP="ampe-eastus-dev-rg"

echo "🚀 Azure Static Web Apps Deployment"
echo "📱 App: $APP_NAME"
echo "📂 Resource Group: $RESOURCE_GROUP"
echo ""

# Check if dist folder exists
if [ ! -d "./dist" ]; then
    echo "❌ Error: ./dist folder not found"
    echo "Please run 'npm run build' first"
    exit 1
fi

echo "📂 Deployment files ready:"
ls -la ./dist/

# Method 1: Try using Azure CLI (if available)
if command -v az &> /dev/null; then
    echo ""
    echo "🔍 Found Azure CLI - attempting deployment..."
    
    # Check if logged in
    if az account show &> /dev/null; then
        echo "✅ Azure CLI authenticated"
        
        # Try to deploy using Azure CLI
        echo "📤 Deploying using Azure CLI..."
        
        az staticwebapp deployment create \
            --name "$APP_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --source "./dist" \
            --token "$DEPLOYMENT_TOKEN"
        
        if [ $? -eq 0 ]; then
            echo "✅ Deployment successful via Azure CLI!"
            echo "🌐 Your app: https://$APP_NAME.azurestaticapps.net"
            exit 0
        else
            echo "⚠️ Azure CLI deployment failed, trying manual method..."
        fi
    else
        echo "⚠️ Azure CLI not authenticated, trying manual method..."
    fi
fi

# Method 2: Manual upload using curl
echo ""
echo "📤 Using manual upload method..."

# Create deployment package
cd dist
zip -r ../deployment.zip . > /dev/null 2>&1
cd ..

if [ ! -f "deployment.zip" ]; then
    echo "❌ Error: Failed to create deployment.zip"
    exit 1
fi

ZIP_SIZE=$(du -h deployment.zip | cut -f1)
echo "✅ Created deployment.zip ($ZIP_SIZE)"

# Test the token first
echo ""
echo "🔍 Testing deployment token..."
TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET \
    "https://$APP_NAME.scm.azurewebsites.net/" \
    -H "Authorization: Bearer $DEPLOYMENT_TOKEN")

echo "Token test response: $TEST_RESPONSE"

if [ "$TEST_RESPONSE" = "000" ]; then
    echo "❌ Network error - cannot reach deployment endpoint"
    echo "💡 Please check:"
    echo "   1. You're in Azure Cloud Shell with internet access"
    echo "   2. The Static Web App name is correct: $APP_NAME"
    echo "   3. Your deployment token is valid"
    rm -f deployment.zip
    exit 1
fi

# Attempt deployment
echo ""
echo "🚀 Uploading to Azure Static Web Apps..."
echo "⏰ This may take a few minutes..."

RESPONSE=$(curl -L -s -w "%{http_code}" \
    -X POST \
    "https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy" \
    -H "Authorization: Bearer $DEPLOYMENT_TOKEN" \
    -H "Content-Type: application/zip" \
    --data-binary @deployment.zip \
    --connect-timeout 30 \
    --max-time 300)

HTTP_CODE="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

echo ""
echo "📊 Deployment Results:"
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ] || [ "$HTTP_CODE" = "204" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Live URL: https://$APP_NAME.azurestaticapps.net"
    echo ""
    echo "⏰ Changes may take 2-5 minutes to appear globally"
elif [ "$HTTP_CODE" = "000" ]; then
    echo "❌ HTTP 000 Error - Token or connectivity issue"
    echo ""
    echo "🔧 Fix this by:"
    echo "   1. Get a NEW deployment token from Azure Portal"
    echo "   2. Use token WITHOUT quotes: $0 your-token-here"
    echo "   3. Or WITH quotes: $0 \"your-token-here\""
    echo ""
    echo "📋 To get a new token:"
    echo "   Portal → Static Web Apps → $APP_NAME → Manage deployment token → Reset"
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "❌ Authentication failed - invalid token"
    echo "💡 Get a fresh token from Azure Portal"
else
    echo "❌ Deployment failed: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Cleanup
rm -f deployment.zip
echo ""
echo "🧹 Temporary files cleaned up"
