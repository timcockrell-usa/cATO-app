const { CosmosClient } = require('@azure/cosmos');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const cosmosConfig = {
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || process.env.VITE_COSMOS_DB_ENDPOINT,
  key: process.env.AZURE_COSMOS_KEY || process.env.VITE_COSMOS_DB_KEY,
  databaseId: process.env.AZURE_COSMOS_DATABASE_NAME || process.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

console.log('🚀 Testing Cosmos DB connection and creating sample data...');
console.log(`📊 Database: ${cosmosConfig.databaseId}`);
console.log(`🔗 Endpoint: ${cosmosConfig.endpoint ? cosmosConfig.endpoint.substring(0, 50) + '...' : 'NOT SET'}`);

if (!cosmosConfig.endpoint || !cosmosConfig.key) {
  console.error('❌ Missing required environment variables in .env.local:');
  console.error('');
  console.error('Required variables:');
  console.error('   - AZURE_COSMOS_ENDPOINT or VITE_COSMOS_DB_ENDPOINT');
  console.error('   - AZURE_COSMOS_KEY or VITE_COSMOS_DB_KEY');
  console.error('');
  console.error('🔧 To fix this:');
  console.error('   1. Go to Azure Portal → Resource Groups → ampe-eastus-dev-rg');
  console.error('   2. Find your Cosmos DB account → Keys');
  console.error('   3. Copy the URI and Primary Key to .env.local');
  console.error('');
  console.error('Current values:');
  console.error(`   AZURE_COSMOS_ENDPOINT: ${process.env.AZURE_COSMOS_ENDPOINT || 'NOT SET'}`);
  console.error(`   VITE_COSMOS_DB_ENDPOINT: ${process.env.VITE_COSMOS_DB_ENDPOINT || 'NOT SET'}`);
  console.error(`   Keys: ${cosmosConfig.key ? '[SET]' : '[NOT SET]'}`);
  process.exit(1);
}

// Configure client
const clientOptions = {
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key,
};

// Handle Cosmos DB Emulator SSL issues in development
if (cosmosConfig.endpoint.includes('localhost')) {
  console.log('🔧 Using Cosmos DB Emulator - disabling SSL verification');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const client = new CosmosClient(clientOptions);

// Sample data for testing
const sampleNistControls = [
  {
    id: 'AC-1',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-1',
    controlName: 'Policy and Procedures',
    description: 'Develop, document, and disseminate access control policies and procedures.',
    azureImplementation: 'Azure AD policies and procedures documented in compliance repository.',
    status: 'implemented',
    implementation: 'Azure AD policies documented',
    lastAssessed: '2024-12-01',
    assessedBy: 'System Administrator',
    evidence: ['Policy document in Azure Repos'],
    riskLevel: 'low',
  },
  {
    id: 'AC-2',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-2',
    controlName: 'Account Management',
    description: 'Manage system accounts, group memberships, privileges, workflow, notifications, deactivations, and authorizations.',
    azureImplementation: 'Implemented through Azure AD user lifecycle management and Azure RBAC.',
    status: 'implemented',
    implementation: 'Azure AD account management',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['Azure AD configuration', 'RBAC policies'],
    riskLevel: 'low',
  }
];

const sampleZtaActivities = [
  {
    id: 'USER-1.1.1',
    pillar: 'User',
    capabilityId: '1.1',
    capabilityName: 'User Inventory',
    activityId: '1.1.1',
    activityName: 'Maintain comprehensive user inventory',
    description: 'Maintain an accurate, complete, and up-to-date inventory of all users in the enterprise.',
    azureImplementation: 'Azure AD provides comprehensive user directory with automated provisioning and de-provisioning capabilities.',
    status: 'implemented',
    implementation: 'Azure AD user management',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['Azure AD user reports', 'Automated provisioning logs'],
    riskLevel: 'low',
  }
];

async function testConnection() {
  try {
    console.log('\\n🔗 Testing connection to Cosmos DB...');
    
    // Test connection by listing databases
    const { resources: databases } = await client.databases.readAll().fetchAll();
    console.log(`✅ Connected successfully! Found ${databases.length} databases.`);
    
    // Create or access our database
    const { database } = await client.databases.createIfNotExists({ id: cosmosConfig.databaseId });
    console.log(`✅ Database '${cosmosConfig.databaseId}' ready`);

    // Create containers
    const containers = [
      { id: 'nist-controls', partitionKey: '/controlIdentifier' },
      { id: 'zta-activities', partitionKey: '/pillar' },
      { id: 'poam-items', partitionKey: '/status' },
      { id: 'vulnerabilities', partitionKey: '/severity' },
    ];

    console.log('\\n📦 Creating containers...');
    for (const containerConfig of containers) {
      const { container } = await database.containers.createIfNotExists({
        id: containerConfig.id,
        partitionKey: containerConfig.partitionKey
      });
      console.log(`✅ Container '${containerConfig.id}' ready`);
    }

    // Insert sample data
    console.log('\\n📋 Inserting sample NIST Controls...');
    const nistContainer = database.container('nist-controls');
    for (const control of sampleNistControls) {
      await nistContainer.items.upsert(control);
      console.log(`✅ Added: ${control.controlIdentifier} - ${control.controlName}`);
    }

    console.log('\\n🛡️ Inserting sample ZTA Activities...');
    const ztaContainer = database.container('zta-activities');
    for (const activity of sampleZtaActivities) {
      await ztaContainer.items.upsert(activity);
      console.log(`✅ Added: ${activity.id} - ${activity.activityName}`);
    }

    console.log('\\n🎉 Test completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Database: ${cosmosConfig.databaseId}`);
    console.log(`   • NIST Controls: ${sampleNistControls.length} sample items`);
    console.log(`   • ZTA Activities: ${sampleZtaActivities.length} sample items`);
    console.log('');
    console.log('✅ Your Cosmos DB is now ready for the full data migration!');
    console.log('   You can now run the main migration script or use your application.');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    // Provide helpful error messages
    if (error.code === 401) {
      console.error('\\n💡 Authentication failed (HTTP 401). Please check:');
      console.error('   • Your Cosmos DB key is correct in .env.local');
      console.error('   • The key has not been regenerated in Azure Portal');
      console.error('   • You are using the Primary Key, not Secondary Key');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\\n💡 Cannot connect to Cosmos DB (DNS error). Please check:');
      console.error('   • Your Cosmos DB endpoint is correct in .env.local');
      console.error('   • You have internet connectivity');
      console.error('   • The Cosmos DB account exists in Azure');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\\n💡 Connection refused. Please check:');
      console.error('   • Cosmos DB is running and accessible');
      console.error('   • Firewall settings allow your IP address');
    } else {
      console.error('\\n💡 Full error details:', error);
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);
