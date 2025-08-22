/**
 * ZTA Data Import CLI Tool
 * 
 * Imports DoD Zero Trust Architecture capabilities and activities from CSV files
 * and seeds Cosmos DB for the CATO dashboard application.
 * 
 * Usage:
 *   npm run seed-zta -- --activities data/ZTA_Activities.csv --capabilities data/ZTA_Capabilities.csv
 *   npm run seed-zta -- --activities data/activities.csv --capabilities data/capabilities.csv --backup
 *   npm run seed-zta -- --help
 */

import { loadCSV } from './lib/csv';
import { 
  initializeCosmosClient, 
  getContainer, 
  backupContainer, 
  upsertItem, 
  getExistingIds,
  hardDeleteItems,
  CosmosConfig 
} from './lib/cosmos';
import { mapActivities, showActivitiesSummary, validateActivity } from './lib/mapActivities';
import { mapCapabilities, showCapabilitiesSummary, validateCapability } from './lib/mapCapabilities';
import { log, createBackupFilename } from './lib/utils';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CLIArgs {
  activities?: string;
  capabilities?: string;
  backup?: boolean;
  purge?: boolean;
  dryRun?: boolean;
  help?: boolean;
}

/**
 * Get Cosmos DB configuration from environment
 */
function getCosmosConfig(): CosmosConfig {
  const connectionString = process.env.COSMOS_CONNECTION_STRING;
  const databaseName = process.env.COSMOS_DB_NAME || 'cato-dashboard';

  if (!connectionString) {
    throw new Error('COSMOS_CONNECTION_STRING environment variable is required');
  }

  return {
    connectionString,
    databaseName
  };
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    switch (arg) {
      case '--activities':
        args.activities = argv[++i];
        break;
      case '--capabilities':
        args.capabilities = argv[++i];
        break;
      case '--backup':
        args.backup = true;
        break;
      case '--purge':
        args.purge = true;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  }

  return args;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
ZTA Data Import CLI Tool

Imports DoD Zero Trust Architecture capabilities and activities from CSV files
and seeds Cosmos DB for the CATO dashboard application.

USAGE:
  npm run seed-zta -- [OPTIONS]

OPTIONS:
  --activities <file>     Path to activities CSV file
  --capabilities <file>   Path to capabilities CSV file
  --backup               Create backup before import (recommended)
  --purge                Delete existing data not in CSV files
  --dry-run              Preview import without making changes
  --help, -h             Show this help message

EXAMPLES:
  # Import both activities and capabilities with backup
  npm run seed-zta -- --activities data/ZTA_Activities.csv --capabilities data/ZTA_Capabilities.csv --backup

  # Dry run to preview changes
  npm run seed-zta -- --activities data/activities.csv --capabilities data/capabilities.csv --dry-run

  # Import with purge to remove old data
  npm run seed-zta -- --activities data/activities.csv --capabilities data/capabilities.csv --backup --purge

ENVIRONMENT:
  Requires .env file with:
  - COSMOS_CONNECTION_STRING
  - COSMOS_DB_NAME
  - COSMOS_CONTAINER_ACTIVITIES
  - COSMOS_CONTAINER_CAPABILITIES
`);
}

/**
 * Validate file exists and is readable
 */
async function validateFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath, fs.constants.R_OK);
  } catch {
    throw new Error(`File not found or not readable: ${filePath}`);
  }
}

/**
 * Import activities from CSV
 */
async function importActivities(filePath: string, dryRun: boolean = false): Promise<string[]> {
  log(`Loading activities CSV: ${filePath}`);
  
  const csvData = await loadCSV(filePath);
  log(`Loaded ${csvData.length} rows from activities CSV`);

  const activities = mapActivities(csvData);
  showActivitiesSummary(activities);

  if (dryRun) {
    log('DRY RUN: Would import activities but not making changes', 'info');
    return activities.map(a => a.id);
  }

  // Validate all activities before importing
  const validActivities = activities.filter(validateActivity);
  const invalidCount = activities.length - validActivities.length;
  
  if (invalidCount > 0) {
    log(`Skipping ${invalidCount} invalid activities`, 'warn');
  }

  if (validActivities.length === 0) {
    log('No valid activities to import', 'error');
    return [];
  }

  const container = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_ACTIVITIES!);
  log(`Importing ${validActivities.length} activities to Cosmos DB`);

  const importedIds: string[] = [];
  for (const activity of validActivities) {
    try {
      await upsertItem(container, activity);
      importedIds.push(activity.id);
      
      if (importedIds.length % 10 === 0) {
        log(`Imported ${importedIds.length}/${validActivities.length} activities`);
      }
    } catch (error: any) {
      log(`Failed to import activity ${activity.id}: ${error.message}`, 'error');
    }
  }

  log(`Successfully imported ${importedIds.length} activities`);
  return importedIds;
}

/**
 * Import capabilities from CSV
 */
async function importCapabilities(filePath: string, dryRun: boolean = false): Promise<string[]> {
  log(`Loading capabilities CSV: ${filePath}`);
  
  const csvData = await loadCSV(filePath);
  log(`Loaded ${csvData.length} rows from capabilities CSV`);

  const capabilities = mapCapabilities(csvData);
  showCapabilitiesSummary(capabilities);

  if (dryRun) {
    log('DRY RUN: Would import capabilities but not making changes', 'info');
    return capabilities.map(c => c.id);
  }

  // Validate all capabilities before importing
  const validCapabilities = capabilities.filter(validateCapability);
  const invalidCount = capabilities.length - validCapabilities.length;
  
  if (invalidCount > 0) {
    log(`Skipping ${invalidCount} invalid capabilities`, 'warn');
  }

  if (validCapabilities.length === 0) {
    log('No valid capabilities to import', 'error');
    return [];
  }

  const container = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_CAPABILITIES!);
  log(`Importing ${validCapabilities.length} capabilities to Cosmos DB`);

  const importedIds: string[] = [];
  for (const capability of validCapabilities) {
    try {
      await upsertItem(container, capability);
      importedIds.push(capability.id);
      
      if (importedIds.length % 10 === 0) {
        log(`Imported ${importedIds.length}/${validCapabilities.length} capabilities`);
      }
    } catch (error: any) {
      log(`Failed to import capability ${capability.id}: ${error.message}`, 'error');
    }
  }

  log(`Successfully imported ${importedIds.length} capabilities`);
  return importedIds;
}

/**
 * Create backup of existing data
 */
async function createBackups(): Promise<void> {
  log('Creating backups of existing data...');

  try {
    // Backup activities
    const activitiesContainer = process.env.COSMOS_CONTAINER_ACTIVITIES!;
    const activitiesBackup = createBackupFilename(activitiesContainer);
    const activitiesContainerObj = await getContainer(getCosmosConfig(), activitiesContainer);
    await backupContainer(activitiesContainerObj, activitiesBackup);
    log(`Activities backup created: ${activitiesBackup}`);

    // Backup capabilities
    const capabilitiesContainer = process.env.COSMOS_CONTAINER_CAPABILITIES!;
    const capabilitiesBackup = createBackupFilename(capabilitiesContainer);
    const capabilitiesContainerObj = await getContainer(getCosmosConfig(), capabilitiesContainer);
    await backupContainer(capabilitiesContainerObj, capabilitiesBackup);
    log(`Capabilities backup created: ${capabilitiesBackup}`);

  } catch (error: any) {
    log(`Backup failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Purge items not in CSV data
 */
async function purgeOldData(importedActivityIds: string[], importedCapabilityIds: string[], dryRun: boolean = false): Promise<void> {
  if (dryRun) {
    log('DRY RUN: Would purge old data but not making changes', 'info');
    return;
  }

  log('Purging items not in CSV data...');

  try {
    // Purge old activities
    const activitiesContainer = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_ACTIVITIES!);
    const existingActivityIds = await getExistingIds(activitiesContainer);
    
    const idsToDelete = existingActivityIds.filter(id => !importedActivityIds.includes(id));
    if (idsToDelete.length > 0) {
      await hardDeleteItems(activitiesContainer, idsToDelete);
      log(`Purged ${idsToDelete.length} old activities`);
    }

    // Purge old capabilities
    const capabilitiesContainer = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_CAPABILITIES!);
    const existingCapabilityIds = await getExistingIds(capabilitiesContainer);
    
    const capIdsToDelete = existingCapabilityIds.filter(id => !importedCapabilityIds.includes(id));
    if (capIdsToDelete.length > 0) {
      await hardDeleteItems(capabilitiesContainer, capIdsToDelete);
      log(`Purged ${capIdsToDelete.length} old capabilities`);
    }

  } catch (error: any) {
    log(`Purge failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    return;
  }

  try {
    // Validate arguments
    if (!args.activities && !args.capabilities) {
      throw new Error('Must specify at least one of --activities or --capabilities');
    }

    log('Starting ZTA data import...');
    
    // Initialize Cosmos client
    initializeCosmosClient(getCosmosConfig());
    log('Connected to Cosmos DB');

    // Validate files exist
    if (args.activities) {
      await validateFile(args.activities);
    }
    if (args.capabilities) {
      await validateFile(args.capabilities);
    }

    // Create backups if requested
    if (args.backup && !args.dryRun) {
      await createBackups();
    }

    // Track imported IDs for purge
    const importedActivityIds: string[] = [];
    const importedCapabilityIds: string[] = [];

    // Import activities
    if (args.activities) {
      const importedIds = await importActivities(args.activities, args.dryRun);
      importedActivityIds.push(...importedIds);
      log(`Activities import completed: ${importedIds.length} items`);
    }

    // Import capabilities
    if (args.capabilities) {
      const importedIds = await importCapabilities(args.capabilities, args.dryRun);
      importedCapabilityIds.push(...importedIds);
      log(`Capabilities import completed: ${importedIds.length} items`);
    }

    // Purge old data if requested
    if (args.purge) {
      await purgeOldData(importedActivityIds, importedCapabilityIds, args.dryRun);
    }

    log('ZTA data import completed successfully! 🎉');

  } catch (error: any) {
    log(`Import failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
