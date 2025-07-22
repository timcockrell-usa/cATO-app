# 🚀 cATO Dashboard - Local Development Guide

Welcome to the cATO Dashboard local development setup! This guide helps you choose the right development path based on your needs.

## 📋 Choose Your Development Path

### 🔒 Option 1: Offline Local Development (Fastest)
**Perfect for**: Quick testing, development, demonstrations, no Azure account needed

**Features**:
- ✅ Local username/password authentication
- ✅ Cosmos DB Emulator with sample data
- ✅ No internet connection required
- ✅ Get running in 5 minutes
- ✅ Perfect for UI/UX development and testing

**👉 Follow Guide**: `LOCAL_DEVELOPMENT_OFFLINE.md`

### 🔐 Option 2: Azure Entra ID Integration (Production-like)
**Perfect for**: Production-like testing, real Azure authentication, multi-subscription data

**Features**:
- ✅ Real Azure Entra ID authentication
- ✅ Role-based access with Azure roles
- ✅ Multi-subscription data export/import
- ✅ Import real data from your Azure environment
- ✅ Production-identical authentication flow

**👉 Follow Guide**: `LOCAL_DEVELOPMENT_AZURE.md`

## 🤔 Which Option Should I Choose?

### Choose **Offline Development** if you:
- Want to get started quickly without Azure setup
- Are developing UI/UX features
- Need to demo the application
- Want to test functionality without network dependencies
- Are new to the project and want to explore features
- Don't have an Azure account or admin access

### Choose **Azure Integration** if you:
- Want production-like authentication testing
- Need to test with real Azure roles and permissions
- Want to import and test with your actual Azure data
- Have multiple Azure subscriptions to consolidate
- Are preparing for production deployment
- Need to validate role-based access controls

## 🎯 Quick Comparison

| Feature | Offline Development | Azure Integration |
|---------|-------------------|-------------------|
| **Setup Time** | ⚡ 5 minutes | 🕐 15-30 minutes |
| **Azure Account Required** | ❌ No | ✅ Yes |
| **Internet Required** | ❌ No | ✅ Yes |
| **Authentication** | Local accounts | Azure Entra ID |
| **Data Source** | Sample data | Real Azure data |
| **Role Testing** | Mock roles | Real Azure roles |
| **Multi-Subscription** | ❌ No | ✅ Yes |
| **Production-like** | 🔶 Partial | ✅ Complete |

## 🚀 Quick Start Commands

### For Offline Development:
```powershell
cd c:\Users\tcockrell\Documents\GitHub\cATO
npm install
Copy-Item .env.local.example .env.local
npm run migrate-data
npm run dev
# Login with: admin / admin123
```

### For Azure Integration:
```powershell
cd c:\Users\tcockrell\Documents\GitHub\cATO
npm install
Copy-Item .env.local.example .env.local
# Follow Azure App Registration setup in LOCAL_DEVELOPMENT_AZURE.md
# Configure .env.local with your Azure details
az login
npm run export-azure-data -- --all
npm run import-azure-data
npm run dev
```

## 📚 Available Guides

1. **`LOCAL_DEVELOPMENT_OFFLINE.md`** - Complete offline development setup
2. **`LOCAL_DEVELOPMENT_AZURE.md`** - Azure Entra ID integration and multi-subscription data import
3. **`README.md`** - Project overview and deployment information

## 💡 Development Tips

### Start Offline, Then Move to Azure
Many developers prefer to:
1. **Start with offline development** to understand the application
2. **Test all features** with sample data
3. **Switch to Azure integration** when ready for production testing

### Hybrid Approach
You can also:
- Use offline development for UI work
- Use Azure integration for authentication and data testing
- Switch between modes by changing `VITE_USE_LOCAL_AUTH` in `.env.local`

## 🔧 Prerequisites (All Paths)

