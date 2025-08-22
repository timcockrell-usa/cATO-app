#!/bin/bash

# Azure Static Web Apps Deployment - CORRECTED BASH VERSION
# Usage: ./deploy-bash-fixed.sh "YOUR_DEPLOYMENT_TOKEN_HERE"

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

echo "🚀 Azure Static Web Apps Deployment (Bash)"
echo "📱 App: $APP_NAME"
echo ""

# Check if dist folder exists
if [ ! -d "./dist" ]; then
    echo "❌ Error: ./dist folder not found"
    echo "Please run 'npm run build' first"
    exit 1
fi

echo "📂 Files ready for deployment:"
ls -la ./dist/

# Create deployment package
echo ""
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

# Clean the token (remove quotes and whitespace)
CLEAN_TOKEN=$(echo "$DEPLOYMENT_TOKEN" | tr -d '"' | tr -d "'" | tr -d ' ')
echo "🔑 Using deployment token (length: ${#CLEAN_TOKEN} chars)"

# Test authentication first
echo ""
echo "🔍 Testing authentication..."

AUTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET \
  "https://$APP_NAME.scm.azurewebsites.net/" \
  -H "Authorization: Bearer $CLEAN_TOKEN" \
  --connect-timeout 10)

echo "Authentication test: HTTP $AUTH_TEST"

if [ "$AUTH_TEST" = "401" ] || [ "$AUTH_TEST" = "403" ]; then
    echo "❌ Authentication failed - token is invalid"
    echo "💡 Get a fresh deployment token from Azure Portal"
    rm -f deployment.zip
    exit 1
elif [ "$AUTH_TEST" = "000" ]; then
    echo "⚠️ Network connectivity issue - but will try deployment anyway"
fi

# Perform deployment
echo ""
echo "🚀 Deploying to Azure Static Web Apps..."
echo "⏰ This may take 2-5 minutes..."

# Use the correct deployment endpoint for Static Web Apps
DEPLOYMENT_URL="https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy"

echo "🌐 Deployment URL: $DEPLOYMENT_URL"
echo ""

RESPONSE=$(curl -s -w "%{http_code}" \
  -X POST \
  "$DEPLOYMENT_URL" \
  -H "Authorization: Bearer $CLEAN_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @deployment.zip \
  --connect-timeout 30 \
  --max-time 300)

HTTP_CODE="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

echo ""
echo "📊 Deployment Results:"
echo "HTTP Code: $HTTP_CODE"

case $HTTP_CODE in
    "200"|"202"|"204")
        echo ""
        echo "✅ Deployment completed successfully!"
        echo "🌐 Your app is live at: https://$APP_NAME.azurestaticapps.net"
        echo ""
        echo "⏰ Changes may take 2-5 minutes to propagate globally"
        echo "🔄 If you don't see changes, wait and refresh the page"
        ;;
    "000")
        echo ""
        echo "❌ HTTP 000 Error - This usually means:"
        echo "   1. Token format issue (try without quotes)"
        echo "   2. Network connectivity problem"
        echo "   3. Token has expired"
        echo ""
        echo "🔧 Try this:"
        echo "   1. Get a FRESH deployment token from Azure Portal:"
        echo "      Portal → Static Web Apps → $APP_NAME → Manage deployment token → Reset"
        echo "   2. Copy the entire new token"
        echo "   3. Run: $0 \"new-token-here\""
        echo "   4. Or try without quotes: $0 new-token-here"
        ;;
    "401"|"403")
        echo ""
        echo "❌ Authentication failed (HTTP $HTTP_CODE)"
        echo "💡 Your deployment token is invalid or expired"
        echo "💡 Get a fresh token from Azure Portal:"
        echo "   Portal → Static Web Apps → $APP_NAME → Manage deployment token → Reset"
        ;;
    *)
        echo ""
        echo "❌ Deployment failed with HTTP code: $HTTP_CODE"
        echo "Response: $RESPONSE_BODY"
        echo ""
        echo "💡 Common solutions:"
        echo "   • Wait a few minutes and try again"
        echo "   • Get a fresh deployment token"
        echo "   • Check if the Static Web App exists and is accessible"
        ;;
esac

# Clean up
rm -f deployment.zip
echo ""
echo "🧹 Cleaned up temporary files"

echo ""
echo "📋 Summary:"
echo "   • App Name: $APP_NAME"
echo "   • Live URL: https://$APP_NAME.azurestaticapps.net"
echo "   • Result: HTTP $HTTP_CODE"
