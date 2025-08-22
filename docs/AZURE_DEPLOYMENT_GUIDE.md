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

After deployment, you need to configure environment variables in your Azure Static Web App for proper authentication and database connectivity.

#### 4.1: Access Azure Portal Configuration

1. **Navigate to Azure Portal**: https://portal.azure.com
2. **Find your Static Web App**:
   - Search for "Static Web Apps" in the search bar
   - Select your deployed app (usually named like `cato-dashboard-xyz`)
3. **Go to Configuration**:
   - In the left menu, click "Configuration"
   - You'll see "Application settings" tab

#### 4.2: Required Environment Variables

Add these environment variables by clicking "Add" for each one:

**Database Configuration:**
```
Name: VITE_COSMOS_DB_ENDPOINT
Value: https://your-cosmos-account.documents.azure.com:443/
Note: Get this from Azure Portal > Cosmos DB > Your Account > Keys > URI
```

```
Name: VITE_COSMOS_DB_NAME
Value: cato-dashboard
Note: This should match your database name
```

```
Name: VITE_COSMOS_DB_KEY
Value: <your-primary-key>
Note: Get this from Azure Portal > Cosmos DB > Your Account > Keys > Primary Key
```

**Authentication Configuration:**
```
Name: AZURE_CLIENT_ID
Value: <your-app-registration-client-id>
Note: From Azure Entra ID > App registrations > Your App > Application (client) ID
```

```
Name: AZURE_TENANT_ID
Value: <your-tenant-id>
Note: From Azure Entra ID > App registrations > Your App > Directory (tenant) ID
```

```
Name: VITE_AZURE_AUTHORITY
Value: https://login.microsoftonline.com/<your-tenant-id>
Note: Replace <your-tenant-id> with actual tenant ID
```

#### 4.3: Detailed Steps for Each Variable

**Getting Cosmos DB Information:**
1. Go to Azure Portal > Search "Cosmos DB"
2. Click your Cosmos DB account (usually `cato-dashboard-xyz`)
3. In left menu, click "Keys"
4. Copy the "URI" for `VITE_COSMOS_DB_ENDPOINT`
5. Copy the "PRIMARY KEY" for `VITE_COSMOS_DB_KEY`

**Getting Azure Entra ID Information:**
1. Go to Azure Portal > Search "Azure Active Directory" or "Entra ID"
2. Click "App registrations" in left menu
3. Find your app registration (may be auto-created by azd)
4. Copy "Application (client) ID" for `AZURE_CLIENT_ID`
5. Copy "Directory (tenant) ID" for `AZURE_TENANT_ID`

#### 4.4: Save and Restart

1. **Save Configuration**:
   - After adding all variables, click "Save" at the top
   - Wait for the notification "Successfully saved application settings"

2. **Restart the Application**:
   - Go to "Overview" tab in your Static Web App
   - Click "Restart" to apply the new environment variables
   - Wait for restart to complete (usually 30-60 seconds)

#### 4.5: Verify Configuration

Test that variables are working:
```bash
# Use Azure CLI to check your app
az staticwebapp show --name your-app-name --resource-group your-resource-group

# Or visit your app URL and check for authentication/database connectivity
```

#### 4.6: Common Issues and Solutions

**Issue: "Environment variables not found"**
- Solution: Ensure you clicked "Save" and restarted the app
- Check variable names match exactly (case-sensitive)

**Issue: "Authentication failed"**
- Solution: Verify Azure Entra ID app registration has correct redirect URIs
- Ensure tenant ID and client ID are correct

**Issue: "Cosmos DB connection failed"**
- Solution: Check firewall settings in Cosmos DB
- Verify endpoint URL format (should end with :443/)
- Ensure primary key is copied correctly (no extra spaces)

#### 4.7: Security Best Practices

- **Never commit secrets** to your Git repository
- **Use Key Vault** for production deployments (optional advanced setup)
- **Rotate keys regularly** in Cosmos DB and Entra ID
- **Monitor access logs** in Azure Portal

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
