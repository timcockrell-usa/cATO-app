require('dotenv').config({ path: '.env.local' });
const { CosmosClient } = require('@azure/cosmos');

async function createZtaCapabilitiesContainer() {
  try {
    console.log('🚀 Connecting to Cosmos DB...');
    
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const database = client.database(process.env.COSMOS_DB_NAME);

    console.log('📝 Creating zta-capabilities container...');
    
    const containerDefinition = {
      id: 'zta-capabilities',
      partitionKey: { paths: ['/pillar'] }
    };

    const { container } = await database.containers.createIfNotExists(containerDefinition);
    console.log('✅ Container zta-capabilities created or already exists');

    console.log('🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  }
}

createZtaCapabilitiesContainer();
