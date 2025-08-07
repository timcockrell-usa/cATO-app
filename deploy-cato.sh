#!/bin/bash

# cATO Dashboard - Deployment Script with Error Handling
# This script deploys the cATO Dashboard with enhanced error checking

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Update these values to match your environment
RESOURCE_GROUP="ampe-eastus-dev-rg"
LOCATION="eastus"
SUBSCRIPTION_ID="930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
VNET_NAME="ampe-eus-dev-vnet"
ADMIN_GROUP_ID=""  # You'll need to set this

echo -e "${BLUE}🚀 cATO Dashboard Deployment Script${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Check if admin group ID is set
if [ -z "$ADMIN_GROUP_ID" ]; then
    echo -e "${RED}❌ Error: ADMIN_GROUP_ID is not set.${NC}"
    echo -e "${YELLOW}Please edit this script and set your admin group object ID.${NC}"
    echo -e "${YELLOW}Run this command to get your admin group ID:${NC}"
    echo -e "   az ad group list --display-name \"*admin*\" --query \"[].{DisplayName:displayName, ObjectId:id}\" -o table"
    echo ""
    echo -e "${YELLOW}Or create a new group:${NC}"
    echo -e "   az ad group create --display-name \"cATO Dashboard Admins\" --mail-nickname \"cato-admins\""
    echo -e "   az ad group show --group \"cATO Dashboard Admins\" --query id -o tsv"
    exit 1
fi

echo -e "${BLUE}🔍 Verifying Azure CLI setup...${NC}"

# Check Azure CLI login
if ! az account show > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged in to Azure CLI. Please run: az login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI is authenticated${NC}"

# Set subscription
echo -e "${BLUE}🔧 Setting subscription...${NC}"
az account set --subscription "$SUBSCRIPTION_ID"
echo -e "${GREEN}✅ Set subscription to: $SUBSCRIPTION_ID${NC}"

# Verify subscription
CURRENT_SUB=$(az account show --query id -o tsv)
if [ "$CURRENT_SUB" != "$SUBSCRIPTION_ID" ]; then
    echo -e "${RED}❌ Failed to set subscription. Current: $CURRENT_SUB, Expected: $SUBSCRIPTION_ID${NC}"
    exit 1
fi

# Verify resource group exists
echo -e "${BLUE}🔍 Verifying resource group...${NC}"
if ! az group show --name "$RESOURCE_GROUP" > /dev/null 2>&1; then
    echo -e "${RED}❌ Resource group '$RESOURCE_GROUP' not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Resource group verified: $RESOURCE_GROUP${NC}"

# Verify VNet exists
echo -e "${BLUE}🔍 Verifying VNet...${NC}"
if ! az network vnet show --resource-group "$RESOURCE_GROUP" --name "$VNET_NAME" > /dev/null 2>&1; then
    echo -e "${RED}❌ VNet '$VNET_NAME' not found in resource group '$RESOURCE_GROUP'.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ VNet verified: $VNET_NAME${NC}"

# Verify admin group exists
echo -e "${BLUE}🔍 Verifying admin group...${NC}"
if ! az ad group show --group "$ADMIN_GROUP_ID" > /dev/null 2>&1; then
    echo -e "${RED}❌ Admin group with ID '$ADMIN_GROUP_ID' not found.${NC}"
    echo -e "${YELLOW}Please verify the group ID is correct.${NC}"
    exit 1
fi
ADMIN_GROUP_NAME=$(az ad group show --group "$ADMIN_GROUP_ID" --query displayName -o tsv)
echo -e "${GREEN}✅ Admin group verified: $ADMIN_GROUP_NAME ($ADMIN_GROUP_ID)${NC}"

# Check Bicep CLI
echo -e "${BLUE}🔍 Verifying Bicep CLI...${NC}"
if ! az bicep version > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Bicep CLI not found. Installing...${NC}"
    az bicep install
fi
BICEP_VERSION=$(az bicep version)
echo -e "${GREEN}✅ Bicep CLI verified: $BICEP_VERSION${NC}"

# Validate Bicep template
echo -e "${BLUE}🔍 Validating Bicep template...${NC}"
if ! az bicep build --file infra/main.bicep > /dev/null 2>&1; then
    echo -e "${RED}❌ Bicep template validation failed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Bicep template is valid${NC}"

echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   Resource Group: $RESOURCE_GROUP"
echo -e "   Location: $LOCATION"
echo -e "   Environment: dev"
echo -e "   Admin Group: $ADMIN_GROUP_NAME"
echo -e "   Subscription: $SUBSCRIPTION_ID"
echo ""

# Confirmation
read -p "Proceed with deployment? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
    echo -e "${YELLOW}⏹️  Deployment cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Starting deployment...${NC}"

# Perform the deployment with detailed output
echo -e "${BLUE}🔧 Deploying Bicep template...${NC}"
DEPLOYMENT_NAME="cato-dashboard-$(date +%Y%m%d-%H%M%S)"

if az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DEPLOYMENT_NAME" \
  --template-file infra/main.bicep \
  --parameters environmentName=dev \
  --parameters location="$LOCATION" \
  --parameters adminGroupObjectId="$ADMIN_GROUP_ID" \
  --verbose; then
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    
    # Get deployment outputs
    echo -e "${BLUE}📊 Deployment Results:${NC}"
    az deployment group show --resource-group "$RESOURCE_GROUP" --name "$DEPLOYMENT_NAME" --query properties.outputs
    
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "1. 📱 Build and deploy the application:"
    echo -e "   npm run build"
    echo -e "   STATIC_APP_NAME=\$(az staticwebapp list --resource-group \"$RESOURCE_GROUP\" --query \"[0].name\" -o tsv)"
    echo -e "   az staticwebapp environment set --name \$STATIC_APP_NAME --environment-name default --source ./dist"
    echo ""
    echo -e "2. 🔐 Configure Azure Entra ID app registration (see deployment guide)"
    echo -e "3. 📊 Run data migration scripts"
    echo ""
    echo -e "${GREEN}✨ Infrastructure deployment complete!${NC}"
    
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo ""
    echo -e "${YELLOW}🔍 Troubleshooting steps:${NC}"
    echo -e "1. Check the deployment logs above for specific errors"
    echo -e "2. Verify your permissions (Contributor role required)"
    echo -e "3. Check Azure resource quotas in the region"
    echo -e "4. Review the deployment in Azure Portal: https://portal.azure.com"
    echo ""
    echo -e "${BLUE}📋 Check deployment status:${NC}"
    echo -e "   az deployment group show --resource-group \"$RESOURCE_GROUP\" --name \"$DEPLOYMENT_NAME\""
    exit 1
fi
