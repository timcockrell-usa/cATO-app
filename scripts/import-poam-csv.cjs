// POAM CSV Import Script (CommonJS version)
const { CosmosClient } = require('@azure/cosmos');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const config = {
  endpoint: process.env.VITE_COSMOS_DB_ENDPOINT || process.env.AZURE_COSMOS_ENDPOINT,
  key: process.env.VITE_COSMOS_DB_KEY || process.env.AZURE_COSMOS_KEY,
  databaseName: 'cato-dashboard'
};

console.log('📥 POAM CSV Import Tool');
console.log('=======================');
console.log();

if (!config.endpoint || !config.key) {
  console.error('❌ Missing Cosmos DB configuration');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const client = new CosmosClient({
  endpoint: config.endpoint,
  key: config.key
});

// Parse CSV content
function parseCSV(csvContent) {
  const lines = csvContent.split('\\n');
  const headers = [];
  const data = [];
  
  // Find the header row (contains "POA&M Item ID")
  let headerRowIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('POA&M Item ID')) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    throw new Error('Could not find POAM header row with "POA&M Item ID"');
  }
  
  // Parse headers
  const headerLine = lines[headerRowIndex];
  const headerCells = parseCSVLine(headerLine);
  
  // Map headers to our field names
  const headerMap = {
    'POA&M Item ID': 'poamId',
    'Control Vulnerability Description': 'description', 
    'Controls / APs': 'relatedControls',
    'Office/Org': 'assignedTo',
    'Security Checks': 'securityChecks',
    'Resources Required': 'resourcesRequired',
    'Scheduled Completion Date': 'dueDate',
    'Status': 'status',
    'Comments': 'comments',
    'Raw Severity': 'rawSeverity',
    'Severity': 'severity',
    'Impact': 'impact',
    'Impact Description': 'impactDescription',
    'Residual Risk Level': 'residualRiskLevel',
    'Recommendations': 'recommendations'
  };
  
  // Process data rows
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.split(',').every(cell => !cell.trim())) continue;
    
    const cells = parseCSVLine(line);
    if (cells.length < 2 || !cells[1]) continue; // Skip if no POAM ID
    
    const poamItem = {};
    headerCells.forEach((header, index) => {
      const mappedField = headerMap[header];
      if (mappedField && cells[index]) {
        poamItem[mappedField] = cells[index].trim();
      }
    });
    
    // Generate unique ID and add metadata
    if (poamItem.poamId) {
      poamItem.id = `poam-${poamItem.poamId}`;
      poamItem.source = 'csv-import';
      poamItem.importDate = new Date().toISOString();
      
      // Parse and format dates
      if (poamItem.dueDate) {
        poamItem.dueDate = formatDate(poamItem.dueDate);
      }
      
      // Parse related controls into array
      if (poamItem.relatedControls) {
        poamItem.relatedControls = poamItem.relatedControls.split(/[,;]/).map(c => c.trim()).filter(c => c);
      }
      
      // Normalize status
      poamItem.status = normalizeStatus(poamItem.status);
      
      // Normalize severity
      poamItem.severity = normalizeSeverity(poamItem.severity || poamItem.rawSeverity);
      
      data.push(poamItem);
    }
  }
  
  return data;
}

// Simple CSV line parser (handles quoted fields)
function parseCSVLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  cells.push(current);
  return cells.map(cell => cell.replace(/^"|"$/g, '').trim());
}

// Format date to ISO string
function formatDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Handle MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
    }
    
    // Try parsing as-is
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.warn(`Could not parse date: ${dateStr}`);
  }
  
  return dateStr; // Return original if parsing fails
}

// Normalize status values
function normalizeStatus(status) {
  if (!status) return 'open';
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('complet')) return 'completed';
  if (statusLower.includes('ongoing') || statusLower.includes('progress')) return 'in-progress';
  if (statusLower.includes('accept')) return 'risk-accepted';
  if (statusLower.includes('plan')) return 'planned';
  
  return 'open';
}

// Normalize severity values
function normalizeSeverity(severity) {
  if (!severity) return 'medium';
  
  const severityLower = severity.toLowerCase();
  if (severityLower.includes('high') || severityLower.includes('critical')) return 'high';
  if (severityLower.includes('low') || severityLower.includes('very low')) return 'low';
  
  return 'medium';
}

// Import POAMs to Cosmos DB
async function importPOAMs(poamData) {
  try {
    console.log(`🔗 Connecting to Cosmos DB...`);
    
    const database = client.database(config.databaseName);
    await database.read();
    
    console.log(`📦 Accessing poam-items container...`);
    const container = database.container('poam-items');
    await container.read();
    
    console.log(`📝 Importing ${poamData.length} POAM items...`);
    
    let successCount = 0;
    let updateCount = 0;
    
    for (const poam of poamData) {
      try {
        // Check if item already exists
        let existingItem = null;
        try {
          const response = await container.item(poam.id, poam.severity).read();
          existingItem = response.resource;
        } catch (error) {
          // Item doesn't exist, which is fine
        }
        
        if (existingItem) {
          // Update existing item
          const updatedItem = { ...existingItem, ...poam, lastUpdated: new Date().toISOString() };
          await container.item(poam.id, poam.severity).replace(updatedItem);
          updateCount++;
          console.log(`   ✅ Updated POAM ${poam.poamId}`);
        } else {
          // Create new item
          await container.items.create(poam);
          successCount++;
          console.log(`   ✅ Created POAM ${poam.poamId}`);
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to import POAM ${poam.poamId}:`, error.message);
      }
    }
    
    console.log(`\\n🎉 Import completed!`);
    console.log(`   • Created: ${successCount} new POAMs`);
    console.log(`   • Updated: ${updateCount} existing POAMs`);
    console.log(`   • Total processed: ${successCount + updateCount}/${poamData.length}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('❌ Please provide a CSV file path');
    console.error('Usage: npm run import-poam-csv path/to/poam-file.csv');
    process.exit(1);
  }
  
  const fullPath = path.resolve(csvFilePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
  }
  
  try {
    console.log(`📂 Reading CSV file: ${fullPath}`);
    const csvContent = fs.readFileSync(fullPath, 'utf-8');
    
    console.log(`📊 Parsing POAM data...`);
    const poamData = parseCSV(csvContent);
    
    if (poamData.length === 0) {
      console.log('⚠️  No POAM items found in CSV file');
      return;
    }
    
    console.log(`✅ Parsed ${poamData.length} POAM items`);
    
    // Show preview of first item
    console.log('\\n📋 Preview of first POAM:');
    console.log(`   • ID: ${poamData[0].id}`);
    console.log(`   • Description: ${poamData[0].description?.substring(0, 50)}...`);
    console.log(`   • Status: ${poamData[0].status}`);
    console.log(`   • Severity: ${poamData[0].severity}`);
    console.log(`   • Due Date: ${poamData[0].dueDate}`);
    
    await importPOAMs(poamData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseCSV, importPOAMs };
