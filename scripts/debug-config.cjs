// Debug script to check configuration
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debug Configuration Check');
console.log('============================');

console.log('\nEnvironment variables:');
console.log('VITE_COSMOS_DB_NAME:', process.env.VITE_COSMOS_DB_NAME);
console.log('AZURE_COSMOS_DATABASE_NAME:', process.env.AZURE_COSMOS_DATABASE_NAME);
console.log('VITE_COSMOS_DB_ENDPOINT:', process.env.VITE_COSMOS_DB_ENDPOINT);

const config = {
  targetEndpoint: process.env.VITE_COSMOS_DB_ENDPOINT || process.env.AZURE_COSMOS_ENDPOINT,
  targetKey: process.env.VITE_COSMOS_DB_KEY || process.env.AZURE_COSMOS_KEY,
  targetDatabaseName: process.env.VITE_COSMOS_DB_NAME || process.env.AZURE_COSMOS_DATABASE_NAME || 'cato-dashboard'
};

console.log('\nParsed config:');
console.log('targetDatabaseName:', config.targetDatabaseName);
console.log('targetEndpoint:', config.targetEndpoint);

// Check if there's some weird parsing happening
console.log('\nType checks:');
console.log('typeof targetDatabaseName:', typeof config.targetDatabaseName);
console.log('targetDatabaseName length:', config.targetDatabaseName?.length);

// Check if it's extracting from endpoint somehow
const endpoint = config.targetEndpoint;
if (endpoint) {
  const urlParts = endpoint.split('://')[1]?.split('.')[0];
  console.log('Account name from endpoint:', urlParts);
}
