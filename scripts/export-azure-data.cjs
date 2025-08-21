// Multi-Subscription Azure Data Export Script (CommonJS version)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const allSubscriptions = args.includes('--all-subscriptions') || args.includes('--all');
const specificSubscription = args.find(arg => arg.startsWith('--subscription='))?.split('=')[1];

console.log('🔍 Multi-Subscription Azure Data Export Helper');
console.log('================================================\n');

function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    const result = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return result.trim();
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(`Command: ${command}`);
    console.error(`Error: ${error.message}`);
    return null;
  }
}

function checkAzureCLI() {
  console.log('🔍 Checking Azure CLI status...');
  
  try {
    const account = runCommand('az account show', 'Getting current Azure account');
    if (!account) {
      console.error('❌ Not logged in to Azure CLI');
      console.error('💡 Please run: az login');
      process.exit(1);
    }
    
    const accountInfo = JSON.parse(account);
    console.log(`✅ Logged in as: ${accountInfo.user.name}`);
    console.log(`   Current subscription: ${accountInfo.name} (${accountInfo.id})`);
    return accountInfo;
    
  } catch (error) {
    console.error('❌ Azure CLI is not working properly');
    console.error('💡 Please run: az login');
    process.exit(1);
  }
}

function getSubscriptions() {
  console.log('\\n📊 Discovering Azure subscriptions...');
  
  const subscriptionsJson = runCommand('az account list --all', 'Listing all subscriptions');
  if (!subscriptionsJson) return [];
  
  const subscriptions = JSON.parse(subscriptionsJson);
  const enabledSubs = subscriptions.filter(sub => sub.state === 'Enabled');
  
  console.log(`Found ${enabledSubs.length} enabled subscriptions:`);
  enabledSubs.forEach((sub, index) => {
    const current = sub.isDefault ? ' (current)' : '';
    console.log(`   ${index + 1}. ${sub.name} - ${sub.id}${current}`);
  });
  
  return enabledSubs;
}

