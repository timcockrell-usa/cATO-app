// Test configuration loading
const dotenv = require('dotenv');

console.log('Testing environment variable loading...');

// Load environment variables from .env.local
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error);
} else {
  console.log('✅ Successfully loaded .env.local');
}

console.log('\n🔧 Configuration values:');
console.log('VITE_COSMOS_DB_ENDPOINT:', process.env.VITE_COSMOS_DB_ENDPOINT || 'NOT SET');
console.log('VITE_COSMOS_DB_NAME:', process.env.VITE_COSMOS_DB_NAME || 'NOT SET');
console.log('AZURE_COSMOS_ENDPOINT:', process.env.AZURE_COSMOS_ENDPOINT || 'NOT SET');
console.log('AZURE_COSMOS_DATABASE_NAME:', process.env.AZURE_COSMOS_DATABASE_NAME || 'NOT SET');

const cosmosConfig = {
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || process.env.VITE_COSMOS_DB_ENDPOINT,
  key: process.env.AZURE_COSMOS_KEY || process.env.VITE_COSMOS_DB_KEY,
  databaseId: process.env.AZURE_COSMOS_DATABASE_NAME || process.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

console.log('\n📊 Final configuration:');
console.log('Database ID:', cosmosConfig.databaseId);
console.log('Endpoint:', cosmosConfig.endpoint ? cosmosConfig.endpoint.substring(0, 50) + '...' : 'NOT SET');
