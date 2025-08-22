#!/bin/bash

# Manual deployment script for Azure Static Web Apps (Bash) - CORRECTED VERSION
# Usage: ./deploy-manual-bash-fixed.sh "YOUR_DEPLOYMENT_TOKEN_HERE"

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

echo "🚀 Starting manual deployment to Azure Static Web Apps..."
echo "📱 App: $APP_NAME"
echo ""

# Check if dist folder exists
if [ ! -d "./dist" ]; then
    echo "❌ Error: ./dist folder not found"
    echo "Please run 'npm run build' first"
    exit 1
fi

echo "📂 Files to deploy:"
ls -la ./dist/

# Create a simple deployment using the SWA API
echo ""
echo "🚀 Deploying to Azure Static Web Apps..."
echo "Note: Using Azure Static Web Apps REST API..."

# Method 1: Try direct file upload approach
echo "📤 Uploading files..."

# Create a tar.gz instead of zip for better compatibility
cd dist
tar -czf ../deployment.tar.gz .
cd ..

if [ ! -f "deployment.tar.gz" ]; then
    echo "❌ Error: Failed to create deployment.tar.gz"
    exit 1
fi

TAR_SIZE=$(du -h deployment.tar.gz | cut -f1)
echo "✅ Created deployment.tar.gz ($TAR_SIZE)"

# Use the correct Azure Static Web Apps deployment endpoint
# The correct endpoint for SWA is different from regular App Service
SWA_API_URL="https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy"

echo ""
echo "🌐 Deployment URL: $SWA_API_URL"
echo "🔑 Using deployment token (length: ${#DEPLOYMENT_TOKEN} chars)"

# First, let's test the authentication
echo ""
echo "🔍 Testing authentication..."
AUTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET \
  "https://$APP_NAME.scm.azurewebsites.net/api/deployments" \
  -H "Authorization: Bearer $DEPLOYMENT_TOKEN")

echo "Auth test response: $AUTH_TEST"

if [ "$AUTH_TEST" = "401" ] || [ "$AUTH_TEST" = "403" ]; then
    echo "❌ Authentication failed. Please check your deployment token."
    echo "💡 Make sure you copied the entire token from Azure Portal"
    echo "💡 Token should start with something like: 'YOUR_TOKEN_HERE'"
    rm -f deployment.tar.gz
    exit 1
fi

# Convert tar.gz back to zip for Azure compatibility
echo "🔄 Converting to zip format for Azure..."
rm -f deployment.zip
gunzip deployment.tar.gz
tar -tf deployment.tar | zip deployment.zip -@
rm -f deployment.tar

# Now attempt the deployment
echo ""
echo "📤 Uploading deployment package..."

RESPONSE=$(curl -s -w "%{http_code}" \
  -X POST \
  "$SWA_API_URL" \
  -H "Authorization: Bearer $DEPLOYMENT_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @deployment.zip \
  --max-time 300)

HTTP_CODE="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

echo ""
echo "📊 Deployment Response:"
echo "HTTP Code: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ] || [ "$HTTP_CODE" = "204" ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your app should be live at: https://$APP_NAME.azurestaticapps.net"
    echo ""
    echo "⏰ Note: It may take 2-5 minutes for changes to propagate globally."
    echo "🔄 If you don't see changes immediately, wait a few minutes and refresh."
elif [ "$HTTP_CODE" = "000" ]; then
    echo ""
    echo "❌ Network error (HTTP 000) - This usually means:"
    echo "   1. Network connectivity issue"
    echo "   2. Invalid deployment token format"
    echo "   3. Token has expired"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "   1. Get a fresh deployment token from Azure Portal"
    echo "   2. Make sure you're in Azure Cloud Shell with internet access"
    echo "   3. Try the token without quotes: ./script.sh TOKEN_HERE"
    echo "   4. Or with quotes: ./script.sh \"TOKEN_HERE\""
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo ""
    echo "❌ Authentication failed (HTTP $HTTP_CODE)"
    echo "💡 Please get a new deployment token from Azure Portal:"
    echo "   1. Go to Static Web Apps → stapp-tlgsnk5eym2h2"
    echo "   2. Click 'Manage deployment token'"
    echo "   3. Reset and copy the new token"
else
    echo ""
    echo "❌ Deployment failed with HTTP code: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "💡 Common solutions:"
    echo "   • Wait a few minutes and try again"
    echo "   • Get a fresh deployment token"
    echo "   • Check if the Static Web App exists and is accessible"
fi

# Clean up
rm -f deployment.zip deployment.tar.gz
echo ""
echo "🧹 Cleaned up temporary files"