function exportSubscriptionData(subscription) {
  console.log(`\\n🔍 Scanning subscription: ${subscription.name}`);
  
  // Set the subscription context
  runCommand(`az account set --subscription "${subscription.id}"`, 'Setting subscription context');
  
  const data = {
    subscription: subscription,
    resourceGroups: [],
    cosmosAccounts: [],
    keyVaults: [],
    staticWebApps: [],
    recommendations: []
  };
  
  try {
    // Get resource groups
    const rgJson = runCommand('az group list', 'Getting resource groups');
    if (rgJson) {
      data.resourceGroups = JSON.parse(rgJson);
      console.log(`   📁 Found ${data.resourceGroups.length} resource groups`);
    }
    
    // Get Cosmos DB accounts
    const cosmosJson = runCommand('az cosmosdb list', 'Getting Cosmos DB accounts');
    if (cosmosJson) {
      data.cosmosAccounts = JSON.parse(cosmosJson);
      console.log(`   🗄️  Found ${data.cosmosAccounts.length} Cosmos DB accounts`);
      
      if (data.cosmosAccounts.length > 0) {
        const cosmosAccount = data.cosmosAccounts[0];
        console.log(`\\n💡 Found Cosmos DB for import:`);
        console.log(`   Account: ${cosmosAccount.name}`);
        console.log(`   Resource Group: ${cosmosAccount.resourceGroup}`);
        console.log(`   Endpoint: ${cosmosAccount.documentEndpoint}`);
        
        data.recommendations.push({
          type: 'cosmos-import',
          title: 'Cosmos DB Import Configuration',
          description: 'Add these to your .env.local file for importing data:',
          config: {
            AZURE_SOURCE_SUBSCRIPTION_ID: subscription.id,
            AZURE_SOURCE_RESOURCE_GROUP: cosmosAccount.resourceGroup,
            AZURE_SOURCE_COSMOS_ENDPOINT: cosmosAccount.documentEndpoint,
            AZURE_SOURCE_COSMOS_DATABASE: 'cato-dashboard'
          }
        });
      }
    }
    
    // Get Key Vaults
    const kvJson = runCommand('az keyvault list', 'Getting Key Vaults');
    if (kvJson) {
      data.keyVaults = JSON.parse(kvJson);
      console.log(`   🔐 Found ${data.keyVaults.length} Key Vaults`);
    }
    
    // Get Static Web Apps
    const swaJson = runCommand('az staticwebapp list', 'Getting Static Web Apps');
    if (swaJson) {
      data.staticWebApps = JSON.parse(swaJson);
      console.log(`   🌐 Found ${data.staticWebApps.length} Static Web Apps`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error scanning subscription: ${error.message}`);
  }
  
  return data;
}

function generateReport(allData) {
  console.log('\\n📝 Generating export report...');
  
  const reportPath = path.join(process.cwd(), 'azure-export-report.json');
  const summaryPath = path.join(process.cwd(), 'azure-export-summary.md');
  
  // Save detailed JSON report
  fs.writeFileSync(reportPath, JSON.stringify(allData, null, 2));
  console.log(`✅ Detailed report saved: ${reportPath}`);
  
  // Generate summary markdown
  let summary = '# Azure Environment Export Summary\\n\\n';
  summary += `Generated: ${new Date().toISOString()}\\n\\n`;
  
  allData.forEach(data => {
    summary += `## Subscription: ${data.subscription.name}\\n`;
    summary += `- **ID**: ${data.subscription.id}\\n`;
    summary += `- **State**: ${data.subscription.state}\\n`;
    summary += `- **Resource Groups**: ${data.resourceGroups.length}\\n`;
    summary += `- **Cosmos DB Accounts**: ${data.cosmosAccounts.length}\\n`;
    summary += `- **Key Vaults**: ${data.keyVaults.length}\\n`;
    summary += `- **Static Web Apps**: ${data.staticWebApps.length}\\n\\n`;
    
    if (data.recommendations.length > 0) {
      summary += `### Recommendations\\n`;
      data.recommendations.forEach(rec => {
        summary += `**${rec.title}**\\n`;
        summary += `${rec.description}\\n\\n`;
        if (rec.config) {
          summary += '```bash\\n';
          Object.entries(rec.config).forEach(([key, value]) => {
            summary += `${key}="${value}"\\n`;
          });
          summary += '```\\n\\n';
        }
      });
    }
  });
  
  fs.writeFileSync(summaryPath, summary);
  console.log(`✅ Summary report saved: ${summaryPath}`);
}

async function main() {
  try {
    const currentAccount = checkAzureCLI();
    
    let subscriptionsToExport = [];
    
    if (specificSubscription) {
      console.log(`\\n🎯 Exporting specific subscription: ${specificSubscription}`);
      // Set and validate the specific subscription
      runCommand(`az account set --subscription "${specificSubscription}"`, 'Setting specific subscription');
      const account = JSON.parse(runCommand('az account show', 'Getting subscription details'));
      subscriptionsToExport = [account];
    } else if (allSubscriptions) {
      console.log('\\n🌐 Exporting all enabled subscriptions...');
      subscriptionsToExport = getSubscriptions();
    } else {
      console.log('\\n📍 Exporting current subscription only...');
      subscriptionsToExport = [currentAccount];
    }
    
    const allData = [];
    
    for (const subscription of subscriptionsToExport) {
      const data = exportSubscriptionData(subscription);
      allData.push(data);
    }
    
    generateReport(allData);
    
    console.log('\\n🎉 Export completed successfully!');
    console.log('\\n📊 Summary:');
    console.log(`   • Subscriptions scanned: ${allData.length}`);
    console.log(`   • Total resource groups: ${allData.reduce((sum, data) => sum + data.resourceGroups.length, 0)}`);
    console.log(`   • Total Cosmos DB accounts: ${allData.reduce((sum, data) => sum + data.cosmosAccounts.length, 0)}`);
    console.log('\\n🚀 Next steps:');
    console.log('   1. Review azure-export-summary.md for recommendations');
    console.log('   2. Update your .env.local file with suggested configurations');
    console.log('   3. Run: npm run import-azure-data');
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run the export
main();
