# Azure Cloud Shell Deployment Guide
# Enhanced NIST Controls Update for cATO Application

This guide provides step-by-step instructions for updating your deployed cATO application with the enhanced NIST 800-53 Rev 5 controls data, including Azure Commercial and Government remediation guidance.

## Prerequisites

- Access to Azure Cloud Shell or Azure CLI installed locally
- Deployed cATO application (Azure Static Web Apps)
- Repository access and deployment permissions
- Azure subscription with appropriate permissions

## Quick Start

### Option 1: Automated Deployment (Recommended)

1. **Open Azure Cloud Shell**
   ```bash
   # Navigate to your application directory
   cd cATO-app
   
   # Make the script executable
   chmod +x deploy-azure-update.sh
   
   # Run the deployment script
   ./deploy-azure-update.sh
   ```

2. **For PowerShell users:**
   ```powershell
   # In Azure Cloud Shell (PowerShell mode) or local PowerShell
   .\deploy-azure-update.ps1 -ResourceGroupName "your-rg-name" -WebAppName "your-webapp-name"
   ```

### Option 2: Manual Step-by-Step Deployment

#### Step 1: Prepare the Environment

```bash
# Clone or navigate to your repository
git clone https://github.com/your-org/cATO-app.git
cd cATO-app

# Install dependencies
npm install
```

#### Step 2: Update NIST Controls Data

```bash
# Process the CSV file with enhanced remediation data
node scripts/update-nist-controls.cjs

# Verify the data was processed correctly
ls -la src/data/nistControlsEnhanced.ts
```

#### Step 3: Build the Application

```bash
# Build for production
npm run build

# Verify build output
ls -la dist/
```

#### Step 4: Deploy to Azure Static Web Apps

```bash
# Log in to Azure (if not already logged in)
az login

# Set your subscription
az account set --subscription "your-subscription-id"

# Deploy using Azure CLI
az staticwebapp deploy \
  --name your-webapp-name \
  --resource-group your-resource-group \
  --source ./dist

# Alternative: Get deployment token and use direct upload
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name your-webapp-name \
  --resource-group your-resource-group \
  --query "properties.apiKey" \
  --output tsv)

# Create deployment package
cd dist && zip -r ../deployment.zip . && cd ..

# Upload using curl
curl -X POST \
  -H "Content-Type: application/zip" \
  -H "Authorization: Bearer $DEPLOYMENT_TOKEN" \
  --data-binary @deployment.zip \
  "https://your-webapp-name.azurestaticapps.net/api/zipdeploy"
```

#### Step 5: Database Updates (If Using Azure SQL Database)

```bash
# If you're using Azure SQL Database backend
sqlcmd -S your-server.database.windows.net \
  -d your-database \
  -U your-username \
  -P your-password \
  -i database/migrate-nist-controls.sql
```

## Configuration Updates

### Environment Variables (if needed)

Add these to your Azure Static Web Apps configuration:

```env
# If using database backend
DATABASE_CONNECTION_STRING="your-connection-string"

# API endpoints (if using custom API)
API_BASE_URL="https://your-api.azurewebsites.net"

# Feature flags
ENABLE_AZURE_GOV_REMEDIATION="true"
ENABLE_AZURE_COMMERCIAL_REMEDIATION="true"
```

### Application Settings in Azure Portal

1. Navigate to your Azure Static Web App in the Azure Portal
2. Go to **Configuration** > **Application settings**
3. Add any required environment variables
4. Save and restart the application

## Verification Steps

### 1. Check Deployment Status

```bash
# Verify the deployment
curl -I https://your-webapp-name.azurestaticapps.net

# Check specific endpoints
curl https://your-webapp-name.azurestaticapps.net/api/health
```

### 2. Test NIST Controls Features

1. **Navigate to the application:**
   - Open https://your-webapp-name.azurestaticapps.net
   - Log in to the dashboard

2. **Verify NIST Controls page:**
   - Go to NIST Controls section
   - Verify you see 134 controls total
   - Check that Azure Commercial and Government remediation sections appear in control details

3. **Test filtering and search:**
   - Use the search functionality
   - Filter by control family
   - Filter by compliance status

### 3. Database Verification (if applicable)

```sql
-- Check that new columns exist
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'nist_controls' 
  AND COLUMN_NAME IN ('azure_commercial_remediation', 'azure_government_remediation');

-- Verify data was loaded
SELECT COUNT(*) as total_controls,
       SUM(CASE WHEN azure_commercial_remediation IS NOT NULL THEN 1 ELSE 0 END) as with_commercial_remediation,
       SUM(CASE WHEN azure_government_remediation IS NOT NULL THEN 1 ELSE 0 END) as with_government_remediation
FROM nist_controls;
```

## New Features Available

After successful deployment, your cATO application will include:

### ✅ Enhanced NIST 800-53 Rev 5 Controls
- **134 total controls** from the official NIST catalog
- Complete control descriptions and discussions
- Enhanced control family organization (20 families)

### ✅ Azure Remediation Guidance
- **Azure Commercial Cloud** specific remediation steps
- **Azure Government Cloud** specific remediation steps
- Cloud-specific security recommendations
- Implementation best practices

### ✅ Improved User Interface
- Enhanced control detail dialogs
- Better filtering and search capabilities
- Visual indicators for Azure remediation availability
- Responsive design improvements

### ✅ Better Navigation
- Context-aware filtering from dashboard charts
- Improved breadcrumb navigation
- Quick access to related controls

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication error:**
   ```bash
   az login --use-device-code
   az account set --subscription "your-subscription-id"
   ```

2. **Build errors:**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **CSV processing fails:**
   ```bash
   # Check if the CSV file exists
   ls -la nist-800-53-controls.csv
   
   # Verify Node.js version
   node --version  # Should be 18+ 
   ```

4. **Database connection issues:**
   - Verify connection string in Azure Portal
   - Check firewall rules allow Azure services
   - Verify SQL user has appropriate permissions

### Getting Help

1. **Check Azure Static Web Apps logs:**
   - Go to Azure Portal > Your Static Web App > Functions > Log stream

2. **Review deployment history:**
   - Azure Portal > Your Static Web App > Deployment history

3. **Monitor application insights:**
   - Check Application Insights for runtime errors

## Rollback Procedure

If you need to rollback the deployment:

```bash
# Revert to previous deployment
az staticwebapp deployment show \
  --name your-webapp-name \
  --resource-group your-resource-group

# Deploy previous version
git checkout previous-commit-hash
npm run build
# Redeploy using steps above
```

## Security Notes

- Enhanced NIST controls include sensitive security implementation details
- Ensure proper access controls are in place
- Review Azure Government compliance requirements if applicable
- Monitor access logs for the updated application

---

**🎉 Congratulations!** Your cATO application now includes comprehensive NIST 800-53 Rev 5 controls with Azure-specific remediation guidance for both Commercial and Government clouds.