- **Node.js** (18+ recommended) - [Download here](https://nodejs.org/)
- **PowerShell** (Windows) or Terminal (Mac/Linux)
- **Azure Cosmos DB Emulator** - [Download here](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator)
- **Git** (to clone/manage the repository)
- **VS Code** (recommended) with Azure extensions

### Additional for Azure Integration:
- **Azure Account** with permissions to create App Registrations
- **Azure CLI** installed and configured

## 🎉 Success Indicators

You'll know your setup is working when:

✅ **Application loads** at http://localhost:5173  
✅ **Authentication works** (local or Azure)  
✅ **Data appears** in dashboards and controls  
✅ **Navigation works** between all pages  
✅ **Role-based access** shows different content  
✅ **Build completes** without errors (`npm run build`)

## ❓ Need Help?

1. **Check your chosen guide** (offline or Azure) for specific troubleshooting
2. **Verify prerequisites** are installed and working
3. **Check browser console** for JavaScript errors
4. **Validate .env.local** file is configured correctly
5. **Ensure Cosmos DB Emulator** is running (https://localhost:8081)

---

**Ready to start?** Choose your path and follow the appropriate detailed guide!

## 📤 Exporting and Importing Your Current Azure Data

## 📤 Exporting and Importing Your Current Azure Data

### 🌐 Multi-Subscription Support

The export tool now supports scanning **all your Azure subscriptions** or just specific ones:

### 🚀 Quick Export/Import Process

```powershell
# Option 1: Export from ALL your subscriptions (recommended for complete environment view)
az login
npm run export-azure-data -- --all

# Option 2: Export from current subscription only
npm run export-azure-data

# Option 3: Export from specific subscription
npm run export-azure-data -- --subscription="your-subscription-name-or-id"

# Then configure and import:
# 1. Copy the generated config from exported-data/env-config.txt to your .env.local
# 2. Import the data into local database
npm run import-azure-data

# 3. Start your app with real data from your entire environment
npm run dev
```

**What gets exported from all subscriptions:**
- 🏗️ **All Azure resources** across all subscriptions
- 🗄️ **CosmosDB accounts** and connection strings  
- 🔒 **Security assessments** and compliance data
- 📊 **Consolidated summary** showing your complete Azure footprint
- 📁 **Per-subscription data files** for detailed review

The export script will create an `exported-data/` folder with:
- **multi-subscription-summary.json** - Overview of your entire Azure environment
- **subscription-*-data.json** - Individual files for each subscription
- **env-config.txt** - Ready-to-use environment variables (automatically picks the best CosmosDB account)
- **IMPORT_INSTRUCTIONS.md** - Detailed instructions

### 🎯 Why Use Multi-Subscription Export?

✅ **Complete Environment View**: See all your resources across every subscription  
✅ **Automatic Best Choice**: Picks the best CosmosDB account for data import  
✅ **Resource Discovery**: Find resources you might have forgotten about  
✅ **Security Overview**: Get security assessments from your entire environment  
✅ **Cost Analysis**: Understand your complete Azure footprint

### Step 1: Identify Your Current Azure Resources

First, let's find what data you currently have in Azure:

```powershell
# Login to Azure
az login

# List your subscriptions
az account list --output table

# Set the subscription you want to export from
az account set --subscription "your-subscription-name-or-id"

# List your resource groups
az group list --output table

# List CosmosDB accounts (if you have existing data)
az cosmosdb list --output table

# List all resources in a specific resource group
az resource list --resource-group "your-resource-group-name" --output table
```

### Step 2: Configure Data Export Settings

Edit your `.env.local` file and uncomment the import section:

```bash
# 📥 AZURE DATA IMPORT CONFIGURATION
# ==========================================
# Fill in these values to import from your existing Azure environment

# Your current Azure subscription ID
AZURE_SOURCE_SUBSCRIPTION_ID=12345678-90ab-cdef-1234-567890abcdef

# Resource group containing your current resources (optional - leave blank to scan all)
AZURE_SOURCE_RESOURCE_GROUP=your-current-resource-group

# If you have existing CosmosDB data to import:
AZURE_SOURCE_COSMOS_ENDPOINT=https://your-existing-cosmos.documents.azure.com:443/
AZURE_SOURCE_COSMOS_KEY=your-existing-cosmos-primary-key
AZURE_SOURCE_COSMOS_DATABASE=your-existing-database-name
```

### Step 3: Export Different Types of Data

#### Option A: Export CosmosDB Data Only
```powershell
# If you only want to import existing CosmosDB data:
npm run import-azure-data -- --cosmos-only
```

#### Option B: Export Azure Resources Only
```powershell
# If you only want to import Azure resource information:
npm run import-azure-data -- --resources-only
```

#### Option C: Export Security Data Only
```powershell
# If you only want to import security assessments:
npm run import-azure-data -- --security-only
```

#### Option D: Export Everything
```powershell
# Import all available data from your Azure environment:
npm run import-azure-data
```

### Step 4: Manual Data Export (Alternative Method)

If the automated import doesn't work, you can manually export your data:

#### Export CosmosDB Data Manually:

```powershell
# Install Azure CosmosDB data migration tool
npm install -g cosmosdb-data-migration-tool

# Export each container to JSON files
cosmosdb-data-migration-tool \
  --source-endpoint "https://your-cosmos.documents.azure.com:443/" \
  --source-key "your-cosmos-key" \
  --source-database "your-database" \
  --source-container "nist-controls" \
  --output-file "./exported-data/nist-controls.json"

# Repeat for each container you want to export
```

#### Export using Azure CLI:

```powershell
# Create export directory
New-Item -ItemType Directory -Force -Path "./exported-data"

# Export resource information
az resource list --subscription "your-subscription-id" > ./exported-data/azure-resources.json

# Export security assessments
az security assessment list --subscription "your-subscription-id" > ./exported-data/security-assessments.json

# Export virtual machines
az vm list --subscription "your-subscription-id" > ./exported-data/virtual-machines.json

# Export network security groups
az network nsg list --subscription "your-subscription-id" > ./exported-data/network-security-groups.json
```

### Step 5: Verify Imported Data

After running the import, verify your data was imported correctly:

```powershell
# Check what was imported
npm run validate-setup

# View imported data in Cosmos DB Emulator
# Open: https://localhost:8081/_explorer/index.html

# Start your app to see the imported data
npm run dev
```

## 🔍 What Data Gets Imported?

The import process will bring in:

### 🗄️ CosmosDB Data (if configured):
- **NIST Controls** - Your existing security controls
- **ZTA Activities** - Zero Trust Architecture data
- **POA&M Items** - Plan of Action and Milestones
- **Vulnerabilities** - Security findings
- **Custom containers** - Any additional data you have

### 🏗️ Azure Resources:
- **Virtual Machines** - Configuration and status
- **Network Security Groups** - Security rules
- **Storage Accounts** - Storage configurations
- **Key Vaults** - Vault information (not secrets)
- **App Services** - Web application details
- **All other resources** - Comprehensive inventory

### 🔒 Security Data:
- **Security Assessments** - Azure Security Center findings
- **Compliance Status** - Regulatory compliance data  
- **Security Recommendations** - Remediation guidance
- **Risk Scores** - Current security posture

### 📊 Generated Reports:
- **import-report.json** - Summary of what was imported
- **Error logs** - Any issues encountered during import
- **Resource inventory** - Complete list of imported items

## 🚨 Troubleshooting Import Issues

### Issue 1: Authentication Errors
```powershell
# Ensure you're logged in to Azure CLI
az login --tenant your-tenant-id

# Check your current subscription
az account show

# Verify you have Reader permissions on the subscription
az role assignment list --assignee your-email@domain.com
```

### Issue 2: CosmosDB Connection Errors
```powershell
# Test CosmosDB connectivity
az cosmosdb database list --name your-cosmos-account --resource-group your-rg

# Verify your connection string
az cosmosdb keys list --name your-cosmos-account --resource-group your-rg
```

### Issue 3: Large Data Sets
```powershell
# For large datasets, import in chunks
npm run import-azure-data -- --batch-size 100

# Or import specific containers only
npm run import-azure-data -- --container nist-controls
```

### Issue 4: Permission Issues
```powershell
# Ensure you have the required Azure roles:
# - Reader (for resources)
# - Security Reader (for security data)
# - Cosmos DB Account Reader (for CosmosDB)

# Check your permissions
az role assignment list --assignee $(az account show --query user.name -o tsv)
```

## 🎮 Local Authentication Test Accounts

When using `VITE_USE_LOCAL_AUTH=true`, you can login with these accounts:

| Username | Password | Role | Access Level |
|----------|----------|------|-------------|
| `admin` | `admin123` | System Administrator | Full access to all features |
| `security` | `security123` | Security Analyst | Security monitoring and analysis |
| `compliance` | `compliance123` | Compliance Officer | Compliance tracking and reporting |
| `ao` | `ao123` | Authorizing Official | Authority for security decisions |
| `auditor` | `auditor123` | Security Auditor | Read-only audit access |
| `viewer` | `viewer123` | Viewer | Basic read-only access |

> 💡 **Tip**: Each account has different role-based permissions, so try different accounts to test various access levels!

## 🔐 Setting Up Azure Entra ID Authentication (Option 2)

### Step 1: Install Azure Cosmos DB Emulator

1. **Download the emulator**: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator
2. **Install with default settings** (it will use port 8081)
3. **Start the emulator** - it usually starts automatically after installation
4. **Verify it's running**: Open https://localhost:8081/_explorer/index.html in your browser

> 💡 **Tip**: The emulator runs as a Windows service and will start automatically on boot.

### Step 2: Create Azure Entra ID App Registration

This is **critical** for Azure authentication to work. Follow these detailed steps:

#### 2.1 Create the App Registration

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate**: Azure Active Directory → App registrations → New registration
3. **Fill out the form**:
   ```
   Name: cATO Dashboard Local Development
   Supported account types: Accounts in this organizational directory only
   Redirect URI: Single-page application (SPA) → http://localhost:5173
   ```
4. **Click Register**

#### 2.2 Configure Authentication

1. **Go to**: Your app → Authentication
2. **Add additional redirect URIs**:
   - `http://localhost:5173`
   - `http://localhost:5173/`
   - `http://localhost:3000` (backup port)
3. **Enable implicit grant flow**:
   - ✅ Access tokens
   - ✅ ID tokens
4. **Set logout URL**: `http://localhost:5173`
5. **Click Save**

#### 2.3 Configure App Roles (Essential for Role-Based Access)

1. **Go to**: Your app → App roles → Create app role
2. **Create these roles one by one**:

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

#### 2.4 Assign Roles to Users

1. **Go to**: Enterprise applications → Find your app → Users and groups
2. **Click**: Add user/group
3. **Select**: Your user account
4. **Select role**: Choose one of the roles you created (start with SystemAdmin for testing)
5. **Click**: Assign

#### 2.5 Get Configuration Values

1. **Go to**: Your app → Overview
2. **Copy these values** (you'll need them for .env.local):
   - **Application (client) ID** - This is your `VITE_AZURE_CLIENT_ID`
   - **Directory (tenant) ID** - This is part of your `VITE_AZURE_AUTHORITY`

### Step 3: Configure Environment Variables (.env.local)

Open your `.env.local` file and configure based on your chosen authentication method:

#### For Local Authentication (Option 1):
```bash
# Set to use local authentication (default)
VITE_USE_LOCAL_AUTH=true

# CosmosDB settings (works with emulator - no changes needed)
VITE_COSMOS_DB_ENDPOINT=https://localhost:8081
VITE_COSMOS_DB_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
VITE_COSMOS_DB_NAME=cato-dashboard-local
```

#### For Azure Entra ID (Option 2):
```bash
# Disable local auth to use Azure Entra ID
VITE_USE_LOCAL_AUTH=false

# Replace with your Azure App Registration details
VITE_AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789012
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/87654321-4321-4321-4321-210987654321

# CosmosDB settings (same as above)
VITE_COSMOS_DB_ENDPOINT=https://localhost:8081
VITE_COSMOS_DB_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
VITE_COSMOS_DB_NAME=cato-dashboard-local
```

### Step 4: Initialize Database and Start Application

```powershell
# Validate your setup (optional but recommended)
npm run validate-setup

# Ensure Cosmos DB Emulator is running
# Check by opening: https://localhost:8081/_explorer/index.html

# Populate your local database with NIST controls and ZTA data from your CSV files
npm run migrate-data

# Start the development server
npm run dev
```

### Step 5: Test Your Application

**For Local Authentication:**
1. **Open**: http://localhost:5173
2. **Login**: Use admin/admin123 (or any test account from the table above)
3. **Verify role-based access**: Different pages accessible based on your chosen account

**For Azure Entra ID:**
1. **Open**: http://localhost:5173
2. **Click "Sign In"**: You should be redirected to Azure login
3. **Login with your account**: Use the account you assigned roles to
4. **Verify role-based access**: Different sections available based on your role

## 🔧 Alternative Database Setup: Using Azure CosmosDB

If you prefer to test against a real Azure CosmosDB instance instead of the local emulator:

### Step 1: Create Azure CosmosDB Resource

```powershell
# Login to Azure
az login

# Create a resource group (if you don't have one)
az group create --name cato-dev-rg --location eastus

# Create a development CosmosDB instance
az cosmosdb create \
  --name cato-dashboard-dev-$(Get-Random) \
  --resource-group cato-dev-rg \
  --default-consistency-level Session \
  --locations regionName=eastus \
  --enable-free-tier true
```

### Step 2: Get Connection Details

```powershell
# Get the endpoint
az cosmosdb show --name your-cosmos-name --resource-group cato-dev-rg --query "documentEndpoint" --output tsv

# Get the primary key
az cosmosdb keys list --name your-cosmos-name --resource-group cato-dev-rg --query "primaryMasterKey" --output tsv
```

### Step 3: Update .env.local for Azure CosmosDB

```bash
# Replace the CosmosDB settings in your .env.local file:
VITE_COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
VITE_COSMOS_DB_KEY=your-actual-cosmos-key-from-step-2
VITE_COSMOS_DB_NAME=cato-dashboard-dev

# Also update the migration script variables:
AZURE_COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
AZURE_COSMOS_KEY=your-actual-cosmos-key-from-step-2
AZURE_COSMOS_DATABASE_NAME=cato-dashboard-dev
```

### Step 4: Run Migration and Start App

```powershell
npm run migrate-data  # Populates Azure CosmosDB
npm run dev          # Start local development server
```

## 🧪 Testing Your Local Application

### Authentication Flow Testing

1. **Initial Load**: App should show login page
2. **Click "Sign In"**: Redirects to Azure login
3. **After Login**: Should return to app with user info displayed
4. **Role Access**: Different sections available based on your assigned role
5. **Logout**: Should clear session and return to login

### Database Operations Testing

1. **NIST Controls**: Browse the controls loaded from your CSV
2. **ZTA Activities**: View Zero Trust Architecture data
3. **POA&M Management**: Create, update, and track action items
4. **Vulnerability Tracking**: View and manage security findings
5. **Search Functionality**: Test search across all data types

### Component Testing

```powershell
# Type checking (ensure no TypeScript errors)
npm run type-check

# Build for production testing
npm run build

# Preview production build locally
npm run preview

# Linting (code quality checks)
npm run lint
```

## 🚨 Troubleshooting Common Issues

### Issue 1: "AADSTS50011: The reply URL specified in the request does not match..."

**Solution**: Check your Azure App Registration redirect URIs
```
1. Go to Azure Portal → App registrations → Your app → Authentication
2. Ensure these URLs are listed:
   - http://localhost:5173
   - http://localhost:5173/
3. Save the configuration
```

### Issue 2: Cosmos DB Emulator SSL Certificate Errors

**Solution**: Trust the emulator certificate
```powershell
# Option 1: Trust certificate via PowerShell
$cert = Get-ChildItem -Path $env:LOCALAPPDATA\CosmosDBEmulator\ssl\cosmos_emulator.cer
Import-Certificate -FilePath $cert.FullName -CertStoreLocation Cert:\CurrentUser\Root

# Option 2: Reset and restart emulator
"C:\Program Files\Azure Cosmos DB Emulator\Microsoft.Azure.Cosmos.Emulator.exe" /Reset
```

### Issue 3: "Access to fetch at ... has been blocked by CORS policy"

**Solution**: This is normal for local development - the app handles CORS appropriately

### Issue 4: Migration Script Fails

**Symptoms**: `npm run migrate-data` shows connection errors

**Solutions**:
```powershell
# Check if Cosmos Emulator is running
Get-Process -Name Microsoft.Azure.Cosmos.Emulator -ErrorAction SilentlyContinue

# Restart the emulator if needed
"C:\Program Files\Azure Cosmos DB Emulator\Microsoft.Azure.Cosmos.Emulator.exe" /Shutdown
"C:\Program Files\Azure Cosmos DB Emulator\Microsoft.Azure.Cosmos.Emulator.exe"

# Verify endpoint is accessible
curl https://localhost:8081
```

### Issue 5: Role-Based Access Not Working

**Check**: User role assignment in Azure
```
1. Azure Portal → Enterprise applications → Your app → Users and groups
2. Verify your user has a role assigned
3. If not, click "Add user/group" and assign a role
4. Try logging out and back in to refresh tokens
```

### Issue 6: Environment Variables Not Loading

**Check**: File naming and location
```powershell
# Ensure file is named correctly (not .env.local.txt)
Get-ChildItem -Name ".env.local"

# Verify content format (no spaces around =)
Get-Content .env.local | Select-String "VITE_AZURE_CLIENT_ID"
```

## 📊 Development Workflow Scripts

```powershell
# 🚀 Daily development workflow
npm run dev                 # Start development server
npm run migrate-data       # Refresh database with latest data
npm run type-check         # Check for TypeScript errors
npm run lint              # Check code quality

# 🔧 Utility scripts
npm run build             # Build for production
npm run preview           # Preview production build
npm run local-setup       # One-time local setup helper
```

## 🔍 Debugging and Logging

### Browser Developer Tools

1. **Open DevTools**: F12 in your browser
2. **Console Tab**: Check for JavaScript errors
3. **Network Tab**: Monitor API calls and authentication flows
4. **Application Tab**: Check localStorage for MSAL tokens

### Application Logs

The app includes comprehensive logging:
- Authentication events
- Database operations
- Role-based access decisions
- Error handling

### Cosmos DB Emulator Data Explorer

Access the built-in data browser:
- **URL**: https://localhost:8081/_explorer/index.html
- **View**: Database contents, query data, monitor performance

## 🎯 Ready for Production?

### Pre-deployment Checklist

- [ ] Authentication works with your Azure AD
- [ ] All role-based access functions correctly  
- [ ] Database operations (CRUD) work properly
- [ ] NIST controls data loads from CSV
- [ ] ZTA activities data displays correctly
- [ ] POA&M management functions work
- [ ] Search functionality operates
- [ ] Build process completes without errors
- [ ] No TypeScript compilation errors
- [ ] All environment variables configured

### Deploy to Azure

Once everything works locally:

```powershell
# Deploy to Azure
npm run setup    # Configure azd
npm run deploy   # Deploy to Azure
```

## 📚 Additional Resources

### Azure Documentation
- [Azure Cosmos DB Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator)
- [Azure Entra ID App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL.js Authentication Library](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)

### Troubleshooting Links
- [MSAL Authentication Errors](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-error-handling-js)
- [Cosmos DB Connection Troubleshooting](https://docs.microsoft.com/en-us/azure/cosmos-db/troubleshoot-dot-net-sdk)

## 🎉 Success Indicators

Your local development is working correctly when:

✅ **Authentication**: You can sign in with Azure AD and see your user info  
✅ **Authorization**: Different pages are accessible based on your role  
✅ **Database**: NIST controls and ZTA data are visible from your CSV files  
✅ **Operations**: You can create, read, update POA&M items  
✅ **Search**: You can search across all data types  
✅ **Build**: `npm run build` completes without errors  
✅ **Types**: `npm run type-check` shows no errors  

Your local testing ensures everything will work perfectly in Azure! 🚀

---

## ❓ Need Help?

If you encounter issues not covered in this guide:

1. **Check browser console** for JavaScript errors
2. **Verify Azure App Registration** settings match exactly
3. **Confirm Cosmos DB Emulator** is running (https://localhost:8081)
4. **Validate .env.local** has correct Azure client ID and tenant ID
5. **Review role assignments** in Azure Enterprise Applications

Remember: Local development success = Azure deployment success! Take time to ensure everything works locally before deploying.
