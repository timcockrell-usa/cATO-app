# 🚀 cATO Dashboard - Quick Deployment Reference

> **📋 For the complete deployment guide, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## ⚡ Quick Start

### Option 1: Azure Developer CLI (Recommended)
```bash
# 1. Clone and setup
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app && npm install

# 2. Login to Azure
az login && azd auth login

# 3. Set admin group (replace with your group ID)
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-admin-group-object-id"

# 4. Deploy everything
azd up
```

### Option 2: Direct Bicep Deployment (Azure Cloud Shell)
```bash
# 1. In Azure Cloud Shell or local CLI
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# 2. Set variables for your environment
RESOURCE_GROUP="your-existing-resource-group"
ADMIN_GROUP_ID="your-admin-group-object-id"

# 3. Deploy infrastructure only
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters adminGroupObjectId=$ADMIN_GROUP_ID

# 4. Deploy application separately (see post-deployment steps)
```

### What is Admin Group Object ID?
This is an Azure Entra ID security group for administrators:
```bash
# Find existing admin groups
az ad group list --display-name "*admin*" --query "[].{Name:displayName, Id:id}" -o table

# OR create new admin group
az ad group create --display-name "cATO Admins" --mail-nickname "cato-admins"
az ad group show --group "cATO Admins" --query id -o tsv
```

## 🏗️ Architecture Overview

The cATO Dashboard deploys a modern, secure architecture:

- **Azure Static Web App** - React frontend with global CDN
- **Azure Cosmos DB** - Serverless NoSQL database 
- **Azure Key Vault** - Secure secrets management
- **Azure Entra ID** - Authentication and RBAC
- **Application Insights** - Performance monitoring
- **Managed Identity** - Secure service authentication

## 🔐 Security Features

✅ **Zero Trust Architecture** ready  
✅ **NIST 800-53** compliance tracking  
✅ **Role-based access** (6 security roles)  
✅ **Encryption** at rest and in transit  
✅ **Private networking** support  
✅ **DoD IL2/IL5** deployment ready  

---

## 📋 Prerequisites

