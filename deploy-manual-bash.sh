#!/bin/bash

# Manual deployment script for Azure Static Web Apps (Bash)
# Usage: ./deploy-manual.sh "YOUR_DEPLOYMENT_TOKEN_HERE"

if [ -z "$1" ]; then
    echo "❌ Error: Deployment token required"
    echo "Usage: $0 \"YOUR_DEPLOYMENT_TOKEN_HERE\""
    echo ""
    echo "To get your deployment token:"
    echo "1. Go to Azure Portal"
    echo "2. Navigate to your Static Web App: stapp-tlgsnk5eym2h2"
    echo "3. Click 'Manage deployment token'"
    echo "4. Copy the token and run: $0 \"paste-token-here\""
    exit 1
fi

DEPLOYMENT_TOKEN="$1"
APP_NAME="stapp-tlgsnk5eym2h2"
RESOURCE_GROUP="ampe-eastus-dev-rg"

echo "🚀 Starting manual deployment to Azure Static Web Apps..."
echo "📱 App: $APP_NAME"
echo "📂 Resource Group: $RESOURCE_GROUP"
echo ""

# Check if dist folder exists
if [ ! -d "./dist" ]; then
    echo "❌ Error: ./dist folder not found"
    echo "Please run 'npm run build' first"
    exit 1
fi

# Create deployment zip using zip command
echo "📦 Creating deployment package..."
cd dist
zip -r ../deployment.zip . > /dev/null 2>&1
cd ..

if [ ! -f "deployment.zip" ]; then
    echo "❌ Error: Failed to create deployment.zip"
    echo "Make sure 'zip' command is available"
    exit 1
fi

ZIP_SIZE=$(du -h deployment.zip | cut -f1)
echo "✅ Created deployment.zip ($ZIP_SIZE)"
echo ""

# Upload using curl to Azure Static Web Apps API
echo "🚀 Uploading to Azure Static Web Apps..."
echo "Note: This may take a few minutes..."
echo ""

RESPONSE=$(curl -s -w "%{http_code}" \
  -X POST \
  "https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy" \
  -H "Authorization: Bearer $DEPLOYMENT_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @deployment.zip)

HTTP_CODE="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

echo "HTTP Response Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your app should be live at: https://$APP_NAME.azurestaticapps.net"
    echo ""
    echo "Note: It may take a few minutes for changes to propagate."
else
    echo ""
    echo "❌ Deployment failed with HTTP code: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "Please check:"
    echo "1. Your deployment token is correct and not expired"
    echo "2. You have proper permissions"
    echo "3. Try again in a few minutes"
fi

# Clean up
rm -f deployment.zip
echo ""
echo "🧹 Cleaned up temporary files"
