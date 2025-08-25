# Azure Functions Deployment Guide

## Overview
This guide covers the deployment of the Azure Functions component for the cATO application's automated data synchronization feature. You can deploy using either the Azure CLI or the Azure Portal.

## Prerequisites
- Azure subscription with appropriate permissions
- Resource group for the cATO application
- For CLI deployment: Azure CLI installed and authenticated
- For Portal deployment: Access to Azure Portal

## Azure Functions Architecture
The Azure Functions component provides:
- **Timer Trigger**: Automated hourly sync of compliance data from Azure services
- **HTTP Trigger**: Manual sync endpoint for on-demand data updates
- **NIST Control Mapping**: Integration with Azure Policy, Security Center, and Monitor

## Deployment Methods

Choose one of the following deployment methods based on your preference and workflow:

- **[Method 1: Azure CLI Deployment](#method-1-azure-cli-deployment)** - Command-line based deployment for automation and scripting
- **[Method 2: Azure Portal Deployment](#method-2-azure-portal-deployment)** - Web-based GUI deployment for interactive setup

---

## Method 1: Azure CLI Deployment

## Method 1: Azure CLI Deployment

### Prerequisites for CLI Deployment
- Azure CLI installed and authenticated
- PowerShell or Bash terminal
- Node.js 20+ installed locally
- Azure Functions Core Tools v4

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
  --runtime-version 20 `
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
    "WEBSITE_NODE_DEFAULT_VERSION=20" `
    "FUNCTIONS_EXTENSION_VERSION=~4" `
    "AzureWebJobsFeatureFlags=EnableWorkerIndexing"
```

### Step 3: Deploy Function Code

#### Install Azure Functions Core Tools
```powershell
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

#### Create Functions Project Structure
```powershell
# Create functions directory
mkdir azure-functions
cd azure-functions

# Initialize Functions project
func init . --typescript
```

#### Create the Timer Function
```powershell
func new --name "DataSyncTimer" --template "Timer trigger" --language typescript
```

#### Create the HTTP Function
```powershell
func new --name "ManualDataSync" --template "HTTP trigger" --language typescript
```

#### Deploy Functions
```powershell
# Deploy to Azure
func azure functionapp publish $functionAppName

# Or deploy with specific settings
func azure functionapp publish $functionAppName --publish-local-settings
```

### Step 4: Configure Managed Identity and Permissions (CLI)

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

### Step 5: Configure Function Triggers (CLI)

#### Timer Function Configuration
```powershell
# The timer function is configured via function.json
# Schedule: "0 0 * * * *" (runs every hour)
# This is set automatically when creating with the timer template
```

#### HTTP Function Configuration
```powershell
# The HTTP function is configured via function.json
# Authorization Level: Function (default)
# HTTP Methods: POST, GET (configurable)
```

### Step 6: Test the Functions (CLI)

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

---

## Method 2: Azure Portal Deployment

### Prerequisites for Portal Deployment
- Access to Azure Portal (portal.azure.com)
- Appropriate Azure subscription permissions
- Resource group already created or permissions to create one

### Step 1: Create Function App via Portal

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure credentials

2. **Create Function App**
   - Click **"Create a resource"** (+) in the top-left corner
   - Search for **"Function App"** and select it
   - Click **"Create"**

3. **Configure Basic Settings**
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Choose existing or create new (e.g., `rg-cato-production`)
   - **Function App Name**: Enter unique name (e.g., `func-cato-datasync-portal`)
   - **Publish**: Code
   - **Runtime Stack**: Node.js
   - **Version**: 20 LTS
   - **Region**: Choose appropriate region (e.g., East US)

4. **Configure Hosting**
   - **Operating System**: Linux (recommended for cost efficiency)
   - **Plan Type**: Premium (recommended) or Consumption
   - **If Consumption Plan**: Memory allocation options
     - ❌ **512MB**: Too small for compliance processing
     - ✅ **2048MB (2GB)**: **Recommended for cATO** - optimal balance
     - ⚠️ **4096MB (4GB)**: Expensive, only for very large datasets
   - **If Premium Plan**: Instance Size: EP1 (1 vCore, 3.5GB RAM) - optimal for cATO workloads
   - **Storage Account**: Create new or use existing

5. **Review and Create**
   - Review all settings
   - Click **"Create"** and wait for deployment

### Step 2: Configure Function App Settings via Portal

1. **Navigate to Function App**
   - Go to **Resource Groups** → Your Resource Group → Your Function App
   - Or search for your Function App name in the portal search

2. **Configure Application Settings**
   - In the Function App menu, select **"Configuration"**
   - Under **"Application settings"**, add the following:
     - `WEBSITE_NODE_DEFAULT_VERSION`: `20`
     - `FUNCTIONS_EXTENSION_VERSION`: `~4`
     - `AzureWebJobsFeatureFlags`: `EnableWorkerIndexing`
   - Click **"Save"** to apply settings

3. **Configure Environment Variables**
   - Add any additional environment variables needed for your functions
   - Configure connection strings if required
   - Click **"Save"** and **"Continue"** when prompted

### Step 3: Deploy Function Code via Portal

#### Option A: Using Deployment Center (Recommended)

1. **Access Deployment Center**
   - In your Function App, select **"Deployment Center"** from the menu
   - Choose your deployment source:
     - **GitHub**: Connect to your GitHub repository
     - **Azure Repos**: Connect to Azure DevOps
     - **Local Git**: Use Git deployment
     - **FTPS**: Upload files directly

2. **Configure GitHub Deployment** (if using GitHub)
   - Click **"GitHub"** and authorize Azure to access your repositories
   - Select **Organization**: Your GitHub organization
   - Select **Repository**: Your cATO repository
   - Select **Branch**: main or your deployment branch
   - **Build Provider**: GitHub Actions (recommended)
   - Click **"Save"**

3. **Monitor Deployment**
   - View deployment logs in the Deployment Center
   - Check deployment status and troubleshoot if needed

#### Option B: Using Advanced Tools (Kudu)

1. **Access Advanced Tools**
   - In your Function App, select **"Advanced Tools"** from the Development Tools section
   - Click **"Go"** to open Kudu console

2. **Upload Function Code**
   - Use the file manager to navigate to `/site/wwwroot`
   - Upload your function files or use Git commands
   - Ensure proper folder structure for Azure Functions

#### Option C: Using VS Code Extension

1. **Install Azure Functions Extension**
   - Install the Azure Functions extension for VS Code
   - Sign in to your Azure account

2. **Deploy from VS Code**
   - Open your function project in VS Code
   - Use Command Palette (Ctrl+Shift+P)
   - Run **"Azure Functions: Deploy to Function App"**
   - Select your Function App and confirm deployment

### Step 4: Configure Managed Identity via Portal

1. **Enable System-Assigned Managed Identity**
   - In your Function App, select **"Identity"** from the Settings section
   - Under **"System assigned"** tab, toggle **"Status"** to **"On"**
   - Click **"Save"** and confirm the action
   - Note the **Object (principal) ID** for role assignments

2. **Assign Azure Roles**
   - Navigate to your **Subscription** or **Resource Group**
   - Select **"Access control (IAM)"**
   - Click **"Add"** → **"Add role assignment"**
   
   **Assign Security Reader Role:**
   - **Role**: Security Reader
   - **Assign access to**: Managed identity
   - **Subscription**: Your subscription
   - **Managed identity**: Function App
   - **Select**: Your Function App name
   - Click **"Save"**

   **Assign Policy Insights Data Writer Role:**
   - Repeat above steps with **Role**: Policy Insights Data Writer

   **Assign Monitoring Reader Role:**
   - Repeat above steps with **Role**: Monitoring Reader

### Step 5: Create Functions via Portal

1. **Create Timer Function**
   - In your Function App, select **"Functions"** from the left menu
   - Click **"Create"** or **"Add"**
   - Choose **"Timer trigger"** template
   - **Function Name**: `DataSyncTimer`
   - **Schedule**: `0 0 * * * *` (every hour)
   - Click **"Create"**

2. **Create HTTP Function**
   - Click **"Create"** again
   - Choose **"HTTP trigger"** template
   - **Function Name**: `ManualDataSync`
   - **Authorization level**: Function
   - Click **"Create"**

3. **Update Function Code**
   - Select each function and click **"Code + Test"**
   - Replace the default code with your implementation
   - Click **"Save"** to apply changes

### Step 6: Configure Function Triggers via Portal

1. **Configure Timer Function**
   - Select **"DataSyncTimer"** function
   - Click **"Integration"**
   - Modify trigger settings if needed:
     - **Schedule**: Verify `0 0 * * * *` for hourly execution
     - **Time zone**: Set appropriate time zone
   - Click **"Save"**

2. **Configure HTTP Function**
   - Select **"ManualDataSync"** function
   - Click **"Integration"**
   - Configure HTTP trigger:
     - **Authorization level**: Function
     - **Selected HTTP methods**: POST, GET
     - **Route template**: Leave default or customize
   - Click **"Save"**

### Step 7: Test Functions via Portal

1. **Test Timer Function**
   - Select **"DataSyncTimer"** function
   - Click **"Code + Test"**
   - Click **"Test/Run"**
   - Select **"Manual execute"**
   - Click **"Run"** to test the function
   - Monitor output and logs

2. **Test HTTP Function**
   - Select **"ManualDataSync"** function
   - Click **"Code + Test"**
   - Click **"Test/Run"**
   - Configure test request:
     - **HTTP method**: POST
     - **Body**: Add test JSON if required
   - Click **"Run"** to test
   - Review response and logs

3. **Get Function URL and Keys**
   - In **"ManualDataSync"** function, click **"Get Function URL"**
   - Copy the URL with the function key
   - Store this for integration with your cATO application

### Step 8: Monitor Functions via Portal

1. **Function Monitoring**
   - Each function has a **"Monitor"** tab
   - View execution history, success/failure rates
   - Analyze performance metrics

2. **Application Insights Integration**
   - Enable Application Insights for detailed monitoring
   - Go to Function App → **"Application Insights"**
   - Click **"Turn on Application Insights"**
   - Configure and save

3. **Log Streaming**
   - Use **"Log stream"** for real-time log viewing
   - Access from Function App → **"Log stream"**

---

## 🎯 **Instance Sizing for cATO Application**

### **Recommended Configuration (Updated for 2025):**
- **Runtime**: Node.js 20 LTS (latest stable, 18 LTS deprecated)
- **Plan**: Premium EP1 
- **Instance Details**:
  - **vCores**: 1
  - **Memory**: 3.5GB
  - **Storage**: 250GB
  - **Monthly Cost**: ~$73

### **Why EP1 is Optimal for cATO:**
- **Compliance Data Processing**: Handles NIST control synchronization efficiently
- **Scheduled Tasks**: Reliable execution of 6-hour compliance syncs
- **Security Features**: Enhanced isolation for government workloads
- **Performance**: No cold starts affecting compliance reporting

### **Sizing Options Comparison:**

| Scenario | Plan | Instance | vCores | Memory | Monthly Cost | Use Case |
|----------|------|----------|--------|--------|--------------|----------|
| **Development** | Consumption | Pay-per-use | Shared | 1.5GB | $0-20 | Testing & development |
| **Production** ⭐ | Premium EP1 | Dedicated | 1 | 3.5GB | ~$73 | **Recommended for cATO** |
| **High Volume** | Premium EP2 | Dedicated | 2 | 7GB | ~$146 | Large organization compliance |
| **Enterprise** | Premium EP3 | Dedicated | 4 | 14GB | ~$292 | Multi-tenant compliance platform |

### **Consumption Plan Memory Options:**
If you're using **Consumption Plan** (pay-per-execution), you'll see these memory options:

| Memory Option | Recommendation | Use Case | Notes |
|---------------|----------------|----------|-------|
| **512MB** | ❌ Not Recommended | Light workloads only | Too small for compliance data processing |
| **2048MB (2GB)** ⭐ | ✅ **Best for cATO** | Production compliance workloads | **Recommended choice** |
| **4096MB (4GB)** | ⚠️ Expensive | Very large datasets | Overkill for most cATO scenarios |

**💡 For your cATO application: Choose 2048MB (2GB)**
- Provides sufficient memory for NIST control processing
- Cost-effective for compliance data synchronization
- Handles Azure API calls and data transformation efficiently
- Allows for future growth without over-provisioning

### **Runtime Version Selection:**
Since Azure only offers Node.js 20 LTS and 22 LTS now:
- ✅ **Node.js 20 LTS** (Recommended) - Stable, well-tested, long-term support
- ❓ **Node.js 22 LTS** (Optional) - Newer but may have compatibility issues with some Azure Functions features

**For cATO production, stick with Node.js 20 LTS for maximum compatibility.**

---

## Integration with cATO Application

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

## Integration with cATO Application

Both deployment methods result in the same Function App configuration. Use the following steps to integrate with your cATO application:

### Update cATO App Configuration
Add the Function App endpoint to your application's environment variables:

```javascript
// In your .env or environment configuration
AZURE_FUNCTIONS_ENDPOINT=https://func-cato-datasync.azurewebsites.net
AZURE_FUNCTIONS_KEY=<function-key>
```

### Get Function Key

**Via CLI:**
```powershell
# Get the function key for HTTP trigger
az functionapp keys list `
  --name $functionAppName `
  --resource-group $resourceGroupName
```

**Via Portal:**
1. Navigate to your Function App → Functions → ManualDataSync
2. Click **"Function Keys"** in the left menu
3. Copy the **default** key value

## Deployment Method Comparison

| Feature | Azure CLI | Azure Portal |
|---------|-----------|--------------|
| **Setup Speed** | Fast (if CLI configured) | Moderate (GUI navigation) |
| **Automation** | Excellent (scriptable) | Limited (manual steps) |
| **Learning Curve** | Steep (CLI commands) | Gentle (visual interface) |
| **Reproducibility** | Excellent (scripts) | Manual documentation needed |
| **CI/CD Integration** | Native support | Requires additional setup |
| **Troubleshooting** | Command-line logs | Visual dashboards |
| **Team Collaboration** | Script sharing | Screen sharing/documentation |
| **Best For** | DevOps, automation, CI/CD | Learning, one-off deployments |

### When to Use CLI Deployment
- ✅ You have Azure CLI experience
- ✅ Need automated/scripted deployment
- ✅ Setting up CI/CD pipelines
- ✅ Managing multiple environments
- ✅ Prefer command-line tools

### When to Use Portal Deployment
- ✅ New to Azure Functions
- ✅ Prefer visual interfaces
- ✅ One-time or infrequent deployments
- ✅ Need to see configuration options
- ✅ Troubleshooting existing resources

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
1. Choose your preferred deployment method (CLI or Portal)
2. Deploy the functions using the steps above
3. Test both timer and HTTP triggers
4. Integrate the HTTP endpoint with your cATO application's Settings page
5. Monitor function execution and performance
6. Set up alerts for function failures or performance issues

## Additional Configuration

### Environment-Specific Deployment
Consider creating separate Function Apps for different environments:
- **Development**: `func-cato-datasync-dev`
- **Staging**: `func-cato-datasync-staging`  
- **Production**: `func-cato-datasync-prod`

### Security Best Practices
- Use managed identity for all Azure service authentication
- Store sensitive configuration in Azure Key Vault
- Enable HTTPS-only communication
- Implement proper CORS settings for HTTP functions
- Regularly rotate function keys

### Performance Optimization
- Configure appropriate timeout values
- Consider upgrading to Premium plan for consistent performance
- Implement proper error handling and retry logic
- Use Application Insights for performance monitoring

## Troubleshooting Common Issues

### Function App Won't Start
- **Check runtime version**: Ensure Node.js version matches requirements
- **Verify storage account**: Function App needs access to storage account
- **Review application settings**: Ensure all required settings are configured

### Permission Errors
- **Managed identity**: Verify system-assigned managed identity is enabled
- **Role assignments**: Check that required Azure roles are assigned
- **Resource scope**: Ensure role assignments have correct scope

### Deployment Failures
- **CLI deployment**: Check Azure CLI authentication and permissions
- **Portal deployment**: Verify GitHub/repository access permissions
- **Code issues**: Review function code for syntax errors

### Performance Issues
- **Cold starts**: Consider Premium plan or always-on setting
- **Memory usage**: Monitor memory consumption and upgrade if needed
- **Timeout errors**: Increase function timeout in host.json

## Support and Resources
- Azure Functions Documentation: https://docs.microsoft.com/en-us/azure/azure-functions/
- Azure CLI Reference: https://docs.microsoft.com/en-us/cli/azure/functionapp
- Troubleshooting Guide: https://docs.microsoft.com/en-us/azure/azure-functions/functions-recover-storage-account
