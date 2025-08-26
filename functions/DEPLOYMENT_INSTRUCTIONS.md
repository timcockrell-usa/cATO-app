# Azure Functions Deployment Instructions

## Your Function App Details
- **Function App Name**: func-cato-datasync-portal
- **Resource Group**: ampe-eastus-dev-rg
- **Region**: East US 2
- **Domain**: func-cato-datasync-portal-hkfbabh2h6e4dtdb.eastus2-01.azurewebsites.net

## Deployment Options

### Option 1: Manual Portal Deployment (Recommended)

1. **Navigate to Function App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Search for "func-cato-datasync-portal"
   - Select your Function App

2. **Deploy via Deployment Center**
   - Click **"Deployment Center"** in the left menu
   - Choose **"Local Git"** or **"GitHub"** if you want CI/CD
   - For immediate deployment, use **"External Git"** and point to this repository

3. **Alternative: Upload via Advanced Tools (Kudu)**
   - Click **"Advanced Tools"** → **"Go"** (opens Kudu)
   - Navigate to **"site/wwwroot"**
   - Upload the contents of the `functions` folder

### Option 2: CLI Deployment (Once Authentication Issues Resolved)

```powershell
# From the functions directory
func azure functionapp publish func-cato-datasync-portal --resource-group ampe-eastus-dev-rg
```

### Option 3: VS Code Extension

1. Install **Azure Functions** extension in VS Code
2. Sign in to Azure account
3. Right-click on Function App in Azure view
4. Select **"Deploy to Function App"**

## Function Endpoints

After deployment, your functions will be available at:

### DataSyncTimer (Timer Function)
- **Type**: Timer trigger (every 6 hours)
- **Schedule**: `0 0 */6 * * *`
- **Purpose**: Automated compliance data synchronization

### ManualDataSync (HTTP Function)
- **GET Endpoint**: `https://func-cato-datasync-portal-hkfbabh2h6e4dtdb.eastus2-01.azurewebsites.net/api/ManualDataSync`
- **POST Endpoint**: `https://func-cato-datasync-portal-hkfbabh2h6e4dtdb.eastus2-01.azurewebsites.net/api/ManualDataSync`
- **Purpose**: On-demand compliance data synchronization

## Testing the Functions

### Test Manual Sync Function
```powershell
# Get status
Invoke-RestMethod -Uri "https://func-cato-datasync-portal-hkfbabh2h6e4dtdb.eastus2-01.azurewebsites.net/api/ManualDataSync?code=<FUNCTION_KEY>" -Method GET

# Trigger sync
Invoke-RestMethod -Uri "https://func-cato-datasync-portal-hkfbabh2h6e4dtdb.eastus2-01.azurewebsites.net/api/ManualDataSync?code=<FUNCTION_KEY>" -Method POST
```

### Get Function Key
1. Go to Function App → Functions → ManualDataSync
2. Click **"Function Keys"**
3. Copy the **default** key

## Integration with cATO Application

Add these environment variables to your cATO application:

```javascript
// Environment variables for cATO integration
AZURE_FUNCTIONS_ENDPOINT=https://func-cato-datasync-portal-hkfbabh2h6e4dtdb.eastus2-01.azurewebsites.net
AZURE_FUNCTIONS_KEY=<your-function-key>
AZURE_FUNCTIONS_MANUAL_SYNC_PATH=/api/ManualDataSync
```

## Monitoring

1. **Application Insights**: Check Function App → Application Insights
2. **Function Logs**: Function App → Functions → [Function Name] → Monitor
3. **Log Stream**: Function App → Log stream (real-time logs)

## Troubleshooting

### Common Issues
- **401 Unauthorized**: Check function key
- **CORS Errors**: Functions include CORS headers
- **Timeout**: Function timeout is set to 10 minutes

### Log Analysis
- Check **Monitor** tab for each function
- Use **Application Insights** for detailed telemetry
- Use **Log stream** for real-time debugging

## Next Steps

1. Deploy the functions using one of the methods above
2. Test both functions (timer and HTTP)
3. Get the function key and integrate with your cATO application
4. Set up monitoring and alerts
5. Expand functions with real Azure SDK integration for compliance data

## Security Notes

- Functions use **Function-level authorization**
- **CORS** is enabled for your cATO application
- **Managed Identity** should be configured for Azure service access
- **HTTPS-only** communication enforced
