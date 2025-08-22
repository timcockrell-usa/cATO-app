# Direct PowerShell deployment commands for Azure Static Web Apps
# Replace YOUR_TOKEN_HERE with your actual deployment token

# Set your token here
$token = "YOUR_TOKEN_HERE"

# Verify files exist
Write-Host "📂 Checking deployment files..." -ForegroundColor Yellow
if (-not (Test-Path "./dist")) {
    Write-Host "❌ Error: ./dist folder not found" -ForegroundColor Red
    exit 1
}

# Create deployment zip if it doesn't exist
if (-not (Test-Path "./deployment.zip")) {
    Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
    Compress-Archive -Path "./dist/*" -DestinationPath "./deployment.zip" -Force
}

$zipSize = (Get-Item "./deployment.zip").Length / 1KB
Write-Host "✅ Using deployment.zip ($([math]::Round($zipSize, 2)) KB)" -ForegroundColor Green

# Deploy using REST API
Write-Host "🚀 Deploying to Azure Static Web Apps..." -ForegroundColor Yellow
$uri = "https://stapp-tlgsnk5eym2h2.scm.azurewebsites.net/api/zipdeploy"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/zip"
}

try {
    $fileBytes = [System.IO.File]::ReadAllBytes("./deployment.zip")
    $response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $fileBytes -TimeoutSec 300
    
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your app should be live at: https://stapp-tlgsnk5eym2h2.azurestaticapps.net" -ForegroundColor Cyan
    Write-Host "Response: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your deployment token and try again." -ForegroundColor Yellow
}
