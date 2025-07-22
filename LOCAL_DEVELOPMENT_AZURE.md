# 🔐 Azure Entra ID Development Guide

This guide focuses specifically on setting up and testing the cATO Dashboard with **Azure Entra ID authentication** and **multi-subscription data import**. Perfect for production-like testing with real Azure authentication and data.

## 🎯 What This Guide Covers

✅ **Azure Entra ID Authentication** - Real Azure AD login  
✅ **Multi-Subscription Data Export** - Import from all your subscriptions  
✅ **Role-Based Access Control** - Test with real Azure roles  
✅ **Production-Like Environment** - Mirrors your actual deployment  

## Prerequisites

- **Azure Account** with permissions to create App Registrations
- **Azure CLI** installed and working
- **Node.js** (18+ recommended)
- **Azure Cosmos DB Emulator** or real Azure CosmosDB
- **PowerShell** (Windows) or Terminal (Mac/Linux)

## 🚀 Quick Start

```powershell
# Navigate to project
cd c:\Users\tcockrell\Documents\GitHub\cATO

# Install dependencies
npm install

# Copy environment template
Copy-Item .env.local.example .env.local

# Follow the steps below to configure Azure Entra ID...
```

## Step 1: Create Azure Entra ID App Registration

### 1.1 Create the App Registration

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate**: Azure Active Directory → App registrations → New registration
3. **Fill out the form**:
   ```
   Name: cATO Dashboard Local Development
   Supported account types: Accounts in this organizational directory only
   Redirect URI: Single-page application (SPA) → http://localhost:5173
   ```
4. **Click Register**

### 1.2 Configure Authentication

1. **Go to**: Your app → Authentication
2. **Add redirect URIs**:
   - `http://localhost:5173`
   - `http://localhost:5173/`
   - `http://localhost:3000` (backup port)
3. **Enable implicit grant flow**:
   - ✅ Access tokens
   - ✅ ID tokens
4. **Set logout URL**: `http://localhost:5173`
5. **Click Save**

### 1.3 Configure App Roles

Create these roles in your app registration:

**System Administrator Role:**
```
Display name: System Administrator
Allowed member types: Users/Groups
Value: SystemAdmin
Description: Full system access for administrators
```

**Security Analyst Role:**
```
Display name: Security Analyst  
Allowed member types: Users/Groups
Value: SecurityAnalyst
Description: Security analysis and monitoring access
```

**Compliance Officer Role:**
```
Display name: Compliance Officer
Allowed member types: Users/Groups
Value: ComplianceOfficer  
Description: Compliance monitoring and reporting access
```

**Authorizing Official Role:**
```
Display name: Authorizing Official
Allowed member types: Users/Groups
Value: AO
Description: Authority to make security decisions
```

**Auditor Role:**
```
Display name: Auditor
Allowed member types: Users/Groups
Value: Auditor
Description: Read-only audit access
```

**Viewer Role:**
```
Display name: Viewer
Allowed member types: Users/Groups
Value: Viewer
Description: Basic read-only access
```

### 1.4 Assign Roles to Users

1. **Go to**: Enterprise applications → Find your app → Users and groups
2. **Click**: Add user/group
3. **Select**: Your user account
4. **Select role**: SystemAdmin (for testing)
5. **Click**: Assign

### 1.5 Get Configuration Values

1. **Go to**: Your app → Overview
2. **Copy these values**:
   - **Application (client) ID**
   - **Directory (tenant) ID**

## Step 2: Configure Environment Variables

Edit your `.env.local` file:

```bash
# 🔐 AZURE ENTRA ID AUTHENTICATION
# ==========================================
# Disable local auth to use Azure Entra ID
VITE_USE_LOCAL_AUTH=false

# Replace with YOUR Azure App Registration details
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id-here

# 🗄️ DATABASE CONFIGURATION
# ==========================================
# Using local Cosmos DB Emulator
VITE_COSMOS_DB_ENDPOINT=https://localhost:8081
VITE_COSMOS_DB_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
VITE_COSMOS_DB_NAME=cato-dashboard-azure

# Migration script settings (should match above)
AZURE_COSMOS_ENDPOINT=https://localhost:8081
AZURE_COSMOS_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
AZURE_COSMOS_DATABASE_NAME=cato-dashboard-azure
```

