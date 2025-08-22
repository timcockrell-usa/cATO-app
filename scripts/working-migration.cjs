// Working data migration script for Azure Cosmos DB
const { CosmosClient } = require('@azure/cosmos');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

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

// Function to parse CSV content with proper handling of complex quoted fields
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // First line is headers
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  console.log(`📋 CSV headers found: ${headers.slice(0, 3).join(', ')}...`);
  
  const data = [];
  let lineNumber = 1;

  for (let i = 1; i < lines.length; i++) {
    lineNumber++;
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 3 && values[0].trim()) { // Ensure we have at least 3 columns and a valid control ID
        const row = {};
        headers.forEach((header, index) => {
          row[header] = (values[index] || '').trim();
        });
        data.push(row);
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Skipped line ${lineNumber} due to parsing error:`, error.message);
    }
  }

  return data;
}

// Function to properly parse CSV line handling commas in quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      // Handle escaped quotes (double quotes)
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i += 2; // Skip both quotes
        continue;
      }
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // Found delimiter outside quotes
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  // Add the last field
  result.push(current.trim());
  
  // Clean up fields (remove surrounding quotes)
  return result.map(field => {
    field = field.trim();
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1);
    }
    return field;
  });
}

// Helper function to determine control family from control ID
function getControlFamily(controlId) {
  const familyMap = {
    'AC': 'Access Control',
    'AT': 'Awareness and Training',
    'AU': 'Audit and Accountability',
    'CA': 'Security Assessment and Authorization',
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
  
  const prefix = controlId.split('-')[0];
  return familyMap[prefix] || 'Unknown';
}

// Function to load NIST controls from CSV file
function loadNistControlsFromCSV() {
  const csvPath = path.join(__dirname, '..', 'data', 'nist.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`NIST CSV file not found at: ${csvPath}`);
  }

  console.log(`📂 Reading NIST controls from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvData = parseCSV(csvContent);
  
  console.log(`📊 Found ${csvData.length} NIST controls in CSV`);

  // Convert CSV data to the format expected by the application
  const nistControls = csvData.map(row => {
    // Based on the CSV structure we saw:
    // Column 0: Control Identifier
    // Column 1: Control (or Control Enhancement) Name  
    // Column 2: Control Text
    // Column 3: Discussion
    // Column 4: Related Controls
    // Column 5: Azure Commercial Remediation
    // Column 6: Azure Government Remediation
    
    const controlId = row['Control Identifier'] || 'UNKNOWN';
    const title = row['Control (or Control Enhancement) Name'] || 'No Title';
    const description = row['Control Text'] || 'No Description';
    const discussion = row['Discussion'] || '';
    const implementation = row['Azure Commercial Remediation'] || 'No Azure implementation provided';
    
    // Determine status and risk level based on implementation content
    let status = 'partial';
    let riskLevel = 'medium';
    
    if (implementation.toLowerCase().includes('not applicable') || 
        implementation.toLowerCase().includes('manual') ||
        implementation.toLowerCase().includes('outside azure') ||
        implementation.toLowerCase().includes('no azure') ||
        implementation === 'No Azure implementation provided') {
      status = 'not-applicable';
      riskLevel = 'low';
    } else if (implementation.toLowerCase().includes('azure') && 
               implementation.length > 50) {
      status = 'implemented';
      riskLevel = 'low';
    } else if (implementation.toLowerCase().includes('noncompliant') ||
               implementation.toLowerCase().includes('high risk')) {
      status = 'not-implemented';
      riskLevel = 'high';
    }

    return {
      id: controlId,
      controlFamily: getControlFamily(controlId),
      controlIdentifier: controlId,
      controlName: title,
      description: description,
      discussion: discussion,
      azureImplementation: implementation,
      implementation: implementation,
      status: status,
      lastAssessed: new Date().toISOString().split('T')[0],
      assessedBy: 'CSV Import',
      evidence: ['Imported from CSV'],
      riskLevel: riskLevel,
      lastUpdated: new Date()
    };
  });

  return nistControls;
}

