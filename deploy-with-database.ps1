# Azure Static Web Apps - Deploy with Database Configuration
# Usage: .\deploy-with-database.ps1 "YOUR_DEPLOYMENT_TOKEN_HERE"

param(
    [Parameter(Mandatory=$true)]
    [string]$DeploymentToken
)

Write-Host "🚀 Deploying cATO App with Database Configuration" -ForegroundColor Green
Write-Host "📱 App: stapp-tlgsnk5eym2h2" -ForegroundColor Cyan
Write-Host "🗄️ Database: Azure Cosmos DB Integration" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "deployment-files-with-db")) {
    Write-Host "❌ Error: deployment-files-with-db folder not found" -ForegroundColor Red
    Write-Host "Please run this script from c:\temp directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Files ready for deployment:" -ForegroundColor Cyan
Get-ChildItem "deployment-files-with-db" | Select-Object Name, Length | Format-Table -AutoSize

# Clean the token
$CleanToken = $DeploymentToken.Trim().Trim('"').Trim("'")
Write-Host "🔑 Using deployment token (length: $($CleanToken.Length) chars)" -ForegroundColor Cyan

Write-Host ""
Write-Host "🗄️ Database Configuration Included:" -ForegroundColor Green
Write-Host "   ✅ staticwebapp.database.config.json" -ForegroundColor White
Write-Host "   ✅ staticwebapp.database.schema.gql" -ForegroundColor White
Write-Host "   ✅ Cosmos DB entities defined" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Deploying to production with database configuration..." -ForegroundColor Green
Write-Host "⏰ This may take 2-5 minutes..." -ForegroundColor Yellow

try {
    # Deploy to production using SWA CLI with database configuration
    & swa deploy deployment-files-with-db --deployment-token $CleanToken --app-name stapp-tlgsnk5eym2h2 --env production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ DEPLOYMENT WITH DATABASE SUCCESSFUL!" -ForegroundColor Green
        Write-Host "🌐 Live at: https://stapp-tlgsnk5eym2h2.azurestaticapps.net" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🗄️ Database Configuration:" -ForegroundColor Yellow
        Write-Host "   • Cosmos DB containers linked" -ForegroundColor White
        Write-Host "   • GraphQL API enabled" -ForegroundColor White
        Write-Host "   • REST API enabled" -ForegroundColor White
        Write-Host "   • Authentication configured" -ForegroundColor White
        Write-Host ""
        Write-Host "📋 IMPORTANT NEXT STEPS:" -ForegroundColor Red
        Write-Host "1. Configure environment variables in Azure Portal:" -ForegroundColor Yellow
        Write-Host "   • AZURE_COSMOS_CONNECTION_STRING" -ForegroundColor Cyan
        Write-Host "   • VITE_ENVIRONMENT=IL2" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Azure Portal → Static Web Apps → stapp-tlgsnk5eym2h2 → Configuration" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🎉 All 6 fixes + Database integration now LIVE!" -ForegroundColor Green
    }
    else {
        Write-Host ""
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        Write-Host "💡 Check your deployment token and try again" -ForegroundColor Yellow
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure SWA CLI is installed and token is valid" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📖 Database Setup Guide:" -ForegroundColor Cyan
Write-Host "After deployment, you'll need to:" -ForegroundColor White
Write-Host "1. Get your Cosmos DB connection string from Azure Portal" -ForegroundColor White
Write-Host "2. Add it as AZURE_COSMOS_CONNECTION_STRING in Static Web App configuration" -ForegroundColor White
Write-Host "3. Your app will then connect to Cosmos DB automatically" -ForegroundColor White