## Step 3: Start Cosmos DB Emulator

1. **Download**: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator
2. **Install** with default settings
3. **Verify running**: https://localhost:8081/_explorer/index.html

## Step 4: Set Up Database and Test

```powershell
# Populate database with sample data
npm run migrate-data

# Start the development server
npm run dev

# Open http://localhost:5173
# Click "Sign In" - you'll be redirected to Azure login
# Login with your assigned account
```

## 🌐 Multi-Subscription Data Export & Import

### Export Data from All Your Subscriptions

```powershell
# Login to Azure CLI
az login

# Option 1: Export from ALL your subscriptions (recommended)
npm run export-azure-data -- --all

# Option 2: Export from current subscription only
npm run export-azure-data

# Option 3: Export from specific subscription
npm run export-azure-data -- --subscription="subscription-name-or-id"
```

### What Gets Exported

- 🏗️ **All Azure resources** across all subscriptions
- 🗄️ **CosmosDB accounts** and connection strings
- 🔒 **Security assessments** and compliance data
- 📊 **Consolidated summary** of your entire Azure environment
- 📁 **Per-subscription data files** for detailed review

### Configure Import

After export completes:

```powershell
# 1. Check the summary of what was found
Get-Content exported-data/multi-subscription-summary.json

# 2. Copy the auto-generated configuration
Get-Content exported-data/env-config.txt | Set-Clipboard

# 3. Paste the configuration into your .env.local file
# (Add the Azure import settings section)

# 4. Import the data
npm run import-azure-data

# 5. Restart your app to see the imported data
npm run dev
```

### Example Generated Configuration

The export tool will add this to your `.env.local`:

```bash
# 📥 AZURE DATA IMPORT CONFIGURATION
# ==========================================
# Auto-generated from multi-subscription export

# Primary subscription for import (auto-selected)
AZURE_SOURCE_SUBSCRIPTION_ID=12345678-90ab-cdef-1234-567890abcdef

# Primary resource group (auto-selected if CosmosDB available)
AZURE_SOURCE_RESOURCE_GROUP=your-resource-group-name

# CosmosDB connection details (auto-filled if available)
AZURE_SOURCE_COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
AZURE_SOURCE_COSMOS_KEY=your-cosmos-primary-key
AZURE_SOURCE_COSMOS_DATABASE=your-database-name

# Tenant information (auto-filled)
AZURE_SOURCE_TENANT_ID=your-tenant-id
```

## 🧪 Testing Your Azure Integration

### Authentication Flow

1. **Initial Load**: App shows login page
2. **Click "Sign In"**: Redirects to Azure AD login
3. **Azure Login**: Use your organizational account
4. **Return to App**: Should show user info and role-based navigation
5. **Role Testing**: Different sections visible based on your assigned role

### Role-Based Access Testing

Test different roles by assigning yourself different roles in the Enterprise Application:

| Role | What to Test |
|------|-------------|
| **SystemAdmin** | Full access to all sections |
| **SecurityAnalyst** | Security dashboards and analysis |
| **ComplianceOfficer** | Compliance tracking and reporting |
| **AO** | Authorization and decision-making features |
| **Auditor** | Read-only access to audit data |
| **Viewer** | Basic read-only navigation |

### Data Validation

After importing Azure data:

1. **Check Import Results**:
   ```powershell
   # View what was imported
   Get-Content exported-data/multi-subscription-summary.json
   
   # Check for any import errors
   npm run validate-setup
   ```

2. **Verify in Database**:
   - Open: https://localhost:8081/_explorer/index.html
   - Check containers: `nist-controls`, `zta-activities`, `azure-resources`, etc.

3. **Test in Application**:
   - Browse NIST Controls (should show imported data)
   - Check Dashboard (should show real resource counts)
   - Review Security assessments (real Azure security data)

## 🔧 Advanced Configuration

### Using Real Azure CosmosDB (Optional)

