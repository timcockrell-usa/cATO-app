# cATO Dashboard - Validation Script (PowerShell)
# Validates NPM setup and build readiness for Azure Static Web Apps

Write-Host "🔍 cATO Dashboard Validation Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# Check Node.js version
try {
    $nodeVersion = (node --version).Substring(1)
    $requiredVersion = [version]"18.17.0"
    $currentVersion = [version]$nodeVersion
    
    if ($currentVersion -ge $requiredVersion) {
        Write-Host "✅ Node.js version: v$nodeVersion (Required: >=18.17.0)" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js version: v$nodeVersion (Required: >=18.17.0)" -ForegroundColor Red
        $hasErrors = $true
    }
}
catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    $hasErrors = $true
}

# Check NPM version
try {
    $npmVersion = npm --version
    $requiredNpmVersion = [version]"11.0.0"
    $currentNpmVersion = [version]$npmVersion
    
    if ($currentNpmVersion -ge $requiredNpmVersion) {
        Write-Host "✅ NPM version: $npmVersion (Required: >=11.0.0)" -ForegroundColor Green
    } else {
        Write-Host "❌ NPM version: $npmVersion (Required: >=11.0.0)" -ForegroundColor Red
        $hasErrors = $true
    }
}
catch {
    Write-Host "❌ NPM not found" -ForegroundColor Red
    $hasErrors = $true
}

# Check package.json exists
if (Test-Path "package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
    
    # Check for package.json engine requirements
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.engines -and $packageJson.engines.npm) {
        Write-Host "✅ NPM engine requirement: $($packageJson.engines.npm)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No NPM engine requirement in package.json" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    $hasErrors = $true
}

# Check node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed (node_modules found)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Dependencies not installed (run npm install)" -ForegroundColor Yellow
}

# Check tsconfig.json exists
if (Test-Path "tsconfig.json") {
    Write-Host "✅ TypeScript configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ tsconfig.json not found" -ForegroundColor Red
    $hasErrors = $true
}

# Check vite.config.ts exists
if (Test-Path "vite.config.ts") {
    Write-Host "✅ Vite configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ vite.config.ts not found" -ForegroundColor Red
    $hasErrors = $true
}

# Check API files are frontend-compatible
if (Test-Path "src/api/atoPackageRoutes.ts") {
    $atoContent = Get-Content "src/api/atoPackageRoutes.ts" -Raw
    if ($atoContent -match "express") {
        Write-Host "❌ ATO Package routes still contain server-side Express code" -ForegroundColor Red
        $hasErrors = $true
    } else {
        Write-Host "✅ ATO Package routes are frontend-compatible" -ForegroundColor Green
    }
} else {
    Write-Host "❌ src/api/atoPackageRoutes.ts not found" -ForegroundColor Red
    $hasErrors = $true
}

if (Test-Path "src/api/nistRevisionRoutes.ts") {
    $nistContent = Get-Content "src/api/nistRevisionRoutes.ts" -Raw
    if ($nistContent -match "express") {
        Write-Host "❌ NIST Revision routes still contain server-side Express code" -ForegroundColor Red
        $hasErrors = $true
    } else {
        Write-Host "✅ NIST Revision routes are frontend-compatible" -ForegroundColor Green
    }
} else {
    Write-Host "❌ src/api/nistRevisionRoutes.ts not found" -ForegroundColor Red
    $hasErrors = $true
}

Write-Host ""

if ($hasErrors) {
    Write-Host "❌ Validation failed - please fix the errors above" -ForegroundColor Red
    Write-Host "💡 Run setup-npm.ps1 to fix common issues" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "🎉 All validation checks passed!" -ForegroundColor Green
    Write-Host "🚀 Your cATO Dashboard is ready for deployment" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "• Local development: npm run dev"
    Write-Host "• Build for production: npm run build"
    Write-Host "• Deploy to Azure: see DEPLOYMENT_GUIDE.md"
}
