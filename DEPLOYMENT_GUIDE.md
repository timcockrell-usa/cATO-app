# 🚀 cATO Dashboard - Azure Deployment Guide

## 📋 Overview

The cATO (Continuous Authority to Operate) Dashboard is a comprehensive security compliance management platform designed for DoD environments. This guide covers the complete deployment process to Azure using modern Infrastructure as Code (IaC) practices.

### 🏗️ Architecture Components

- **Azure Static Web App** - High-performance React frontend with CDN
- **Azure Cosmos DB** - Serverless NoSQL database for compliance data
- **Azure Key Vault** - Secure configuration and secrets management
- **Azure Entra ID** - Role-based access control and authentication
- **Application Insights** - Application performance monitoring
- **Log Analytics** - Centralized logging and monitoring

## 🔐 Security Features

✅ **Zero Trust Architecture** compliance  
✅ **NIST 800-53 Rev 5** control tracking  
✅ **Role-based access control** (6 security roles)  
✅ **Data encryption** at rest and in transit  
✅ **Managed Identity** authentication  
✅ **Private networking** ready for production  

---

## 📋 Prerequisites

### Required Tools

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) v2.50+
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd) v1.0+
- [Node.js](https://nodejs.org/) v18.17.0+ (LTS recommended)
- [NPM](https://www.npmjs.com/) v11.5.2+ (for security and performance)
- [Git](https://git-scm.com/) v2.30+
- PowerShell 7+ (Windows) or Bash (Linux/macOS)

### Node.js and NPM Setup

**Recommended versions for Azure Static Web Apps:**
```bash
# Check current versions
node --version  # Should be v18.17.0 or higher (v22.18.0 recommended)
npm --version   # Should be v11.5.2 or higher

# Upgrade NPM if needed (requires Node.js 20.17.0+ for NPM 11.5.2)
npm install -g npm@11.5.2

# For Node.js version management, use:
# - nvm (Linux/macOS): nvm install 22.18.0 && nvm use 22.18.0
# - nvm-windows (Windows): nvm install 22.18.0 && nvm use 22.18.0
```

## 🚀 Quick Setup

### For Linux/macOS:
```bash
# Make the script executable
chmod +x setup-npm.sh

# Run the setup script
./setup-npm.sh
```

### For Windows PowerShell:
```powershell
# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the setup script
.\setup-npm.ps1
```

### For Manual Setup:
```bash
# 1. Upgrade NPM to 11.5.2
npm install -g npm@11.5.2

# 2. Clean previous installation
rm -rf node_modules package-lock.json
npm cache clean --force

# 3. Install dependencies
npm install

# 4. Run validation
npm run type-check
npm run build
```

These setup scripts will:
- ✅ Verify Node.js version (18.17.0+)
- ✅ Upgrade NPM to 11.5.2
- ✅ Clean previous installations
- ✅ Install all dependencies
- ✅ Run TypeScript type checking
- ✅ Build the application

**Validation Script:** Run `./validate-setup.ps1` (Windows) or `./validate-setup.sh` (Linux/macOS) to verify your setup.

### Azure Requirements

- Azure subscription with **Contributor** role
- Azure Entra ID **Application Administrator** role
- Resource quota for:
  - Static Web Apps (Standard tier)
  - Cosmos DB (Serverless)
  - Key Vault (Standard)

### Security Clearance

- Appropriate clearance level for target deployment environment
- DoD Impact Level 2 (IL2) or Impact Level 5 (IL5) authorization if required---

## 🚀 Deployment into Existing Infrastructure

This guide is specifically for deploying the cATO Dashboard into your existing Azure infrastructure:

- **Resource Group**: ampe-eastus-dev-rg
- **VNet**: ampe-eus-dev-vnet (10.8.11.0/24)
- **Subscription**: 930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e
- **Region**: East US

### Deployment Process

```bash
# In Azure Cloud Shell (Bash) or local Azure CLI

# 1. Clone the repository
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# 2. Set your existing environment variables
RESOURCE_GROUP="ampe-eastus-dev-rg"
LOCATION="eastus2"  # IMPORTANT: Use eastus2, not eastus (Static Web Apps not available in eastus)
SUBSCRIPTION_ID="930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
VNET_NAME="ampe-eus-dev-vnet"
ADMIN_GROUP_ID="your-admin-group-object-id"  # Get this from the section below

# 3. Verify your existing resources and set subscription
az account set --subscription $SUBSCRIPTION_ID
az network vnet show --resource-group $RESOURCE_GROUP --name $VNET_NAME
az group show --name $RESOURCE_GROUP

# 4a. Try Azure CLI deployment first
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters environmentName=dev \
  --parameters location=$LOCATION \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID

# 4b. If Azure CLI fails, use Azure PowerShell instead:
# Connect-AzAccount
# Set-Location "infra"
# New-AzResourceGroupDeployment -ResourceGroupName $RESOURCE_GROUP -TemplateFile "main.json" -environmentName "dev" -location $LOCATION -adminGroupObjectId $ADMIN_GROUP_ID
```

> **Important VNet Information**: This deployment **does NOT create or modify your existing VNet**. The Bicep template creates application resources with public endpoints by default. Your existing `ampe-eus-dev-vnet` (10.8.11.0/24) will remain completely untouched. For production, you can later add private endpoints to connect these resources to your existing VNet.

> **Note**: This deployment will create new resources (Static Web App, Cosmos DB, Key Vault, etc.) in your existing resource group. For test environments, you can easily remove all these resources using the provided cleanup script without affecting your existing infrastructure.

### What is the Admin Group?

The **Admin Group** is an Azure Entra ID (Azure Active Directory) security group that contains users who should have administrative access to the Key Vault and other management functions.

**To find or create your admin group:**

```bash
# List existing groups to find your admin group
az ad group list --display-name "*admin*" --query "[].{DisplayName:displayName, ObjectId:id}" -o table

# OR create a new admin group
az ad group create --display-name "cATO Dashboard Admins" --mail-nickname "cato-admins"

# Add yourself to the group
MY_USER_ID=$(az ad signed-in-user show --query id -o tsv)
az ad group member add --group "cATO Dashboard Admins" --member-id $MY_USER_ID

# Get the group object ID for deployment
az ad group show --group "cATO Dashboard Admins" --query id -o tsv
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# Install dependencies
npm install
```

### Step 2: Azure Authentication and Setup

```bash
# Login to Azure CLI
az login

# Set your subscription to your existing environment
az account set --subscription "930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"

# Verify you're in the right subscription and can access your resource group
az group show --name "ampe-eastus-dev-rg"
az network vnet show --resource-group "ampe-eastus-dev-rg" --name "ampe-eus-dev-vnet"

# Verify your subscription
az account show
```

### Step 3: Get Admin Group Object ID

```bash
# List existing groups to find your admin group
az ad group list --display-name "*admin*" --query "[].{DisplayName:displayName, ObjectId:id}" -o table

# OR create a new admin group specifically for cATO Dashboard
az ad group create --display-name "cATO Dashboard Admins" --mail-nickname "cato-admins"

# Add yourself to the group
MY_USER_ID=$(az ad signed-in-user show --query id -o tsv)
az ad group member add --group "cATO Dashboard Admins" --member-id $MY_USER_ID

# Get the group object ID for deployment (save this value)
az ad group show --group "cATO Dashboard Admins" --query id -o tsv
```

### Step 4: Deploy Infrastructure

```bash
# Set your environment variables
RESOURCE_GROUP="ampe-eastus-dev-rg"
LOCATION="eastus2"  # IMPORTANT: Use eastus2, not eastus
ADMIN_GROUP_ID="your-admin-group-object-id"  # Use the ID from Step 3

# Method 1: Try Azure CLI first
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters environmentName=dev \
  --parameters location=$LOCATION \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID
```

**If Azure CLI has issues (corrupted modules, etc.), use Azure PowerShell instead:**

```powershell
# Method 2: Azure PowerShell (if Azure CLI fails)
Connect-AzAccount -SubscriptionId "930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
Set-Location "infra"
New-AzResourceGroupDeployment `
  -ResourceGroupName "ampe-eastus-dev-rg" `
  -TemplateFile "main.json" `
  -environmentName "dev" `
  -location "eastus2" `
  -adminGroupObjectId "your-admin-group-object-id"
```

This deployment will create in your existing `ampe-eastus-dev-rg` resource group:
1. Azure Static Web App for the React frontend
2. Azure Cosmos DB (serverless) for compliance data
3. Azure Key Vault for secure secrets management
4. Application Insights for monitoring
5. Log Analytics workspace for centralized logging
6. User-Assigned Managed Identity for secure service connections

### Step 5: Deploy the Application

After the infrastructure is deployed, deploy the React application:

**⚠️ Important: NPM Version Fix**

If you got NPM errors during setup, your Node.js version may be too old. NPM 11.5.2 requires Node.js 20.17.0+.

**Option 1: Continue with NPM 10.7.0 (Quick Fix)**
```bash
# Your current setup works fine for Azure Static Web Apps
# Just build and deploy with current NPM version
npm run build

# Method 1: Use Azure Static Web Apps CLI (Recommended)
# Install SWA CLI if not already installed
npm install -g @azure/static-web-apps-cli

# Get the Static Web App name and deployment token
STATIC_APP_NAME=$(az staticwebapp list --resource-group "ampe-eastus-dev-rg" --query "[0].name" -o tsv)
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $STATIC_APP_NAME --resource-group "ampe-eastus-dev-rg" --query "properties.apiKey" -o tsv)

# Deploy using SWA CLI
swa deploy ./dist --deployment-token $DEPLOYMENT_TOKEN

# Method 2: Alternative - Upload via Azure CLI (if SWA CLI not available)
# Create a zip of the dist folder and deploy
cd dist
zip -r ../dist.zip .
cd ..
az staticwebapp source upload --name $STATIC_APP_NAME --resource-group "ampe-eastus-dev-rg" --source dist.zip
```

**Option 2: Upgrade Node.js for NPM 11.5.2 (Recommended)**
```bash
# Check your current Node version
node --version  # If less than v20.17.0, upgrade Node.js first

# Using nvm (if available) - Recommended Node.js v22.18.0
nvm install 22.18.0
nvm use 22.18.0

# Then run the NPM upgrade
npm install -g npm@11.5.2

# Clean install and build
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Step 6: Configure Azure Entra ID Application

After deployment, you'll need to set up authentication:

1. **Go to Azure Portal** → Azure Entra ID → App registrations
2. **Create new registration**:
   ```
   Name: cATO Dashboard Development
   Account types: Single tenant
   Redirect URI: https://[your-static-web-app-url]
   ```
3. **Configure authentication**:
   - Add redirect URIs for your Static Web App
   - Enable implicit grant flow (Access tokens + ID tokens)
   - Set logout URL
4. **Set up API permissions**:
   - Microsoft Graph: `User.Read`, `User.ReadBasic.All`
5. **Configure app roles** (see Role-Based Access Control section below)

---

## 👥 Role-Based Access Control Setup

### Application Roles

Configure these roles in your Azure Entra ID app registration:

| Role | Description | Access Level |
|------|-------------|--------------|
| **SystemAdmin** | Full system administration | Complete access |
| **AO** | Authorizing Official | Security decisions, approvals |
| **ComplianceOfficer** | Compliance management | Compliance tracking, reports |
| **SecurityAnalyst** | Security analysis | NIST controls, ZTA activities |
| **Auditor** | Audit and review | Read-only audit access |
| **Viewer** | Basic access | Dashboard viewing only |

### Creating App Roles

1. **Go to** Azure Portal → App registrations → Your app → App roles
2. **Click** "Create app role" for each role:

**Example: System Administrator Role**

```json
{
  "displayName": "System Administrator",
  "description": "Full system access for administrators",
  "value": "SystemAdmin",
  "allowedMemberTypes": ["User", "Group"],
  "isEnabled": true
}
```

### Assigning Users to Roles

1. **Go to** Enterprise applications → Your app → Users and groups
2. **Click** "Add user/group"
3. **Select** users/groups and assign appropriate roles
4. **Save** assignments

---

## 📊 Data Population and Migration

### Initial Data Setup

```bash
# Set environment variables for data migration
export AZURE_COSMOS_ENDPOINT="https://your-cosmos-account.documents.azure.com:443/"
export AZURE_COSMOS_DATABASE_NAME="cato-dashboard"

# Run initial data migration
npm run migrate-data

# Validate data was imported correctly
npm run validate-setup
```

### Import from Existing eMASS System

```bash
# Configure eMASS integration
export EMASS_API_ENDPOINT="your-emass-endpoint"
export EMASS_API_KEY="your-api-key"

# Import eMASS data
npm run import-emass-data

# Verify import results
npm run validate-emass-import
```

### Azure Resource Data Import

```bash
# Import from all Azure subscriptions
npm run export-azure-data -- --all

# Import the exported data
npm run import-azure-data

# Restart application to see imported data
azd restart
```

---

## 🔒 Security Configuration

### Network Security (Production)

For production deployments, enhance security:

```bash
# Enable private endpoints
azd env set ENABLE_PRIVATE_ENDPOINTS "true"

# Restrict public access
azd env set COSMOS_PUBLIC_ACCESS "Disabled"
azd env set KEYVAULT_PUBLIC_ACCESS "Disabled"

# Redeploy with security changes
azd up
```

### Key Vault Secrets Management

```bash
# Add application secrets to Key Vault
az keyvault secret set --vault-name "your-key-vault" --name "EmassApiKey" --value "your-secret"
az keyvault secret set --vault-name "your-key-vault" --name "AzureAdClientSecret" --value "your-secret"
```

### Monitoring and Alerting

```bash
# Enable advanced monitoring
azd env set ENABLE_MONITORING_ALERTS "true"
azd env set ALERT_EMAIL "security-team@your-domain.mil"

# Update deployment
azd up
```

---

## 📈 Monitoring and Maintenance

### Health Monitoring

Monitor application health through:
- **Application Insights**: Performance metrics and user analytics
- **Log Analytics**: Centralized logging and query capability
- **Azure Monitor**: Infrastructure metrics and alerting
- **Key Vault**: Secret access auditing

### Performance Optimization

```bash
# Monitor Cosmos DB RU consumption
az cosmosdb show --name "your-cosmos-account" --resource-group "your-rg" --query "properties.provisionedThroughputSettings"

# Check Static Web App CDN performance
az staticwebapp show --name "your-static-app" --resource-group "your-rg"
```

### Backup and Disaster Recovery

- **Cosmos DB**: Automatic backups enabled (8-hour retention)
- **Application Code**: Git repository as source of truth
- **Configuration**: Key Vault provides secret backup
- **Infrastructure**: Bicep templates enable redeployment

---

## 🔧 Troubleshooting

### Common Deployment Issues

**Issue**: `Cannot update Static Web App: A create or update operation is currently in progress`

This error occurs when:
1. A previous deployment was interrupted
2. A Static Web App deletion didn't complete fully  
3. Azure has a background operation still running

**Solutions:**

```bash
# Option 1: Wait 10-15 minutes for Azure operations to complete, then retry

# Option 2A: Deploy with different environment name to generate new resource names
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters environmentName=dev2 \
  --parameters location=$LOCATION \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID

# Option 2B: Deploy with deployment suffix to force new names
DEPLOYMENT_SUFFIX=$(date +%s)  # Use timestamp
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters environmentName=dev \
  --parameters location=$LOCATION \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID \
  --parameters deploymentSuffix=$DEPLOYMENT_SUFFIX

# Option 2C: Deploy with custom resource token
CUSTOM_TOKEN=$(openssl rand -hex 6 | head -c 13)  # Generate random 13-char token
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters environmentName=dev \
  --parameters location=$LOCATION \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID \
  --parameters resourceToken=$CUSTOM_TOKEN

# Option 3: Clean up with bash script and wait
./cleanup-deployment.sh
# Wait 10-15 minutes, then retry deployment
```

**Issue**: `LocationNotAvailableForResourceType` for Azure Static Web Apps

```bash
# Solution: Use eastus2 instead of eastus
LOCATION="eastus2"  # Static Web Apps not available in eastus
```

**Issue**: `bad magic number in 'urllib3._version'` or Azure CLI module errors

```powershell
# Solution: Use Azure PowerShell instead of Azure CLI
Connect-AzAccount -SubscriptionId "930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
Set-Location "infra"
New-AzResourceGroupDeployment `
  -ResourceGroupName "ampe-eastus-dev-rg" `
  -TemplateFile "main.json" `
  -environmentName "dev" `
  -location "eastus2" `
  -adminGroupObjectId "your-admin-group-object-id"
```

**Issue**: `content already consumed` error

```bash
# Solution: Clear Azure CLI cache and re-authenticate
az account clear
az login
```

**Issue**: Cleanup script not working - Azure CLI errors or hanging

```bash
# Problem: Azure CLI may be corrupted or have module issues
# Solution: Use the improved bash cleanup script with better error handling

# For Linux/macOS/WSL - Enhanced bash script
chmod +x cleanup-deployment.sh
./cleanup-deployment.sh

# The improved script includes:
# - Better Azure CLI error detection
# - Robust resource discovery using table format
# - Fallback mechanisms for corrupted Azure CLI
# - Proper handling of special resources (Key Vault, Cosmos DB)
```

**Issue**: NPM build errors - missing dependencies or TypeScript errors

```bash
# Problem: Server-side dependencies or outdated NPM version
# Solution: Use NPM 11.5.2 and ensure frontend-only build

# Step 1: Update NPM to latest version
npm install -g npm@11.5.2

# Step 2: Clean install dependencies
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Step 3: Check for TypeScript errors
npm run type-check

# Step 4: Build for production
npm run build

# If you see express, puppeteer, or archiver errors:
# These are server-side dependencies that should be moved to Azure Functions
# The frontend build has been configured to work without them
```

**Issue**: Module import errors or missing types

```bash
# Check if all devDependencies are installed
npm install --save-dev @types/express @types/archiver @types/marked

# Verify TypeScript configuration
npm run type-check

# Clean build
npm run build
```

**Issue**: `AZURE_ADMIN_GROUP_OBJECT_ID not found`

```bash
# Get object ID for your admin group
az ad group list --display-name "Your Admin Group" --query "[0].objectId" -o tsv
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "object-id-here"
```

**Issue**: `Insufficient permissions for Key Vault`

```bash
# Check your role assignments
az role assignment list --assignee $(az account show --query user.name -o tsv) --scope /subscriptions/$(az account show --query id -o tsv)
```

**Issue**: `Static Web App deployment failed`

```bash
# Check build logs
azd logs --service web

# Retry deployment
azd deploy --service web
```

### Authentication Issues

**Issue**: `AADSTS50011: Redirect URI mismatch`
1. Go to App registrations → Authentication
2. Add your Static Web App URL to redirect URIs
3. Include both `https://your-app.azurestaticapps.net` and `https://your-app.azurestaticapps.net/`

**Issue**: `User has no assigned roles`
1. Go to Enterprise applications → Users and groups
2. Add user and assign appropriate role
3. User must logout and login again

### Performance Issues

**Issue**: `Slow Cosmos DB queries`

```bash
# Check indexing policy
az cosmosdb sql container show --account-name "your-account" --database-name "cato-dashboard" --name "nist-controls" --resource-group "your-rg"

# Monitor RU consumption
az monitor metrics list --resource "/subscriptions/.../Microsoft.DocumentDB/databaseAccounts/your-account" --metric "TotalRequestUnits"
```---

## 🔄 CI/CD Pipeline Setup

### GitHub Actions (Recommended)

The repository includes GitHub Actions workflows:

```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Azure Developer CLI
        uses: Azure/setup-azd@v0.1.0
      - name: Deploy Application
        run: azd up
        env:
          AZURE_CREDENTIALS: ${{ secrets.AZURE_CREDENTIALS }}
```

### Setup CI/CD

```bash
# Configure GitHub integration
azd pipeline config --provider github

# This will:
# 1. Create Azure service principal
# 2. Add GitHub secrets
# 3. Set up deployment workflow
```

---

## 📚 Additional Resources

### Documentation Links

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Cosmos DB Best Practices](https://docs.microsoft.com/en-us/azure/cosmos-db/best-practices)
- [Azure Entra ID App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [NIST 800-53 Security Controls](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)

### Support and Community

- [Azure Developer CLI Docs](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/)
- [Report Issues](https://github.com/timcockrell-usa/cATO-app/issues)
- DoD Cybersecurity Community of Practice

### Compliance and Security

- [DoD Cloud Computing SRG](https://public.cyber.mil/dccs/dccs-documents/)
- [FedRAMP Authorization](https://www.fedramp.gov/)
- [Azure Government Compliance](https://docs.microsoft.com/en-us/azure/azure-government/compliance/)

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ **Application loads** at Static Web App URL  
✅ **Authentication works** with Azure Entra ID  
✅ **Role-based access** functions properly  
✅ **Dashboard shows data** from Cosmos DB  
✅ **NIST controls load** without errors  
✅ **ZTA activities display** correctly  
✅ **Monitoring is active** in Application Insights  
✅ **Secrets are secure** in Key Vault  

## 🚀 Next Steps

After successful deployment:

1. **Configure monitoring alerts** for production
2. **Set up automated backups** and disaster recovery
3. **Implement CI/CD pipeline** for automated deployments
4. **Train users** on role-based access features
5. **Schedule regular security assessments**
6. **Plan data retention policies** per compliance requirements

---

**For additional support, contact the development team or reference the detailed documentation in the repository.**