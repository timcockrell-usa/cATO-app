# Azure Cloud Shell Deployment Script for cATO Application Update
# PowerShell version for Windows users
# Updates deployed cATO application with enhanced NIST controls data

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$WebAppName,
    
    [Parameter(Mandatory=$false)]
    [string]$StorageAccountName
)

# Configuration
$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

Write-Host "🚀 Starting cATO application update with enhanced NIST controls..." -ForegroundColor Cyan

# Step 1: Check if we're in the correct directory
if (-not (Test-Path "package.json") -or -not (Test-Path "azure.yaml")) {
    Write-Error "Please run this script from the root of your cATO application directory"
    exit 1
}

Write-Status "Found cATO application files"

# Step 2: Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Warning "Installing dependencies..."
    npm install
}

# Step 3: Update NIST controls data from CSV
Write-Status "Processing NIST controls CSV data..."
if (Test-Path "scripts/update-nist-controls.cjs") {
    node scripts/update-nist-controls.cjs
    Write-Status "NIST controls data updated successfully"
} else {
    Write-Error "Missing update-nist-controls.cjs script"
    exit 1
}

# Step 4: Build the application
Write-Status "Building application..."
npm run build

# Step 5: Check Azure CLI login
Write-Status "Checking Azure CLI authentication..."
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Status "Logged in as: $($account.user.name)"
} catch {
    Write-Error "Please log in to Azure CLI first: az login"
    exit 1
}

# Step 6: Deploy to Azure Static Web Apps
Write-Status "Deploying to Azure Static Web Apps..."

try {
    # Get the deployment token
    $deploymentToken = az staticwebapp secrets list --name $WebAppName --resource-group $ResourceGroupName --query "properties.apiKey" --output tsv
    
    if ([string]::IsNullOrEmpty($deploymentToken)) {
        Write-Error "Failed to get deployment token. Please check your resource group and web app names."
        exit 1
    }
    
    Write-Status "Got deployment token"
    
    # Create deployment package
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $deploymentZip = "deployment-$timestamp.zip"
    
    Write-Status "Creating deployment package..."
    Compress-Archive -Path "dist\*" -DestinationPath $deploymentZip -Force
    
    # Deploy using REST API
    Write-Status "Uploading to Azure Static Web Apps..."
    $webAppUrl = "https://$WebAppName.azurestaticapps.net"
    
    # Use curl if available, otherwise use Invoke-RestMethod
    if (Get-Command curl -ErrorAction SilentlyContinue) {
        curl -X POST `
            -H "Content-Type: application/zip" `
            -H "Authorization: Bearer $deploymentToken" `
            --data-binary "@$deploymentZip" `
            "$webAppUrl/api/zipdeploy"
    } else {
        $headers = @{
            "Content-Type" = "application/zip"
            "Authorization" = "Bearer $deploymentToken"
        }
        
        $fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $deploymentZip))
        Invoke-RestMethod -Uri "$webAppUrl/api/zipdeploy" -Method Post -Headers $headers -Body $fileBytes
    }
    
    # Clean up
    Remove-Item $deploymentZip -Force
    
} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}

# Step 7: Update database if needed
if ($env:DATABASE_CONNECTION_STRING) {
    Write-Status "Checking for database updates..."
    
    if (Test-Path "database/migrate-nist-controls.sql") {
        Write-Warning "Database migration script found but not executed. Please run manually if using Azure SQL Database."
    }
}

# Step 8: Verify deployment
Write-Status "Verifying deployment..."
Start-Sleep -Seconds 30

try {
    $response = Invoke-WebRequest -Uri $webAppUrl -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Status "✅ Deployment successful!"
        Write-Host ""
        Write-Host "🌐 Your updated cATO application is available at:" -ForegroundColor Cyan
        Write-Host "   $webAppUrl" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 New features include:" -ForegroundColor Cyan
        Write-Host "   • Enhanced NIST 800-53 Rev 5 controls (134 total)" -ForegroundColor White
        Write-Host "   • Azure Commercial remediation guidance" -ForegroundColor White
        Write-Host "   • Azure Government remediation guidance" -ForegroundColor White
        Write-Host "   • Improved control filtering and search" -ForegroundColor White
    } else {
        Write-Error "Deployment verification failed with status code: $($response.StatusCode)"
    }
} catch {
    Write-Error "Deployment verification failed: $($_.Exception.Message)"
    Write-Warning "Please check the Azure portal for deployment status."
}

Write-Host ""
Write-Status "Deployment process completed! 🎉"
