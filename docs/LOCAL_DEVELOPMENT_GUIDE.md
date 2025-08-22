# Local Development Guide

This guide helps you set up the cATO Dashboard for local development and testing.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Azure Cosmos DB Emulator (optional, for local data)

## Quick Start

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/cATO-app.git
cd cATO-app

# Install dependencies
npm install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Basic configuration for local development
VITE_APP_NAME=cATO Dashboard
VITE_APP_VERSION=1.0.0

# For local Cosmos DB Emulator
VITE_COSMOS_DB_ENDPOINT=https://localhost:8081
VITE_COSMOS_DB_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
VITE_COSMOS_DB_NAME=cato-dashboard

# Authentication (optional for local dev)
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id
```

### Step 3: Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Working with Data

### Option 1: Azure Cosmos DB Emulator (Recommended)

1. **Install Cosmos DB Emulator**:
   - Download from [Microsoft Docs](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator)
   - Install and start the emulator

2. **Import Sample Data**:
   ```bash
   # Import ZTA data to local Cosmos DB
   npm run seed-zta -- --activities data/zta_activities_with_azure.csv --capabilities data/zta_capabilities_with_azure.csv
   ```

### Option 2: Connect to Azure Cosmos DB

Update your `.env.local` with your Azure Cosmos DB credentials:

```env
VITE_COSMOS_DB_ENDPOINT=https://your-account.documents.azure.com:443/
VITE_COSMOS_DB_KEY=your-primary-key
VITE_COSMOS_DB_NAME=cato-dashboard
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run type checking
npm run type-check

# Import ZTA data
npm run seed-zta -- --help

# Check Cosmos DB connection
node scripts/check-cosmos-db.cjs
```

## Authentication for Local Development

### Simple Mode (No Azure Authentication)
- The app includes a simplified authentication for local development
- Use any email/password combination to log in locally

### Azure Entra ID Integration
- Follow the "Azure Entra ID Setup Guide" to configure authentication
- Update `.env.local` with your Azure app registration details

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── services/       # API and data services
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries
├── types/          # TypeScript type definitions
└── utils/          # Utility functions

scripts/
├── seed-zta.cjs    # ZTA data import script
└── lib/            # Script utilities

docs/               # Documentation
infra/              # Azure infrastructure (Bicep)
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change port in `vite.config.ts` if 5173 is in use
2. **Cosmos DB connection**: Ensure emulator is running or Azure credentials are correct
3. **Node.js version**: Ensure you're using Node.js 18 or later
4. **Module resolution**: Try deleting `node_modules` and running `npm install`

### Development Tips

- Use the browser dev tools for debugging
- Check the console for error messages
- Use the Network tab to monitor API calls
- The app supports hot reloading for fast development

### Getting Help

- Check the console for error messages
- Verify environment variables are set correctly
- Ensure all required services are running
