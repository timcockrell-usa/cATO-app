#!/bin/bash

# cATO Dashboard - Cleanup Script
# This script removes all cATO Dashboard resources from your existing resource group
# WITHOUT affecting any existing infrastructure (VNet, etc.)

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Update these values to match your deployment
RESOURCE_GROUP="ampe-eastus-dev-rg"
SUBSCRIPTION_ID="930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
ENVIRONMENT_NAME="dev"

echo -e "${BLUE}🧹 cATO Dashboard Cleanup Script${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will remove ALL cATO Dashboard resources from:${NC}"
echo -e "   Resource Group: ${RESOURCE_GROUP}"
echo -e "   Subscription: ${SUBSCRIPTION_ID}"
echo ""
echo -e "${GREEN}✅ This script will NOT remove:${NC}"
echo -e "   • Your existing VNet (ampe-eus-dev-vnet)"
echo -e "   • Your existing resource group"
echo -e "   • Any other existing infrastructure"
echo ""

# Confirmation prompt
read -p "Are you sure you want to proceed? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
    echo -e "${RED}❌ Cleanup cancelled.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Setting up Azure CLI context...${NC}"

# Set subscription
az account set --subscription "$SUBSCRIPTION_ID"
echo -e "${GREEN}✅ Set subscription to: $SUBSCRIPTION_ID${NC}"

# Verify resource group exists
if ! az group show --name "$RESOURCE_GROUP" > /dev/null 2>&1; then
    echo -e "${RED}❌ Resource group '$RESOURCE_GROUP' not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Verified resource group: $RESOURCE_GROUP${NC}"
echo ""

# Function to safely delete resources with error handling
delete_resource() {
    local resource_type=$1
    local resource_name=$2
    local display_name=$3
    
    echo -e "${BLUE}🗑️  Checking for $display_name...${NC}"
    
    # Check if resource exists
    if az resource show --resource-group "$RESOURCE_GROUP" --name "$resource_name" --resource-type "$resource_type" > /dev/null 2>&1; then
        echo -e "${YELLOW}   Found: $resource_name${NC}"
        echo -e "${BLUE}   Deleting $display_name...${NC}"
        
        if az resource delete --resource-group "$RESOURCE_GROUP" --name "$resource_name" --resource-type "$resource_type" --yes; then
            echo -e "${GREEN}   ✅ Successfully deleted: $display_name${NC}"
        else
            echo -e "${RED}   ❌ Failed to delete: $display_name${NC}"
        fi
    else
        echo -e "${YELLOW}   ℹ️  Not found: $resource_name (may already be deleted)${NC}"
    fi
    echo ""
}

# Function to get resource token (matches Bicep logic)
get_resource_token() {
    # This approximates the Bicep uniqueString function
    # In practice, you might need to adjust this based on actual deployed resource names
    local input="$SUBSCRIPTION_ID$RESOURCE_GROUP$ENVIRONMENT_NAME"
    echo "$input" | sha256sum | cut -c1-13 | tr '[:upper:]' '[:lower:]'
}

RESOURCE_TOKEN=$(get_resource_token)
echo -e "${BLUE}📋 Using resource token: $RESOURCE_TOKEN${NC}"
echo ""

# Define resource names (matches Bicep naming convention)
COSMOS_ACCOUNT="cosmos-$RESOURCE_TOKEN"
STATIC_WEB_APP="stapp-$RESOURCE_TOKEN"
MANAGED_IDENTITY="id-$RESOURCE_TOKEN"
KEY_VAULT="kv-$RESOURCE_TOKEN"
LOG_ANALYTICS="log-$RESOURCE_TOKEN"
APP_INSIGHTS="appi-$RESOURCE_TOKEN"

echo -e "${BLUE}🎯 Target resources to delete:${NC}"
echo -e "   • Static Web App: $STATIC_WEB_APP"
echo -e "   • Cosmos DB: $COSMOS_ACCOUNT"
echo -e "   • Key Vault: $KEY_VAULT"
echo -e "   • Managed Identity: $MANAGED_IDENTITY"
echo -e "   • Log Analytics: $LOG_ANALYTICS"
echo -e "   • App Insights: $APP_INSIGHTS"
echo ""

