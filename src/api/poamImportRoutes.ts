import { Request, Response } from 'express';
import multer from 'multer';
import { CosmosClient } from '@azure/cosmos';

// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Cosmos DB configuration
const config = {
  endpoint: process.env.VITE_COSMOS_DB_ENDPOINT || process.env.AZURE_COSMOS_ENDPOINT,
  key: process.env.VITE_COSMOS_DB_KEY || process.env.AZURE_COSMOS_KEY,
  databaseName: 'cato-dashboard'
};

const client = new CosmosClient({
  endpoint: config.endpoint!,
  key: config.key!
});

interface POAMItem {
  id: string;
  poamId: string;
  description: string;
  relatedControls?: string[];
  assignedTo?: string;
  securityChecks?: string;
  resourcesRequired?: string;
  dueDate?: string;
  status: string;
  comments?: string;
  rawSeverity?: string;
  severity: string;
  impact?: string;
  impactDescription?: string;
  residualRiskLevel?: string;
  recommendations?: string;
  source: string;
  importDate: string;
}

// Parse CSV content
function parseCSV(csvContent: string): POAMItem[] {
  const lines = csvContent.split('\\n');
  const data: POAMItem[] = [];
  
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
  const headerMap: { [key: string]: string } = {
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
    
    const poamItem: any = {};
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
        poamItem.relatedControls = poamItem.relatedControls.split(/[,;]/).map((c: string) => c.trim()).filter((c: string) => c);
      }
      
      // Normalize status
      poamItem.status = normalizeStatus(poamItem.status);
      
      // Normalize severity
      poamItem.severity = normalizeSeverity(poamItem.severity || poamItem.rawSeverity);
      
      data.push(poamItem as POAMItem);
    }
  }
  
  return data;
}

// Simple CSV line parser (handles quoted fields)
function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
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
function formatDate(dateStr: string): string | null {
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
function normalizeStatus(status: string): string {
  if (!status) return 'open';
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('complet')) return 'completed';
  if (statusLower.includes('ongoing') || statusLower.includes('progress')) return 'in-progress';
  if (statusLower.includes('accept')) return 'risk-accepted';
  if (statusLower.includes('plan')) return 'planned';
  
  return 'open';
}

// Normalize severity values
function normalizeSeverity(severity: string): string {
  if (!severity) return 'medium';
  
  const severityLower = severity.toLowerCase();
  if (severityLower.includes('high') || severityLower.includes('critical')) return 'high';
  if (severityLower.includes('low') || severityLower.includes('very low')) return 'low';
  
  return 'medium';
}

// Import POAMs to Cosmos DB
async function importPOAMs(poamData: POAMItem[]): Promise<{ success: boolean; imported: number; updated: number; errors: string[] }> {
  const database = client.database(config.databaseName);
  const container = database.container('poam-items');
  
  let successCount = 0;
  let updateCount = 0;
  const errors: string[] = [];
  
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
      } else {
        // Create new item
        await container.items.create(poam);
        successCount++;
      }
      
    } catch (error) {
      const errorMsg = `Failed to import POAM ${poam.poamId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }
  
  return {
    success: errors.length === 0 || (successCount + updateCount) > 0,
    imported: successCount,
    updated: updateCount,
    errors
  };
}

// Express route handler
export async function handlePOAMImport(req: Request, res: Response) {
  try {
    // Use multer middleware
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: 'File upload failed: ' + err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
        return res.status(400).json({
          success: false,
          message: 'File must be a CSV'
        });
      }
      
      try {
        // Parse CSV content
        const csvContent = req.file.buffer.toString('utf-8');
        const poamData = parseCSV(csvContent);
        
        if (poamData.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No valid POAM items found in CSV file'
          });
        }
        
        // Import to Cosmos DB
        const result = await importPOAMs(poamData);
        
        res.json({
          success: result.success,
          message: result.success 
            ? `Successfully processed ${result.imported + result.updated} POAMs` 
            : 'Import completed with errors',
          imported: result.imported,
          updated: result.updated,
          errors: result.errors
        });
        
      } catch (error) {
        console.error('CSV parsing error:', error);
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to parse CSV file'
        });
      }
    });
    
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Export for use in other modules
export { parseCSV, importPOAMs };
