
# cATO Dashboard

A comprehensive Continuous Authority to Operate (cATO) dashboard for managing NIST 800-53 compliance, Zero Trust Architecture (ZTA) maturity, and Plan of Action & Milestones (POA&M) in cloud environments.

## Features

- **NIST 800-53 Compliance Management**: Track and manage security control implementation status
- **Zero Trust Architecture Assessment**: Monitor ZTA maturity across seven pillars with DoD data
- **POA&M Management**: Import, track, and manage Plans of Action and Milestones
- **Azure Integration**: Import real Azure resource data for compliance assessment
- **Multi-Framework Support**: Support for NIST Rev 4 and Rev 5 frameworks
- **Role-Based Access Control**: Azure Entra ID integration with organizational roles

## Quick Start

### Prerequisites

- Node.js 18 or later
- Azure subscription (for cloud deployment)
- Azure Entra ID tenant (for authentication)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/cATO-app.git
cd cATO-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

### Azure Deployment

```bash
# Install Azure Developer CLI
winget install microsoft.azd

# Deploy to Azure
azd auth login
azd up
```

## Documentation

- **[Local Development Guide](./docs/LOCAL_DEVELOPMENT_GUIDE.md)** - Complete setup for local development
- **[Azure Deployment Guide](./docs/AZURE_DEPLOYMENT_GUIDE.md)** - Deploy to Azure using azd
- **[Azure Entra ID Setup Guide](./docs/AZURE_AUTHENTICATION_SETUP_GUIDE.md)** - Configure authentication

## Data Management

### Import ZTA Data

```bash
# Import DoD Zero Trust capabilities and activities
npm run seed-zta -- --activities data/zta_activities_with_azure.csv --capabilities data/zta_capabilities_with_azure.csv --backup
```

### Check Database Connection

```bash
# Verify Cosmos DB connection and data
node scripts/check-cosmos-db.cjs
```

## Project Structure

```
├── src/
│   ├── components/    # React components
│   ├── pages/         # Application pages
│   ├── services/      # API and data services
│   └── types/         # TypeScript definitions
├── scripts/           # Data import and utility scripts
├── infra/             # Azure infrastructure (Bicep)
├── docs/              # Documentation
└── data/              # ZTA data files
```

## Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run seed-zta     # Import ZTA data to Cosmos DB
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Azure Static Web Apps, Azure Functions
- **Database**: Azure Cosmos DB
- **Authentication**: Azure Entra ID
- **Infrastructure**: Azure (Bicep)
- **Build Tool**: Vite

## Environment Variables

### Required for Local Development

```env
VITE_COSMOS_DB_ENDPOINT=your-cosmos-endpoint
VITE_COSMOS_DB_KEY=your-cosmos-key
VITE_COSMOS_DB_NAME=cato-dashboard
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id
```

### Required for Azure Deployment

These are automatically configured during Azure deployment via `azd up`.

## Contributing

1. Follow the local development setup
2. Create feature branches from `main`
3. Ensure all tests pass and code is linted
4. Submit pull requests with clear descriptions

## Security & Compliance

This application is designed for government and enterprise use with:

- Azure Entra ID authentication
- Role-based access controls
- Data encryption at rest and in transit
- NIST 800-53 compliance framework support
- Zero Trust Architecture principles

## Support

For issues and questions:

1. Check the documentation in the `docs/` folder
2. Review existing GitHub issues
3. Create a new issue with detailed information

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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
