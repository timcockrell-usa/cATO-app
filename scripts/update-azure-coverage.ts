// Azure NIST Control Coverage Update Script
// This script updates NIST controls with Azure coverage information from CSV

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// TODO: Update controls with Azure coverage info from azure_control_coverage.csv
// The CSV has columns: Control Identifier, Control Name, Azure Covered? (Yes/No), Coverage Type (Fully/Partially).
// For each control in the CSV:
//  - Find the corresponding Control entry in the app (matching by Control Identifier).
//  - If "Azure Covered?" is "Yes", set control.providerCovered = true. If "No", set control.providerCovered = false.
//  - If Coverage Type is "Fully", set control.providerCoverageType = "Full". If "Partially", set it to "Partial". If blank (not covered), set it to "None" or null.
//  - Save these updates to the database.
// Implement a script or migration to read the CSV file and update the Control records accordingly.

interface AzureCoverageRecord {
  'Control Identifier': string;
  'Control Name': string;
  'Azure Covered?': 'Yes' | 'No';
  'Coverage Type': 'Fully' | 'Partially' | '';
}

interface NISTControlUpdate {
  id: string;
  controlIdentifier: string;
  providerCovered: boolean;
  providerCoverageType: 'Full' | 'Partial' | 'None';
  azureInherited: boolean;
  azureSharedResponsibility: boolean;
  lastUpdated: string;
  updatedBy: string;
}

/**
 * Read and parse the Azure control coverage CSV file
 */
