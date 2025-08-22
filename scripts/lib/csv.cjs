/**
 * CSV loading with robust header handling and BOM support
 */

const { csvParse } = require('d3-dsv');
const fs = require('fs').promises;

/**
 * Load and parse CSV file with robust header matching
 */
async function loadCSV(filePath) {
  try {
    // Read file with UTF-8 encoding
    let content = await fs.readFile(filePath, 'utf8');
    
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    // Parse CSV
    const data = csvParse(content);
    
    if (!data || data.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }
    
    console.log(`✅ Loaded ${data.length} rows from CSV`);
    
    // Log headers for debugging
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log(`📋 CSV Headers: ${headers.join(', ')}`);
    }
    
    return data;
    
  } catch (error) {
    throw new Error(`Failed to load CSV file ${filePath}: ${error.message}`);
  }
}

/**
 * Get CSV value with flexible header matching
 */
function getCSVValue(row, possibleHeaders) {
  if (!Array.isArray(possibleHeaders)) {
    possibleHeaders = [possibleHeaders];
  }
  
  // Try exact matches first
  for (const header of possibleHeaders) {
    if (row.hasOwnProperty(header) && row[header] !== undefined) {
      const value = String(row[header]).trim();
      return value === '' ? '' : value;
    }
  }
  
  // Try case-insensitive matches
  const rowHeaders = Object.keys(row);
  for (const header of possibleHeaders) {
    const lowerHeader = header.toLowerCase();
    for (const rowHeader of rowHeaders) {
      if (rowHeader.toLowerCase() === lowerHeader) {
        const value = String(row[rowHeader]).trim();
        return value === '' ? '' : value;
      }
    }
  }
  
  // Try partial matches (contains)
  for (const header of possibleHeaders) {
    const lowerHeader = header.toLowerCase();
    for (const rowHeader of rowHeaders) {
      if (rowHeader.toLowerCase().includes(lowerHeader) || 
          lowerHeader.includes(rowHeader.toLowerCase())) {
        const value = String(row[rowHeader]).trim();
        return value === '' ? '' : value;
      }
    }
  }
  
  return '';
}

/**
 * Validate that required headers are present in CSV
 */
function validateHeaders(csvData, requiredHeaders) {
  if (!csvData || csvData.length === 0) {
    throw new Error('CSV data is empty');
  }
  
  const headers = Object.keys(csvData[0]);
  const missing = [];
  
  for (const required of requiredHeaders) {
    const found = headers.some(header => 
      header.toLowerCase().includes(required.toLowerCase()) ||
      required.toLowerCase().includes(header.toLowerCase())
    );
    
    if (!found) {
      missing.push(required);
    }
  }
  
  if (missing.length > 0) {
    console.log(`⚠️  Missing headers: ${missing.join(', ')}`);
    console.log(`📋 Available headers: ${headers.join(', ')}`);
  }
  
  return missing.length === 0;
}

module.exports = {
  loadCSV,
  getCSVValue,
  validateHeaders
};
