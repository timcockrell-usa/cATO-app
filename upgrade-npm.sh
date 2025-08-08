#!/bin/bash

# NPM Upgrade Script for cATO Dashboard
# Upgrades NPM from 10.7.0 to 11.5.2 safely

echo "🔄 Starting NPM upgrade process..."

# Backup current configuration
echo "📦 Creating backup of current package files..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup 2>/dev/null || echo "No package-lock.json to backup"

# Check current versions
echo "📋 Current versions:"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"

# Update NPM globally
echo "⬆️ Updating NPM to version 11.5.2..."
npm install -g npm@11.5.2

# Verify new NPM version
echo "✅ New NPM version: $(npm --version)"

# Clear npm cache
echo "🧹 Clearing NPM cache..."
npm cache clean --force

# Remove node_modules and package-lock.json
echo "🗑️ Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

echo "🎉 NPM upgrade completed!"
echo "Next step: Run npm install to reinstall dependencies"
