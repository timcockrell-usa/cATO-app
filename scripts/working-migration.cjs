// Working data migration script for Azure Cosmos DB
const { CosmosClient } = require('@azure/cosmos');
const dotenv = require('dotenv');

// Load environment variables from .env.local
console.log('🔧 Loading configuration from .env.local...');
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error);
  process.exit(1);
}

const cosmosConfig = {
  endpoint: process.env.AZURE_COSMOS_ENDPOINT || process.env.VITE_COSMOS_DB_ENDPOINT,
  key: process.env.AZURE_COSMOS_KEY || process.env.VITE_COSMOS_DB_KEY,
  databaseId: 'cato-dashboard', // Fixed database name - don't rely on env vars that might be wrong
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

// Sample data
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
    description: 'Manage information system accounts, including establishing, activating, modifying, reviewing, disabling, and removing accounts.',
    azureImplementation: 'Azure AD account lifecycle management with automated provisioning and deprovisioning.',
    status: 'implemented',
    implementation: 'Azure AD automated account management',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['Azure AD audit logs', 'Provisioning configuration'],
    riskLevel: 'medium',
  },
  {
    id: 'AC-3',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-3',
    controlName: 'Access Enforcement',
    description: 'Enforce approved authorizations for logical access to information and system resources.',
    azureImplementation: 'Azure RBAC and Conditional Access policies enforce authorization decisions.',
    status: 'implemented',
    implementation: 'Azure RBAC with conditional access',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['RBAC configuration', 'Conditional access policies'],
    riskLevel: 'high',
  },
  {
    id: 'AC-6',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-6',
    controlName: 'Least Privilege',
    description: 'Employ the principle of least privilege, allowing only authorized accesses.',
    azureImplementation: 'Azure PIM and RBAC implement least privilege access with just-in-time elevation.',
    status: 'implemented',
    implementation: 'Azure PIM with JIT access',
    lastAssessed: '2024-12-01',
    assessedBy: 'System Administrator',
    evidence: ['PIM configuration', 'Access reviews'],
    riskLevel: 'high',
  },
  {
    id: 'AU-2',
    controlFamily: 'Audit and Accountability',
    controlIdentifier: 'AU-2',
    controlName: 'Event Logging',
    description: 'Ensure that the events listed in AU-2a are audited within the system.',
    azureImplementation: 'Azure Monitor and Log Analytics capture comprehensive audit events.',
    status: 'implemented',
    implementation: 'Azure Monitor comprehensive logging',
    lastAssessed: '2024-12-01',
    assessedBy: 'Security Analyst',
    evidence: ['Log Analytics configuration', 'Monitoring rules'],
    riskLevel: 'medium',
  },
  {
    id: 'SC-7',
    controlFamily: 'System and Communications Protection',
    controlIdentifier: 'SC-7',
    controlName: 'Boundary Protection',
    description: 'Monitor and control communications at the external boundary of the system.',
    azureImplementation: 'Azure Firewall and NSGs provide network boundary protection and monitoring.',
    status: 'implemented',
    implementation: 'Azure Firewall with NSG monitoring',
    lastAssessed: '2024-12-01',
    assessedBy: 'Network Administrator',
    evidence: ['Firewall rules', 'NSG configurations', 'Network monitoring'],
    riskLevel: 'high',
  },
];

const sampleZtaActivities = [
  {
    id: 'zta-1',
    name: 'Identity Verification and Authentication',
    description: 'Implement multi-factor authentication and continuous identity verification.',
    category: 'Identity',
    priority: 'high',
    status: 'in-progress',
    azureImplementation: 'Azure AD with MFA and Conditional Access',
    progress: 75,
    dueDate: '2024-12-31',
    assignedTo: 'Identity Team',
    evidence: ['MFA deployment metrics', 'Conditional access policies'],
  },
  {
    id: 'zta-2',
    name: 'Network Microsegmentation',
    description: 'Implement network microsegmentation to limit lateral movement.',
    category: 'Network',
    priority: 'high',
    status: 'planned',
    azureImplementation: 'Azure Virtual Networks with NSGs and Azure Firewall',
    progress: 25,
    dueDate: '2025-03-31',
    assignedTo: 'Network Team',
    evidence: ['Network segmentation design'],
  },
  {
    id: 'zta-3',
    name: 'Device Trust and Compliance',
    description: 'Establish device trust and compliance verification.',
    category: 'Device',
    priority: 'medium',
    status: 'in-progress',
    azureImplementation: 'Microsoft Intune device compliance policies',
    progress: 60,
    dueDate: '2025-01-31',
    assignedTo: 'Device Management Team',
    evidence: ['Intune compliance reports'],
  },
  {
    id: 'zta-4',
    name: 'Data Classification and Protection',
    description: 'Classify and protect data based on sensitivity and access patterns.',
    category: 'Data',
    priority: 'high',
    status: 'in-progress',
    azureImplementation: 'Microsoft Purview and Azure Information Protection',
    progress: 40,
    dueDate: '2025-02-28',
    assignedTo: 'Data Protection Team',
    evidence: ['Data classification policies', 'Protection metrics'],
  },
];

