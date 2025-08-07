
# 🛡️ cATO Dashboard - Continuous Authority to Operate

A comprehensive security compliance management platform designed for DoD environments, providing real-time NIST 800-53 control tracking, Zero Trust Architecture monitoring, and automated compliance reporting.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Ftimcockrell-usa%2FcATO-app%2Fmain%2Finfra%2Fmain.json)

## 🎯 Key Features

- **🔐 NIST 800-53 Rev 5** - Complete control family tracking and evidence management
- **🛡️ Zero Trust Architecture** - Seven pillar maturity assessment and monitoring  
- **📋 POA&M Management** - Risk-based plan of action and milestones tracking
- **🔍 Vulnerability Integration** - Microsoft Defender and security assessment correlation
- **📊 Executive Dashboards** - Real-time compliance metrics and reporting
- **🔄 eMASS Integration** - Compatible export packages for enterprise compliance

## 🏗️ Architecture

Built on modern Azure services for scalability, security, and compliance:

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Authentication**: Azure Entra ID with role-based access control
- **Database**: Azure Cosmos DB (Serverless) 
- **Hosting**: Azure Static Web Apps with global CDN
- **Security**: Azure Key Vault, Managed Identity, Private Endpoints
- **Monitoring**: Application Insights, Log Analytics

## 🚀 Quick Deployment

### Prerequisites
- Azure subscription with Contributor access
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/) and [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/)
- Node.js 18+

### Deploy to Azure

```bash
# Clone repository
git clone https://github.com/timcockrell-usa/cATO-app.git
cd cATO-app

# Install dependencies  
npm install

# Login to Azure
az login && azd auth login

# Set admin group (replace with your Azure AD group)
azd env set AZURE_ADMIN_GROUP_OBJECT_ID "your-admin-group-object-id"

# Deploy everything
azd up
```

**📋 Complete deployment instructions:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 👥 Role-Based Access Control

The application supports six security roles aligned with DoD cybersecurity operations:

| Role | Description | Access Level |
|------|-------------|--------------|
| **SystemAdmin** | Full system administration | Complete access to all features |
| **AO** | Authorizing Official | Security decisions and approvals |
| **ComplianceOfficer** | Compliance management | Full compliance tracking and reporting |
| **SecurityAnalyst** | Security analysis and updates | NIST controls, ZTA activities, POA&M |
| **Auditor** | Audit and review | Read-only access to audit data |
| **Viewer** | Basic dashboard access | Read-only dashboard viewing |

## 🌍 Multi-Environment Support

- **Development**: Standard Azure regions
- **Production**: Azure with private endpoints and enhanced security
- **Azure Government**: IL5 deployment for classified environments
- **Hybrid**: Cross-environment data synchronization support

## 📊 Compliance Features

### NIST 800-53 Control Tracking
- **18 Control Families** with 1,400+ controls
- **Real-time status** tracking and evidence management
- **Gap analysis** and remediation planning
- **Historical trending** and compliance metrics

### Zero Trust Architecture
- **Seven Pillar Assessment** (Identity, Device, Network, Application, Data, Infrastructure, Visibility)
- **Maturity scoring** across Initial, Advanced, and Optimal levels
- **Implementation guidance** and best practices
- **Progress tracking** with milestone management

### POA&M Management
- **Risk-based prioritization** with severity scoring
- **Assignment and tracking** with due date management
- **Integration** with vulnerability assessments
- **Automated notifications** and escalation

## 🔧 Development Setup

### Local Development (Azure Integration)
Test with real Azure authentication and data:
```bash
# See LOCAL_DEVELOPMENT_AZURE.md for complete setup
npm install
cp .env.example .env.local
# Configure Azure Entra ID app registration
npm run dev
```

### Local Development (Offline)
Development without Azure dependencies:
```bash
# See LOCAL_DEVELOPMENT_OFFLINE.md for complete setup
npm install
export VITE_USE_LOCAL_AUTH=true
npm run dev
```

**📚 Development guides:**
- [Azure Integration Development](./LOCAL_DEVELOPMENT_AZURE.md)
- [Offline Development](./LOCAL_DEVELOPMENT_OFFLINE.md)

## 📁 Project Structure

```
cATO-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Application pages
│   ├── services/           # API and data services
│   ├── contexts/           # React context providers
│   ├── data/               # Static compliance data
│   └── types/              # TypeScript type definitions
├── infra/                  # Azure Bicep infrastructure
├── scripts/                # Data migration and utilities
├── docs/                   # Additional documentation
└── .github/workflows/      # CI/CD pipelines
```

## 🔒 Security & Compliance

### Security Features
- **Zero Trust principles** implemented throughout
- **Data encryption** at rest and in transit
- **Azure Managed Identity** for service authentication
- **Role-based access control** with Azure Entra ID
- **Private networking** support for production
- **Audit logging** and monitoring

### Compliance Standards
- **NIST 800-53 Rev 5** security controls
- **DoD Cloud Computing SRG** requirements
- **FedRAMP** baseline controls
- **Zero Trust Architecture** implementation
- **CUI (Controlled Unclassified Information)** handling

## 📈 Monitoring & Operations

- **Application Insights** - Performance monitoring and user analytics
- **Log Analytics** - Centralized logging and query capabilities
- **Azure Monitor** - Infrastructure monitoring and alerting
- **Key Vault auditing** - Secret access monitoring
- **Cosmos DB metrics** - Database performance tracking

## 🤝 Contributing

We welcome contributions from the DoD cybersecurity community:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure all contributions:
- Follow security best practices
- Include appropriate tests
- Update documentation as needed
- Comply with DoD software development guidelines

## 📚 Documentation

- **[Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Comprehensive Azure deployment
- **[Quick Deployment Reference](./DEPLOYMENT.md)** - Fast deployment commands
- **[Azure Development Setup](./LOCAL_DEVELOPMENT_AZURE.md)** - Local development with Azure
- **[Offline Development Setup](./LOCAL_DEVELOPMENT_OFFLINE.md)** - Local development without Azure
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - Technical architecture details
- **[API Documentation](./docs/API.md)** - Service API reference

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/timcockrell-usa/cATO-app/issues)
- **Documentation**: Repository wiki and documentation files
- **Community**: DoD Cybersecurity Community of Practice

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **USAFRICOM Cybersecurity Team** for requirements and testing
- **DoD Cybersecurity Community** for feedback and contributions
- **Azure Government Team** for IL5 deployment guidance
- **NIST** for the 800-53 security control framework

---

**Built with ❤️ for the DoD cybersecurity community**
