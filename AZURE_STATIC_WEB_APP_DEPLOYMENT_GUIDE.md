# Azure Static Web App + Functions Integration Deployment Guide

This guide walks you through deploying the cATO application with full Azure Functions integration for automated compliance data synchronization.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Azure Static      │    │   Azure Functions    │    │   Data Sources      │
│   Web App           │    │   (API Backend)      │    │   (NIST, etc.)      │
│                     │    │                      │    │                     │
│ ┌─────────────────┐ │    │ ┌──────────────────┐ │    │ ┌─────────────────┐ │
│ │ React Frontend  │ │◄──►│ │ DataSyncTimer    │ │◄──►│ │ NIST Controls   │ │
│ │ (TypeScript)    │ │    │ │ (Automated Sync) │ │    │ │ Database        │ │
│ └─────────────────┘ │    │ └──────────────────┘ │    │ └─────────────────┘ │
│                     │    │                      │    │                     │
│ ┌─────────────────┐ │    │ ┌──────────────────┐ │    │ ┌─────────────────┐ │
│ │ Settings UI     │ │◄──►│ │ ManualDataSync   │ │◄──►│ │ Compliance      │ │
│ │ Status Monitor  │ │    │ │ (On-Demand)      │ │    │ │ APIs            │ │
│ └─────────────────┘ │    │ └──────────────────┘ │    │ └─────────────────┘ │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## 📋 Prerequisites

### Azure Requirements
- Azure subscription with appropriate permissions
- Azure CLI installed and configured
- Resource group (existing or new)

### Development Requirements
- Node.js 18+ installed
- Git repository (GitHub recommended)
- PowerShell (for Windows deployment script)

### GitHub Integration (Optional but Recommended)
- GitHub repository with cATO application code
- GitHub personal access token with repo permissions

## 🚀 Deployment Steps

### Step 1: Clone and Prepare Repository

```bash
# Clone your cATO repository
git clone https://github.com/your-username/cATO-app.git
cd cATO-app

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env.local
```

### Step 2: Configure Environment Variables

Edit `.env.local` with your Azure configuration:

```bash
# Azure Functions Configuration
VITE_AZURE_FUNCTIONS_ENDPOINT=https://your-function-app-name.azurewebsites.net
VITE_AZURE_FUNCTIONS_KEY=your-function-app-key

# Azure Active Directory (if using enhanced security)
VITE_AZURE_CLIENT_ID=your-aad-client-id
VITE_AZURE_TENANT_ID=your-aad-tenant-id

# Application Configuration
VITE_APP_TITLE=cATO - Continuous Authorization to Operate
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AZURE_FUNCTIONS=true
VITE_ENABLE_REAL_TIME_SYNC=true
VITE_ENABLE_AUTO_REFRESH=true
```

### Step 3: Deploy Using PowerShell Script (Recommended)

```powershell
# Login to Azure
az login

# Run deployment script
.\deploy-static-web-app.ps1 -ResourceGroupName "rg-cato-prod" -StaticWebAppName "swa-cato-app" -FunctionAppName "func-cato-datasync" -GitHubRepo "https://github.com/your-username/cATO-app" -GitHubToken "your-github-token"
```

### Step 4: Manual Azure CLI Deployment (Alternative)

If you prefer manual deployment:

```bash
# Create resource group
az group create --name rg-cato-prod --location "East US"

# Create Static Web App
az staticwebapp create \
  --name swa-cato-app \
  --resource-group rg-cato-prod \
  --location "East US" \
  --source https://github.com/your-username/cATO-app \
  --branch main \
  --token your-github-token \
  --app-location "/" \
  --api-location "functions" \
  --output-location "dist"
```

### Step 5: Configure GitHub Actions

1. **Add GitHub Secrets**: Go to your repository settings and add these secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: (provided during deployment)

2. **Verify Workflow**: The GitHub Actions workflow should be automatically created. Check `.github/workflows/` for the workflow file.

3. **Trigger Deployment**: Push changes to trigger automatic deployment:
   ```bash
   git add .
   git commit -m "Initial Azure Static Web App deployment"
   git push origin main
   ```

## 🔧 Configuration Files Overview

### Static Web App Configuration (`staticwebapp.config.json`)
```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "enabled": true,
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/your-tenant-id/v2.0",
          "clientIdSettingName": "AZURE_CLIENT_ID",
          "clientSecretSettingName": "AZURE_CLIENT_SECRET"
        }
      }
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
  }
}
```

### GitHub Actions Workflow
- Automatically builds and deploys on push to main branch
- Uses Node.js 20 for build process
- Includes environment variable configuration
- Deploys to Azure Static Web Apps with API integration

## 🔍 Post-Deployment Verification

### 1. Verify Static Web App Deployment
```bash
# Check deployment status
az staticwebapp show --name swa-cato-app --resource-group rg-cato-prod
```

### 2. Test Azure Functions Integration
1. Navigate to your deployed application
2. Go to Settings page
3. Check Azure Functions Status section
4. Verify connection to your functions
5. Test manual data sync functionality

### 3. Monitor Real-time Status
- Azure Functions status should show "Connected"
- Last sync timestamp should be visible
- Manual sync button should trigger immediate synchronization

## 🔐 Security Configuration

### Azure Active Directory Integration
1. **Create App Registration** in Azure AD
2. **Configure Redirect URIs** for your domain
3. **Set Client ID and Tenant ID** in environment variables
4. **Enable authentication** in Static Web App settings

### Function App Security
1. **Use Function Keys** for API authentication
2. **Configure CORS** to allow your domain
3. **Enable Application Insights** for monitoring
4. **Set up Azure Key Vault** for sensitive configuration

## 📊 Monitoring and Troubleshooting

### Application Insights
Monitor your application performance and errors:
```bash
# Enable Application Insights
az monitor app-insights component create \
  --app insights-cato-app \
  --location "East US" \
  --resource-group rg-cato-prod
```

### Common Issues and Solutions

1. **Azure Functions Not Connecting**
   - Verify `VITE_AZURE_FUNCTIONS_ENDPOINT` is correct
   - Check function app is running and accessible
   - Validate function key is properly configured

2. **GitHub Actions Deployment Fails**
   - Check GitHub secrets are properly set
   - Verify workflow file is in `.github/workflows/`
   - Review build logs for specific errors

3. **Authentication Issues**
   - Confirm Azure AD app registration configuration
   - Check redirect URIs match your domain
   - Verify tenant ID and client ID are correct

## 🔄 Continuous Integration/Continuous Deployment

### Automated Deployment Pipeline
- **Trigger**: Push to main branch
- **Build**: Vite build process with environment variables
- **Test**: Run any configured tests
- **Deploy**: Deploy to Azure Static Web Apps
- **Verify**: Health checks and smoke tests

### Environment Management
- **Development**: Local development with `.env.local`
- **Staging**: Branch deployments for testing
- **Production**: Main branch deployment with production configuration

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [GitHub Actions for Azure](https://docs.microsoft.com/en-us/azure/developer/github/github-actions)
- [React + TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)

## 🎯 Next Steps

After successful deployment:

1. **Configure monitoring and alerting**
2. **Set up backup and disaster recovery**
3. **Implement additional security measures**
4. **Scale based on usage patterns**
5. **Add custom domain and SSL certificate**

## 📞 Support

For issues with this deployment:
1. Check the troubleshooting section above
2. Review Azure portal logs and Application Insights
3. Consult Azure documentation for specific services
4. Contact your Azure support team if needed
