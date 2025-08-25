# Azure Functions Manual Deployment Guide

## Overview
This guide covers the manual deployment of the Azure Functions component for the cATO application's automated data synchronization feature.

## Prerequisites
- Azure CLI installed and authenticated
- Azure subscription with appropriate permissions
- Resource group for the cATO application

## Azure Functions Architecture
The Azure Functions component provides:
- **Timer Trigger**: Automated hourly sync of compliance data from Azure services
- **HTTP Trigger**: Manual sync endpoint for on-demand data updates
- **NIST Control Mapping**: Integration with Azure Policy, Security Center, and Monitor

## Manual Deployment Steps

### Step 1: Create Azure Function App
```powershell
# Set variables
$resourceGroupName = "rg-cato-production"
$functionAppName = "func-cato-datasync"
$storageAccountName = "stcatosync$(Get-Random -Maximum 10000)"
$location = "East US"

# Create storage account for Function App
az storage account create `
  --name $storageAccountName `
  --location $location `
  --resource-group $resourceGroupName `
  --sku Standard_LRS

# Create Function App
az functionapp create `
  --resource-group $resourceGroupName `
  --consumption-plan-location $location `
  --runtime node `
  --runtime-version 18 `
  --functions-version 4 `
  --name $functionAppName `
  --storage-account $storageAccountName
```

### Step 2: Configure Function App Settings
```powershell
# Configure application settings
az functionapp config appsettings set `
  --name $functionAppName `
  --resource-group $resourceGroupName `
  --settings `
    "WEBSITE_NODE_DEFAULT_VERSION=18" `
    "FUNCTIONS_EXTENSION_VERSION=~4" `
    "AzureWebJobsFeatureFlags=EnableWorkerIndexing"
```

### Step 3: Deploy Function Code

#### Option A: Deploy from Local Development
1. **Install Azure Functions Core Tools**:
   ```powershell
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

2. **Create Functions Project Structure**:
   ```powershell
   # Create functions directory
   mkdir azure-functions
   cd azure-functions
   
   # Initialize Functions project
   func init . --typescript
   ```

3. **Create the Timer Function**:
   ```powershell
   func new --name "DataSyncTimer" --template "Timer trigger" --language typescript
   ```

4. **Create the HTTP Function**:
   ```powershell
   func new --name "ManualDataSync" --template "HTTP trigger" --language typescript
   ```

5. **Replace function code** with the implementation from `src/services/azureDataSync.ts`

6. **Deploy Functions**:
   ```powershell
   func azure functionapp publish $functionAppName
   ```

#### Option B: Deploy via Azure Portal
1. **Navigate to Azure Portal** → Function Apps → Your Function App
2. **Select "Deployment Center"**
3. **Choose deployment source** (GitHub, Local Git, etc.)
4. **Configure deployment settings**
5. **Deploy the function code**

### Step 4: Configure Managed Identity and Permissions

#### Enable System-Assigned Managed Identity
```powershell
az functionapp identity assign `
  --name $functionAppName `
  --resource-group $resourceGroupName
```

#### Assign Required Azure Roles
```powershell
# Get Function App's managed identity
$principalId = az functionapp identity show `
  --name $functionAppName `
  --resource-group $resourceGroupName `
  --query principalId -o tsv

# Get subscription ID
$subscriptionId = az account show --query id -o tsv

# Assign Security Reader role for Azure Security Center
az role assignment create `
  --assignee $principalId `
  --role "Security Reader" `
  --scope "/subscriptions/$subscriptionId"

# Assign Policy Insights Data Writer role for Azure Policy
az role assignment create `
  --assignee $principalId `
  --role "Policy Insights Data Writer" `
  --scope "/subscriptions/$subscriptionId"

# Assign Monitoring Reader role for Azure Monitor
az role assignment create `
  --assignee $principalId `
  --role "Monitoring Reader" `
  --scope "/subscriptions/$subscriptionId"
```

### Step 5: Configure Function Triggers

#### Timer Function Configuration
- **Schedule**: `0 0 * * * *` (runs every hour)
- **Function Name**: `DataSyncTimer`
- **Timeout**: 5 minutes

#### HTTP Function Configuration
- **Authorization Level**: Function
- **HTTP Methods**: POST
- **Function Name**: `ManualDataSync`

### Step 6: Test the Functions

#### Test Timer Function
```powershell
# Manually trigger the timer function
az functionapp function invoke `
  --function-name "DataSyncTimer" `
  --name $functionAppName `
  --resource-group $resourceGroupName
```

#### Test HTTP Function
```powershell
# Get function URL
$functionUrl = az functionapp function show `
  --function-name "ManualDataSync" `
  --name $functionAppName `
  --resource-group $resourceGroupName `
  --query "invokeUrlTemplate" -o tsv

# Test the HTTP function
Invoke-RestMethod -Uri $functionUrl -Method POST
```

### Step 7: Integration with cATO Application

#### Update cATO App Configuration
Add the Function App endpoint to your application's environment variables:

```javascript
// In your .env or environment configuration
AZURE_FUNCTIONS_ENDPOINT=https://func-cato-datasync.azurewebsites.net
AZURE_FUNCTIONS_KEY=<function-key>
```

#### Get Function Key
```powershell
# Get the function key for HTTP trigger
az functionapp keys list `
  --name $functionAppName `
  --resource-group $resourceGroupName
```

## Monitoring and Troubleshooting

### View Function Logs
1. **Azure Portal** → Function Apps → Your Function App → Functions → Function Name → Monitor
2. **Application Insights** (if configured)
3. **Log Stream** in Azure Portal

### Common Issues
- **Authentication Errors**: Verify managed identity and role assignments
- **Timeout Issues**: Increase function timeout in host.json
- **Memory Issues**: Consider upgrading to Premium plan for larger workloads

## Function Code Structure

The deployed functions will include:

### DataSyncTimer Function
- **Purpose**: Automated hourly sync of compliance data
- **Triggers**: Timer (every hour)
- **Actions**: 
  - Fetch Azure Policy compliance states
  - Retrieve Security Center recommendations
  - Update NIST control mappings
  - Store results in configured data store

### ManualDataSync Function
- **Purpose**: On-demand data synchronization
- **Triggers**: HTTP POST request
- **Actions**: Same as timer function but triggered manually
- **Response**: JSON with sync status and timestamp

## Security Considerations
- Functions use managed identity for Azure service authentication
- No stored credentials in function code
- Role-based access control (RBAC) for minimum required permissions
- HTTPS-only communication

## Next Steps
1. Deploy the functions using the steps above
2. Test both timer and HTTP triggers
3. Integrate the HTTP endpoint with your cATO application's Settings page
4. Monitor function execution and performance
5. Set up alerts for function failures or performance issues

## Support
- Azure Functions Documentation: https://docs.microsoft.com/en-us/azure/azure-functions/
- Azure CLI Reference: https://docs.microsoft.com/en-us/cli/azure/functionapp
- Troubleshooting Guide: https://docs.microsoft.com/en-us/azure/azure-functions/functions-recover-storage-account
