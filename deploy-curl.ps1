# Simple Azure Static Web Apps deployment using curl (PowerShell)
# Usage: .\deploy-curl.ps1 "YOUR_DEPLOYMENT_TOKEN_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$DeploymentToken
)

$APP_NAME = "stapp-tlgsnk5eym2h2"

Write-Host "🚀 Simple Azure Static Web Apps Deployment" -ForegroundColor Green
Write-Host "📱 App: $APP_NAME" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-not (Test-Path "./dist")) {
    Write-Host "❌ Error: ./dist folder not found" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deployment.zip") {
    Remove-Item "deployment.zip" -Force
}

Compress-Archive -Path "./dist/*" -DestinationPath "deployment.zip" -Force
$zipSize = (Get-Item "deployment.zip").Length
$zipSizeKB = [math]::Round($zipSize / 1KB, 2)
Write-Host "✅ Created deployment.zip ($zipSizeKB KB)" -ForegroundColor Green

# Clean the token
$CleanToken = $DeploymentToken.Trim().Trim('"').Trim("'")
Write-Host "🔑 Using deployment token (length: $($CleanToken.Length) chars)" -ForegroundColor Cyan

# Test authentication first
Write-Host ""
Write-Host "🔍 Testing authentication..." -ForegroundColor Yellow

$testCmd = "curl -s -o nul -w `"%{http_code}`" -X GET `"https://$APP_NAME.scm.azurewebsites.net/`" -H `"Authorization: Bearer $CleanToken`""
$testResult = Invoke-Expression $testCmd

Write-Host "Authentication test result: HTTP $testResult" -ForegroundColor Cyan

if ($testResult -eq "401" -or $testResult -eq "403") {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
    Write-Host "💡 Please get a new deployment token from Azure Portal" -ForegroundColor Yellow
    Remove-Item "deployment.zip" -ErrorAction SilentlyContinue
    exit 1
}
elseif ($testResult -eq "000") {
    Write-Host "⚠️ Network connectivity issue" -ForegroundColor Yellow
    Write-Host "💡 Make sure you're in Azure Cloud Shell with internet access" -ForegroundColor Yellow
}

# Perform deployment using curl
Write-Host ""
Write-Host "🚀 Deploying to Azure Static Web Apps..." -ForegroundColor Green
Write-Host "⏰ This may take a few minutes..." -ForegroundColor Yellow

$deployCmd = "curl -s -w `"%{http_code}`" -X POST `"https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy`" -H `"Authorization: Bearer $CleanToken`" -H `"Content-Type: application/zip`" --data-binary `"@deployment.zip`" --connect-timeout 30 --max-time 300"

$result = Invoke-Expression $deployCmd
$httpCode = $result.Substring($result.Length - 3)

Write-Host ""
Write-Host "📊 Deployment Result: HTTP $httpCode" -ForegroundColor Cyan

switch ($httpCode) {
    "200" {
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
        Write-Host "🌐 Your app is live at: https://$APP_NAME.azurestaticapps.net" -ForegroundColor Cyan
        Write-Host "⏰ Changes may take 2-5 minutes to appear" -ForegroundColor Yellow
    }
    "202" {
        Write-Host "✅ Deployment accepted and in progress!" -ForegroundColor Green
        Write-Host "🌐 Your app is live at: https://$APP_NAME.azurestaticapps.net" -ForegroundColor Cyan
        Write-Host "⏰ Changes may take 2-5 minutes to appear" -ForegroundColor Yellow
    }
    "000" {
        Write-Host "❌ HTTP 000 Error - Token or connectivity issue" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Try this:" -ForegroundColor Yellow
        Write-Host "1. Get a NEW deployment token from Azure Portal" -ForegroundColor Cyan
        Write-Host "2. Portal → Static Web Apps → $APP_NAME → Manage deployment token → Reset" -ForegroundColor Cyan
        Write-Host "3. Copy the entire new token" -ForegroundColor Cyan
        Write-Host "4. Run: .\deploy-curl.ps1 `"NEW-TOKEN-HERE`"" -ForegroundColor Cyan
    }
    "401" {
        Write-Host "❌ Authentication failed - token is invalid" -ForegroundColor Red
        Write-Host "💡 Get a fresh deployment token from Azure Portal" -ForegroundColor Yellow
    }
    "403" {
        Write-Host "❌ Access forbidden - check token permissions" -ForegroundColor Red
        Write-Host "💡 Get a fresh deployment token from Azure Portal" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Deployment failed with HTTP $httpCode" -ForegroundColor Red
        Write-Host "💡 Wait a few minutes and try again" -ForegroundColor Yellow
    }
}

# Cleanup
Remove-Item "deployment.zip" -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "🧹 Temporary files cleaned up" -ForegroundColor Gray
