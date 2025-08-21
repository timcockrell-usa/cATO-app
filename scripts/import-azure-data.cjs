// Azure Environment Data Import Script (CommonJS version)
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { ResourceManagementClient } = require('@azure/arm-resources');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('📥 Azure Environment Data Import Script');
console.log('=====================================\n');

// Configuration
const config = {
  // Source Azure environment (where to import from)
  sourceSubscriptionId: process.env.AZURE_SOURCE_SUBSCRIPTION_ID || process.env.AZURE_SUBSCRIPTION_ID,
  sourceResourceGroup: process.env.AZURE_SOURCE_RESOURCE_GROUP,
  sourceCosmosEndpoint: process.env.AZURE_SOURCE_COSMOS_ENDPOINT,
  sourceCosmosKey: process.env.AZURE_SOURCE_COSMOS_KEY,
  sourceDatabaseName: process.env.AZURE_SOURCE_COSMOS_DATABASE || 'cato-dashboard',
  
  // Target Cosmos DB (your local/dev environment)
  targetCosmosEndpoint: process.env.AZURE_COSMOS_ENDPOINT || process.env.VITE_COSMOS_DB_ENDPOINT,
  targetCosmosKey: process.env.AZURE_COSMOS_KEY || process.env.VITE_COSMOS_DB_KEY,
  targetDatabaseName: process.env.AZURE_COSMOS_DATABASE_NAME || process.env.VITE_COSMOS_DB_NAME || 'cato-dashboard'
};

console.log('🔧 Configuration Check:');
console.log(`   Source Subscription: ${config.sourceSubscriptionId || 'Not configured'}`);
console.log(`   Source Resource Group: ${config.sourceResourceGroup || 'Not configured'}`);
console.log(`   Source Cosmos DB: ${config.sourceCosmosEndpoint ? 'Configured' : 'Not configured'}`);
console.log(`   Target Cosmos DB: ${config.targetCosmosEndpoint ? config.targetCosmosEndpoint.substring(0, 50) + '...' : 'Not configured'}`);
console.log('');

// Check if we have minimum required configuration
if (!config.targetCosmosEndpoint || !config.targetCosmosKey) {
  console.error('❌ Missing target Cosmos DB configuration in .env.local:');
  console.error('   Required variables:');
  console.error('   - AZURE_COSMOS_ENDPOINT or VITE_COSMOS_DB_ENDPOINT');
  console.error('   - AZURE_COSMOS_KEY or VITE_COSMOS_DB_KEY');
  console.error('');
  console.error('💡 Please update your .env.local file with your Azure Cosmos DB details.');
  process.exit(1);
}

// Target Cosmos DB client (your environment)
const targetClient = new CosmosClient({
  endpoint: config.targetCosmosEndpoint,
  key: config.targetCosmosKey
});

async function importAzureData() {
  try {
    console.log('🚀 Starting Azure data import...');
    
    // Option 1: Import from source Cosmos DB (if configured)
    if (config.sourceCosmosEndpoint && config.sourceCosmosKey) {
      await importFromSourceCosmosDB();
    }
    // Option 2: Import Azure resource data using Azure APIs
    else if (config.sourceSubscriptionId) {
      await importAzureResources();
    }
    // Option 3: Use sample data if no source is configured
    else {
      console.log('ℹ️  No source configuration found. Creating sample Azure-based data...');
      await createSampleAzureData();
    }

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    
    if (error.code === 401) {
      console.error('\\n💡 Authentication failed. Please check:');
      console.error('   • Your Cosmos DB keys are correct');
      console.error('   • You have proper Azure permissions');
    } else if (error.code === 'CredentialUnavailableError') {
      console.error('\\n💡 Azure authentication failed. Please:');
      console.error('   • Run: az login');
      console.error('   • Ensure you have access to the source subscription');
    }
    
    process.exit(1);
  }
}

