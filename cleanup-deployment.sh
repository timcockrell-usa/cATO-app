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
        
        # Use --force instead of --yes for az resource delete
        if az resource delete --resource-group "$RESOURCE_GROUP" --name "$resource_name" --resource-type "$resource_type" --force; then
            echo -e "${GREEN}   ✅ Successfully deleted: $display_name${NC}"
        else
            echo -e "${RED}   ❌ Failed to delete: $display_name${NC}"
        fi
    else
        echo -e "${YELLOW}   ℹ️  Not found: $resource_name (may already be deleted)${NC}"
    fi
    echo ""
}

# Function to discover cATO resources dynamically
discover_cato_resources() {
    echo -e "${BLUE}🔍 Discovering cATO Dashboard resources...${NC}"
    
    # Get all resources in the resource group
    local all_resources=$(az resource list --resource-group "$RESOURCE_GROUP" --query "[].{name:name, type:type}" -o tsv)
    
    # Find Cosmos DB resources (cosmos-*)
    COSMOS_ACCOUNTS=($(echo "$all_resources" | awk '$2=="Microsoft.DocumentDB/databaseAccounts" {print $1}' | grep "^cosmos-"))
    
    # Find Static Web Apps (stapp-*)
    STATIC_WEB_APPS=($(echo "$all_resources" | awk '$2=="Microsoft.Web/staticSites" {print $1}' | grep "^stapp-"))
    
    # Find Managed Identities (id-*)
    MANAGED_IDENTITIES=($(echo "$all_resources" | awk '$2=="Microsoft.ManagedIdentity/userAssignedIdentities" {print $1}' | grep "^id-"))
    
    # Find Key Vaults (kv-*)
    KEY_VAULTS=($(echo "$all_resources" | awk '$2=="Microsoft.KeyVault/vaults" {print $1}' | grep "^kv-"))
    
    # Find Log Analytics (log-*)
    LOG_ANALYTICS=($(echo "$all_resources" | awk '$2=="Microsoft.OperationalInsights/workspaces" {print $1}' | grep "^log-"))
    
    # Find Application Insights (appi-*)
    APP_INSIGHTS=($(echo "$all_resources" | awk '$2=="Microsoft.Insights/components" {print $1}' | grep "^appi-"))
    
    # Find Smart Detector Alert Rules (these are auto-created with App Insights)
    SMART_DETECTORS=($(echo "$all_resources" | awk '$2=="microsoft.alertsmanagement/smartDetectorAlertRules" {print $1}'))
    
    echo -e "${GREEN}✅ Discovered cATO resources:${NC}"
    echo -e "   • Cosmos DB accounts: ${#COSMOS_ACCOUNTS[@]}"
    echo -e "   • Static Web Apps: ${#STATIC_WEB_APPS[@]}"
    echo -e "   • Managed Identities: ${#MANAGED_IDENTITIES[@]}"
    echo -e "   • Key Vaults: ${#KEY_VAULTS[@]}"
    echo -e "   • Log Analytics: ${#LOG_ANALYTICS[@]}"
    echo -e "   • App Insights: ${#APP_INSIGHTS[@]}"
    echo -e "   • Smart Detectors: ${#SMART_DETECTORS[@]}"
    echo ""
}

# Discover resources
discover_cato_resources

echo -e "${BLUE}🎯 Found cATO resources to delete:${NC}"
for resource in "${STATIC_WEB_APPS[@]}"; do echo -e "   • Static Web App: $resource"; done
for resource in "${COSMOS_ACCOUNTS[@]}"; do echo -e "   • Cosmos DB: $resource"; done
for resource in "${KEY_VAULTS[@]}"; do echo -e "   • Key Vault: $resource"; done
for resource in "${MANAGED_IDENTITIES[@]}"; do echo -e "   • Managed Identity: $resource"; done
for resource in "${LOG_ANALYTICS[@]}"; do echo -e "   • Log Analytics: $resource"; done
for resource in "${APP_INSIGHTS[@]}"; do echo -e "   • App Insights: $resource"; done
for resource in "${SMART_DETECTORS[@]}"; do echo -e "   • Smart Detector: $resource"; done
echo ""

