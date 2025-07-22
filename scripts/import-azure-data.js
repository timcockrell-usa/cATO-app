#!/usr/bin/env node

/**
 * Azure Environment Data Import Script
 * 
 * This script connects to your existing Azure environment and imports:
 * - CosmosDB data from existing databases
 * - Azure Resource information
 * - Security configurations
 * - Compliance data
 * 
 * Usage: npm run import-azure-data
 */

import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ComputeManagementClient } from '@azure/arm-compute';
import { NetworkManagementClient } from '@azure/arm-network';
import { SecurityCenter } from '@azure/arm-security';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log('🔄 Azure Environment Data Import Tool\n');

// Configuration
const config = {
  // Source Azure environment (your existing Azure setup)
  sourceSubscriptionId: process.env.AZURE_SOURCE_SUBSCRIPTION_ID,
  sourceCosmosEndpoint: process.env.AZURE_SOURCE_COSMOS_ENDPOINT,
  sourceCosmosKey: process.env.AZURE_SOURCE_COSMOS_KEY,
  sourceCosmosDatabase: process.env.AZURE_SOURCE_COSMOS_DATABASE,
  
  // Target local/development environment
  targetCosmosEndpoint: process.env.AZURE_COSMOS_ENDPOINT || process.env.VITE_COSMOS_DB_ENDPOINT,
  targetCosmosKey: process.env.AZURE_COSMOS_KEY || process.env.VITE_COSMOS_DB_KEY,
  targetCosmosDatabase: process.env.AZURE_COSMOS_DATABASE_NAME || process.env.VITE_COSMOS_DB_NAME || 'cato-dashboard-local',
  
  // Resource group to scan for data
  resourceGroupName: process.env.AZURE_SOURCE_RESOURCE_GROUP,
};

