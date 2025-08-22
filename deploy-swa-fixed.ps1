# Azure Static Web Apps Manual Deployment - PowerShell (FIXED VERSION)
# Usage: .\deploy-swa-fixed.ps1 "YOUR_DEPLOYMENT_TOKEN_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$DeploymentToken
)

$APP_NAME = "stapp-tlgsnk5eym2h2"
$RESOURCE_GROUP = "ampe-eastus-dev-rg"

Write-Host "🚀 Azure Static Web Apps Deployment (PowerShell)" -ForegroundColor Green
Write-Host "📱 App: $APP_NAME" -ForegroundColor Cyan
Write-Host "📂 Resource Group: $RESOURCE_GROUP" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-not (Test-Path "./dist")) {
    Write-Host "❌ Error: ./dist folder not found" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Files ready for deployment:" -ForegroundColor Green
Get-ChildItem "./dist" | Format-Table Name, Length, LastWriteTime

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
try {
    if (Test-Path "deployment.zip") {
        Remove-Item "deployment.zip" -Force
    }
    
    # Use PowerShell's Compress-Archive
    Compress-Archive -Path "./dist/*" -DestinationPath "deployment.zip" -Force
    
    $zipSize = (Get-Item "deployment.zip").Length
    $zipSizeKB = [math]::Round($zipSize / 1KB, 2)
    Write-Host "✅ Created deployment.zip ($zipSizeKB KB)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create deployment package: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean the token (remove any extra whitespace or quotes)
$CleanToken = $DeploymentToken.Trim().Trim('"').Trim("'")
Write-Host "🔑 Token length: $($CleanToken.Length) characters" -ForegroundColor Cyan

# Test connectivity first
Write-Host ""
Write-Host "🔍 Testing connectivity to deployment endpoint..." -ForegroundColor Yellow

$testUrl = "https://$APP_NAME.scm.azurewebsites.net/"
try {
    $testResponse = Invoke-WebRequest -Uri $testUrl -Method GET -Headers @{
        "Authorization" = "Bearer $CleanToken"
        "User-Agent" = "PowerShell-StaticWebApp-Deploy/1.0"
    } -TimeoutSec 30 -UseBasicParsing

    Write-Host "✅ Connectivity test successful (HTTP $($testResponse.StatusCode))" -ForegroundColor Green
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "❌ Authentication failed (HTTP $statusCode)" -ForegroundColor Red
        Write-Host "💡 Your deployment token is invalid or expired" -ForegroundColor Yellow
        Write-Host "Please get a new token from Azure Portal:" -ForegroundColor Yellow
        Write-Host "   Portal → Static Web Apps → $APP_NAME → Manage deployment token → Reset" -ForegroundColor Cyan
        Remove-Item "deployment.zip" -ErrorAction SilentlyContinue
        exit 1
    }
    Write-Host "⚠️ Connectivity test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Proceeding with deployment attempt..." -ForegroundColor Yellow
}

# Perform deployment
Write-Host ""
Write-Host "🚀 Uploading to Azure Static Web Apps..." -ForegroundColor Green
Write-Host "⏰ This may take 2-5 minutes..." -ForegroundColor Yellow

$deployUrl = "https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy"
$zipBytes = [System.IO.File]::ReadAllBytes((Resolve-Path "deployment.zip").Path)

try {
    $response = Invoke-RestMethod -Uri $deployUrl -Method POST -Body $zipBytes -Headers @{
        "Authorization" = "Bearer $CleanToken"
        "Content-Type" = "application/zip"
        "User-Agent" = "PowerShell-StaticWebApp-Deploy/1.0"
    } -TimeoutSec 300

    Write-Host ""
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your app is live at: https://$APP_NAME.azurestaticapps.net" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏰ Note: Changes may take 2-5 minutes to propagate globally" -ForegroundColor Yellow
    Write-Host "🔄 If you don't see changes immediately, wait and refresh" -ForegroundColor Yellow
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message

    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorMessage" -ForegroundColor Red

    if ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host ""
        Write-Host "🔧 Authentication Error - Try this:" -ForegroundColor Yellow
        Write-Host "1. Get a NEW deployment token from Azure Portal" -ForegroundColor Cyan
        Write-Host "2. Make sure you copy the ENTIRE token" -ForegroundColor Cyan
        Write-Host "3. Run: .\deploy-swa-fixed.ps1 `"NEW-TOKEN-HERE`"" -ForegroundColor Cyan
    }
    elseif ($statusCode -eq 0 -or $null -eq $statusCode) {
        Write-Host ""
        Write-Host "🔧 Network Error (HTTP 000) - Try this:" -ForegroundColor Yellow
        Write-Host "1. Check your internet connection in Cloud Shell" -ForegroundColor Cyan
        Write-Host "2. Get a fresh deployment token" -ForegroundColor Cyan
        Write-Host "3. Make sure you're using quotes around the token" -ForegroundColor Cyan
        Write-Host "4. Run: .\deploy-swa-fixed.ps1 `"YOUR-TOKEN`"" -ForegroundColor Cyan
    }
    else {
        Write-Host ""
        Write-Host "🔧 Unexpected Error - Try this:" -ForegroundColor Yellow
        Write-Host "1. Wait 5 minutes and try again" -ForegroundColor Cyan
        Write-Host "2. Get a fresh deployment token" -ForegroundColor Cyan
        Write-Host "3. Contact Azure support if problem persists" -ForegroundColor Cyan
    }
}
finally {
    # Cleanup
    if (Test-Path "deployment.zip") {
        Remove-Item "deployment.zip" -Force
        Write-Host ""
        Write-Host "🧹 Cleaned up temporary files" -ForegroundColor Gray
    }
}