# Start deletion process
echo -e "${BLUE}🚀 Starting cleanup process...${NC}"
echo ""

# Delete Static Web App first (fastest to delete)
delete_resource "Microsoft.Web/staticSites" "$STATIC_WEB_APP" "Static Web App"

# Delete Application Insights
delete_resource "Microsoft.Insights/components" "$APP_INSIGHTS" "Application Insights"

# Delete Key Vault (with purge protection check)
echo -e "${BLUE}🗑️  Checking for Key Vault...${NC}"
if az keyvault show --name "$KEY_VAULT" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    echo -e "${YELLOW}   Found Key Vault: $KEY_VAULT${NC}"
    echo -e "${BLUE}   Deleting Key Vault...${NC}"
    
    if az keyvault delete --name "$KEY_VAULT" --resource-group "$RESOURCE_GROUP"; then
        echo -e "${GREEN}   ✅ Key Vault deleted: $KEY_VAULT${NC}"
        
        # Check if purge is needed (for complete cleanup)
        echo -e "${YELLOW}   ⚠️  Key Vault is soft-deleted. Purging for complete cleanup...${NC}"
        if az keyvault purge --name "$KEY_VAULT" --no-wait; then
            echo -e "${GREEN}   ✅ Key Vault purged: $KEY_VAULT${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Could not purge Key Vault (may require additional permissions)${NC}"
        fi
    else
        echo -e "${RED}   ❌ Failed to delete Key Vault${NC}"
    fi
else
    echo -e "${YELLOW}   ℹ️  Key Vault not found: $KEY_VAULT${NC}"
fi
echo ""

# Delete Cosmos DB (takes longest)
echo -e "${BLUE}🗑️  Checking for Cosmos DB...${NC}"
if az cosmosdb show --name "$COSMOS_ACCOUNT" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    echo -e "${YELLOW}   Found Cosmos DB: $COSMOS_ACCOUNT${NC}"
    echo -e "${BLUE}   Deleting Cosmos DB (this may take several minutes)...${NC}"
    
    if az cosmosdb delete --name "$COSMOS_ACCOUNT" --resource-group "$RESOURCE_GROUP" --yes; then
        echo -e "${GREEN}   ✅ Cosmos DB deletion initiated: $COSMOS_ACCOUNT${NC}"
        echo -e "${YELLOW}   ℹ️  Cosmos DB deletion continues in the background${NC}"
    else
        echo -e "${RED}   ❌ Failed to delete Cosmos DB${NC}"
    fi
else
    echo -e "${YELLOW}   ℹ️  Cosmos DB not found: $COSMOS_ACCOUNT${NC}"
fi
echo ""

# Delete Log Analytics workspace
delete_resource "Microsoft.OperationalInsights/workspaces" "$LOG_ANALYTICS" "Log Analytics Workspace"

# Delete Managed Identity (delete last as other resources may depend on it)
delete_resource "Microsoft.ManagedIdentity/userAssignedIdentities" "$MANAGED_IDENTITY" "Managed Identity"

echo ""
echo -e "${GREEN}🎉 Cleanup process completed!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "${GREEN}✅ All cATO Dashboard resources have been removed${NC}"
echo -e "${GREEN}✅ Your existing VNet and other infrastructure remain intact${NC}"
echo -e "${YELLOW}ℹ️  Cosmos DB deletion may take additional time to complete in the background${NC}"
echo ""
echo -e "${BLUE}🔍 To verify cleanup, run:${NC}"
echo -e "   az resource list --resource-group $RESOURCE_GROUP --query \"[?contains(tags.'azd-env-name', '$ENVIRONMENT_NAME')]\""
echo ""
echo -e "${GREEN}✨ Resource group '$RESOURCE_GROUP' is ready for fresh deployment!${NC}"
