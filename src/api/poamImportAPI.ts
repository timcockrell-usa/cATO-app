// POAM Import API Route (simpler version without multer)
import { Request, Response } from 'express';
import { CosmosClient } from '@azure/cosmos';

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
  importDate?: string;
  lastUpdated?: string;
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
      // Add import metadata
      poam.importDate = new Date().toISOString();
      
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
    const { poamItems } = req.body;
    
    if (!poamItems || !Array.isArray(poamItems)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: poamItems array is required'
      });
    }
    
    if (poamItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No POAM items provided'
      });
    }
    
    // Validate POAM items
    const validItems: POAMItem[] = [];
    const validationErrors: string[] = [];
    
    for (const item of poamItems) {
      if (!item.id || !item.poamId) {
        validationErrors.push(`Invalid POAM item: missing ID or POAM ID`);
        continue;
      }
      
      if (!item.description) {
        validationErrors.push(`POAM ${item.poamId}: missing description`);
        continue;
      }
      
      if (!item.severity) {
        validationErrors.push(`POAM ${item.poamId}: missing severity`);
        continue;
      }
      
      validItems.push(item);
    }
    
    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid POAM items found',
        errors: validationErrors
      });
    }
    
    // Import to Cosmos DB
    const result = await importPOAMs(validItems);
    
    res.json({
      success: result.success,
      message: result.success 
        ? `Successfully processed ${result.imported + result.updated} POAMs` 
        : 'Import completed with errors',
      imported: result.imported,
      updated: result.updated,
      errors: [...validationErrors, ...result.errors]
    });
    
  } catch (error) {
    console.error('POAM import error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

// Export for use in other modules
export { importPOAMs };
