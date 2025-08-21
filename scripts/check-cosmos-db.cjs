// Check Cosmos DB database existence (CommonJS version)
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  try {
    console.log('🔍 Checking Cosmos DB database configuration...');
    
    const endpoint = process.env.VITE_COSMOS_DB_ENDPOINT || process.env.AZURE_COSMOS_ENDPOINT;
    const key = process.env.VITE_COSMOS_DB_KEY || process.env.AZURE_COSMOS_KEY;
    const databaseName = process.env.VITE_COSMOS_DB_NAME || process.env.AZURE_COSMOS_DATABASE_NAME || 'cato-dashboard';
    
    if (!endpoint || !key) {
      console.error('❌ Missing Cosmos DB configuration');
      console.error('   Please check your .env.local file');
      process.exit(1);
    }
    
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Database: ${databaseName}`);
    
    const client = new CosmosClient({ endpoint, key });
    
    // Check if database exists
    try {
      const { database } = await client.database(databaseName).read();
      console.log(`✅ Database '${databaseName}' exists`);
      
      // List containers
      const { resources: containers } = await database.containers.readAll().fetchAll();
      console.log(`   Containers found: ${containers.length}`);
      
      for (const container of containers) {
        console.log(`   - ${container.id}`);
        
        // Count items in each container
        try {
          const { resources: items } = await database.container(container.id).items.readAll().fetchAll();
          console.log(`     Items: ${items.length}`);
        } catch (error) {
          console.log(`     Items: Unable to count (${error.message})`);
        }
      }
      
    } catch (error) {
      if (error.code === 404) {
        console.log(`❌ Database '${databaseName}' does not exist`);
        console.log('💡 You need to create the database first using Azure Portal or Azure CLI');
      } else {
        console.error(`❌ Error checking database: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

checkDatabase();
