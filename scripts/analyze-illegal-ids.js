const fs = require('fs');
const path = require('path');

// Function to parse CSV line handling commas in quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current.trim());
  
  return result.map(field => {
    field = field.trim();
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1);
    }
    return field;
  });
}

// Check if an ID contains illegal characters for Cosmos DB
function hasIllegalCharacters(id) {
  // Cosmos DB disallows: /, \, ?, #, control characters, and some others
  return /[\/\\?#\x00-\x1f\x7f:]/.test(id);
}

// Sanitize ID to be valid for Cosmos DB
function sanitizeId(id) {
  return id
    .replace(/[\/\\?#\x00-\x1f\x7f:]/g, '-') // Replace illegal chars with hyphen
    .replace(/\s+/g, '-') // Replace spaces with hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 255); // Cosmos DB ID limit
}

// Read and analyze the CSV file
const csvPath = path.join(__dirname, '..', 'data', 'zta_activities_with_azure.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log('🔍 Analyzing ZTA Activities CSV for illegal character IDs...\n');

const problematicRows = [];
let lineNumber = 0;

for (const line of lines) {
  lineNumber++;
  if (lineNumber === 1) continue; // Skip header
  
  try {
    const columns = parseCSVLine(line);
    const id = columns[0] || '';
    
    if (hasIllegalCharacters(id)) {
      problematicRows.push({
        lineNumber,
        originalId: id,
        sanitizedId: sanitizeId(id),
        activityName: columns[1] || 'Unknown',
        pillar: columns[2] || 'Unknown'
      });
    }
  } catch (error) {
    // Skip malformed lines
  }
}

console.log(`Found ${problematicRows.length} problematic activity IDs:\n`);

problematicRows.forEach((row, index) => {
  console.log(`${index + 1}. Line ${row.lineNumber}:`);
  console.log(`   Original ID: "${row.originalId}"`);
  console.log(`   Sanitized ID: "${row.sanitizedId}"`);
  console.log(`   Activity: ${row.activityName}`);
  console.log(`   Pillar: ${row.pillar}`);
  console.log('');
});

if (problematicRows.length > 0) {
  console.log('💡 These IDs contain illegal characters for Cosmos DB:');
  console.log('   • Forward slashes (/)');
  console.log('   • Colons (:)');
  console.log('   • Backslashes (\\)');
  console.log('   • Question marks (?)');
  console.log('   • Hash symbols (#)');
  console.log('   • Control characters');
  console.log('\nWould you like me to automatically fix these in the CSV file?');
}
