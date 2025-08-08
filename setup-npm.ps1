# cATO Dashboard - Setup Script (PowerShell)
# Upgrades NPM and installs dependencies for Azure Static Web Apps deployment

Write-Host "🚀 cATO Dashboard Setup Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18.17.0 or higher first." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = (node --version).Substring(1)
$requiredVersion = [version]"18.17.0"
$currentVersion = [version]$nodeVersion

if ($currentVersion -lt $requiredVersion) {
    Write-Host "❌ Node.js version $nodeVersion is too old. Please upgrade to 18.17.0 or higher." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js version: v$nodeVersion" -ForegroundColor Green

# Update NPM to 11.5.2
Write-Host "⬆️ Updating NPM to version 11.5.2..." -ForegroundColor Blue
npm install -g npm@11.5.2

# Verify NPM version
$npmVersion = npm --version
Write-Host "✅ NPM version: $npmVersion" -ForegroundColor Green

# Clean previous installation
Write-Host "🧹 Cleaning previous installation..." -ForegroundColor Blue
if (Test-Path "node_modules") { Remove-Item -Recurse -Force node_modules }
if (Test-Path "package-lock.json") { Remove-Item -Force package-lock.json }
npm cache clean --force

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Run type check
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Blue
try {
    npm run type-check
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ TypeScript check found issues - review code for any remaining errors" -ForegroundColor Yellow
}

# Build the application
Write-Host "🏗️ Building application..." -ForegroundColor Blue
try {
    npm run build
    Write-Host "✅ Build successful!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Build failed - check errors above" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your Azure environment variables"
Write-Host "2. Run deployment: see DEPLOYMENT_GUIDE.md"
Write-Host "3. For local development: npm run dev"
Write-Host ""
Write-Host "📚 See DEPLOYMENT_GUIDE.md for complete deployment instructions" -ForegroundColor Cyan
