// CommonJS version of the migration script to avoid ES module issues
const { CosmosClient } = require('@azure/cosmos');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Import the data from the CommonJS compiled files
const { nistControlsFromCSV } = require('../src/data/nistControlsEnhanced.js');
const { ztaActivitiesFromCSV } = require('../src/data/ztaActivitiesEnhanced.js');

const cosmosConfig = {
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || process.env.VITE_COSMOS_DB_ENDPOINT,
  key: process.env.AZURE_COSMOS_KEY || process.env.VITE_COSMOS_DB_KEY,
  databaseId: process.env.AZURE_COSMOS_DATABASE_NAME || process.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

console.log('🚀 Starting data migration to CosmosDB...');
console.log(`📊 Database: ${cosmosConfig.databaseId}`);
console.log(`🔗 Endpoint: ${cosmosConfig.endpoint}`);

if (!cosmosConfig.endpoint || !cosmosConfig.key) {
  console.error('❌ Missing required environment variables:');
  console.error('   - AZURE_COSMOS_ENDPOINT or VITE_COSMOS_DB_ENDPOINT');
  console.error('   - AZURE_COSMOS_KEY or VITE_COSMOS_DB_KEY');
  console.error('');
  console.error('💡 Please update your .env.local file with your Azure Cosmos DB details:');
  console.error('   1. Go to Azure Portal → Resource Groups → ampe-eastus-dev-rg');
  console.error('   2. Find your Cosmos DB account → Keys');
  console.error('   3. Copy the URI and Primary Key to .env.local');
  process.exit(1);
}

// Configure client for local development vs production
const clientOptions = {
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key,
};

// Handle Cosmos DB Emulator SSL issues in development
if (cosmosConfig.endpoint.includes('localhost')) {
  console.log('🔧 Using Cosmos DB Emulator - disabling SSL verification for local development');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const client = new CosmosClient(clientOptions);

async function migrateData() {
  try {
    const database = client.database(cosmosConfig.databaseId);

    // Create database and containers if they don't exist
    console.log('📦 Ensuring database and containers exist...');
    
    try {
      await database.read();
      console.log(`✅ Database '${cosmosConfig.databaseId}' exists`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`📦 Creating database '${cosmosConfig.databaseId}'...`);
        await client.databases.create({ id: cosmosConfig.databaseId });
      } else {
        throw error;
      }
    }

    // Ensure containers exist
    const containers = [
      { id: 'nist-controls', partitionKey: '/controlIdentifier' },
      { id: 'zta-activities', partitionKey: '/pillar' },
      { id: 'poam-items', partitionKey: '/status' },
      { id: 'vulnerabilities', partitionKey: '/severity' },
      { id: 'control-history', partitionKey: '/controlIdentifier' }
    ];

    for (const containerConfig of containers) {
      try {
        const container = database.container(containerConfig.id);
        await container.read();
        console.log(`✅ Container '${containerConfig.id}' exists`);
      } catch (error) {
        if (error.code === 404) {
          console.log(`📦 Creating container '${containerConfig.id}'...`);
          await database.containers.create({
            id: containerConfig.id,
            partitionKey: containerConfig.partitionKey
          });
        } else {
          throw error;
        }
      }
    }

    // Migrate NIST Controls
    console.log('\\n📋 Migrating NIST Controls...');
    const nistContainer = database.container('nist-controls');
    
    let nistCount = 0;
    for (const control of nistControlsFromCSV) {
      try {
        await nistContainer.items.upsert(control);
        nistCount++;
        if (nistCount % 10 === 0) {
          console.log(`✅ Migrated ${nistCount} NIST Controls...`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate NIST Control ${control.controlIdentifier}:`, error.message);
      }
    }
    console.log(`✅ Completed NIST Controls migration: ${nistCount} controls`);

    // Migrate ZTA Activities
    console.log('\\n🛡️ Migrating Zero Trust Architecture Activities...');
    const ztaContainer = database.container('zta-activities');
    
    let ztaCount = 0;
    for (const activity of ztaActivitiesFromCSV) {
      try {
        await ztaContainer.items.upsert(activity);
        ztaCount++;
        if (ztaCount % 10 === 0) {
          console.log(`✅ Migrated ${ztaCount} ZTA Activities...`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate ZTA Activity ${activity.id}:`, error.message);
      }
    }
    console.log(`✅ Completed ZTA Activities migration: ${ztaCount} activities`);

    console.log('\\n🎉 Data migration completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • NIST Controls: ${nistCount} items`);
    console.log(`   • ZTA Activities: ${ztaCount} items`);
    console.log(`   • Database: ${cosmosConfig.databaseId}`);
    console.log(`   • Endpoint: ${cosmosConfig.endpoint}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Provide helpful error messages
    if (error.code === 401) {
      console.error('\\n💡 Authentication failed. Please check:');
      console.error('   • Your Cosmos DB key is correct in .env.local');
      console.error('   • The key has not been regenerated in Azure Portal');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\\n💡 Cannot connect to Cosmos DB. Please check:');
      console.error('   • Your Cosmos DB endpoint is correct in .env.local');
      console.error('   • You have internet connectivity');
      console.error('   • The Cosmos DB account exists in Azure');
    }
    
    process.exit(1);
  }
}

// Run the migration
migrateData().catch(console.error);
