#!/usr/bin/env node

/**
 * Multi-Subscription Azure Data Export Script
 * 
 * This script can export data from one or all of your Azure subscriptions
 * to help you get a complete view of your Azure environment.
 * 
 * Usage:
 *   npm run export-azure-data                    # Current subscription only
 *   npm run export-azure-data -- --all          # All enabled subscriptions
 *   npm run export-azure-data -- --subscription=<sub-id-or-name>  # Specific subscription
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const allSubscriptions = args.includes('--all-subscriptions') || args.includes('--all');
const specificSubscription = args.find(arg => arg.startsWith('--subscription='))?.split('=')[1];

console.log('� Multi-Subscription Azure Data Export Helper');
console.log('================================================\n');

// Create export directory
const exportDir = path.join(__dirname, '../exported-data');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
  console.log(`📁 Created export directory: ${exportDir}\n`);
}

// Check Azure CLI login status
function checkAzureLogin() {
  try {
    const result = execSync('az account show --output json', { encoding: 'utf8' });
    const account = JSON.parse(result);
    console.log('✅ Azure CLI is logged in');
    console.log(`   Account: ${account.user.name}`);
    console.log(`   Current subscription: ${account.name} (${account.id})`);
    console.log(`   Tenant: ${account.tenantId}\n`);
    return account;
  } catch (error) {
    console.log('❌ Not logged in to Azure CLI');
    console.log('   Please run: az login\n');
    process.exit(1);
  }
}

// Get all available subscriptions
function getAllSubscriptions() {
  try {
    console.log('📋 Getting all available subscriptions...');
    const result = execSync('az account list --output json', { encoding: 'utf8' });
    const allSubs = JSON.parse(result);
    
    // Filter to enabled subscriptions only
    const enabledSubs = allSubs.filter(sub => sub.state === 'Enabled');
    
    console.log(`Found ${enabledSubs.length} enabled subscription(s):`);
    enabledSubs.forEach((sub, index) => {
      console.log(`  ${index + 1}. ✅ ${sub.name}`);
      console.log(`     ID: ${sub.id}`);
      console.log(`     Tenant: ${sub.tenantId}`);
    });
    console.log('');
    
    return enabledSubs;
  } catch (error) {
    console.log('❌ Failed to list subscriptions');
    throw error;
  }
}

// Set active subscription
function setActiveSubscription(subscriptionId) {
  try {
    execSync(`az account set --subscription "${subscriptionId}"`, { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.log(`❌ Failed to set subscription ${subscriptionId}`);
    return false;
  }
}

// Export data for a single subscription
function exportSubscriptionData(subscription, subscriptionIndex = 0, totalSubscriptions = 1) {
  const subPrefix = totalSubscriptions > 1 ? `[${subscriptionIndex + 1}/${totalSubscriptions}] ` : '';
  console.log(`\n🔄 ${subPrefix}Processing subscription: ${subscription.name}`);
  console.log(`   ID: ${subscription.id}`);
  
  // Set active subscription
  if (!setActiveSubscription(subscription.id)) {
    console.log(`   ⚠️  Skipping ${subscription.name} - cannot set as active subscription`);
    return { subscription: subscription.name, success: false, error: 'Cannot set subscription' };
  }
  
  const subscriptionData = {
    subscription: {
      id: subscription.id,
      name: subscription.name,
      tenantId: subscription.tenantId,
      state: subscription.state
    },
    resources: [],
    cosmosdbAccounts: [],
    securityAssessments: [],
    resourceGroups: [],
    summary: {}
  };
  
  try {
    // Export resource groups
    console.log(`   � Exporting resource groups...`);
    const groupsResult = execSync('az group list --output json', { encoding: 'utf8' });
    subscriptionData.resourceGroups = JSON.parse(groupsResult);
    console.log(`   ✅ Found ${subscriptionData.resourceGroups.length} resource groups`);
    
    // Export all resources
    console.log(`   🏗️  Exporting all resources...`);
    const resourcesResult = execSync('az resource list --output json', { encoding: 'utf8' });
    subscriptionData.resources = JSON.parse(resourcesResult);
    console.log(`   ✅ Found ${subscriptionData.resources.length} resources`);
    
    // Group resources by type for summary
    const resourcesByType = subscriptionData.resources.reduce((acc, resource) => {
      const type = resource.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    subscriptionData.summary.resourcesByType = resourcesByType;
    
    // Export CosmosDB accounts
    console.log(`   🗄️  Exporting CosmosDB accounts...`);
    try {
      const cosmosResult = execSync('az cosmosdb list --output json', { encoding: 'utf8' });
      subscriptionData.cosmosdbAccounts = JSON.parse(cosmosResult);
      console.log(`   ✅ Found ${subscriptionData.cosmosdbAccounts.length} CosmosDB accounts`);
      
      // Get keys for each CosmosDB account
      for (const account of subscriptionData.cosmosdbAccounts) {
        try {
          const keysResult = execSync(`az cosmosdb keys list --name "${account.name}" --resource-group "${account.resourceGroup}" --output json`, { encoding: 'utf8' });
          const keys = JSON.parse(keysResult);
          account.connectionInfo = {
            endpoint: account.documentEndpoint,
            primaryKey: keys.primaryMasterKey,
            secondaryKey: keys.secondaryMasterKey
          };
          console.log(`     ✅ Got keys for ${account.name}`);
        } catch (error) {
          console.log(`     ⚠️  Could not get keys for ${account.name} (insufficient permissions)`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  No CosmosDB accounts or insufficient permissions`);
    }
    
    // Export security assessments
    console.log(`   🔒 Exporting security assessments...`);
    try {
      const securityResult = execSync('az security assessment list --output json', { encoding: 'utf8' });
      subscriptionData.securityAssessments = JSON.parse(securityResult);
      console.log(`   ✅ Found ${subscriptionData.securityAssessments.length} security assessments`);
    } catch (error) {
      console.log(`   ⚠️  Could not export security assessments (insufficient permissions or not enabled)`);
    }
    
    console.log(`   ✅ Completed export for ${subscription.name}`);
    return { ...subscriptionData, success: true };
    
  } catch (error) {
    console.log(`   ❌ Error exporting ${subscription.name}: ${error.message}`);
    return { subscription: subscription.name, success: false, error: error.message };
  }
}

// Generate consolidated environment configuration
function generateConsolidatedEnvConfig(allData) {
  console.log('\n� Generating environment configuration...');
  
  // Find the best CosmosDB account to use for import
  let bestCosmosAccount = null;
  let bestSubscription = null;
  
  for (const subData of allData) {
    if (subData.success && subData.cosmosdbAccounts && subData.cosmosdbAccounts.length > 0) {
      for (const account of subData.cosmosdbAccounts) {
        if (account.connectionInfo && account.connectionInfo.primaryKey) {
          bestCosmosAccount = account;
          bestSubscription = subData.subscription;
          break;
        }
      }
      if (bestCosmosAccount) break;
    }
  }
  
  let envConfig = `# Multi-Subscription Azure Environment Configuration
# Generated on ${new Date().toISOString()}
# ===================================================

# 📊 SUMMARY
# Total subscriptions scanned: ${allData.filter(d => d.success).length}
# Total resources found: ${allData.reduce((sum, d) => sum + (d.resources?.length || 0), 0)}
# Total CosmosDB accounts: ${allData.reduce((sum, d) => sum + (d.cosmosdbAccounts?.length || 0), 0)}

# 🔧 AZURE DATA IMPORT CONFIGURATION
# ==========================================
`;

  if (bestSubscription && bestCosmosAccount) {
    envConfig += `
# Primary subscription for import (has accessible CosmosDB)
AZURE_SOURCE_SUBSCRIPTION_ID=${bestSubscription.id}

# Primary resource group (CosmosDB account location)
AZURE_SOURCE_RESOURCE_GROUP=${bestCosmosAccount.resourceGroup}

# CosmosDB connection details
AZURE_SOURCE_COSMOS_ENDPOINT=${bestCosmosAccount.documentEndpoint}
AZURE_SOURCE_COSMOS_KEY=${bestCosmosAccount.connectionInfo.primaryKey}
AZURE_SOURCE_COSMOS_DATABASE=your-database-name-here

# Tenant information
AZURE_SOURCE_TENANT_ID=${bestSubscription.tenantId}
`;
  } else {
    // Use the first successful subscription
    const firstSuccessfulSub = allData.find(d => d.success);
    if (firstSuccessfulSub) {
      envConfig += `
# Primary subscription for import
AZURE_SOURCE_SUBSCRIPTION_ID=${firstSuccessfulSub.subscription.id}

# Note: No accessible CosmosDB accounts found - you may need to:
# 1. Ensure you have Cosmos DB Account Reader permissions
# 2. Create a CosmosDB account for data import
# 3. Manually set AZURE_SOURCE_COSMOS_* values

# Tenant information
AZURE_SOURCE_TENANT_ID=${firstSuccessfulSub.subscription.tenantId}
`;
    }
  }
  
  fs.writeFileSync(path.join(exportDir, 'env-config.txt'), envConfig);
  console.log('   ✅ Environment configuration saved to exported-data/env-config.txt');
}

// Generate comprehensive summary report
function generateSummaryReport(allData) {
  console.log('\n📊 Generating summary report...');
  
  const successfulExports = allData.filter(d => d.success);
  const failedExports = allData.filter(d => !d.success);
  
  // Aggregate data across all subscriptions
  const totalResources = successfulExports.reduce((sum, d) => sum + (d.resources?.length || 0), 0);
  const totalCosmosDB = successfulExports.reduce((sum, d) => sum + (d.cosmosdbAccounts?.length || 0), 0);
  const totalResourceGroups = successfulExports.reduce((sum, d) => sum + (d.resourceGroups?.length || 0), 0);
  
  // Aggregate resource types across all subscriptions
  const allResourceTypes = {};
  successfulExports.forEach(subData => {
    if (subData.summary && subData.summary.resourcesByType) {
      Object.entries(subData.summary.resourcesByType).forEach(([type, count]) => {
        allResourceTypes[type] = (allResourceTypes[type] || 0) + count;
      });
    }
  });
  
  const report = {
    exportTimestamp: new Date().toISOString(),
    summary: {
      totalSubscriptions: allData.length,
      successfulExports: successfulExports.length,
      failedExports: failedExports.length,
      totalResources,
      totalCosmosDBAccounts: totalCosmosDB,
      totalResourceGroups
    },
    subscriptions: allData.map(subData => ({
      name: subData.subscription?.name || subData.subscription,
      id: subData.subscription?.id,
      success: subData.success,
      error: subData.error,
      resourceCount: subData.resources?.length || 0,
      cosmosDBCount: subData.cosmosdbAccounts?.length || 0,
      resourceGroupCount: subData.resourceGroups?.length || 0
    })),
    resourceTypesSummary: allResourceTypes,
    recommendations: []
  };
  
  // Add recommendations
  if (totalCosmosDB === 0) {
    report.recommendations.push("Consider creating a CosmosDB account to store your security compliance data");
  }
  if (failedExports.length > 0) {
    report.recommendations.push("Some subscriptions failed to export - check your permissions");
  }
  if (totalResources > 1000) {
    report.recommendations.push("Large environment detected - consider using resource tagging for better organization");
  }
  
  fs.writeFileSync(path.join(exportDir, 'multi-subscription-summary.json'), JSON.stringify(report, null, 2));
  console.log('   ✅ Summary report saved to exported-data/multi-subscription-summary.json');
  
  // Print summary to console
  console.log('\n� EXPORT SUMMARY');
  console.log('=================');
  console.log(`Subscriptions processed: ${report.summary.totalSubscriptions}`);
  console.log(`Successful exports: ${report.summary.successfulExports}`);
  console.log(`Failed exports: ${report.summary.failedExports}`);
  console.log(`Total resources: ${report.summary.totalResources}`);
  console.log(`Total CosmosDB accounts: ${report.summary.totalCosmosDBAccounts}`);
  console.log(`Total resource groups: ${report.summary.totalResourceGroups}`);
  
  if (Object.keys(allResourceTypes).length > 0) {
    console.log('\nTop resource types:');
    Object.entries(allResourceTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
  }
}

// Generate import instructions
function generateImportInstructions() {
  const instructions = `# Multi-Subscription Azure Data Import Instructions

## Files Exported:

### Per Subscription:
- subscription-{name}-data.json: Complete data for each subscription
- multi-subscription-summary.json: Consolidated summary across all subscriptions

### Consolidated Files:
- env-config.txt: Environment variables for .env.local
- IMPORT_INSTRUCTIONS.md: These instructions

## Import Options:

### Option 1: Quick Import (Recommended)
\`\`\`powershell
# 1. Copy environment configuration
Get-Content exported-data/env-config.txt | Set-Clipboard
# Paste into your .env.local file

# 2. Run automated import
npm run import-azure-data

# 3. Start your app
npm run dev
\`\`\`

### Option 2: Selective Import
\`\`\`powershell
# Import only CosmosDB data
npm run import-azure-data -- --cosmos-only

# Import only resources metadata
npm run import-azure-data -- --resources-only

# Import only security assessments
npm run import-azure-data -- --security-only
\`\`\`

### Option 3: Subscription-Specific Import
\`\`\`powershell
# Import from a specific subscription
npm run import-azure-data -- --subscription="subscription-name-or-id"
\`\`\`

## Next Steps:

1. **Review the summary**: Check multi-subscription-summary.json for overview
2. **Configure import**: Copy env-config.txt to your .env.local
3. **Run import**: Execute npm run import-azure-data
4. **Verify data**: Start app with npm run dev
5. **Check database**: Open https://localhost:8081/_explorer/index.html

## Troubleshooting:

### Permission Issues:
- Ensure you have Reader role on all subscriptions
- For CosmosDB data: Need Cosmos DB Account Reader role
- For security data: Need Security Reader role

### Large Datasets:
- Use selective import options for large environments
- Consider filtering by resource groups or specific subscription

### Missing Data:
- Check the summary report for failed subscriptions
- Review Azure CLI permissions with: az role assignment list

## Manual Data Review:

You can review the exported data before importing:
- Open exported JSON files to see what data is available
- Check subscription-specific data files for detailed resource information
- Review security assessments for compliance data
`;

  fs.writeFileSync(path.join(exportDir, 'IMPORT_INSTRUCTIONS.md'), instructions);
  console.log('   ✅ Import instructions saved to exported-data/IMPORT_INSTRUCTIONS.md');
}

// Export security assessments
function exportSecurityData() {
  try {
    console.log('🔒 Exporting security assessments...');
    const account = execSync('az account show --output json', { encoding: 'utf8' });
    const accountInfo = JSON.parse(account);
    
    const result = execSync(`az security assessment list --output json`, { encoding: 'utf8' });
    const assessments = JSON.parse(result);
    
    fs.writeFileSync(path.join(exportDir, 'security-assessments.json'), JSON.stringify(assessments, null, 2));
    console.log(`   ✅ Exported ${assessments.length} security assessments`);
    
  } catch (error) {
    console.log('❌ Failed to export security data - this requires Security Center permissions');
  }
}

// Generate environment configuration
function generateEnvConfig() {
  console.log('\n⚙️  Generating .env.local configuration...');
  
  const account = JSON.parse(execSync('az account show --output json', { encoding: 'utf8' }));
  
  let envConfig = `# Generated Azure import configuration
# Copy these values to your .env.local file

# Source subscription for data import
AZURE_SOURCE_SUBSCRIPTION_ID=${account.id}

# Optional: Specify a resource group to limit the scope
# AZURE_SOURCE_RESOURCE_GROUP=your-resource-group-name

`;

  // Add CosmosDB configuration if available
  const cosmosAccountsFile = path.join(exportDir, 'cosmosdb-accounts.json');
  if (fs.existsSync(cosmosAccountsFile)) {
    const accounts = JSON.parse(fs.readFileSync(cosmosAccountsFile, 'utf8'));
    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      envConfig += `# CosmosDB configuration (from ${firstAccount.name})
AZURE_SOURCE_COSMOS_ENDPOINT=${firstAccount.documentEndpoint}
# AZURE_SOURCE_COSMOS_KEY=get-this-from-cosmosdb-${firstAccount.name}-connection.json
# AZURE_SOURCE_COSMOS_DATABASE=your-database-name

`;
    }
  }
  
  fs.writeFileSync(path.join(exportDir, 'env-config.txt'), envConfig);
  console.log('   ✅ Environment configuration saved to exported-data/env-config.txt');
}

// Generate import instructions
function generateInstructions() {
  const instructions = `# Azure Data Import Instructions

## Files Exported:
- all-resources.json: Complete list of your Azure resources
- cosmosdb-accounts.json: CosmosDB account information
- cosmosdb-*-connection.json: Connection details for each CosmosDB account
- security-assessments.json: Security Center assessments
- env-config.txt: Environment variables for .env.local

## Next Steps:

1. **Copy environment configuration:**
   - Open exported-data/env-config.txt
   - Copy the configuration to your .env.local file
   - Fill in any missing values (like AZURE_SOURCE_COSMOS_KEY)

2. **Get CosmosDB keys:**
   - Check cosmosdb-*-connection.json files for connection details
   - Copy the primaryKey to your AZURE_SOURCE_COSMOS_KEY variable

3. **Run the import:**
   \`\`\`powershell
   npm run import-azure-data
   \`\`\`

4. **Verify imported data:**
   \`\`\`powershell
   npm run dev
   # Open https://localhost:8081/_explorer/index.html to see imported data
   \`\`\`

## Troubleshooting:

- If import fails, check your Azure CLI permissions
- Ensure you have Reader access on the subscription
- For CosmosDB import, you need Cosmos DB Account Reader role
- For security data, you need Security Reader role

## Manual Import (if automated import fails):

You can manually copy data from the exported JSON files into your local CosmosDB emulator using the Data Explorer at https://localhost:8081/_explorer/index.html
`;

  fs.writeFileSync(path.join(exportDir, 'IMPORT_INSTRUCTIONS.md'), instructions);
  console.log('   ✅ Import instructions saved to exported-data/IMPORT_INSTRUCTIONS.md');
}

// Main execution
async function main() {
  console.log('🚀 Starting multi-subscription Azure data export...\n');
  
  // Check login and get current account
  const currentAccount = checkAzureLogin();
  
  // Get all available subscriptions
  const allSubscriptions = getAllSubscriptions();
  
  if (allSubscriptions.length === 0) {
    console.log('❌ No enabled subscriptions found');
    process.exit(1);
  }
  
  // Determine which subscriptions to process
  let subscriptionsToProcess = [];
  
  if (specificSubscription) {
    const targetSub = allSubscriptions.find(sub => 
      sub.id === specificSubscription || 
      sub.name === specificSubscription ||
      sub.id.includes(specificSubscription) ||
      sub.name.toLowerCase().includes(specificSubscription.toLowerCase())
    );
    if (targetSub) {
      subscriptionsToProcess = [targetSub];
      console.log(`🎯 Processing specific subscription: ${targetSub.name}\n`);
    } else {
      console.error(`❌ Subscription "${specificSubscription}" not found`);
      console.log('Available subscriptions:');
      allSubscriptions.forEach(sub => console.log(`   - ${sub.name} (${sub.id})`));
      process.exit(1);
    }
  } else if (allSubscriptions) {
    subscriptionsToProcess = allSubscriptions;
    console.log(`🌐 Processing ALL ${allSubscriptions.length} enabled subscriptions\n`);
    if (allSubscriptions.length > 5) {
      console.log('⚠️  You have many subscriptions - this may take a while...\n');
    }
  } else {
    // Default to current subscription only
    const currentSub = allSubscriptions.find(sub => sub.id === currentAccount.id);
    subscriptionsToProcess = currentSub ? [currentSub] : [allSubscriptions[0]];
    console.log(`📍 Processing current subscription only: ${subscriptionsToProcess[0].name}`);
    console.log('💡 Tip: Use --all to scan all your subscriptions\n');
  }
  
  // Export data from each subscription
  const allExportedData = [];
  console.log('📤 Starting export process...\n');
  
  for (let i = 0; i < subscriptionsToProcess.length; i++) {
    const subscription = subscriptionsToProcess[i];
    const exportResult = exportSubscriptionData(subscription, i, subscriptionsToProcess.length);
    
    // Save individual subscription data
    if (exportResult.success) {
      const filename = `subscription-${subscription.name.replace(/[^a-zA-Z0-9]/g, '-')}-data.json`;
      fs.writeFileSync(path.join(exportDir, filename), JSON.stringify(exportResult, null, 2));
      console.log(`   💾 Saved data to ${filename}`);
    }
    
    allExportedData.push(exportResult);
  }
  
  // Generate consolidated reports
  generateConsolidatedEnvConfig(allExportedData);
  generateSummaryReport(allExportedData);
  generateImportInstructions();
  
  // Reset to original subscription
  setActiveSubscription(currentAccount.id);
  
  console.log('\n🎉 Multi-subscription export completed!');
  console.log(`📁 All data exported to: ${exportDir}`);
  console.log('📖 Read IMPORT_INSTRUCTIONS.md for next steps');
  console.log('\n💡 Quick next steps:');
  console.log('   1. Review multi-subscription-summary.json for overview');
  console.log('   2. Copy env-config.txt contents to your .env.local');
  console.log('   3. Run: npm run import-azure-data');
  
  const successfulCount = allExportedData.filter(d => d.success).length;
  const totalResources = allExportedData.reduce((sum, d) => sum + (d.resources?.length || 0), 0);
  
  console.log(`\n📊 Final Summary: ${successfulCount}/${subscriptionsToProcess.length} subscriptions, ${totalResources} resources total`);
}

main().catch(console.error);