// Validate required configuration
function validateConfig() {
  const requiredFields = [
    'sourceSubscriptionId',
    'targetCosmosEndpoint', 
    'targetCosmosKey'
  ];

  const missing = requiredFields.filter(field => !config[field as keyof typeof config]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(field => {
      console.error(`   - AZURE_${field.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
    });
    console.error('\nAdd these to your .env.local file or environment variables.');
    process.exit(1);
  }
}

// Initialize clients
function initializeClients() {
  const credential = new DefaultAzureCredential();
  
  const resourceClient = new ResourceManagementClient(
    credential,
    config.sourceSubscriptionId!
  );
  
  const computeClient = new ComputeManagementClient(
    credential,
    config.sourceSubscriptionId!
  );
  
  const networkClient = new NetworkManagementClient(
    credential,
    config.sourceSubscriptionId!
  );
  
  const securityClient = new SecurityCenter(
    credential,
    config.sourceSubscriptionId!
  );
  
  const sourceCosmosClient = config.sourceCosmosEndpoint && config.sourceCosmosKey ? 
    new CosmosClient({
      endpoint: config.sourceCosmosEndpoint,
      key: config.sourceCosmosKey,
    }) : null;
  
  const targetCosmosClient = new CosmosClient({
    endpoint: config.targetCosmosEndpoint!,
    key: config.targetCosmosKey!,
  });

  return {
    resourceClient,
    computeClient,
    networkClient,
    securityClient,
    sourceCosmosClient,
    targetCosmosClient
  };
}

// Import CosmosDB data from existing database
async function importCosmosData(sourceClient: CosmosClient, targetClient: CosmosClient) {
  console.log('📊 Importing CosmosDB data...');
  
  try {
    const sourceDb = sourceClient.database(config.sourceCosmosDatabase!);
    const targetDb = targetClient.database(config.targetCosmosDatabase!);
    
    // Ensure target database exists
    try {
      await targetDb.read();
    } catch (error) {
      console.log(`📦 Creating target database: ${config.targetCosmosDatabase}`);
      await targetClient.databases.create({ id: config.targetCosmosDatabase! });
    }
    
    // List containers to import
    const { resources: containers } = await sourceDb.containers.readAll().fetchAll();
    
    for (const container of containers) {
      console.log(`📂 Importing container: ${container.id}`);
      
      try {
        const sourceContainer = sourceDb.container(container.id);
        
        // Create container in target if it doesn't exist
        try {
          const targetContainer = targetDb.container(container.id);
          await targetContainer.read();
        } catch {
          const containerDef = await sourceContainer.read();
          await targetDb.containers.create({
            id: container.id,
            partitionKey: containerDef.resource?.partitionKey,
          });
        }
        
        const targetContainer = targetDb.container(container.id);
        
        // Import all items
        const { resources: items } = await sourceContainer.items.readAll().fetchAll();
        
        for (const item of items) {
          try {
            await targetContainer.items.upsert(item);
          } catch (error) {
            console.warn(`⚠️  Failed to import item ${item.id}:`, (error as any).message);
          }
        }
        
        console.log(`✅ Imported ${items.length} items from ${container.id}`);
        
      } catch (error) {
        console.error(`❌ Failed to import container ${container.id}:`, (error as any).message);
      }
    }
    
  } catch (error) {
    console.error('❌ CosmosDB import failed:', (error as any).message);
    throw error;
  }
}

// Import Azure Resource information
async function importAzureResources(resourceClient: ResourceManagementClient, targetClient: CosmosClient) {
  console.log('🏗️  Importing Azure resources...');
  
  try {
    const targetDb = targetClient.database(config.targetCosmosDatabase!);
    
    // Ensure azure-resources container exists
    try {
      await targetDb.container('azure-resources').read();
    } catch {
      await targetDb.containers.create({
        id: 'azure-resources',
        partitionKey: '/resourceType'
      });
    }
    
    const resourcesContainer = targetDb.container('azure-resources');
    
    // Get resources from specified resource group or all resource groups
    const resourceGroupName = config.resourceGroupName;
    
    const resources = resourceGroupName ? 
      await resourceClient.resources.listByResourceGroup(resourceGroupName).next() :
      await resourceClient.resources.list().next();
    
    let importCount = 0;
    
    for await (const resource of resources) {
      const resourceDoc = {
        id: resource.name!,
        resourceId: resource.id,
        name: resource.name,
        type: resource.type,
        resourceType: resource.type?.split('/')[1] || 'unknown',
        location: resource.location,
        resourceGroupName: resource.id?.split('/')[4],
        subscriptionId: config.sourceSubscriptionId,
        tags: resource.tags || {},
        importDate: new Date().toISOString(),
        properties: resource.properties || {}
      };
      
      try {
        await resourcesContainer.items.upsert(resourceDoc);
        importCount++;
      } catch (error) {
        console.warn(`⚠️  Failed to import resource ${resource.name}:`, (error as any).message);
      }
    }
    
    console.log(`✅ Imported ${importCount} Azure resources`);
    
  } catch (error) {
    console.error('❌ Azure resources import failed:', (error as any).message);
  }
}

// Import security assessments
async function importSecurityData(securityClient: SecurityCenter, targetClient: CosmosClient) {
  console.log('🔒 Importing security assessments...');
  
  try {
    const targetDb = targetClient.database(config.targetCosmosDatabase!);
    
    // Ensure security-assessments container exists
    try {
      await targetDb.container('security-assessments').read();
    } catch {
      await targetDb.containers.create({
        id: 'security-assessments',
        partitionKey: '/severity'
      });
    }
    
    const securityContainer = targetDb.container('security-assessments');
    
    // Get security assessments
    const assessments = securityClient.assessments.list(
      `/subscriptions/${config.sourceSubscriptionId}`
    );
    
    let importCount = 0;
    
    for await (const assessment of assessments) {
      const assessmentDoc = {
        id: assessment.name!,
        assessmentId: assessment.id,
        name: assessment.name,
        displayName: assessment.displayName,
        status: assessment.status?.code,
        severity: assessment.status?.severity || 'medium',
        description: assessment.metadata?.description,
        remediationDescription: assessment.metadata?.remediationDescription,
        categories: assessment.metadata?.categories || [],
        userImpact: assessment.metadata?.userImpact,
        implementationEffort: assessment.metadata?.implementationEffort,
        threats: assessment.metadata?.threats || [],
        importDate: new Date().toISOString()
      };
      
      try {
        await securityContainer.items.upsert(assessmentDoc);
        importCount++;
      } catch (error) {
        console.warn(`⚠️  Failed to import assessment ${assessment.name}:`, (error as any).message);
      }
    }
    
    console.log(`✅ Imported ${importCount} security assessments`);
    
  } catch (error) {
    console.error('❌ Security data import failed:', (error as any).message);
  }
}

// Generate summary report
function generateImportReport(summary: any) {
  const reportPath = path.join(__dirname, '../import-report.json');
  const report = {
    importDate: new Date().toISOString(),
    sourceSubscription: config.sourceSubscriptionId,
    targetDatabase: config.targetCosmosDatabase,
    summary,
    config: {
      ...config,
      // Don't include sensitive keys in report
      sourceCosmosKey: config.sourceCosmosKey ? '***' : undefined,
      targetCosmosKey: '***'
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Import report saved: ${reportPath}`);
}

// Main execution
async function main() {
  console.log('🚀 Starting Azure environment data import...\n');
  
  validateConfig();
  console.log('✅ Configuration validated\n');
  
  const clients = initializeClients();
  const summary = {
    cosmosData: 0,
    azureResources: 0,
    securityAssessments: 0,
    errors: []
  };
  
  try {
    // Import CosmosDB data if source is configured
    if (clients.sourceCosmosClient && config.sourceCosmosDatabase) {
      await importCosmosData(clients.sourceCosmosClient, clients.targetCosmosClient);
      summary.cosmosData = 1; // Simplified counting
    } else {
      console.log('⚠️  Skipping CosmosDB import - source database not configured');
    }
    
    // Import Azure resources
    await importAzureResources(clients.resourceClient, clients.targetCosmosClient);
    
    // Import security data
    await importSecurityData(clients.securityClient, clients.targetCosmosClient);
    
    console.log('\n🎉 Import completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - CosmosDB data: ${summary.cosmosData ? 'Imported' : 'Skipped'}`);
    console.log(`   - Azure resources: Imported`);
    console.log(`   - Security assessments: Imported`);
    
    generateImportReport(summary);
    
  } catch (error) {
    console.error('\n❌ Import failed:', (error as any).message);
    summary.errors.push((error as any).message);
    generateImportReport(summary);
    process.exit(1);
  }
}

// Handle CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