const samplePoamItems = [
  {
    id: 'poam-001',
    title: 'Implement Multi-Factor Authentication for All Users',
    description: 'Deploy MFA for all user accounts to meet AC-2 requirements.',
    severity: 'high',
    status: 'in-progress',
    dueDate: '2024-12-31',
    assignedTo: 'Identity Team',
    affectedSystems: ['Azure AD', 'All applications'],
    relatedControls: ['AC-2', 'AC-3'],
    progress: 80,
    estimatedCompletion: '2024-12-15',
  },
  {
    id: 'poam-002',
    title: 'Configure Network Segmentation',
    description: 'Implement network microsegmentation to enhance SC-7 boundary protection.',
    severity: 'medium',
    status: 'planned',
    dueDate: '2025-03-31',
    assignedTo: 'Network Team',
    affectedSystems: ['Azure Virtual Network', 'Azure Firewall'],
    relatedControls: ['SC-7'],
    progress: 20,
    estimatedCompletion: '2025-03-15',
  },
];

async function migrateFullData() {
  try {
    console.log('\\n🔗 Connecting to Azure Cosmos DB...');
    
    // Check if the database exists first - DON'T try to create it
    let database;
    try {
      database = client.database(cosmosConfig.databaseId);
      await database.read();
      console.log(`✅ Connected to existing database: ${cosmosConfig.databaseId}`);
    } catch (error) {
      if (error.code === 404) {
        console.error(`❌ Database '${cosmosConfig.databaseId}' does not exist.`);
        console.error('💡 Please create the database using Azure Portal or Azure CLI first.');
        console.error('\\nExample Azure CLI command:');
        console.error(`az cosmosdb sql database create --account-name YOUR_ACCOUNT --resource-group YOUR_RG --name ${cosmosConfig.databaseId}`);
        process.exit(1);
      } else {
        throw error;
      }
    }

    // Create containers and migrate data
    const containers = [
      {
        id: 'nist-controls',
        partitionKey: '/controlFamily',
        data: sampleNistControls
      },
      {
        id: 'zta-activities',
        partitionKey: '/category',
        data: sampleZtaActivities
      },
      {
        id: 'poam-items',
        partitionKey: '/severity',
        data: samplePoamItems
      },
      {
        id: 'vulnerabilities',
        partitionKey: '/severity',
        data: []
      },
      {
        id: 'control-history',
        partitionKey: '/controlId',
        data: []
      }
    ];

    for (const containerInfo of containers) {
      await createContainerAndData(database, containerInfo);
    }

    console.log('\\n🎉 Migration completed successfully!');
    console.log('\\n📊 Summary:');
    console.log(`   • Database: ${cosmosConfig.databaseId}`);
    console.log(`   • NIST Controls: ${sampleNistControls.length} items`);
    console.log(`   • ZTA Activities: ${sampleZtaActivities.length} items`);
    console.log(`   • POAM Items: ${samplePoamItems.length} items`);
    console.log(`   • Empty containers: 2 (vulnerabilities, control-history)`);
    console.log('\\n🚀 You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 403) {
      console.error('\\n💡 This error usually means:');
      console.error('   • Database creation is disabled through the SDK endpoint');
      console.error('   • You need to create the database using Azure Portal or Azure CLI');
      console.error('   • Your Cosmos DB account has restricted public network access');
    }
    throw error;
  }
}

async function createContainerAndData(database, containerInfo) {
  try {
    console.log(`\\n📦 Setting up container: ${containerInfo.id}`);
    
    // Try to create container if it doesn't exist
    try {
      const { container } = await database.containers.createIfNotExists({
        id: containerInfo.id,
        partitionKey: containerInfo.partitionKey
      });
      console.log(`   ✅ Container '${containerInfo.id}' ready`);
      
      // Add data if provided
      if (containerInfo.data && containerInfo.data.length > 0) {
        let insertedCount = 0;
        for (const item of containerInfo.data) {
          try {
            await container.items.upsert(item);
            insertedCount++;
          } catch (error) {
            console.error(`   ❌ Failed to insert item ${item.id}:`, error.message);
          }
        }
        console.log(`   📝 Inserted ${insertedCount}/${containerInfo.data.length} items`);
      } else {
        console.log(`   📝 Container created (no data to insert)`);
      }
      
    } catch (error) {
      if (error.code === 403) {
        console.log(`   ⚠️  Container creation failed - checking if it exists...`);
        // Try to read the existing container
        try {
          const container = database.container(containerInfo.id);
          await container.read();
          console.log(`   ✅ Using existing container: ${containerInfo.id}`);
          
          // Still try to add data to existing container
          if (containerInfo.data && containerInfo.data.length > 0) {
            let insertedCount = 0;
            for (const item of containerInfo.data) {
              try {
                await container.items.upsert(item);
                insertedCount++;
              } catch (error) {
                console.error(`   ❌ Failed to insert item ${item.id}:`, error.message);
              }
            }
            console.log(`   📝 Inserted ${insertedCount}/${containerInfo.data.length} items into existing container`);
          }
        } catch (readError) {
          console.error(`   ❌ Container '${containerInfo.id}' does not exist and cannot be created:`, error.message);
        }
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error(`❌ Failed to set up container '${containerInfo.id}':`, error.message);
    throw error;
  }
}

// Run the migration
migrateFullData();
