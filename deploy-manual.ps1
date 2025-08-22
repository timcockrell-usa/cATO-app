# Manual deployment script for Azure Static Web Apps (PowerShell)
# Usage: .\deploy-manual.ps1 "YOUR_DEPLOYMENT_TOKEN_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$DeploymentToken
)

$APP_NAME = "stapp-tlgsnk5eym2h2"
$RESOURCE_GROUP = "ampe-eastus-dev-rg"

Write-Host "🚀 Starting manual deployment to Azure Static Web Apps..." -ForegroundColor Green
Write-Host "📱 App: $APP_NAME" -ForegroundColor Cyan
Write-Host "📂 Resource Group: $RESOURCE_GROUP" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-not (Test-Path "./dist")) {
    Write-Host "❌ Error: ./dist folder not found" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}

# Create deployment zip
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path "./dist/*" -DestinationPath "./deployment.zip" -Force

$zipSize = (Get-Item "./deployment.zip").Length / 1KB
Write-Host "✅ Created deployment.zip ($([math]::Round($zipSize, 2)) KB)" -ForegroundColor Green
Write-Host ""

# Upload using Invoke-RestMethod
Write-Host "🚀 Uploading to Azure Static Web Apps..." -ForegroundColor Yellow
Write-Host "Note: This may take a few minutes..." -ForegroundColor Gray

try {
    $uri = "https://api.azurestaticapps.net/api/deploy"
    $headers = @{
        "Authorization" = "Bearer $DeploymentToken"
        "Content-Type" = "application/zip"
    }
    
    $fileBytes = [System.IO.File]::ReadAllBytes("./deployment.zip")
    
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $fileBytes -TimeoutSec 300
    
    Write-Host ""
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your app should be live at: https://$APP_NAME.azurestaticapps.net" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Note: It may take a few minutes for changes to propagate." -ForegroundColor Gray
    
} catch {
    Write-Host ""
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. Your deployment token is correct and not expired" -ForegroundColor Gray
    Write-Host "2. You have proper permissions" -ForegroundColor Gray
    Write-Host "3. Try again in a few minutes" -ForegroundColor Gray
}

# Clean up
Remove-Item "./deployment.zip" -Force
Write-Host "🧹 Cleaned up temporary files" -ForegroundColor Gray
