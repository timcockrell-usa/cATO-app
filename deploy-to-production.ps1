# Azure Static Web Apps - Deploy to Production
# Usage: .\deploy-to-production.ps1 "YOUR_DEPLOYMENT_TOKEN_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$DeploymentToken
)

Write-Host "🚀 Deploying to PRODUCTION - Azure Static Web Apps" -ForegroundColor Green
Write-Host "📱 App: stapp-tlgsnk5eym2h2" -ForegroundColor Cyan
Write-Host "🎯 Target: PRODUCTION ENVIRONMENT" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "cato-app-deployment.zip")) {
    Write-Host "❌ Error: cato-app-deployment.zip not found" -ForegroundColor Red
    Write-Host "Please run this script from c:\temp directory" -ForegroundColor Yellow
    exit 1
}

# Extract deployment files if not already done
if (-not (Test-Path "deployment-files")) {
    Write-Host "📁 Extracting deployment files..." -ForegroundColor Yellow
    Expand-Archive -Path "cato-app-deployment.zip" -DestinationPath "deployment-files" -Force
    Write-Host "✅ Files extracted" -ForegroundColor Green
}

Write-Host "📂 Deployment files ready:" -ForegroundColor Cyan
Get-ChildItem "deployment-files" | Select-Object Name | Format-Table -AutoSize

# Clean the token
$CleanToken = $DeploymentToken.Trim().Trim('"').Trim("'")
Write-Host "🔑 Using deployment token (length: $($CleanToken.Length) chars)" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎯 Deploying to PRODUCTION environment..." -ForegroundColor Green
Write-Host "⚠️  This will replace your current production site!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue with production deployment? (y/N)"
if ($confirm.ToLower() -ne 'y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting production deployment..." -ForegroundColor Green
Write-Host "⏰ This may take 2-5 minutes..." -ForegroundColor Yellow

try {
    # Deploy to production using SWA CLI
    & swa deploy deployment-files --deployment-token $CleanToken --app-name stapp-tlgsnk5eym2h2 --env production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ PRODUCTION DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "🌐 Live at: https://stapp-tlgsnk5eym2h2.azurestaticapps.net" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎉 All 6 fixes are now LIVE in production:" -ForegroundColor Green
        Write-Host "   ✅ NIST controls show correct count (259)" -ForegroundColor White
        Write-Host "   ✅ Dynamic environment classification" -ForegroundColor White
        Write-Host "   ✅ Fixed dashboard chart navigation" -ForegroundColor White
        Write-Host "   ✅ ZTA activities properly update" -ForegroundColor White
        Write-Host "   ✅ Notifications button works" -ForegroundColor White
        Write-Host "   ✅ POAM import and profile settings accessible" -ForegroundColor White
        Write-Host ""
        Write-Host "⏰ Changes may take 2-5 minutes to propagate globally" -ForegroundColor Yellow
    }
    else {
        Write-Host ""
        Write-Host "❌ Production deployment failed" -ForegroundColor Red
        Write-Host "💡 Check your deployment token and try again" -ForegroundColor Yellow
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure SWA CLI is installed and token is valid" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test your production site: https://stapp-tlgsnk5eym2h2.azurestaticapps.net" -ForegroundColor White
Write-Host "2. Configure environment variables in Azure Portal if needed" -ForegroundColor White
Write-Host "3. Clean up any preview environments if desired" -ForegroundColor White
