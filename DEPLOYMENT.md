# USAFRICOM cATO Dashboard - Deployment Guide

## Architecture Overview

The cATO Dashboard is a comprehensive security compliance management platform built for DoD environments, featuring:

- **Azure Entra ID Authentication** - Secure, role-based access control
- **CosmosDB Database** - Scalable, globally distributed data storage
- **Static Web App Hosting** - High-performance, CDN-enabled frontend
- **Multi-Environment Support** - IL2 and IL5 deployment capability
- **Continuous Compliance Monitoring** - Real-time NIST 800-53 and ZTA tracking

## Prerequisites

### Azure Resources Required
- Azure subscription with appropriate permissions
- Azure Entra ID tenant
- Azure CLI or Azure PowerShell installed
- Azure Developer CLI (azd) installed
- Node.js 18+ and npm installed

### Security Requirements
- DoD Impact Level authorization for target environment
- Azure Entra ID administrative access
- Security clearance appropriate for data classification level

## Quick Start Deployment

### 1. Clone and Setup

```bash
git clone <repository-url>
cd cATO
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your specific values:

```env
# Azure Entra ID Configuration
VITE_AZURE_CLIENT_ID=your-azure-client-id
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
