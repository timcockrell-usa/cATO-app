#!/bin/bash

# cATO Dashboard - Setup Script
# Upgrades NPM and installs dependencies for Azure Static Web Apps deployment

set -e

echo "🚀 cATO Dashboard Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.17.0 or higher first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE="18.17.0"

if ! node -e "process.exit(process.versions.node.split('.').map(Number).reduce((a,b,i) => a + b * Math.pow(1000, 2-i), 0) >= '$REQUIRED_NODE'.split('.').map(Number).reduce((a,b,i) => a + b * Math.pow(1000, 2-i), 0) ? 0 : 1)"; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to $REQUIRED_NODE or higher."
    exit 1
fi

echo "✅ Node.js version: v$NODE_VERSION"

# Update NPM to 11.5.2
echo "⬆️ Updating NPM to version 11.5.2..."
npm install -g npm@11.5.2

# Verify NPM version
NPM_VERSION=$(npm --version)
echo "✅ NPM version: $NPM_VERSION"

# Clean previous installation
echo "🧹 Cleaning previous installation..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type check
echo "🔍 Running TypeScript type check..."
if npm run type-check; then
    echo "✅ TypeScript check passed"
else
    echo "⚠️ TypeScript check found issues - review code for any remaining errors"
fi

# Build the application
echo "🏗️ Building application..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - check errors above"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your Azure environment variables"
echo "2. Run deployment: see DEPLOYMENT_GUIDE.md"
echo "3. For local development: npm run dev"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for complete deployment instructions"
