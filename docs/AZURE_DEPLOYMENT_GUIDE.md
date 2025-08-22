# Azure Deployment Guide

This guide provides step-by-step instructions for deploying the cATO Dashboard to Azure using Azure Developer CLI (azd).

## Prerequisites

- Azure subscription with appropriate permissions
- Azure CLI installed locally or access to Azure Cloud Shell
- Git repository access
- Node.js 18+ installed

## Deployment Steps

### Step 1: Prepare Your Environment

```bash
# Clone the repository
git clone https://github.com/your-org/cATO-app.git
cd cATO-app

# Install dependencies
npm install
```

### Step 2: Install Azure Developer CLI

```bash
# Install azd (if not already installed)
# Windows (PowerShell)
winget install microsoft.azd

# macOS
brew tap azure/azd && brew install azd

# Linux
curl -fsSL https://aka.ms/install-azd.sh | bash
```

### Step 3: Deploy to Azure

```bash
# Initialize azd (first time only)
azd auth login
azd init

# Deploy the application
azd up
```

The `azd up` command will:
- Provision Azure resources (Static Web App, Cosmos DB, etc.)
- Build and deploy the application
- Configure environment variables
- Set up authentication

### Step 4: Configure Environment Variables

After deployment, configure the required environment variables in your Static Web App:

1. Go to Azure Portal > Static Web Apps > Your App > Configuration
2. Add the following variables:

```
VITE_COSMOS_DB_ENDPOINT=<your-cosmos-endpoint>
VITE_COSMOS_DB_NAME=cato-dashboard
AZURE_CLIENT_ID=<your-client-id>
AZURE_TENANT_ID=<your-tenant-id>
```

### Step 5: Import Data

```bash
# Import ZTA data to Cosmos DB
npm run seed-zta -- --activities data/zta_activities_with_azure.csv --capabilities data/zta_capabilities_with_azure.csv --backup

# Verify deployment
azd show
```

## Updating an Existing Deployment

```bash
# Pull latest changes
git pull origin main

# Redeploy
azd deploy
```

## Monitoring and Logs

```bash
# View application logs
azd monitor --live

# Get deployment status
azd show
```

## Cleanup

```bash
# Remove all Azure resources
azd down --purge
```

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure Azure Entra ID is properly configured
2. **Cosmos DB connection issues**: Verify connection strings and firewall rules
3. **Build failures**: Check Node.js version and dependencies

### Support

For deployment issues, check:
- Azure Portal > Resource Health
- Application Insights logs
- Azure Static Web Apps deployment logs
