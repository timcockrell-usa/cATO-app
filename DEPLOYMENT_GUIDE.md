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
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/) v2.30+
- PowerShell 7+ (Windows) or Bash (Linux/macOS)

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

## 🚀 Deployment Options

### Option 1: Azure Developer CLI (Recommended)

This is the easiest method that handles everything automatically.

### Option 2: Direct Bicep Deployment

If you prefer to deploy just the infrastructure using Azure Cloud Shell or have an existing resource group:

```bash
# In Azure Cloud Shell or local Azure CLI

# 1. Clone the repository (if not already done)
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# 2. Set your variables
RESOURCE_GROUP="your-existing-resource-group"
LOCATION="eastus"
ADMIN_GROUP_ID="your-admin-group-object-id"  # See explanation below

# 3. Deploy the Bicep template
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters environmentName=prod \
  --parameters location=$LOCATION \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID
```

### Option 3: Deploy into Existing Resource Group & VNet

If you already have a resource group and VNet deployed (like your ampe-eastus-dev-rg setup):

```bash
# In Azure Cloud Shell or local Azure CLI

# 1. Clone the repository (if not already done)
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# 2. Set your existing environment variables
RESOURCE_GROUP="ampe-eastus-dev-rg"
LOCATION="eastus"
SUBSCRIPTION_ID="930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
VNET_NAME="ampe-eus-dev-vnet"
ADMIN_GROUP_ID="your-admin-group-object-id"  # Get this from the section below

# 3. Verify your existing resources
az network vnet show --resource-group $RESOURCE_GROUP --name $VNET_NAME
az account set --subscription $SUBSCRIPTION_ID

# 4. Deploy the Bicep template into existing resource group
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters environmentName=dev \
  --parameters location=$LOCATION \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID
```

> **Note**: The Bicep template will create new resources (Static Web App, Cosmos DB, Key Vault, etc.) in your existing resource group. It won't modify your existing VNet but will be ready for private endpoint integration if needed later.

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

## 🚀 Quick Start Deployment

### Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# Install dependencies
npm install
```

### Step 2: Azure Authentication

```bash
# Login to Azure CLI
az login

# Set your subscription (for existing infrastructure)
az account set --subscription "930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"

# Verify you're in the right subscription and can access your resource group
az group show --name "ampe-eastus-dev-rg"

# Login to Azure Developer CLI (if using azd method)
azd auth login

# Verify your subscription
az account show
```

### Step 3: Configure Environment Variables

```bash
# Get your Azure Entra ID admin group object ID
az ad group show --group "Your-Admin-Group-Name" --query objectId -o tsv

# Set required environment variables for deployment
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-admin-group-object-id"
```

### Step 4: Deploy Infrastructure and Application

```bash
# Initialize azd environment (first time only)
azd init

# Deploy everything with one command
azd up
```

This will:
1. Create Azure resources using Bicep
2. Build the React application
3. Deploy to Azure Static Web Apps
4. Configure managed identity permissions
5. Set up monitoring and logging

### Step 5: Configure Azure Entra ID Application

After deployment, you'll need to set up authentication:

1. **Go to Azure Portal** → Azure Entra ID → App registrations
2. **Create new registration** or configure existing:
   ```
   Name: cATO Dashboard Production
   Account types: Single tenant
   Redirect URI: https://[your-static-web-app-url]
   ```
3. **Configure authentication**:
   - Add redirect URIs for your Static Web App
   - Enable implicit grant flow (Access tokens + ID tokens)
   - Set logout URL
4. **Set up API permissions**:
   - Microsoft Graph: `User.Read`, `User.ReadBasic.All`
   - Add custom scopes if needed
5. **Configure app roles** (see detailed section below)

---

## 🔧 Environment-Specific Deployments

### Development Environment

```bash
# Deploy to development subscription
azd env new dev
azd env set AZURE_LOCATION "eastus"
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-dev-group-id"
azd up
```

### Production Environment

```bash
# Deploy to production subscription  
azd env new prod
azd env set AZURE_LOCATION "eastus"
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-prod-group-id"

# Enable production security settings
azd env set ENABLE_PRIVATE_ENDPOINTS "true"
azd env set RESTRICT_PUBLIC_ACCESS "true"
azd up
```

### Azure Government (IL5)

```bash
# Set Azure Government cloud
az cloud set --name AzureUSGovernment
azd auth login

# Deploy to gov cloud
azd env new il5-prod
azd env set AZURE_LOCATION "usgovvirginia"
azd up
```

> **Note**: Azure Government deployment uses the same Bicep templates and process as Azure Commercial, but connects to the Azure Government cloud endpoints. The main differences are:
> - Different cloud endpoints (`.us` domains)
> - Limited region availability (usgovvirginia, usgovtexas, etc.)
> - Enhanced compliance features for government workloads
> - Same resource types and configurations as Commercial

### Azure Commercial (IL2) - Recommended for Testing

For initial testing and development, use Azure Commercial which has the same setup process:

```bash
# Ensure you're using Azure Commercial cloud (default)
az cloud set --name AzureCloud
azd auth login

# Deploy to commercial cloud for testing
azd env new test-il2
azd env set AZURE_LOCATION "eastus"
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-admin-group-id"
azd up
```

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