If you prefer to use a real Azure CosmosDB instead of the emulator:

```powershell
# Create Azure CosmosDB
az group create --name cato-dev-rg --location eastus
az cosmosdb create --name cato-dashboard-dev-$(Get-Random) --resource-group cato-dev-rg

# Get connection details
az cosmosdb show --name your-cosmos-name --resource-group cato-dev-rg --query "documentEndpoint" --output tsv
az cosmosdb keys list --name your-cosmos-name --resource-group cato-dev-rg --query "primaryMasterKey" --output tsv
```

Update `.env.local`:
```bash
# Replace emulator settings with real Azure CosmosDB
VITE_COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
VITE_COSMOS_DB_KEY=your-actual-cosmos-key
VITE_COSMOS_DB_NAME=cato-dashboard-azure
```

### Selective Data Import

Import only specific types of data:

```powershell
# Import only CosmosDB data
npm run import-azure-data -- --cosmos-only

# Import only resource metadata
npm run import-azure-data -- --resources-only

# Import only security assessments
npm run import-azure-data -- --security-only

# Import from specific subscription
npm run import-azure-data -- --subscription="subscription-name"
```

## 🚨 Troubleshooting

### Authentication Issues

**Problem**: "AADSTS50011: The reply URL specified in the request does not match"
**Solution**: 
1. Go to App registrations → Your app → Authentication
2. Ensure `http://localhost:5173` is in redirect URIs
3. Save configuration

**Problem**: User has no roles/permissions
**Solution**:
1. Go to Enterprise applications → Your app → Users and groups
2. Add user/group and assign a role
3. Logout and login again

### Data Import Issues

**Problem**: "No subscriptions found"
**Solution**:
```powershell
az login
az account list --output table
az account set --subscription "your-subscription-name"
```

**Problem**: "Insufficient permissions"
**Solution**:
- Ensure you have Reader role on subscriptions
- For CosmosDB: Need Cosmos DB Account Reader role
- For security data: Need Security Reader role

**Problem**: Large dataset timeouts
**Solution**:
```powershell
# Import in smaller batches
npm run import-azure-data -- --batch-size 50

# Or import specific containers only
npm run import-azure-data -- --container nist-controls
```

### Certificate Issues (Cosmos Emulator)

```powershell
# Trust the emulator certificate
$cert = Get-ChildItem -Path $env:LOCALAPPDATA\CosmosDBEmulator\ssl\cosmos_emulator.cer
Import-Certificate -FilePath $cert.FullName -CertStoreLocation Cert:\CurrentUser\Root

# Or reset the emulator
"C:\Program Files\Azure Cosmos DB Emulator\Microsoft.Azure.Cosmos.Emulator.exe" /Reset
```

## 📊 Development Workflow

```powershell
# Daily workflow with Azure integration
npm run dev                    # Start with Azure auth
npm run export-azure-data -- --all  # Refresh data from Azure
npm run import-azure-data      # Import latest data
npm run validate-setup         # Check everything is working
```

## 🎯 Success Indicators

Your Azure integration is working when:

✅ **Azure Login**: Can sign in with your organizational account  
✅ **Role Access**: Different sections visible based on Azure role  
✅ **Real Data**: Dashboard shows actual resource counts from Azure  
✅ **Security Data**: Can view real security assessments  
✅ **Multi-Subscription**: Can see data from all your subscriptions  
✅ **Logout**: Can sign out and return to login page  

## 🚀 Ready for Production

Your local Azure testing ensures:
- Authentication flows work correctly
- Role-based access functions properly
- Data import/export processes are tested
- Security configurations are validated
- Multi-subscription support is working

You're now ready to deploy to Azure with confidence! 

## 📚 Next Steps

1. **Test thoroughly** with different user roles
2. **Validate** all imported data appears correctly  
3. **Document** any custom role mappings needed
4. **Deploy** to Azure using `azd up`
5. **Monitor** authentication and data flows in production

---

**Need the offline testing guide instead?** See `LOCAL_DEVELOPMENT_OFFLINE.md` for testing without any Azure connection.
