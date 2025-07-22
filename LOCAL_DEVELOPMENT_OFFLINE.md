# 🔒 Offline Local Development Guide

This guide focuses on **completely offline local testing** of the cATO Dashboard. Perfect for development, testing, and demonstrations without any Azure or internet connection required.

## 🎯 What This Guide Covers

✅ **Local Authentication** - Username/password login (no Azure needed)  
✅ **Local Database** - Cosmos DB Emulator with sample data  
✅ **Offline Testing** - No internet connection required  
✅ **Quick Setup** - Get running in minutes  

## Prerequisites

- **Node.js** (18+ recommended)
- **Azure Cosmos DB Emulator** (local database - uses port 8081)
- **PowerShell** (Windows) or Terminal (Mac/Linux)
- **No Azure account needed**
- **No internet connection required**

> 💡 **Port Note**: The Cosmos DB Emulator uses port 8081. The dev server will automatically find an available port (usually 3000).

## 🚀 Quick Start (5 Minutes)

```powershell
# Navigate to project
cd c:\Users\tcockrell\Documents\GitHub\cATO

# Install dependencies (internet required for this step only)
npm install

# Copy environment template
Copy-Item .env.local.example .env.local

# Start Cosmos DB Emulator (download if needed)
# Download: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator

# Populate database with sample data
npm run migrate-data

# Start the development server
npm run dev

# Open http://localhost:3002/ (or whatever port is shown)
# Login with: admin / admin123
```

That's it! You're running completely offline.

## Step 1: Install Cosmos DB Emulator

1. **Download**: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator
2. **Install** with default settings (uses port 8081)
3. **Start** - usually starts automatically after installation
4. **Verify**: Open https://localhost:8081/_explorer/index.html

> 💡 **Note**: The emulator runs as a Windows service and starts automatically on boot.

## Step 2: Configure Local Authentication

Your `.env.local` file should look like this:

```bash
# 🔒 LOCAL AUTHENTICATION (No Azure Required)
VITE_USE_LOCAL_AUTH=true

# 🗄️ LOCAL DATABASE CONFIGURATION
VITE_COSMOS_DB_ENDPOINT=https://localhost:8081
VITE_COSMOS_DB_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
VITE_COSMOS_DB_NAME=cato-dashboard-local

# Migration script settings (should match above)
AZURE_COSMOS_ENDPOINT=https://localhost:8081
AZURE_COSMOS_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
AZURE_COSMOS_DATABASE_NAME=cato-dashboard-local
```

## Step 3: Set Up Database with Sample Data

```powershell
# Populate database with NIST controls, ZTA activities, and sample data
npm run migrate-data

# This creates:
# - NIST security controls from your CSV files
# - Zero Trust Architecture activities  
# - Sample POA&M items
# - Sample vulnerability data
# - Test user accounts
```

## Step 4: Start and Test

```powershell
# Start the development server
npm run dev

# Open your browser to the URL shown (typically http://localhost:3002/)
# You'll see the login page with username/password fields
```

> 💡 **Port Note**: The dev server automatically finds an available port (usually 3002) since the Cosmos DB Emulator uses ports 8081-8082.

## 🎮 Test User Accounts

Use these accounts for local testing:

| Username | Password | Role | Access Level |
|----------|----------|------|-------------|
| `admin` | `admin123` | System Administrator | 🔓 Full access to all features |
| `security` | `security123` | Security Analyst | 🔒 Security monitoring and analysis |
| `compliance` | `compliance123` | Compliance Officer | 📋 Compliance tracking and reporting |
| `ao` | `ao123` | Authorizing Official | ✅ Authority for security decisions |
| `auditor` | `auditor123` | Security Auditor | 👀 Read-only audit access |
| `viewer` | `viewer123` | Viewer | 📖 Basic read-only access |

## 🧪 What You Can Test Offline

### Dashboard Features
✅ **Main Dashboard** - Resource counts, security metrics  
✅ **NIST Controls** - Browse and search security controls  
✅ **Zero Trust Activities** - View ZTA implementation status  
✅ **POA&M Management** - Create, edit, track action items  
✅ **Vulnerability Tracking** - View security findings  
✅ **Search & Filter** - Full-text search across all data  

### Application Features
✅ **Authentication Flow** - Login/logout functionality  
✅ **Role-Based Access** - Different views based on user role  
✅ **Data CRUD Operations** - Create, read, update, delete data  
✅ **Navigation** - All page routing and navigation  
✅ **UI Components** - All interface elements and interactions  

### Technical Features
✅ **Database Operations** - All Cosmos DB interactions  
✅ **State Management** - React state and data flow  
✅ **Error Handling** - Error messages and validation  
✅ **Performance** - Loading states and optimization  
✅ **Responsive Design** - Mobile and desktop layouts  

## 📊 Sample Data Included

### NIST Controls
- Security controls from NIST 800-53
- Organized by families (AC, AU, CA, CM, etc.)
- Implementation guidance and references
- Risk assessments and compliance status

### Zero Trust Architecture
- ZTA activities and milestones
- Implementation phases and priorities  
- Capability assessments and gaps
- Roadmap planning data

### POA&M Items
- Sample Plan of Action & Milestones
- Various risk levels and statuses
- Due dates and responsible parties
- Remediation tracking

### Vulnerabilities
- Sample security findings
- Different severity levels
- Remediation recommendations
- Compliance mapping

## 🔧 Database Management

### View Your Data
Open the Cosmos DB Emulator Data Explorer:
- **URL**: https://localhost:8081/_explorer/index.html
- **Browse**: Navigate through databases and containers
- **Query**: Write SQL queries against your data

### Reset Database
```powershell
# If you need to start fresh
"C:\Program Files\Azure Cosmos DB Emulator\Microsoft.Azure.Cosmos.Emulator.exe" /Reset

# Then repopulate
npm run migrate-data
```

## 🎯 Success Indicators

Your offline setup is working when:

✅ **Login Works**: Can login with test accounts  
✅ **Data Visible**: See NIST controls, ZTA activities  
✅ **Navigation**: All pages load correctly  
✅ **CRUD Operations**: Can create, edit, delete POA&M items  
✅ **Search**: Can search across all data types  
✅ **Roles**: Different access levels work correctly  
✅ **Performance**: App is responsive and fast  

## 🚀 Development Workflow

```powershell
# Daily offline development
npm run dev                 # Start development
npm run type-check         # Check TypeScript
npm run lint              # Check code quality
npm run build             # Test production build

# Reset and refresh data when needed
npm run migrate-data       # Reload sample data
npm run validate-setup     # Verify everything works
```

## 🔄 Moving to Azure Later

When you're ready to connect to Azure:

1. **Switch guides**: Use `LOCAL_DEVELOPMENT_AZURE.md`
2. **Update config**: Change `VITE_USE_LOCAL_AUTH=false`  
3. **Set up Azure**: Create App Registration and configure
4. **Import real data**: Use multi-subscription export tools

Your offline development ensures all functionality works before connecting to Azure!

---

**Need Azure integration instead?** See `LOCAL_DEVELOPMENT_AZURE.md` for Azure Entra ID authentication and multi-subscription data import.