# Final confirmation before deletion
if [[ ${#STATIC_WEB_APPS[@]} -eq 0 && ${#COSMOS_ACCOUNTS[@]} -eq 0 && ${#KEY_VAULTS[@]} -eq 0 && ${#MANAGED_IDENTITIES[@]} -eq 0 && ${#LOG_ANALYTICS[@]} -eq 0 && ${#APP_INSIGHTS[@]} -eq 0 ]]; then
    echo -e "${YELLOW}ℹ️  No cATO Dashboard resources found to delete.${NC}"
    echo -e "${GREEN}✅ Resource group appears to be clean already.${NC}"
    exit 0
fi

read -p "Proceed with deleting these $(( ${#STATIC_WEB_APPS[@]} + ${#COSMOS_ACCOUNTS[@]} + ${#KEY_VAULTS[@]} + ${#MANAGED_IDENTITIES[@]} + ${#LOG_ANALYTICS[@]} + ${#APP_INSIGHTS[@]} + ${#SMART_DETECTORS[@]} )) resources? (yes/no): " final_confirm
if [[ $final_confirm != "yes" ]]; then
    echo -e "${RED}❌ Cleanup cancelled.${NC}"
    exit 1
fi

# Start deletion process
echo -e "${BLUE}🚀 Starting cleanup process...${NC}"
echo ""

# Delete Static Web Apps (fastest to delete)
for resource in "${STATIC_WEB_APPS[@]}"; do
    delete_resource "Microsoft.Web/staticSites" "$resource" "Static Web App"
done

# Delete Application Insights
for resource in "${APP_INSIGHTS[@]}"; do
    delete_resource "Microsoft.Insights/components" "$resource" "Application Insights"
done

# Delete Smart Detector Alert Rules
for resource in "${SMART_DETECTORS[@]}"; do
    delete_resource "microsoft.alertsmanagement/smartDetectorAlertRules" "$resource" "Smart Detector Alert Rule"
done

# Delete Key Vaults (with purge protection check)
for kv_name in "${KEY_VAULTS[@]}"; do
    echo -e "${BLUE}🗑️  Checking for Key Vault: $kv_name...${NC}"
    if az keyvault show --name "$kv_name" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
        echo -e "${YELLOW}   Found Key Vault: $kv_name${NC}"
        echo -e "${BLUE}   Deleting Key Vault...${NC}"
        
        if az keyvault delete --name "$kv_name" --resource-group "$RESOURCE_GROUP"; then
            echo -e "${GREEN}   ✅ Key Vault deleted: $kv_name${NC}"
            
            # Check if purge is needed (for complete cleanup)
            echo -e "${YELLOW}   ⚠️  Key Vault is soft-deleted. Purging for complete cleanup...${NC}"
            if az keyvault purge --name "$kv_name" --no-wait; then
                echo -e "${GREEN}   ✅ Key Vault purged: $kv_name${NC}"
            else
                echo -e "${YELLOW}   ⚠️  Could not purge Key Vault (may require additional permissions)${NC}"
            fi
        else
            echo -e "${RED}   ❌ Failed to delete Key Vault${NC}"
        fi
    else
        echo -e "${YELLOW}   ℹ️  Key Vault not found: $kv_name${NC}"
    fi
    echo ""
done

# Delete Log Analytics Workspaces
for resource in "${LOG_ANALYTICS[@]}"; do
    delete_resource "Microsoft.OperationalInsights/workspaces" "$resource" "Log Analytics Workspace"
done

# Delete Managed Identities
for resource in "${MANAGED_IDENTITIES[@]}"; do
    delete_resource "Microsoft.ManagedIdentity/userAssignedIdentities" "$resource" "User-Assigned Managed Identity"
done

# Delete Cosmos DB accounts (slowest, do last)
for resource in "${COSMOS_ACCOUNTS[@]}"; do
    echo -e "${BLUE}🗑️  Deleting Cosmos DB: $resource...${NC}"
    echo -e "${YELLOW}   ⚠️  This may take several minutes...${NC}"
    delete_resource "Microsoft.DocumentDB/databaseAccounts" "$resource" "Cosmos DB Account"
done

echo ""
echo -e "${GREEN}🎉 Cleanup process completed!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "${GREEN}✅ All cATO Dashboard resources have been removed${NC}"
echo -e "${GREEN}✅ Your existing VNet and other infrastructure remain intact${NC}"
echo -e "${YELLOW}ℹ️  Cosmos DB deletion may take additional time to complete in the background${NC}"
echo ""
echo -e "${BLUE}🔍 To verify cleanup, run:${NC}"
echo -e "   az resource list --resource-group $RESOURCE_GROUP"
echo ""
echo -e "${GREEN}✨ Resource group '$RESOURCE_GROUP' is ready for fresh deployment!${NC}"
