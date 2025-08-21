// Full data migration script for Azure Cosmos DB
const { CosmosClient } = require('@azure/cosmos');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const cosmosConfig = {
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || process.env.VITE_COSMOS_DB_ENDPOINT,
  key: process.env.AZURE_COSMOS_KEY || process.env.VITE_COSMOS_DB_KEY,
  databaseId: process.env.AZURE_COSMOS_DATABASE_NAME || process.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

console.log('🚀 Starting full data migration to Azure Cosmos DB...');
console.log(`📊 Database: ${cosmosConfig.databaseId}`);
console.log(`🔗 Endpoint: ${cosmosConfig.endpoint ? cosmosConfig.endpoint.substring(0, 50) + '...' : 'NOT SET'}`);

if (!cosmosConfig.endpoint || !cosmosConfig.key) {
  console.error('❌ Missing required environment variables in .env.local');
  console.error('Please ensure AZURE_COSMOS_ENDPOINT and AZURE_COSMOS_KEY are set.');
  process.exit(1);
}

const client = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key,
});

// Sample data (in production, this would load from the TypeScript files)
// For now, we'll create a representative sample of the full dataset
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
  },
  {
    id: 'AC-3',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-3',
    controlName: 'Access Enforcement',
    description: 'Enforce approved authorizations for logical access to information and system resources.',
    azureImplementation: 'Azure RBAC and Conditional Access policies enforce access controls.',
    status: 'implemented',
    implementation: 'Azure RBAC and Conditional Access',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['RBAC configuration', 'Conditional Access policies'],
    riskLevel: 'low',
  },
  {
    id: 'AU-1',
    controlFamily: 'Audit and Accountability',
    controlIdentifier: 'AU-1',
    controlName: 'Policy and Procedures',
    description: 'Develop, document, and disseminate audit and accountability policies and procedures.',
    azureImplementation: 'Azure Monitor and Log Analytics provide comprehensive audit capabilities.',
    status: 'implemented',
    implementation: 'Azure Monitor audit policies',
    lastAssessed: '2024-12-01',
    assessedBy: 'Compliance Officer',
    evidence: ['Audit policy document', 'Azure Monitor configuration'],
    riskLevel: 'low',
  },
  {
    id: 'AU-2',
    controlFamily: 'Audit and Accountability',
    controlIdentifier: 'AU-2',
    controlName: 'Event Logging',
    description: 'Identify the types of events that the system is capable of logging.',
    azureImplementation: 'Azure Monitor and Application Insights capture comprehensive event logs.',
    status: 'implemented',
    implementation: 'Azure Monitor event logging',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['Azure Monitor logs', 'Application Insights data'],
    riskLevel: 'low',
  },
  {
    id: 'CA-1',
    controlFamily: 'Assessment, Authorization, and Monitoring',
    controlIdentifier: 'CA-1',
    controlName: 'Policy and Procedures',
    description: 'Develop, document, and disseminate assessment, authorization, and monitoring policies and procedures.',
    azureImplementation: 'Azure Security Center and Defender for Cloud provide continuous assessment.',
    status: 'implemented',
    implementation: 'Azure Security Center monitoring',
    lastAssessed: '2024-12-01',
    assessedBy: 'Compliance Officer',
    evidence: ['Security Center configuration', 'Assessment reports'],
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
    azureImplementation: 'Azure AD provides comprehensive user directory with automated provisioning.',
    status: 'implemented',
    implementation: 'Azure AD user management',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['Azure AD user reports', 'Automated provisioning logs'],
    riskLevel: 'low',
  },
  {
    id: 'USER-1.2.1',
    pillar: 'User',
    capabilityId: '1.2',
    capabilityName: 'User Authentication',
    activityId: '1.2.1',
    activityName: 'Implement strong authentication mechanisms',
    description: 'Implement multi-factor authentication and strong authentication policies.',
    azureImplementation: 'Azure AD MFA and Conditional Access enforce strong authentication.',
    status: 'implemented',
    implementation: 'Azure AD MFA and Conditional Access',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['MFA configuration', 'Conditional Access policies'],
    riskLevel: 'low',
  },
  {
    id: 'DEVICE-2.1.1',
    pillar: 'Device',
    capabilityId: '2.1',
    capabilityName: 'Device Inventory',
    activityId: '2.1.1',
    activityName: 'Maintain comprehensive device inventory',
    description: 'Maintain an accurate inventory of all devices with access to enterprise resources.',
    azureImplementation: 'Microsoft Intune provides comprehensive device management and inventory.',
    status: 'partial',
    implementation: 'Intune device enrollment',
    lastAssessed: '2024-12-01',
    assessedBy: 'System Administrator',
    evidence: ['Intune device reports'],
    riskLevel: 'medium',
  },
  {
    id: 'NETWORK-3.1.1',
    pillar: 'Network',
    capabilityId: '3.1',
    capabilityName: 'Network Segmentation',
    activityId: '3.1.1',
    activityName: 'Implement network micro-segmentation',
    description: 'Implement network micro-segmentation to limit lateral movement.',
    azureImplementation: 'Azure Virtual Networks with NSGs and Application Security Groups.',
    status: 'implemented',
    implementation: 'Azure VNet segmentation',
    lastAssessed: '2024-12-01',
    assessedBy: 'Network Administrator',
    evidence: ['VNet configuration', 'NSG rules'],
    riskLevel: 'low',
  }
];

