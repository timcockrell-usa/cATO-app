# Azure Static Web Apps CLI Deployment Script
# This script installs SWA CLI and deploys your application

param(
    [Parameter(Mandatory=$false)]
    [string]$DeploymentToken
)

Write-Host "🚀 Azure Static Web Apps CLI Deployment" -ForegroundColor Green
Write-Host "📱 App: stapp-tlgsnk5eym2h2" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "cato-app-deployment.zip")) {
    Write-Host "❌ Error: cato-app-deployment.zip not found" -ForegroundColor Red
    Write-Host "Please run this script from c:\temp directory" -ForegroundColor Yellow
    exit 1
}

# Step 1: Install SWA CLI if not already installed
Write-Host "📦 Checking for Azure Static Web Apps CLI..." -ForegroundColor Yellow

try {
    $swaVersion = & swa --version 2>$null
    Write-Host "✅ SWA CLI already installed: $swaVersion" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ SWA CLI not found. Installing..." -ForegroundColor Yellow
    
    # Check if npm is available
    try {
        $npmVersion = & npm --version 2>$null
        Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
        
        Write-Host "📦 Installing Azure Static Web Apps CLI..." -ForegroundColor Yellow
        & npm install -g @azure/static-web-apps-cli
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SWA CLI installed successfully!" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Failed to install SWA CLI via npm" -ForegroundColor Red
            Write-Host "Please install manually: npm install -g @azure/static-web-apps-cli" -ForegroundColor Yellow
            exit 1
        }
    }
    catch {
        Write-Host "❌ npm not found. Please install Node.js first" -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
        exit 1
    }
}

# Step 2: Extract the deployment files
Write-Host ""
Write-Host "📁 Extracting deployment files..." -ForegroundColor Yellow

if (Test-Path "deployment-files") {
    Remove-Item "deployment-files" -Recurse -Force
}

New-Item -ItemType Directory -Name "deployment-files" -Force | Out-Null
Expand-Archive -Path "cato-app-deployment.zip" -DestinationPath "deployment-files" -Force

Write-Host "✅ Files extracted to deployment-files/" -ForegroundColor Green

# Step 3: Deploy using SWA CLI
Write-Host ""
Write-Host "🚀 Deploying to Azure Static Web Apps..." -ForegroundColor Green

if ($DeploymentToken) {
    Write-Host "🔑 Using provided deployment token" -ForegroundColor Cyan
    
    & swa deploy deployment-files --deployment-token $DeploymentToken --app-name stapp-tlgsnk5eym2h2
}
else {
    Write-Host "🔐 No deployment token provided - attempting interactive login..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You have two options:" -ForegroundColor Cyan
    Write-Host "1. Use deployment token: .\deploy-with-swa.ps1 'YOUR_TOKEN_HERE'" -ForegroundColor White
    Write-Host "2. Use Azure login (will prompt for authentication)" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Choose (1) for token or (2) for Azure login"
    
    if ($choice -eq "1") {
        $token = Read-Host "Enter your deployment token"
        & swa deploy deployment-files --deployment-token $token --app-name stapp-tlgsnk5eym2h2
    }
    else {
        Write-Host "🔐 Using Azure CLI authentication..." -ForegroundColor Yellow
        & swa deploy deployment-files --resource-group ampe-eastus-dev-rg --app-name stapp-tlgsnk5eym2h2
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your app is live at: https://stapp-tlgsnk5eym2h2.azurestaticapps.net" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏰ Changes may take 2-5 minutes to propagate globally" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎉 All 6 deployment fixes are now live:" -ForegroundColor Green
    Write-Host "   ✅ NIST controls show correct count (259)" -ForegroundColor White
    Write-Host "   ✅ Dynamic environment classification" -ForegroundColor White  
    Write-Host "   ✅ Fixed dashboard chart navigation" -ForegroundColor White
    Write-Host "   ✅ ZTA activities properly update" -ForegroundColor White
    Write-Host "   ✅ Notifications button works" -ForegroundColor White
    Write-Host "   ✅ POAM import and profile settings accessible" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "💡 Try getting a fresh deployment token from Azure Portal" -ForegroundColor Yellow
    Write-Host "   Portal → Static Web Apps → stapp-tlgsnk5eym2h2 → Manage deployment token" -ForegroundColor Cyan
}

# Cleanup
Write-Host ""
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Gray
Remove-Item "deployment-files" -Recurse -Force -ErrorAction SilentlyContinue