### Tools Required
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) v2.50+
- [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd) v1.0+
- [Node.js](https://nodejs.org/) v18+

### Azure Permissions
- Azure subscription **Contributor** role
- Azure Entra ID **Application Administrator** role

---

## 🌍 Multi-Environment Support

### Development
```bash
azd env new dev
azd env set AZURE_LOCATION "eastus"
azd up
```

### Production
```bash
azd env new prod
azd env set AZURE_LOCATION "eastus"
azd env set ENABLE_PRIVATE_ENDPOINTS "true"
azd up
```

### Azure Government (IL5)
```bash
az cloud set --name AzureUSGovernment
azd env new il5-prod
azd env set AZURE_LOCATION "usgovvirginia"
azd up
```

---

## 👥 Post-Deployment Configuration

### 1. Azure Entra ID Setup

1. **Create app registration** in Azure Portal
2. **Configure redirect URIs** with your Static Web App URL
3. **Create app roles**:
   - SystemAdmin, AO, ComplianceOfficer
   - SecurityAnalyst, Auditor, Viewer
4. **Assign users** to appropriate roles

### 2. Deploy Application (If using Direct Bicep option)

If you used the direct Bicep deployment, you need to deploy the application separately:

```bash
# Get the Static Web App name from your deployment
STATIC_APP_NAME=$(az staticwebapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)

# Build the application
npm run build

# Deploy to Static Web App (using Azure CLI)
az staticwebapp environment set --name $STATIC_APP_NAME --environment-name default --source ./dist

# OR use GitHub Actions (recommended for ongoing deployments)
# See the complete deployment guide for CI/CD setup
```

### 3. Initial Data Population

```bash
# Set Cosmos DB connection
export AZURE_COSMOS_ENDPOINT="https://your-cosmos-account.documents.azure.com:443/"
export AZURE_COSMOS_DATABASE_NAME="cato-dashboard"

# Import initial compliance data
npm run migrate-data

# Validate successful import
npm run validate-setup
```

### 3. Application Configuration

Configure environment variables in Static Web App:

```env
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
VITE_COSMOS_DB_NAME=cato-dashboard
```

---

## 📊 Application Features

### Dashboard Capabilities

- **NIST 800-53 Control Tracking** - Real-time compliance status
- **Zero Trust Architecture** - Seven pillar maturity assessment  
- **POA&M Management** - Risk-based remediation tracking
- **Vulnerability Integration** - Microsoft Defender correlation
- **eMASS Compatibility** - Export packages for compliance

### Role-Based Access

| Role | Dashboard | NIST | ZTA | Execution | POA&M | Export |
|------|-----------|------|-----|-----------|-------|---------|
| **SystemAdmin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AO** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **ComplianceOfficer** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SecurityAnalyst** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Auditor** | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ |
| **Viewer** | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ |

_👁️ = Read-only access_

---

## 🔧 Common Commands

```bash
# View deployment status
azd show

# Monitor application logs  
azd logs --service web

# Update application only
azd deploy --service web

# Clean up resources
azd down

# Check application health
npm run validate-setup
```

---

## 🚨 Troubleshooting

### Authentication Issues
```bash
# Check app registration configuration
az ad app show --id your-client-id

# Verify role assignments
az ad app show --id your-client-id --query appRoles
```

### Database Connection Issues
```bash
# Test Cosmos DB connectivity
az cosmosdb show --name your-cosmos-account --resource-group your-rg

# Check managed identity permissions
az role assignment list --assignee your-managed-identity-id
```

### Deployment Failures
```bash
# View detailed deployment logs
azd logs --follow

# Check resource deployment status
az deployment group list --resource-group your-rg
```

---

## 📚 Additional Resources

- **[Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment documentation
- **[Local Development - Azure](./LOCAL_DEVELOPMENT_AZURE.md)** - Azure integration testing
- **[Local Development - Offline](./LOCAL_DEVELOPMENT_OFFLINE.md)** - Offline development setup
- **[Azure Static Web Apps Docs](https://docs.microsoft.com/en-us/azure/static-web-apps/)**
- **[NIST 800-53 Documentation](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)**

---

## 🎯 Success Indicators

Your deployment is successful when:

✅ Application loads at Static Web App URL  
✅ Azure Entra ID authentication works  
✅ Role-based navigation functions  
✅ NIST controls display data  
✅ Dashboard shows compliance metrics  
✅ Application Insights shows telemetry  

**For detailed configuration and troubleshooting, see the [complete deployment guide](./DEPLOYMENT_GUIDE.md).**
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_REDIRECT_URI=https://your-app-domain.com
VITE_POST_LOGOUT_REDIRECT_URI=https://your-app-domain.com

# Azure Resource Endpoints
VITE_COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
VITE_COSMOS_DB_NAME=cato-dashboard
```

### 3. Deploy to Azure using AZD

Initialize and deploy the application:

```bash
# Initialize azd (first time only)
azd init

# Set required environment variables
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-admin-group-object-id"

# Deploy infrastructure and application
azd up
```

### 4. Configure Azure Entra ID Application

1. Go to Azure Portal > Azure Entra ID > App registrations
2. Create a new application registration or use existing
3. Configure redirect URIs to include your Static Web App URL
4. Configure API permissions:
   - Microsoft Graph: User.Read, User.ReadBasic.All, Directory.Read.All
   - Add any custom API scopes if needed
5. Configure group claims and role assignments

### 5. Populate Initial Data

After deployment, run the data migration script:

```bash
# Set environment variables for the script
export AZURE_COSMOS_ENDPOINT="https://your-cosmos-account.documents.azure.com:443/"
export AZURE_COSMOS_KEY="your-cosmos-key"
export AZURE_COSMOS_DATABASE_NAME="cato-dashboard"

# Run migration
node scripts/migrate-data.js
```

## Multi-Environment Deployment (IL2 & IL5)

### IL5 (Azure Government) Deployment

For IL5 deployments in Azure Government Cloud:

```bash
# Set Azure Government cloud
az cloud set --name AzureUSGovernment
azd auth login

# Deploy to Azure Government
azd up --location usgovvirginia
```

### IL2 (Commercial Azure) Deployment

For IL2 deployments in commercial Azure:

```bash
# Set commercial cloud
az cloud set --name AzureCloud
azd auth login

# Deploy to commercial Azure
azd up --location eastus
```

### Cross-Environment Data Sync

The application supports read-only data synchronization from IL2 to IL5 environments:

1. Configure the IL2 export API endpoint in IL5 environment
2. Set up automated data ingestion schedule
3. Configure appropriate network security rules

## Security Configuration

### 1. Network Security

- Configure Network Security Groups (NSGs) for micro-segmentation
- Enable Azure Firewall Premium with IDPS
- Implement Private Endpoints for PaaS services
- Configure VPN Gateway or ExpressRoute for hybrid connectivity

### 2. Identity and Access Management

- Configure Privileged Identity Management (PIM)
- Set up Conditional Access policies
- Enable Multi-Factor Authentication (MFA)
- Configure group-based role assignments:
  - **SystemAdmin**: Full system access
  - **AO**: Authorizing Official access
  - **ComplianceOfficer**: Compliance management
  - **SecurityAnalyst**: Security analysis and updates
  - **Auditor**: Read-only audit access
  - **Viewer**: Read-only dashboard access

### 3. Data Protection

- Enable CosmosDB encryption at rest and in transit
- Configure Key Vault for secrets management
- Implement data classification and labeling
- Set up backup and disaster recovery

### 4. Monitoring and Auditing

- Configure Azure Monitor and Log Analytics
- Enable Microsoft Sentinel for SIEM capabilities
- Set up security alerting and automated responses
- Configure compliance dashboards and reporting

## Application Features

### Dashboard Capabilities

1. **NIST 800-53 Control Tracking**
   - Real-time compliance status
   - Control family visualization
   - Evidence management
   - Historical trending

2. **Zero Trust Architecture (ZTA) Monitoring**
   - Seven pillar maturity assessment
   - Activity progress tracking
   - Implementation guidance
   - Capability mapping

3. **Plan of Action & Milestones (POA&M)**
   - Risk-based prioritization
   - Assignment and tracking
   - Milestone management
   - Automated notifications

4. **Vulnerability Management**
   - Integration with Microsoft Defender
   - Risk correlation with controls
   - Remediation tracking
   - Compliance impact analysis

5. **Export and Reporting**
   - eMASS-compatible exports
   - Executive dashboards
   - Compliance reports
   - Audit packages

### Role-Based Access Control

The application implements granular role-based access:

- **Dashboard**: All authenticated users
- **NIST Controls**: SecurityAnalyst, ComplianceOfficer, SystemAdmin, AO
- **ZTA Activities**: SecurityAnalyst, ComplianceOfficer, SystemAdmin, AO
- **Execution Enablers**: SecurityAnalyst, ComplianceOfficer, SystemAdmin, AO
- **POA&M Management**: SecurityAnalyst, ComplianceOfficer, SystemAdmin
- **Export Package**: ComplianceOfficer, SystemAdmin, AO

## Monitoring and Maintenance

### Health Checks

Monitor application health through:
- Application Insights telemetry
- CosmosDB metrics and alerts
- Static Web App availability
- Authentication success rates

### Performance Optimization

- CosmosDB request unit optimization
- CDN caching configuration
- Query optimization for large datasets
- Batch processing for bulk operations

### Security Monitoring

- Failed authentication monitoring
- Privilege escalation detection
- Data access auditing
- Configuration change tracking

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify Azure Entra ID application configuration
   - Check redirect URI configuration
   - Validate group claims setup

2. **Database Connection Issues**
   - Verify CosmosDB endpoint and credentials
   - Check network connectivity and firewall rules
   - Validate RBAC permissions

3. **Deployment Failures**
   - Check Azure subscription permissions
   - Verify resource naming conflicts
   - Review deployment logs in Azure Portal

### Support and Documentation

- Application logs: Available in Application Insights
- Infrastructure logs: Available in Log Analytics
- Security events: Available in Microsoft Sentinel
- Performance metrics: Available in Azure Monitor

## Security Considerations

### Data Classification

This application handles CUI (Controlled Unclassified Information) and must be deployed with appropriate security controls:

- Network isolation
- Encryption in transit and at rest
- Access logging and monitoring
- Regular security assessments

### Compliance Requirements

The application supports compliance with:
- NIST 800-53 Rev 5
- DoD Cloud Computing Security Requirements Guide (SRG)
- FedRAMP requirements
- DoD Zero Trust Architecture guidance

### Incident Response

In case of security incidents:
1. Isolate affected components
2. Preserve evidence through logging
3. Follow DoD incident response procedures
4. Conduct post-incident analysis and remediation

---

For additional support or questions, contact the USAFRICOM Cybersecurity team or reference the application documentation in the repository.
