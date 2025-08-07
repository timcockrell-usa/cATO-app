/**
 * Enhanced Migration Script for Multi-Cloud cATO Platform
 * Migrates multi-tenant, multi-cloud data to Cosmos DB
 */

import { CosmosClient } from '@azure/cosmos';
import enhancedNISTControlsMultiCloud from '../src/data/nistControlsMultiCloud.js';
import enhancedZTAActivitiesMultiCloud from '../src/data/ztaActivitiesMultiCloud.js';

// Cosmos DB configuration
const cosmosConfig = {
  endpoint: process.env.COSMOS_DB_ENDPOINT || 'https://127.0.0.1:8081',
  key: process.env.COSMOS_DB_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==',
  databaseId: process.env.COSMOS_DB_NAME || 'cato-dashboard'
};

// Initialize Cosmos client
const client = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key
});

const database = client.database(cosmosConfig.databaseId);

// Container configurations for multi-tenant architecture
const containers = {
  tenants: {
    id: 'tenants',
    partitionKey: '/id'
  },
  cloudEnvironments: {
    id: 'cloud-environments',
    partitionKey: '/tenantId'
  },
  nistControlsEnhanced: {
    id: 'nist-controls-enhanced',
    partitionKey: '/tenantId'
  },
  ztaActivitiesEnhanced: {
    id: 'zta-activities-enhanced',
    partitionKey: '/tenantId'
  },
  poamItemsEnhanced: {
    id: 'poam-items-enhanced',
    partitionKey: '/tenantId'
  },
  complianceData: {
    id: 'compliance-data',
    partitionKey: '/tenantId'
  },
  sscMetrics: {
    id: 'ssc-metrics',
    partitionKey: '/tenantId'
  },
  executionEnablers: {
    id: 'execution-enablers',
    partitionKey: '/tenantId'
  },
  auditLogs: {
    id: 'audit-logs',
    partitionKey: '/tenantId'
  }
};

