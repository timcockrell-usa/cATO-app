# Azure Functions Deployment via VS Code

## Quick VS Code Deployment Steps

### 1. Install VS Code Extensions
1. Open VS Code
2. Install the **Azure Functions** extension
3. Install the **Azure Account** extension

### 2. Sign in to Azure
1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Azure: Sign In" and select it
3. Follow the authentication flow

### 3. Deploy Functions
1. Open your `functions` folder in VS Code
2. Press `Ctrl+Shift+P` to open Command Palette
3. Type "Azure Functions: Deploy to Function App"
4. Select your subscription
5. Select `func-cato-datasync-portal`
6. Confirm deployment

### 4. Monitor Deployment
- Check the VS Code output panel for deployment progress
- Verify functions appear in Azure Portal

## Alternative: Manual Portal Upload

If VS Code doesn't work, you can manually upload via Azure Portal:

1. **Zip your functions folder**:
   - Right-click on the `functions` folder
   - Select "Send to" → "Compressed folder"
   - Name it `functions.zip`

2. **Upload via Kudu Console**:
   - In Azure Portal: Function App → Advanced Tools → Go
   - Navigate to `/site/wwwroot`
   - Drag and drop `functions.zip`
   - Extract the files

3. **Restart Function App**:
   - In Azure Portal: Function App → Overview → Restart

## Verification Steps

After deployment:
1. Check Function App → Functions (should show DataSyncTimer and ManualDataSync)
2. Test each function using the "Code + Test" feature
3. Verify logs in Monitor section