function readAzureCoverageCSV(csvPath: string): AzureCoverageRecord[] {
  try {
    console.log(`📂 Reading Azure coverage data from: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Azure coverage CSV file not found at: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as AzureCoverageRecord[];

    console.log(`📊 Found ${records.length} Azure coverage records`);
    return records;
  } catch (error) {
    console.error('❌ Error reading Azure coverage CSV:', error);
    throw error;
  }
}

/**
 * Convert Azure coverage data to NIST control updates
 */
function convertToControlUpdates(coverageRecords: AzureCoverageRecord[]): NISTControlUpdate[] {
  const updates: NISTControlUpdate[] = [];
  const timestamp = new Date().toISOString();

  for (const record of coverageRecords) {
    const controlId = record['Control Identifier'];
    const azureCovered = record['Azure Covered?'] === 'Yes';
    const coverageType = record['Coverage Type'];

    let providerCoverageType: 'Full' | 'Partial' | 'None';
    let azureInherited = false;
    let azureSharedResponsibility = false;

    if (azureCovered) {
      if (coverageType === 'Fully') {
        providerCoverageType = 'Full';
        azureInherited = true;
        azureSharedResponsibility = false;
      } else if (coverageType === 'Partially') {
        providerCoverageType = 'Partial';
        azureInherited = false;
        azureSharedResponsibility = true;
      } else {
        providerCoverageType = 'Partial';
        azureSharedResponsibility = true;
      }
    } else {
      providerCoverageType = 'None';
      azureInherited = false;
      azureSharedResponsibility = false;
    }

    const update: NISTControlUpdate = {
      id: controlId,
      controlIdentifier: controlId,
      providerCovered: azureCovered,
      providerCoverageType,
      azureInherited,
      azureSharedResponsibility,
      lastUpdated: timestamp,
      updatedBy: 'Azure Coverage Import'
    };

    updates.push(update);
  }

  console.log(`✅ Converted ${updates.length} control updates`);
  return updates;
}

/**
 * Update the enhanced NIST controls TypeScript file with Azure coverage
 */
function updateNISTControlsFile(updates: NISTControlUpdate[], controlsFilePath: string): void {
  try {
    console.log(`📝 Updating NIST controls file: ${controlsFilePath}`);

    if (!fs.existsSync(controlsFilePath)) {
      throw new Error(`NIST controls file not found at: ${controlsFilePath}`);
    }

    // Read the current file
    let fileContent = fs.readFileSync(controlsFilePath, 'utf-8');

    // Update the NISTControl interface to include new fields
    const interfaceMatch = fileContent.match(/export interface NISTControl \{[\s\S]*?\}/);
    if (interfaceMatch) {
      const currentInterface = interfaceMatch[0];
      
      // Check if new fields already exist
      if (!currentInterface.includes('providerCovered')) {
        const newInterface = currentInterface.replace(
          /poamItems: any\[\];/,
          `poamItems: any[];
  // Azure Cloud Provider Coverage
  providerCovered?: boolean;
  providerCoverageType?: 'Full' | 'Partial' | 'None';
  azureInherited?: boolean;
  azureSharedResponsibility?: boolean;`
        );
        fileContent = fileContent.replace(currentInterface, newInterface);
        console.log('✅ Updated NISTControl interface');
      }
    }

    // Update each control in the array
    let updatedCount = 0;
    for (const update of updates) {
      // Find the control object in the file
      const controlRegex = new RegExp(`{\\s*"id":\\s*"${update.controlIdentifier.replace(/[()]/g, '\\$&')}"[\\s\\S]*?}(?=,\\s*{|\\s*\\])`);
      const controlMatch = fileContent.match(controlRegex);
      
      if (controlMatch) {
        const currentControl = controlMatch[0];
        
        // Add Azure coverage fields before the closing brace
        const updatedControl = currentControl.replace(
          /("poamItems": \[.*?\])/,
          `$1,
    "providerCovered": ${update.providerCovered},
    "providerCoverageType": "${update.providerCoverageType}",
    "azureInherited": ${update.azureInherited},
    "azureSharedResponsibility": ${update.azureSharedResponsibility}`
        );

        fileContent = fileContent.replace(currentControl, updatedControl);
        updatedCount++;
      } else {
        console.warn(`⚠️  Control ${update.controlIdentifier} not found in file`);
      }
    }

    // Write the updated file
    fs.writeFileSync(controlsFilePath, fileContent, 'utf-8');
    console.log(`✅ Updated ${updatedCount} controls in ${controlsFilePath}`);

  } catch (error) {
    console.error('❌ Error updating NIST controls file:', error);
    throw error;
  }
}

/**
 * Generate a migration script for database updates
 */
function generateDatabaseMigration(updates: NISTControlUpdate[], outputPath: string): void {
  console.log(`📝 Generating database migration script: ${outputPath}`);

  const migrationContent = `-- Azure Control Coverage Database Migration
-- Generated: ${new Date().toISOString()}
-- Updates NIST controls with Azure coverage information

-- Add new columns for Azure coverage if they don't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'provider_covered')
BEGIN
    ALTER TABLE nist_controls ADD provider_covered BIT DEFAULT 0;
    PRINT 'Added provider_covered column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'provider_coverage_type')
BEGIN
    ALTER TABLE nist_controls ADD provider_coverage_type NVARCHAR(10) DEFAULT 'None';
    PRINT 'Added provider_coverage_type column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'azure_inherited')
BEGIN
    ALTER TABLE nist_controls ADD azure_inherited BIT DEFAULT 0;
    PRINT 'Added azure_inherited column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'azure_shared_responsibility')
BEGIN
    ALTER TABLE nist_controls ADD azure_shared_responsibility BIT DEFAULT 0;
    PRINT 'Added azure_shared_responsibility column';
END

-- Update controls with Azure coverage information
${updates.map(update => `
UPDATE nist_controls 
SET 
    provider_covered = ${update.providerCovered ? 1 : 0},
    provider_coverage_type = '${update.providerCoverageType}',
    azure_inherited = ${update.azureInherited ? 1 : 0},
    azure_shared_responsibility = ${update.azureSharedResponsibility ? 1 : 0},
    updated_at = GETDATE()
WHERE control_identifier = '${update.controlIdentifier}';`).join('')}

-- Create view for Azure coverage statistics
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_AzureCoverageStats')
    DROP VIEW vw_AzureCoverageStats;
GO

CREATE VIEW vw_AzureCoverageStats AS
SELECT 
    control_family,
    COUNT(*) as total_controls,
    SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) as azure_covered_count,
    SUM(CASE WHEN azure_inherited = 1 THEN 1 ELSE 0 END) as azure_inherited_count,
    SUM(CASE WHEN azure_shared_responsibility = 1 THEN 1 ELSE 0 END) as azure_shared_count,
    SUM(CASE WHEN provider_covered = 0 THEN 1 ELSE 0 END) as customer_responsibility_count,
    CAST(SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as azure_coverage_percentage
FROM nist_controls
GROUP BY control_family;
GO

-- Create overall Azure coverage statistics
SELECT 
    'Overall' as scope,
    COUNT(*) as total_controls,
    SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) as azure_covered,
    SUM(CASE WHEN azure_inherited = 1 THEN 1 ELSE 0 END) as azure_inherited,
    SUM(CASE WHEN azure_shared_responsibility = 1 THEN 1 ELSE 0 END) as azure_shared,
    SUM(CASE WHEN provider_covered = 0 THEN 1 ELSE 0 END) as customer_only,
    CAST(SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as coverage_percentage
FROM nist_controls;

PRINT 'Azure control coverage migration completed successfully!';
`;

  fs.writeFileSync(outputPath, migrationContent, 'utf-8');
  console.log(`✅ Generated database migration script`);
}

/**
 * Generate a Cosmos DB update script
 */
function generateCosmosDBUpdate(updates: NISTControlUpdate[], outputPath: string): void {
  console.log(`📝 Generating Cosmos DB update script: ${outputPath}`);

  const cosmosContent = `// Cosmos DB Azure Coverage Update Script
// Generated: ${new Date().toISOString()}

import { CosmosClient } from '@azure/cosmos';

const cosmosConfig = {
  endpoint: process.env.COSMOS_ENDPOINT || '',
  key: process.env.COSMOS_KEY || '',
  databaseId: 'cato-dashboard',
  containerId: 'nist-controls'
};

const client = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key
});

const database = client.database(cosmosConfig.databaseId);
const container = database.container(cosmosConfig.containerId);

// Azure coverage updates
const azureCoverageUpdates = ${JSON.stringify(updates, null, 2)};

async function updateNISTControlsWithAzureCoverage() {
  console.log('🚀 Starting Azure coverage update for NIST controls');
  
  let successCount = 0;
  let errorCount = 0;

  for (const update of azureCoverageUpdates) {
    try {
      // Read the existing control
      const { resource: existingControl } = await container.item(
        update.controlIdentifier, 
        update.controlIdentifier
      ).read();

      if (existingControl) {
        // Update with Azure coverage information
        const updatedControl = {
          ...existingControl,
          providerCovered: update.providerCovered,
          providerCoverageType: update.providerCoverageType,
          azureInherited: update.azureInherited,
          azureSharedResponsibility: update.azureSharedResponsibility,
          lastUpdated: update.lastUpdated,
          updatedBy: update.updatedBy
        };

        // Replace the document
        await container.item(update.controlIdentifier, update.controlIdentifier)
          .replace(updatedControl);
        
        successCount++;
        console.log(\`✅ Updated \${update.controlIdentifier}\`);
      } else {
        console.warn(\`⚠️  Control \${update.controlIdentifier} not found\`);
        errorCount++;
      }
    } catch (error) {
      console.error(\`❌ Error updating \${update.controlIdentifier}:\`, error);
      errorCount++;
    }
  }

  console.log(\`\\n📊 Update Summary:\`);
  console.log(\`✅ Successfully updated: \${successCount} controls\`);
  console.log(\`❌ Errors: \${errorCount} controls\`);
  console.log(\`🎯 Total processed: \${successCount + errorCount} controls\`);
}

// Run the update
updateNISTControlsWithAzureCoverage()
  .then(() => {
    console.log('🎉 Azure coverage update completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Update failed:', error);
    process.exit(1);
  });
`;

  fs.writeFileSync(outputPath, cosmosContent, 'utf-8');
  console.log(`✅ Generated Cosmos DB update script`);
}

/**
 * Generate Azure coverage statistics report
 */
function generateCoverageReport(updates: NISTControlUpdate[], outputPath: string): void {
  console.log(`📊 Generating Azure coverage report: ${outputPath}`);

  // Calculate statistics
  const totalControls = updates.length;
  const azureCovered = updates.filter(u => u.providerCovered).length;
  const azureInherited = updates.filter(u => u.azureInherited).length;
  const azureShared = updates.filter(u => u.azureSharedResponsibility).length;
  const customerOnly = updates.filter(u => !u.providerCovered).length;

  // Group by control family
  const familyStats = new Map<string, {
    total: number;
    covered: number;
    inherited: number;
    shared: number;
    customerOnly: number;
  }>();

  for (const update of updates) {
    const family = update.controlIdentifier.split('-')[0];
    if (!familyStats.has(family)) {
      familyStats.set(family, { total: 0, covered: 0, inherited: 0, shared: 0, customerOnly: 0 });
    }
    
    const stats = familyStats.get(family)!;
    stats.total++;
    if (update.providerCovered) stats.covered++;
    if (update.azureInherited) stats.inherited++;
    if (update.azureSharedResponsibility) stats.shared++;
    if (!update.providerCovered) stats.customerOnly++;
  }

  const familyNames: { [key: string]: string } = {
    'AC': 'Access Control',
    'AT': 'Awareness and Training',
    'AU': 'Audit and Accountability',
    'CA': 'Assessment, Authorization, and Monitoring',
    'CM': 'Configuration Management',
    'CP': 'Contingency Planning',
    'IA': 'Identification and Authentication',
    'IR': 'Incident Response',
    'MA': 'Maintenance',
    'MP': 'Media Protection',
    'PE': 'Physical and Environmental Protection',
    'PL': 'Planning',
    'PM': 'Program Management',
    'PS': 'Personnel Security',
    'RA': 'Risk Assessment',
    'SA': 'System and Services Acquisition',
    'SC': 'System and Communications Protection',
    'SI': 'System and Information Integrity'
  };

  const reportContent = `# Azure NIST SP 800-53 Control Coverage Report
Generated: ${new Date().toLocaleString()}

## Executive Summary

Microsoft Azure provides coverage for **${azureCovered} out of ${totalControls}** NIST SP 800-53 Rev. 5 controls (**${(azureCovered/totalControls*100).toFixed(1)}%**).

### Coverage Breakdown:
- 🔵 **Azure Inherited (Fully Covered)**: ${azureInherited} controls (${(azureInherited/totalControls*100).toFixed(1)}%)
- 🟡 **Azure Shared Responsibility (Partially Covered)**: ${azureShared} controls (${(azureShared/totalControls*100).toFixed(1)}%)
- 🔴 **Customer Responsibility Only**: ${customerOnly} controls (${(customerOnly/totalControls*100).toFixed(1)}%)

## Control Family Coverage

| Family | Name | Total | Azure Covered | Inherited | Shared | Customer Only | Coverage % |
|--------|------|-------|---------------|-----------|---------|---------------|------------|
${Array.from(familyStats.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([family, stats]) => 
    `| ${family} | ${familyNames[family] || family} | ${stats.total} | ${stats.covered} | ${stats.inherited} | ${stats.shared} | ${stats.customerOnly} | ${(stats.covered/stats.total*100).toFixed(1)}% |`
  ).join('\n')}

## Key Insights

### Fully Inherited Controls (Azure Provides Complete Coverage)
These controls are completely implemented by Microsoft Azure infrastructure and services:

${updates.filter(u => u.azureInherited).map(u => `- **${u.controlIdentifier}**: Fully managed by Azure`).join('\n')}

### Shared Responsibility Controls (Azure Provides Partial Coverage)
These controls require both Azure capabilities and customer configuration/implementation:

${updates.filter(u => u.azureSharedResponsibility).slice(0, 20).map(u => `- **${u.controlIdentifier}**: Azure provides tools, customer configures`).join('\n')}
${updates.filter(u => u.azureSharedResponsibility).length > 20 ? `\n*... and ${updates.filter(u => u.azureSharedResponsibility).length - 20} more*` : ''}

### Customer-Only Controls (No Azure Coverage)
These controls are entirely the customer's responsibility:

${updates.filter(u => !u.providerCovered).slice(0, 20).map(u => `- **${u.controlIdentifier}**: Customer implementation required`).join('\n')}
${updates.filter(u => !u.providerCovered).length > 20 ? `\n*... and ${updates.filter(u => !u.providerCovered).length - 20} more*` : ''}

## Implementation Recommendations

### 1. Leverage Azure-Inherited Controls
- Focus compliance efforts on configuring and validating inherited controls
- Document Azure service compliance for audit purposes
- Verify control inheritance through Azure compliance documentation

### 2. Configure Shared Responsibility Controls
- Implement Azure Policy for automated compliance checking
- Configure Azure Security Center for security monitoring
- Set up Azure Monitor for logging and alerting
- Use Azure AD for identity and access management

### 3. Implement Customer-Only Controls
- Develop organizational policies and procedures
- Implement training and awareness programs
- Create incident response and contingency plans
- Establish risk management processes

## Next Steps

1. **Update cATO Application**: Import this coverage data to mark controls appropriately
2. **Validate Coverage**: Review Azure services and confirm control mappings
3. **Configure Azure Services**: Implement recommended Azure services for shared controls
4. **Document Implementation**: Create evidence packages for each control type
5. **Regular Review**: Update coverage as Azure services evolve

---
*This report is based on Microsoft Azure's coverage of NIST SP 800-53 Rev. 5 controls according to FedRAMP and Azure compliance documentation.*
`;

  fs.writeFileSync(outputPath, reportContent, 'utf-8');
  console.log(`✅ Generated Azure coverage report`);
}

/**
 * Main execution function
 */
async function updateAzureControlCoverage(): Promise<void> {
  console.log('🚀 Starting Azure NIST Control Coverage Update');
  console.log('=' .repeat(60));

  try {
    const currentDir = process.cwd();
    
    // Define file paths
    const csvPath = path.join(currentDir, 'data', 'azure_control_coverage.csv');
    const controlsFilePath = path.join(currentDir, 'src', 'data', 'nistControlsEnhanced.ts');
    const dbMigrationPath = path.join(currentDir, 'database', 'azure-coverage-migration.sql');
    const cosmosUpdatePath = path.join(currentDir, 'scripts', 'update-azure-coverage-cosmos.js');
    const reportPath = path.join(currentDir, 'docs', 'azure-coverage-report.md');

    // Step 1: Read Azure coverage CSV
    const coverageRecords = readAzureCoverageCSV(csvPath);

    // Step 2: Convert to control updates
    const controlUpdates = convertToControlUpdates(coverageRecords);

    // Step 3: Update TypeScript file
    updateNISTControlsFile(controlUpdates, controlsFilePath);

    // Step 4: Generate database migration
    generateDatabaseMigration(controlUpdates, dbMigrationPath);

    // Step 5: Generate Cosmos DB update script
    generateCosmosDBUpdate(controlUpdates, cosmosUpdatePath);

    // Step 6: Generate coverage report
    generateCoverageReport(controlUpdates, reportPath);

    console.log('\\n' + '=' .repeat(60));
    console.log('🎉 Azure Control Coverage Update Completed Successfully!');
    console.log('\\n📁 Generated Files:');
    console.log(`   • Updated: ${controlsFilePath}`);
    console.log(`   • Database Migration: ${dbMigrationPath}`);
    console.log(`   • Cosmos DB Update: ${cosmosUpdatePath}`);
    console.log(`   • Coverage Report: ${reportPath}`);
    
    console.log('\\n🎯 Next Steps:');
    console.log('   1. Review the updated TypeScript file');
    console.log('   2. Run the database migration if using SQL Database');
    console.log('   3. Run the Cosmos DB update script if using Cosmos DB');
    console.log('   4. Review the coverage report for insights');
    console.log('   5. Update your application UI to show Azure coverage');

  } catch (error) {
    console.error('💥 Azure control coverage update failed:', error);
    process.exit(1);
  }
}

// Export for use as module or run directly
export {
  readAzureCoverageCSV,
  convertToControlUpdates,
  updateNISTControlsFile,
  generateDatabaseMigration,
  generateCosmosDBUpdate,
  generateCoverageReport,
  updateAzureControlCoverage
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAzureControlCoverage();
}