async function importFromSourceCosmosDB() {
  console.log('📊 Importing from source Cosmos DB...');
  
  const sourceClient = new CosmosClient({
    endpoint: config.sourceCosmosEndpoint,
    key: config.sourceCosmosKey
  });

  const sourceDatabase = sourceClient.database(config.sourceDatabaseName);
  const targetDatabase = targetClient.database(config.targetDatabaseName);

  // Check if target database exists (don't try to create it)
  try {
    await targetDatabase.read();
    console.log(`✅ Using existing target database: ${config.targetDatabaseName}`);
  } catch (error) {
    if (error.code === 404) {
      throw new Error(`Target database '${config.targetDatabaseName}' does not exist. Please create it first using Azure Portal or run: npm run migrate-data`);
    }
    throw error;
  }

  const containers = ['nist-controls', 'zta-activities', 'poam-items', 'vulnerabilities'];
  
  for (const containerName of containers) {
    try {
      console.log(`\\n📦 Importing container: ${containerName}`);
      
      const sourceContainer = sourceDatabase.container(containerName);
      const { resources: items } = await sourceContainer.items.readAll().fetchAll();
      
      if (items.length === 0) {
        console.log(`   ℹ️  No items found in source container '${containerName}'`);
        continue;
      }

      // Create target container
      const partitionKeys = {
        'nist-controls': '/controlIdentifier',
        'zta-activities': '/pillar',
        'poam-items': '/status',
        'vulnerabilities': '/severity'
      };

      await targetDatabase.containers.createIfNotExists({
        id: containerName,
        partitionKey: partitionKeys[containerName] || '/id'
      });

      const targetContainer = targetDatabase.container(containerName);
      
      // Import items
      let importedCount = 0;
      for (const item of items) {
        try {
          await targetContainer.items.upsert(item);
          importedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to import item ${item.id}:`, error.message);
        }
      }
      
      console.log(`   ✅ Imported ${importedCount}/${items.length} items`);
      
    } catch (error) {
      console.error(`   ❌ Failed to import container '${containerName}':`, error.message);
    }
  }
}

async function importAzureResources() {
  console.log('🔍 Importing Azure resource data...');
  
  const credential = new DefaultAzureCredential();
  const resourceClient = new ResourceManagementClient(credential, config.sourceSubscriptionId);
  
  const targetDatabase = targetClient.database(config.targetDatabaseName);
  
  // Check if target database exists (don't try to create it)
  try {
    await targetDatabase.read();
    console.log(`✅ Using existing target database: ${config.targetDatabaseName}`);
  } catch (error) {
    if (error.code === 404) {
      throw new Error(`Target database '${config.targetDatabaseName}' does not exist. Please create it first using Azure Portal or run: npm run migrate-data`);
    }
    throw error;
  }

  // Create container for Azure resources
  await targetDatabase.containers.createIfNotExists({
    id: 'azure-resources',
    partitionKey: '/resourceType'
  });

  const resourceContainer = targetDatabase.container('azure-resources');
  
  try {
    console.log('   📊 Fetching Azure resources...');
    
    // Get all resources in the subscription
    const resources = [];
    for await (const resource of resourceClient.resources.list()) {
      resources.push({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        resourceType: resource.type,
        location: resource.location,
        resourceGroup: resource.id.split('/')[4],
        subscriptionId: config.sourceSubscriptionId,
        importedAt: new Date().toISOString(),
        tags: resource.tags || {}
      });
      
      if (resources.length % 10 === 0) {
        console.log(`   📊 Found ${resources.length} resources...`);
      }
    }
    
    console.log(`\\n   💾 Importing ${resources.length} Azure resources...`);
    
    let importedCount = 0;
    for (const resource of resources) {
      try {
        await resourceContainer.items.upsert(resource);
        importedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to import resource ${resource.name}:`, error.message);
      }
    }
    
    console.log(`   ✅ Imported ${importedCount}/${resources.length} Azure resources`);
    
  } catch (error) {
    console.error('   ❌ Failed to fetch Azure resources:', error.message);
    throw error;
  }
}

async function createSampleAzureData() {
  console.log('📊 Creating sample Azure-based data...');
  
  const targetDatabase = targetClient.database(config.targetDatabaseName);
  
  // Check if target database exists (don't try to create it)
  try {
    await targetDatabase.read();
    console.log(`✅ Using existing target database: ${config.targetDatabaseName}`);
  } catch (error) {
    if (error.code === 404) {
      throw new Error(`Target database '${config.targetDatabaseName}' does not exist. Please create it first using Azure Portal or run: npm run migrate-data`);
    }
    throw error;
  }

  // Create sample Azure resources
  await targetDatabase.containers.createIfNotExists({
    id: 'azure-resources',
    partitionKey: '/resourceType'
  });

  const resourceContainer = targetDatabase.container('azure-resources');
  
  const sampleResources = [
    {
      id: '/subscriptions/930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e/resourceGroups/ampe-eastus-dev-rg/providers/Microsoft.DocumentDB/databaseAccounts/cosmos-tlgsnk5eym2h2',
      name: 'cosmos-tlgsnk5eym2h2',
      type: 'Microsoft.DocumentDB/databaseAccounts',
      resourceType: 'Microsoft.DocumentDB/databaseAccounts',
      location: 'eastus2',
      resourceGroup: 'ampe-eastus-dev-rg',
      subscriptionId: '930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e',
      importedAt: new Date().toISOString(),
      tags: { environment: 'dev', project: 'cato-dashboard' }
    },
    {
      id: '/subscriptions/930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e/resourceGroups/ampe-eastus-dev-rg/providers/Microsoft.Web/staticSites/cato-static-app',
      name: 'cato-static-app',
      type: 'Microsoft.Web/staticSites',
      resourceType: 'Microsoft.Web/staticSites',
      location: 'eastus2',
      resourceGroup: 'ampe-eastus-dev-rg',
      subscriptionId: '930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e',
      importedAt: new Date().toISOString(),
      tags: { environment: 'dev', project: 'cato-dashboard' }
    },
    {
      id: '/subscriptions/930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e/resourceGroups/ampe-eastus-dev-rg/providers/Microsoft.KeyVault/vaults/cato-keyvault-dev',
      name: 'cato-keyvault-dev',
      type: 'Microsoft.KeyVault/vaults',
      resourceType: 'Microsoft.KeyVault/vaults',
      location: 'eastus2',
      resourceGroup: 'ampe-eastus-dev-rg',
      subscriptionId: '930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e',
      importedAt: new Date().toISOString(),
      tags: { environment: 'dev', project: 'cato-dashboard' }
    }
  ];

  let importedCount = 0;
  for (const resource of sampleResources) {
    try {
      await resourceContainer.items.upsert(resource);
      importedCount++;
      console.log(`   ✅ Added: ${resource.name} (${resource.type})`);
    } catch (error) {
      console.error(`   ❌ Failed to add resource ${resource.name}:`, error.message);
    }
  }

  console.log(`\\n🎉 Import completed successfully!`);
  console.log(`📊 Summary:`);
  console.log(`   • Sample Azure resources: ${importedCount} items`);
  console.log(`   • Target database: ${config.targetDatabaseName}`);
  console.log(`   • Endpoint: ${config.targetCosmosEndpoint}`);
}

// Run the import
importAzureData().catch(console.error);
