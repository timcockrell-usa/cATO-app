@echo off
echo NIST 800-53 Rev 5 Controls Update Utility
echo ========================================
echo.
echo This script will update your NIST controls database with the complete
echo SP 800-53 Rev 5 catalog from the CSV file you've provided.
echo.

REM Check if CSV file path is provided
if "%~1"=="" (
    echo Usage: update-nist.bat "path\to\sp800-53r5-control-catalog.csv"
    echo.
    echo Please drag and drop your CSV file onto this batch file, or
    echo run it from command line with the CSV file path as argument.
    echo.
    pause
    exit /b 1
)

REM Check if file exists
if not exist "%~1" (
    echo Error: CSV file not found: %~1
    echo.
    pause
    exit /b 1
)

echo Processing CSV file: %~1
echo.

REM Run the Node.js script
node "%~dp0update-nist-controls.js" "%~1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ NIST controls update completed successfully!
    echo.
    echo Your NIST controls database has been updated with the complete
    echo SP 800-53 Rev 5 catalog. The updated file is located at:
    echo src\data\nistControlsEnhanced.ts
    echo.
    echo You can now restart your application to see the updated controls.
) else (
    echo.
    echo ❌ Error occurred during NIST controls update.
    echo Please check the error messages above.
)

echo.
pause
