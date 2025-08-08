#!/bin/bash

# Test script to validate cleanup-deployment.sh syntax
echo "Testing cleanup-deployment.sh syntax..."

if bash -n cleanup-deployment.sh; then
    echo "✅ Bash syntax is valid"
else
    echo "❌ Bash syntax errors found"
    exit 1
fi

echo "✅ Cleanup script is ready to use"
echo ""
echo "To run the cleanup script:"
echo "  ./cleanup-deployment.sh"
echo ""
echo "Make sure you have:"
echo "  - Azure CLI installed and logged in (az login)"
echo "  - Subscription set correctly"
echo "  - Bash environment (WSL, Git Bash, or Linux)"