// Function to sanitize ID to be valid for Cosmos DB
function sanitizeId(id) {
  return id
    .replace(/[\/\\?#\x00-\x1f\x7f:]/g, '-') // Replace illegal chars with hyphen
    .replace(/\s+/g, '-') // Replace spaces with hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 255); // Cosmos DB ID limit
}
function loadZtaActivitiesFromCSV() {
  const csvPath = path.join(__dirname, '..', 'data', 'zta_activities_with_azure.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`ZTA Activities CSV file not found at: ${csvPath}`);
  }

  console.log(`📂 Reading ZTA activities from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvData = parseCSV(csvContent);
  
  console.log(`📊 Found ${csvData.length} ZTA activities in CSV`);

  // Convert CSV data to the format expected by the application
  const ztaActivities = csvData.map((row, index) => {
    const rawId = row['ID#'] || `zta-activity-${index + 1}`;
    const id = sanitizeId(rawId); // Sanitize ID to avoid illegal characters
    const name = row['Activity Name'] || 'Unnamed Activity';
    const pillar = row['Pillar'] || 'Unknown';
    const description = row['Descriptions'] || 'No description provided';
    const azureImplementation = row['Azure Commercial Remediation'] || 'No Azure implementation provided';
    const relatedControls = row['Related NIST Controls'] || '';
    
    return {
      id: id,
      name: name,
      description: description,
      category: pillar,
      priority: 'medium', // Default priority since not in CSV
      status: 'planned', // Default status since not in CSV
      azureImplementation: azureImplementation,
      progress: 0, // Default progress
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      assignedTo: 'ZTA Team',
      evidence: ['Imported from CSV'],
      relatedControls: relatedControls.split(',').map(c => c.trim()).filter(c => c),
      lastUpdated: new Date()
    };
  });

  return ztaActivities;
}

// Function to load ZTA capabilities from CSV file
function loadZtaCapabilitiesFromCSV() {
  const csvPath = path.join(__dirname, '..', 'data', 'zta_capabilities_with_azure.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`ZTA Capabilities CSV file not found at: ${csvPath}`);
  }

  console.log(`📂 Reading ZTA capabilities from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvData = parseCSV(csvContent);
  
  console.log(`📊 Found ${csvData.length} ZTA capabilities in CSV`);

  // Convert CSV data to the format expected by the application
  const ztaCapabilities = csvData.map((row, index) => {
    const rawId = row['ID #'] || `zta-capability-${index + 1}`;
    const id = sanitizeId(rawId); // Sanitize ID to avoid illegal characters
    const pillar = row['Capability Pillar'] || 'Unknown';
    const description = row['Capability Description'] || 'No description provided';
    const outcome = row['Capability Outcome'] || 'No outcome specified';
    const azureImplementation = row['Azure Commercial Remediation'] || 'No Azure implementation provided';
    const relatedControls = row['Related NIST Controls'] || '';
    
    return {
      id: id,
      pillar: pillar,
      description: description,
      outcome: outcome,
      azureImplementation: azureImplementation,
      relatedControls: relatedControls.split(',').map(c => c.trim()).filter(c => c),
      status: 'planned', // Default status
      priority: 'medium', // Default priority
      lastUpdated: new Date()
    };
  });

  return ztaCapabilities;
}

// Load all data from CSV files instead of using hardcoded sample data
const sampleNistControls = loadNistControlsFromCSV();
const sampleZtaActivities = loadZtaActivitiesFromCSV();
const sampleZtaCapabilities = loadZtaCapabilitiesFromCSV();

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
        data: sampleZtaActivities.concat(sampleZtaCapabilities) // Store both activities and capabilities in same container
      },
      {
        id: 'poam-items',
        partitionKey: '/severity',
        data: [] // Empty - no hardcoded POAM data
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
    console.log(`   • ZTA Capabilities: ${sampleZtaCapabilities.length} items`);
    console.log(`   • Empty containers: 3 (poam-items, vulnerabilities, control-history)`);
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
