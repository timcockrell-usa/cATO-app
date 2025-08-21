# 🚀 cATO Dashboard - Quick Deployment Reference

> **📋 For the complete deployment guide, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## ⚡ Quick Start

### Option 1: Azure Developer CLI (Recommended)
```bash
# 1. Clone and setup
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app && npm install

# 2. Login to Azure
az login && azd auth login

# 3. Set admin group (replace with your group ID)
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-admin-group-object-id"

# 4. Deploy everything
azd up
```

### Option 2: Direct Bicep Deployment (Azure Cloud Shell)
```bash
# 1. In Azure Cloud Shell or local CLI
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# 2. Set variables for your environment
RESOURCE_GROUP="your-existing-resource-group"
ADMIN_GROUP_ID="your-admin-group-object-id"
LOCATION="eastus2"

# 3a. First pass (skip app settings if you encounter SWA Conflict 59348)
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID \
  --parameters environmentName=dev \
  --parameters location=$LOCATION \
  --parameters applyAppSettings=false

# 3b. After provisioning state is Succeeded apply settings
a z staticwebapp show --name $(az staticwebapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv) --resource-group $RESOURCE_GROUP --query properties.provisioningState -o tsv
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID \
  --parameters environmentName=dev \
  --parameters location=$LOCATION \
  --parameters applyAppSettings=true
```

### What is Admin Group Object ID?
This is an Azure Entra ID security group for administrators:
```bash
# Find existing admin groups
az ad group list --display-name "*admin*" --query "[].{Name:displayName, Id:id}" -o table

# OR create new admin group
az ad group create --display-name "cATO Admins" --mail-nickname "cato-admins"
az ad group show --group "cATO Admins" --query id -o tsv
```

## 🏗️ Architecture Overview

The cATO Dashboard deploys a modern, secure architecture:

- **Azure Static Web App** - React frontend with global CDN
- **Azure Cosmos DB** - Serverless NoSQL database 
- **Azure Key Vault** - Secure secrets management
- **Azure Entra ID** - Authentication and RBAC
- **Application Insights** - Performance monitoring
- **Managed Identity** - Secure service authentication

## 🔐 Security Features

✅ **Zero Trust Architecture** ready  
✅ **NIST 800-53** compliance tracking  
✅ **Role-based access** (6 security roles)  
✅ **Encryption** at rest and in transit  
✅ **Private networking** support  
✅ **DoD IL2/IL5** deployment ready  

---

## 📋 Prerequisites

### Tools Required
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) v2.50+
- [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd) v1.0+
- [Node.js](https://nodejs.org/) v18+

### Azure Permissions
- Azure subscription **Contributor** role
- Azure Entra ID **Application Administrator** role

---

## 🌍 Multi-Environment Support

### Development
```bash
azd env new dev
azd env set AZURE_LOCATION "eastus"
azd up
```

### Production
```bash
azd env new prod
azd env set AZURE_LOCATION "eastus"
azd env set ENABLE_PRIVATE_ENDPOINTS "true"
azd up
```

### Azure Government (IL5)
```bash
az cloud set --name AzureUSGovernment
azd env new il5-prod
azd env set AZURE_LOCATION "usgovvirginia"
azd up
```

---

## 👥 Post-Deployment Configuration

### 1. Azure Entra ID Setup

1. **Create app registration** in Azure Portal
2. **Configure redirect URIs** with your Static Web App URL
3. **Create app roles**:
   - SystemAdmin, AO, ComplianceOfficer
   - SecurityAnalyst, Auditor, Viewer
4. **Assign users** to appropriate roles

### 2. Deploy Application (If using Direct Bicep option)

If you used the direct Bicep deployment, you need to deploy the application separately:

```bash
# Get the Static Web App name from your deployment
STATIC_APP_NAME=$(az staticwebapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)

# Build the application
npm run build

# Deploy to Static Web App (using Azure CLI)
az staticwebapp environment set --name $STATIC_APP_NAME --environment-name default --source ./dist

# OR use GitHub Actions (recommended for ongoing deployments)
# See the complete deployment guide for CI/CD setup
```

### 3. Initial Data Population

```bash
# Set Cosmos DB connection
export AZURE_COSMOS_ENDPOINT="https://your-cosmos-account.documents.azure.com:443/"
export AZURE_COSMOS_DATABASE_NAME="cato-dashboard"

# Import initial compliance data
npm run migrate-data

# Validate successful import
npm run validate-setup
```

### 3. Application Configuration

Configure environment variables in Static Web App:

```env
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_REDIRECT_URI=https://your-app-domain.com
VITE_POST_LOGOUT_REDIRECT_URI=https://your-app-domain.com

# Azure Resource Endpoints
VITE_COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
VITE_COSMOS_DB_NAME=cato-dashboard
```

---

## 📊 Application Features

### Dashboard Capabilities

- **NIST 800-53 Control Tracking** - Real-time compliance status
- **Zero Trust Architecture** - Seven pillar maturity assessment  
- **POA&M Management** - Risk-based remediation tracking
- **Vulnerability Integration** - Microsoft Defender correlation
- **eMASS Compatibility** - Export packages for compliance

### Role-Based Access

| Role | Dashboard | NIST | ZTA | Execution | POA&M | Export |
|------|-----------|------|-----|-----------|-------|---------|
| **SystemAdmin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AO** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **ComplianceOfficer** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SecurityAnalyst** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Auditor** | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ |
| **Viewer** | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ |

_👁️ = Read-only access_

---

## 🔧 Common Commands

```bash
# View deployment status
azd show

# Monitor application logs  
azd logs --service web

# Update application only
azd deploy --service web

# Clean up resources
azd down

# Check application health
npm run validate-setup
```

---

## 🚨 Troubleshooting

### Authentication Issues
```bash
# Check app registration configuration
az ad app show --id your-client-id

# Verify role assignments
az ad app show --id your-client-id --query appRoles
```

### Database Connection Issues
```bash
# Test Cosmos DB connectivity
az cosmosdb show --name your-cosmos-account --resource-group your-rg

# Check managed identity permissions
az role assignment list --assignee your-managed-identity-id
```

### Deployment Failures
```bash
# View detailed deployment logs
azd logs --follow

# Check resource deployment status
az deployment group list --resource-group your-rg
```

---

## 📚 Additional Resources

- **[Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment documentation
- **[Local Development - Azure](./LOCAL_DEVELOPMENT_AZURE.md)** - Azure integration testing
- **[Local Development - Offline](./LOCAL_DEVELOPMENT_OFFLINE.md)** - Offline development setup
- **[Azure Static Web Apps Docs](https://docs.microsoft.com/en-us/azure/static-web-apps/)**
- **[NIST 800-53 Documentation](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)**

---

## 🎯 Success Indicators

Your deployment is successful when:

✅ Application loads at Static Web App URL  
✅ Azure Entra ID authentication works  
✅ Role-based navigation functions  
✅ NIST controls display data  
✅ Dashboard shows compliance metrics  
✅ Application Insights shows telemetry  

**For detailed configuration and troubleshooting, see the [complete deployment guide](./DEPLOYMENT_GUIDE.md).**