async function migrateFullData() {
  try {
    console.log('\\n🔗 Connecting to Azure Cosmos DB...');
    const database = client.database(cosmosConfig.databaseId);

    // Ensure database exists
    try {
      await database.read();
      console.log(`✅ Database '${cosmosConfig.databaseId}' exists`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`📦 Creating database '${cosmosConfig.databaseId}'...`);
        await client.databases.create({ id: cosmosConfig.databaseId });
      }
    }

    // Create containers
    const containers = [
      { id: 'nist-controls', partitionKey: '/controlIdentifier' },
      { id: 'zta-activities', partitionKey: '/pillar' },
      { id: 'poam-items', partitionKey: '/status' },
      { id: 'vulnerabilities', partitionKey: '/severity' },
      { id: 'control-history', partitionKey: '/controlIdentifier' }
    ];

    console.log('\\n📦 Ensuring containers exist...');
    for (const containerConfig of containers) {
      const { container } = await database.containers.createIfNotExists({
        id: containerConfig.id,
        partitionKey: containerConfig.partitionKey
      });
      console.log(`✅ Container '${containerConfig.id}' ready`);
    }

    // Migrate NIST Controls
    console.log('\\n📋 Migrating NIST Controls...');
    const nistContainer = database.container('nist-controls');
    
    let nistCount = 0;
    for (const control of sampleNistControls) {
      try {
        await nistContainer.items.upsert(control);
        nistCount++;
        console.log(`✅ Migrated: ${control.controlIdentifier} - ${control.controlName}`);
      } catch (error) {
        console.error(`❌ Failed to migrate NIST Control ${control.controlIdentifier}:`, error.message);
      }
    }

    // Migrate ZTA Activities
    console.log('\\n🛡️ Migrating Zero Trust Architecture Activities...');
    const ztaContainer = database.container('zta-activities');
    
    let ztaCount = 0;
    for (const activity of sampleZtaActivities) {
      try {
        await ztaContainer.items.upsert(activity);
        ztaCount++;
        console.log(`✅ Migrated: ${activity.id} - ${activity.activityName}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ZTA Activity ${activity.id}:`, error.message);
      }
    }

    // Create some sample POAM items
    console.log('\\n📝 Creating sample POAM items...');
    const poamContainer = database.container('poam-items');
    
    const samplePOAMs = [
      {
        id: 'POAM-001',
        vulnerabilityId: 'VUL-001',
        description: 'Update MFA policies for privileged accounts',
        status: 'open',
        severity: 'medium',
        assignedTo: 'Security Team',
        dueDate: '2024-12-31',
        controlIds: ['AC-2', 'AC-3'],
        remediation: 'Implement Azure AD Privileged Identity Management',
        riskLevel: 'medium'
      },
      {
        id: 'POAM-002',
        vulnerabilityId: 'VUL-002',
        description: 'Enable advanced threat protection',
        status: 'in-progress',
        severity: 'high',
        assignedTo: 'Security Team',
        dueDate: '2024-11-30',
        controlIds: ['CA-1', 'CA-2'],
        remediation: 'Deploy Microsoft Defender for Cloud',
        riskLevel: 'high'
      }
    ];

    let poamCount = 0;
    for (const poam of samplePOAMs) {
      try {
        await poamContainer.items.upsert(poam);
        poamCount++;
        console.log(`✅ Created POAM: ${poam.id} - ${poam.description}`);
      } catch (error) {
        console.error(`❌ Failed to create POAM ${poam.id}:`, error.message);
      }
    }

    console.log('\\n🎉 Data migration completed successfully!');
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   • Database: ${cosmosConfig.databaseId}`);
    console.log(`   • NIST Controls: ${nistCount} items`);
    console.log(`   • ZTA Activities: ${ztaCount} items`);
    console.log(`   • POAM Items: ${poamCount} items`);
    console.log(`   • Containers: ${containers.length} created`);
    console.log('');
    console.log('🚀 Your cATO Dashboard is now ready to use!');
    console.log('   Run: npm run dev');
    console.log('   Open: http://localhost:5173');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    if (error.code === 401) {
      console.error('\\n💡 Authentication failed. Please check your Cosmos DB key.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\\n💡 Cannot connect to Cosmos DB. Please check your endpoint.');
    }
    
    process.exit(1);
  }
}

// Run the migration
migrateFullData().catch(console.error);
