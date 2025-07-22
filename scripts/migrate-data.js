import { CosmosClient } from '@azure/cosmos';
import { nistControlsFromCSV } from '../src/data/nistControlsEnhanced.js';
import { ztaActivitiesFromCSV } from '../src/data/ztaActivitiesEnhanced.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

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

    // Create database and containers if they don't exist (helpful for local development)
    console.log('📦 Ensuring database and containers exist...');
    
    try {
      await database.read();
      console.log(`✅ Database '${cosmosConfig.databaseId}' exists`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`📦 Creating database '${cosmosConfig.databaseId}'...`);
        await client.databases.create({ id: cosmosConfig.databaseId });
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
        }
      }
    }

    // Migrate NIST Controls
    console.log('\n📋 Migrating NIST Controls...');
    const nistContainer = database.container('nist-controls');
    
    for (const control of nistControlsFromCSV) {
      try {
        await nistContainer.items.upsert(control);
        console.log(`✅ Migrated NIST Control: ${control.controlIdentifier} - ${control.controlName}`);
      } catch (error) {
        console.error(`❌ Failed to migrate NIST Control ${control.controlIdentifier}:`, error.message);
      }
    }

    // Migrate ZTA Activities
    console.log('\n🛡️  Migrating ZTA Activities...');
    const ztaContainer = database.container('zta-activities');
    
    for (const activity of ztaActivitiesFromCSV) {
      try {
        await ztaContainer.items.upsert(activity);
        console.log(`✅ Migrated ZTA Activity: ${activity.activityId} - ${activity.activityName}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ZTA Activity ${activity.activityId}:`, error.message);
      }
    }

    // Create sample POAM items
    console.log('\n📝 Creating sample POA&M items...');
    const poamContainer = database.container('poam-items');
    
    const samplePoamItems = [
      {
        id: 'POAM-001',
        title: 'Complete Conditional Access Implementation',
        description: 'Finalize implementation of Conditional Access policies for all applications and users.',
        relatedControls: ['AC-3', 'AC-4'],
        riskLevel: 'medium',
        status: 'in-progress',
        assignee: 'security-team@usafricom.mil',
        dueDate: '2025-03-15',
        createdDate: '2024-12-01',
        lastUpdated: '2024-12-15',
        mitigationSteps: [
          'Review current Conditional Access policies',
          'Identify gaps in application coverage',
          'Implement missing policies for high-risk applications',
          'Test policies in staging environment',
          'Deploy to production with monitoring'
        ],
        evidence: ['Conditional Access policy exports', 'Test results documentation']
      },
      {
        id: 'POAM-002',
        title: 'Implement Network Micro-Segmentation',
        description: 'Deploy comprehensive network micro-segmentation using NSGs and Azure Firewall.',
        relatedControls: ['SC-7', 'AC-4'],
        riskLevel: 'high',
        status: 'open',
        assignee: 'network-team@usafricom.mil',
        dueDate: '2025-02-28',
        createdDate: '2024-11-15',
        lastUpdated: '2024-12-10',
        mitigationSteps: [
          'Design network segmentation architecture',
          'Configure Network Security Groups',
          'Deploy Azure Firewall Premium',
          'Implement micro-segmentation rules',
          'Validate traffic flow and security'
        ],
        evidence: []
      },
      {
        id: 'POAM-003',
        title: 'Establish Interconnection Security Agreements',
        description: 'Complete ISAs for all external system connections.',
        relatedControls: ['CA-3', 'SA-9'],
        riskLevel: 'medium',
        status: 'open',
        assignee: 'legal-team@usafricom.mil',
        dueDate: '2025-04-30',
        createdDate: '2024-10-01',
        lastUpdated: '2024-12-01',
        mitigationSteps: [
          'Identify all external system connections',
          'Draft ISA templates',
          'Engage with external partners',
          'Negotiate and finalize agreements',
          'Implement technical controls per ISAs'
        ],
        evidence: ['Draft ISA documents', 'Partner correspondence']
      }
    ];

    for (const poam of samplePoamItems) {
      try {
        await poamContainer.items.upsert(poam);
        console.log(`✅ Created POA&M: ${poam.id} - ${poam.title}`);
      } catch (error) {
        console.error(`❌ Failed to create POA&M ${poam.id}:`, error.message);
      }
    }

    // Create sample vulnerability data
    console.log('\n🔍 Creating sample vulnerability data...');
    const vulnContainer = database.container('vulnerabilities');
    
    const sampleVulnerabilities = [
      {
        id: 'VULN-001',
        vulnerabilityId: 'CVE-2024-12345',
        severity: 'high',
        affectedControls: ['SI-2', 'RA-5'],
        description: 'Critical vulnerability in Azure VM operating system requiring immediate patching.',
        discoveryDate: '2024-12-01',
        status: 'open',
        assignee: 'patching-team@usafricom.mil',
        dueDate: '2024-12-31'
      },
      {
        id: 'VULN-002',
        vulnerabilityId: 'CVE-2024-67890',
        severity: 'medium',
        affectedControls: ['SI-2', 'CM-6'],
        description: 'Medium severity vulnerability in web application framework.',
        discoveryDate: '2024-11-15',
        status: 'in-progress',
        assignee: 'dev-team@usafricom.mil',
        dueDate: '2025-01-15'
      }
    ];

    for (const vuln of sampleVulnerabilities) {
      try {
        await vulnContainer.items.upsert(vuln);
        console.log(`✅ Created Vulnerability: ${vuln.vulnerabilityId} - ${vuln.severity}`);
      } catch (error) {
        console.error(`❌ Failed to create Vulnerability ${vuln.vulnerabilityId}:`, error.message);
      }
    }

    console.log('\n🎉 Data migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - NIST Controls: ${nistControlsFromCSV.length} migrated`);
    console.log(`   - ZTA Activities: ${ztaActivitiesFromCSV.length} migrated`);
    console.log(`   - POA&M Items: ${samplePoamItems.length} created`);
    console.log(`   - Vulnerabilities: ${sampleVulnerabilities.length} created`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData().catch(console.error);
