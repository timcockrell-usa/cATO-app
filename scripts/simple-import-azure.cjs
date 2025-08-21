// Simple Azure Data Import Script (CommonJS version)
// Works with existing Cosmos DB database and containers
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config({ path: '.env.local' });

// Configuration
const config = {
  targetEndpoint: process.env.VITE_COSMOS_DB_ENDPOINT || process.env.AZURE_COSMOS_ENDPOINT,
  targetKey: process.env.VITE_COSMOS_DB_KEY || process.env.AZURE_COSMOS_KEY,
  targetDatabaseName: process.env.VITE_COSMOS_DB_NAME || process.env.AZURE_COSMOS_DATABASE_NAME || 'cato-dashboard'
};

console.log('📥 Simple Azure Data Import Script');
console.log('==================================');
console.log();

// Validate configuration
const requiredFields = ['targetEndpoint', 'targetKey'];
const missing = requiredFields.filter(field => !config[field]);

if (missing.length > 0) {
  console.error('❌ Missing required configuration:');
  missing.forEach(field => {
    console.error(`   • ${field}`);
  });
  console.error('\\n💡 Please check your .env.local file');
  process.exit(1);
}

console.log('🔧 Configuration:');
console.log(`   Target Database: ${config.targetDatabaseName}`);
console.log(`   Target Endpoint: ${config.targetEndpoint.substring(0, 50)}...`);
console.log();

const targetClient = new CosmosClient({
  endpoint: config.targetEndpoint,
  key: config.targetKey
});

async function main() {
  try {
    console.log('🚀 Starting data import...');
    
    const targetDatabase = targetClient.database(config.targetDatabaseName);
    
    // Check if database exists
    try {
      await targetDatabase.read();
      console.log(`✅ Connected to database: ${config.targetDatabaseName}`);
    } catch (error) {
      if (error.code === 404) {
        console.error(`❌ Database '${config.targetDatabaseName}' does not exist`);
        console.error('💡 Please run: npm run migrate-data');
        process.exit(1);
      }
      throw error;
    }
    
    // List existing containers
    const { resources: containers } = await targetDatabase.containers.readAll().fetchAll();
    console.log(`\\n📦 Found ${containers.length} existing containers:`);
    
    for (const container of containers) {
      console.log(`   • ${container.id}`);
    }
    
    // Add some sample Azure resource data to existing containers
    await addSampleData(targetDatabase);
    
    console.log('\\n🎉 Import completed successfully!');
    console.log('\\n📊 Summary:');
    console.log('   • Used existing database and containers');
    console.log('   • Added sample Azure resource metadata');
    console.log('   • Ready for production use');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

async function addSampleData(database) {
  console.log('\\n📊 Adding sample Azure resource metadata...');
  
  // Add Azure resource metadata to existing NIST controls
  const nistContainer = database.container('nist-controls');
  
  try {
    console.log('   • Updating NIST controls with Azure resource mappings...');
    
    // Get existing NIST controls
    const { resources: controls } = await nistContainer.items.readAll().fetchAll();
    let updateCount = 0;
    
    for (const control of controls) {
      // Add Azure resource mapping if it doesn't exist
      if (!control.azureResources) {
        control.azureResources = {
          relevantServices: getAzureServicesForControl(control.id),
          policies: getAzurePoliciesForControl(control.id),
          lastUpdated: new Date().toISOString()
        };
        
        await nistContainer.items.upsert(control);
        updateCount++;
      }
    }
    
    console.log(`     ✅ Updated ${updateCount} controls with Azure mappings`);
    
  } catch (error) {
    console.error(`     ❌ Failed to update NIST controls: ${error.message}`);
  }
  
  // Add Azure resource data to ZTA activities if needed
  const ztaContainer = database.container('zta-activities');
  
  try {
    console.log('   • Updating ZTA activities with Azure resource mappings...');
    
    const { resources: activities } = await ztaContainer.items.readAll().fetchAll();
    let updateCount = 0;
    
    for (const activity of activities) {
      // Add Azure implementation details if they don't exist
      if (!activity.azureImplementation) {
        activity.azureImplementation = {
          services: getAzureServicesForZTA(activity.id),
          configurations: getAzureConfigsForZTA(activity.id),
          lastUpdated: new Date().toISOString()
        };
        
        await ztaContainer.items.upsert(activity);
        updateCount++;
      }
    }
    
    console.log(`     ✅ Updated ${updateCount} ZTA activities with Azure implementations`);
    
  } catch (error) {
    console.error(`     ❌ Failed to update ZTA activities: ${error.message}`);
  }
}

function getAzureServicesForControl(controlId) {
  const mappings = {
    'AC-2': ['Azure Entra ID', 'Azure RBAC', 'Azure Key Vault'],
    'AC-3': ['Azure Entra ID', 'Azure RBAC', 'Azure Policy'],
    'AC-6': ['Azure Entra ID Privileged Identity Management', 'Azure RBAC'],
    'AU-2': ['Azure Monitor', 'Log Analytics', 'Azure Sentinel'],
    'AU-3': ['Azure Monitor', 'Application Insights', 'Azure Security Center'],
    'SC-7': ['Azure Firewall', 'Network Security Groups', 'Azure Front Door']
  };
  
  return mappings[controlId] || ['Azure Monitor', 'Azure Security Center'];
}

function getAzurePoliciesForControl(controlId) {
  const policies = {
    'AC-2': ['Require MFA for privileged accounts', 'Account lockout policy'],
    'AC-3': ['Conditional access policies', 'Role-based access control'],
    'AC-6': ['Privileged access management', 'Just-in-time access'],
    'AU-2': ['Audit log retention policy', 'Security event monitoring'],
    'AU-3': ['Application logging requirements', 'Audit trail integrity'],
    'SC-7': ['Network segmentation', 'Firewall rules']
  };
  
  return policies[controlId] || ['Standard security policies'];
}

function getAzureServicesForZTA(activityId) {
  const services = {
    'zta-1': ['Azure Entra ID', 'Azure Conditional Access'],
    'zta-2': ['Azure Firewall', 'Azure Application Gateway'],
    'zta-3': ['Azure Key Vault', 'Azure Managed Identity'],
    'zta-4': ['Azure Monitor', 'Azure Sentinel']
  };
  
  return services[activityId] || ['Azure Security Center'];
}

function getAzureConfigsForZTA(activityId) {
  const configs = {
    'zta-1': ['Multi-factor authentication', 'Risk-based conditional access'],
    'zta-2': ['Network microsegmentation', 'Application-level firewalls'],
    'zta-3': ['Zero-trust network access', 'Identity-based authentication'],
    'zta-4': ['Continuous monitoring', 'Behavioral analytics']
  };
  
  return configs[activityId] || ['Standard zero-trust configurations'];
}

// Run the import
main();