// Sample tenant data
const sampleTenant = {
  id: 'demo-tenant-001',
  organizationName: 'Demo Government Agency',
  organizationType: 'government',
  nistRevision: '5',
  fedRampLevel: 'moderate',
  databaseEndpoint: cosmosConfig.endpoint,
  keyVaultUri: 'https://demo-tenant-001-kv.vault.azure.net/',
  roles: [
    {
      userId: 'admin-user-001',
      email: 'admin@demoagency.gov',
      role: 'authorizing-officer',
      permissions: [
        'view_dashboard',
        'view_controls',
        'view_zta_activities',
        'view_compliance_reports',
        'update_implementation_notes',
        'view_technical_details',
        'assess_controls',
        'create_security_documentation',
        'manage_security_tools',
        'create_poam',
        'update_poam',
        'approve_low_risk_exceptions',
        'approve_medium_risk_exceptions',
        'approve_high_risk_exceptions',
        'manage_risk_assessments',
        'create_risk_reports',
        'grant_ato',
        'revoke_ato',
        'manage_tenant_settings',
        'manage_user_roles',
        'approve_all_exceptions'
      ],
      assignedAt: new Date().toISOString(),
      assignedBy: 'system'
    }
  ],
  cloudEnvironments: ['env-azure-prod-001', 'env-aws-dev-001'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
};

// Sample cloud environments
const sampleCloudEnvironments = [
  {
    id: 'env-azure-prod-001',
    tenantId: 'demo-tenant-001',
    name: 'Azure Production',
    provider: 'azure',
    credentials: {
      keyVaultSecretId: 'azure-prod-credentials'
    },
    region: 'East US 2',
    isActive: true,
    lastSync: new Date().toISOString(),
    syncStatus: 'connected',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'env-aws-dev-001',
    tenantId: 'demo-tenant-001',
    name: 'AWS Development',
    provider: 'aws',
    credentials: {
      keyVaultSecretId: 'aws-dev-credentials'
    },
    region: 'us-east-1',
    isActive: true,
    lastSync: new Date().toISOString(),
    syncStatus: 'connected',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample execution enablers (DOTmLPF-P)
const sampleExecutionEnablers = [
  {
    id: 'enabler-doctrine-001',
    tenantId: 'demo-tenant-001',
    category: 'doctrine',
    name: 'Zero Trust Security Policy',
    description: 'Establish organizational doctrine for zero trust security implementation',
    status: 'complete',
    assignee: 'security-team@demoagency.gov',
    dueDate: '2024-12-31',
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin-user-001',
    evidence: ['ZT-Policy-v1.0.pdf', 'Policy-Approval-Memo.pdf']
  },
  {
    id: 'enabler-organization-001',
    tenantId: 'demo-tenant-001',
    category: 'organization',
    name: 'Cloud Security Team Structure',
    description: 'Establish dedicated cloud security team with defined roles and responsibilities',
    status: 'in-progress',
    assignee: 'hr-team@demoagency.gov',
    dueDate: '2024-06-30',
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin-user-001',
    evidence: ['Org-Chart-Draft.pdf']
  },
  {
    id: 'enabler-training-001',
    tenantId: 'demo-tenant-001',
    category: 'training',
    name: 'Cloud Security Training Program',
    description: 'Develop and implement comprehensive cloud security training for all technical staff',
    status: 'planned',
    assignee: 'training-team@demoagency.gov',
    dueDate: '2024-09-30',
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin-user-001',
    evidence: []
  },
  {
    id: 'enabler-materiel-001',
    tenantId: 'demo-tenant-001',
    category: 'materiel',
    name: 'Security Monitoring Tools',
    description: 'Procure and deploy enterprise security monitoring and SIEM tools',
    status: 'in-progress',
    assignee: 'procurement-team@demoagency.gov',
    dueDate: '2024-08-15',
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin-user-001',
    evidence: ['RFP-Security-Tools.pdf']
  }
];

// Sample SSC metrics
const sampleSSCMetrics = {
  id: 'ssc-metrics-001',
  tenantId: 'demo-tenant-001',
  environmentId: 'env-azure-prod-001',
  sastResults: {
    totalScans: 45,
    criticalVulnerabilities: 2,
    highVulnerabilities: 8,
    mediumVulnerabilities: 23,
    lowVulnerabilities: 67,
    lastScanDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  scaResults: {
    totalComponents: 156,
    vulnerableComponents: 12,
    criticalVulnerabilities: 1,
    highVulnerabilities: 4,
    lastScanDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  containerSecurity: {
    totalImages: 23,
    vulnerableImages: 3,
    criticalVulnerabilities: 0,
    highVulnerabilities: 2,
    lastScanDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  collectedAt: new Date().toISOString()
};

async function createContainers() {
  console.log('Creating containers...');
  
  for (const [name, config] of Object.entries(containers)) {
    try {
      const { container } = await database.containers.createIfNotExists({
        id: config.id,
        partitionKey: config.partitionKey
      });
      console.log(`✓ Container '${config.id}' created/verified`);
    } catch (error) {
      console.error(`✗ Error creating container '${config.id}':`, error.message);
    }
  }
}

async function migrateTenant() {
  console.log('Migrating tenant data...');
  
  try {
    const container = database.container('tenants');
    await container.items.upsert(sampleTenant);
    console.log('✓ Sample tenant migrated');
  } catch (error) {
    console.error('✗ Error migrating tenant:', error.message);
  }
}

async function migrateCloudEnvironments() {
  console.log('Migrating cloud environments...');
  
  try {
    const container = database.container('cloud-environments');
    
    for (const environment of sampleCloudEnvironments) {
      await container.items.upsert(environment);
    }
    
    console.log(`✓ ${sampleCloudEnvironments.length} cloud environments migrated`);
  } catch (error) {
    console.error('✗ Error migrating cloud environments:', error.message);
  }
}

async function migrateNISTControls() {
  console.log('Migrating enhanced NIST controls...');
  
  try {
    const container = database.container('nist-controls-enhanced');
    let migratedCount = 0;
    
    // Create tenant-specific controls
    for (const control of enhancedNISTControlsMultiCloud) {
      const tenantControl = {
        ...control,
        id: `demo-tenant-001-${control.controlIdentifier}`,
        tenantId: 'demo-tenant-001',
        environmentStatus: {
          'env-azure-prod-001': {
            status: Math.random() > 0.3 ? 'compliant' : 'partial',
            lastAssessed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            assessedBy: 'admin-user-001',
            evidence: ['assessment-report.pdf'],
            riskLevel: Math.random() > 0.7 ? 'high' : 'medium'
          },
          'env-aws-dev-001': {
            status: Math.random() > 0.4 ? 'compliant' : 'not-assessed',
            lastAssessed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            assessedBy: 'admin-user-001',
            evidence: [],
            riskLevel: 'low'
          }
        },
        overallStatus: Math.random() > 0.2 ? 'compliant' : 'partial',
        overallRiskLevel: Math.random() > 0.8 ? 'high' : 'medium'
      };
      
      await container.items.upsert(tenantControl);
      migratedCount++;
    }
    
    console.log(`✓ ${migratedCount} enhanced NIST controls migrated`);
  } catch (error) {
    console.error('✗ Error migrating NIST controls:', error.message);
  }
}

async function migrateZTAActivities() {
  console.log('Migrating enhanced ZTA activities...');
  
  try {
    const container = database.container('zta-activities-enhanced');
    let migratedCount = 0;
    
    // Create tenant-specific ZTA activities
    for (const activity of enhancedZTAActivitiesMultiCloud) {
      const tenantActivity = {
        ...activity,
        id: `demo-tenant-001-${activity.activityId}`,
        tenantId: 'demo-tenant-001',
        environmentStatus: {
          'env-azure-prod-001': {
            status: Math.random() > 0.5 ? 'complete' : 'in-progress',
            maturity: Math.floor(Math.random() * 5) + 1,
            lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedBy: 'admin-user-001'
          },
          'env-aws-dev-001': {
            status: Math.random() > 0.6 ? 'in-progress' : 'planned',
            maturity: Math.floor(Math.random() * 4) + 1,
            lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedBy: 'admin-user-001'
          }
        },
        overallStatus: Math.random() > 0.3 ? 'in-progress' : 'complete',
        overallMaturity: Math.floor(Math.random() * 4) + 2
      };
      
      await container.items.upsert(tenantActivity);
      migratedCount++;
    }
    
    console.log(`✓ ${migratedCount} enhanced ZTA activities migrated`);
  } catch (error) {
    console.error('✗ Error migrating ZTA activities:', error.message);
  }
}

async function migrateExecutionEnablers() {
  console.log('Migrating execution enablers...');
  
  try {
    const container = database.container('execution-enablers');
    
    for (const enabler of sampleExecutionEnablers) {
      await container.items.upsert(enabler);
    }
    
    console.log(`✓ ${sampleExecutionEnablers.length} execution enablers migrated`);
  } catch (error) {
    console.error('✗ Error migrating execution enablers:', error.message);
  }
}

async function migrateSSCMetrics() {
  console.log('Migrating SSC metrics...');
  
  try {
    const container = database.container('ssc-metrics');
    await container.items.upsert(sampleSSCMetrics);
    console.log('✓ SSC metrics migrated');
  } catch (error) {
    console.error('✗ Error migrating SSC metrics:', error.message);
  }
}

async function createSampleComplianceData() {
  console.log('Creating sample compliance data...');
  
  try {
    const container = database.container('compliance-data');
    
    const sampleComplianceData = {
      id: `azure-compliance-${Date.now()}`,
      tenantId: 'demo-tenant-001',
      environmentId: 'env-azure-prod-001',
      provider: 'azure',
      collectedAt: new Date().toISOString(),
      rawData: {
        securityFindings: [],
        configCompliance: []
      },
      findings: [
        {
          id: 'finding-001',
          provider: 'azure',
          severity: 'high',
          status: 'fail',
          mappedControls: ['SC-7'],
          resourceId: '/subscriptions/12345/resourceGroups/rg-prod/providers/Microsoft.Network/networkSecurityGroups/nsg-web',
          ruleName: 'Network Security Group allows unrestricted inbound access',
          description: 'NSG rule allows inbound traffic from any source',
          remediation: 'Restrict NSG rules to specific source IP ranges',
          discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastChecked: new Date().toISOString()
        },
        {
          id: 'finding-002',
          provider: 'azure',
          severity: 'medium',
          status: 'fail',
          mappedControls: ['SC-28'],
          resourceId: '/subscriptions/12345/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/storageprod',
          ruleName: 'Storage account encryption at rest',
          description: 'Storage account does not have customer-managed encryption keys',
          remediation: 'Enable customer-managed keys for storage account encryption',
          discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastChecked: new Date().toISOString()
        }
      ]
    };
    
    await container.items.upsert(sampleComplianceData);
    console.log('✓ Sample compliance data created');
  } catch (error) {
    console.error('✗ Error creating compliance data:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting enhanced multi-cloud cATO platform migration...\n');
  
  try {
    await createContainers();
    console.log();
    
    await migrateTenant();
    await migrateCloudEnvironments();
    await migrateNISTControls();
    await migrateZTAActivities();
    await migrateExecutionEnablers();
    await migrateSSCMetrics();
    await createSampleComplianceData();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Tenants: 1`);
    console.log(`   • Cloud Environments: ${sampleCloudEnvironments.length}`);
    console.log(`   • NIST Controls: ${enhancedNISTControlsMultiCloud.length}`);
    console.log(`   • ZTA Activities: ${enhancedZTAActivitiesMultiCloud.length}`);
    console.log(`   • Execution Enablers: ${sampleExecutionEnablers.length}`);
    console.log(`   • SSC Metrics: 1`);
    console.log(`   • Compliance Data: 1`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
