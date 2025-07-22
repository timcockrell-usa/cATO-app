@echo off
echo 🚀 cATO Dashboard - Local Development Quick Start
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo 📝 Creating local environment configuration...
    copy ".env.local.example" ".env.local" >nul
    echo ⚠️  IMPORTANT: Edit .env.local with your Azure Entra ID settings!
    echo    - Set VITE_AZURE_CLIENT_ID
    echo    - Set VITE_AZURE_AUTHORITY  
    echo.
    echo 📖 See LOCAL_DEVELOPMENT.md for detailed setup instructions
    echo.
    pause
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Setup complete! Next steps:
echo.
echo 1. Configure your Azure Entra ID app registration
echo 2. Edit .env.local with your actual values
echo 3. Start Cosmos DB Emulator (or use Azure CosmosDB)
echo 4. Run: npm run migrate-data
echo 5. Run: npm run dev
echo.
echo 📖 Read LOCAL_DEVELOPMENT.md for detailed instructions
echo.
pause
