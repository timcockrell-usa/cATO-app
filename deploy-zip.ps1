# PowerShell script to deploy ZIP file using REST API
param(
    [string]$ResourceGroupName = "ampe-eastus-dev-rg",
    [string]$FunctionAppName = "func-cato-datasync-portal",
    [string]$ZipFilePath = "cato-functions.zip"
)

Write-Host "🚀 Azure Functions ZIP Deployment Script" -ForegroundColor Green
Write-Host "Function App: $FunctionAppName" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host "ZIP File: $ZipFilePath" -ForegroundColor Yellow

# Check if ZIP file exists
if (-not (Test-Path $ZipFilePath)) {
    Write-Error "ZIP file not found: $ZipFilePath"
    exit 1
}

Write-Host "`n📋 Instructions for Manual ZIP Deployment:" -ForegroundColor Cyan

Write-Host "`n1️⃣ OPTION 1: Azure Portal - Kudu (RECOMMENDED)" -ForegroundColor Green
Write-Host "   • Go to portal.azure.com"
Write-Host "   • Search for: $FunctionAppName"
Write-Host "   • Navigate to: Development Tools > Advanced Tools"
Write-Host "   • Click 'Go' to open Kudu"
Write-Host "   • In Kudu: Tools > Zip Push Deploy"
Write-Host "   • Drag and drop: $ZipFilePath"
Write-Host "   • Wait for deployment completion"

Write-Host "`n2️⃣ OPTION 2: VS Code Extension" -ForegroundColor Blue
Write-Host "   • Install: Azure Functions extension"
Write-Host "   • Sign in to Azure account"
Write-Host "   • Right-click on functions folder"
Write-Host "   • Select: Deploy to Function App"
Write-Host "   • Choose: $FunctionAppName"

Write-Host "`n3️⃣ OPTION 3: Direct Upload via Portal" -ForegroundColor Magenta
Write-Host "   • Go to: $FunctionAppName > Functions"
Write-Host "   • Create new functions manually"
Write-Host "   • Copy/paste code from functions/src/functions/"
Write-Host "   • DataSyncTimer.js and ManualDataSync.js"

Write-Host "`n📁 ZIP File Contents:" -ForegroundColor Yellow
if (Test-Path $ZipFilePath) {
    $zipContents = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $ZipFilePath))
    foreach ($entry in $zipContents.Entries) {
        Write-Host "   • $($entry.FullName)"
    }
    $zipContents.Dispose()
}

Write-Host "`n✅ After deployment, test your functions:" -ForegroundColor Green
Write-Host "   • Timer Function: Will run automatically every 6 hours"
Write-Host "   • HTTP Function: Test via Function App > Functions > ManualDataSync > Test/Run"

Write-Host "`n🔗 Function URLs (after deployment):" -ForegroundColor Cyan
Write-Host "   • Base URL: https://$FunctionAppName.azurewebsites.net"
Write-Host "   • HTTP Trigger: https://$FunctionAppName.azurewebsites.net/api/ManualDataSync"

Write-Host "`n📊 Monitor deployment:" -ForegroundColor Blue
Write-Host "   • Portal: $FunctionAppName > Functions (should show 2 functions)"
Write-Host "   • Logs: Monitor tab for each function"
Write-Host "   • Status: Function App Overview page"

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "   1. Deploy using one of the options above"
Write-Host "   2. Verify both functions appear in the portal"
Write-Host "   3. Test the ManualDataSync function"
Write-Host "   4. Check logs for any errors"
Write-Host "   5. Get function key for integration with cATO app"

Write-Host "`nDeployment script completed! Choose your preferred method above." -ForegroundColor Green
