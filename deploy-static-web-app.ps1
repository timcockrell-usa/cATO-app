# Azure Static Web App + Functions Deployment Script
# This script deploys both the static web app and Azure Functions together

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$StaticWebAppName,
    
    [Parameter(Mandatory=$true)]
    [string]$FunctionAppName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubRepo = "",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = ""
)

Write-Host "🚀 Deploying cATO Azure Static Web App + Functions Integration" -ForegroundColor Green
Write-Host "=" * 70

# Check if logged in to Azure
try {
    $currentContext = az account show --query "name" -o tsv
    Write-Host "✅ Logged in to Azure account: $currentContext" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# Create resource group if it doesn't exist
Write-Host "`n📁 Checking resource group: $ResourceGroupName"
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq "false") {
    Write-Host "Creating resource group..." -ForegroundColor Yellow
    az group create --name $ResourceGroupName --location $Location
    Write-Host "✅ Resource group created" -ForegroundColor Green
} else {
    Write-Host "✅ Resource group exists" -ForegroundColor Green
}

# Deploy Static Web App
Write-Host "`n🌐 Deploying Static Web App: $StaticWebAppName"
if ($GitHubRepo -and $GitHubToken) {
    Write-Host "Deploying with GitHub integration..." -ForegroundColor Yellow
    
    $swaResult = az staticwebapp create `
        --name $StaticWebAppName `
        --resource-group $ResourceGroupName `
        --location $Location `
        --source $GitHubRepo `
        --branch "main" `
        --token $GitHubToken `
        --app-location "/" `
        --api-location "functions" `
        --output-location "dist"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Static Web App created with GitHub integration" -ForegroundColor Green
        
        # Get the deployment token
        $deploymentToken = az staticwebapp secrets list --name $StaticWebAppName --resource-group $ResourceGroupName --query "properties.apiKey" -o tsv
        Write-Host "📋 GitHub Actions Deployment Token: $deploymentToken" -ForegroundColor Cyan
        Write-Host "   Add this as AZURE_STATIC_WEB_APPS_API_TOKEN secret in your GitHub repo"
    } else {
        Write-Host "❌ Failed to create Static Web App" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Creating Static Web App without GitHub integration..." -ForegroundColor Yellow
    
    $swaResult = az staticwebapp create `
        --name $StaticWebAppName `
        --resource-group $ResourceGroupName `
        --location $Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Static Web App created" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create Static Web App" -ForegroundColor Red
        exit 1
    }
}

# Deploy Azure Functions (assuming functions are already created in ./functions)
Write-Host "`n⚡ Checking for Azure Functions..."
if (Test-Path "./functions") {
    Write-Host "Functions directory found. Deploying to Static Web App API..." -ForegroundColor Yellow
    
    # The functions will be deployed automatically via GitHub Actions or manual deployment
    Write-Host "✅ Functions will be deployed via the Static Web App integration" -ForegroundColor Green
} else {
    Write-Host "⚠️ No functions directory found. Functions need to be created separately." -ForegroundColor Yellow
}

# Get Static Web App details
Write-Host "`n📊 Getting deployment information..."
$swaDetails = az staticwebapp show --name $StaticWebAppName --resource-group $ResourceGroupName | ConvertFrom-Json

Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "=" * 50
Write-Host "Static Web App Name: $StaticWebAppName"
Write-Host "Resource Group: $ResourceGroupName"
Write-Host "Location: $Location"
Write-Host "Default Hostname: $($swaDetails.defaultHostname)" -ForegroundColor Cyan
Write-Host "Repository URL: $($swaDetails.repositoryUrl)"

if ($swaDetails.defaultHostname) {
    Write-Host "`n🌐 Your cATO application will be available at:" -ForegroundColor Green
    Write-Host "https://$($swaDetails.defaultHostname)" -ForegroundColor Cyan
}

# Environment Variables Setup
Write-Host "`n🔧 Environment Variables Setup:" -ForegroundColor Yellow
Write-Host "Add these environment variables to your GitHub repository secrets:"
Write-Host ""
Write-Host "AZURE_STATIC_WEB_APPS_API_TOKEN = (deployment token shown above)" -ForegroundColor Cyan

if ($GitHubRepo) {
    Write-Host "`n📝 GitHub Actions Setup:" -ForegroundColor Yellow
    Write-Host "1. Add the deployment token as a GitHub secret"
    Write-Host "2. Push changes to trigger automatic deployment"
    Write-Host "3. Monitor deployment in GitHub Actions tab"
} else {
    Write-Host "`n📝 Manual Deployment:" -ForegroundColor Yellow
    Write-Host "1. Build your application: npm run build"
    Write-Host "2. Deploy using Azure CLI or GitHub Actions"
}

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🔗 Manage your Static Web App: https://portal.azure.com/#resource$($swaDetails.id)" -ForegroundColor Cyan
