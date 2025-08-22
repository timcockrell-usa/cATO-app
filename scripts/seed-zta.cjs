/**
 * ZTA Data Import CLI Tool
 * 
 * Imports DoD Zero Trust Architecture capabilities and activities from CSV files
 * into Azure Cosmos DB for the CATO dashboard application.
 */

const fs = require('fs').promises;
const path = require('path');

// Load local modules using require
const { loadCSV } = require('./lib/csv.cjs');
const { 
  initializeCosmosClient, 
  getContainer, 
  backupContainer, 
  upsertItem, 
  getExistingIds,
  hardDeleteItems
} = require('./lib/cosmos.cjs');
const { mapActivities, showActivitiesSummary, validateActivity } = require('./lib/mapActivities.cjs');
const { mapCapabilities, showCapabilitiesSummary, validateCapability } = require('./lib/mapCapabilities.cjs');
const { log, createBackupFilename } = require('./lib/utils.cjs');

/**
 * Get Cosmos DB configuration from environment
 */
function getCosmosConfig() {
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
function parseArgs() {
  const args = {};
  
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    
    switch (arg) {
      case '--activities':
      case '-a':
        args.activities = process.argv[++i];
        break;
      case '--capabilities':
      case '-c':
        args.capabilities = process.argv[++i];
        break;
      case '--backup':
      case '-b':
        args.backup = true;
        break;
      case '--purge':
      case '-p':
        args.purge = true;
        break;
      case '--dry-run':
      case '-d':
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
function showHelp() {
  console.log(`
ZTA Data Import Tool
===================

Import DoD Zero Trust Architecture capabilities and activities from CSV files into Azure Cosmos DB.

Usage:
  npm run seed-zta [options]

Options:
  --activities <file>, -a    Path to activities CSV file
  --capabilities <file>, -c  Path to capabilities CSV file  
  --backup, -b              Create backup before import (recommended)
  --purge, -p               Delete existing data not in CSV files
  --dry-run, -d             Preview import without making changes
  --help, -h                Show this help message

Examples:
  # Import both with backup
  npm run seed-zta -- --activities data/activities.csv --capabilities data/capabilities.csv --backup

  # Dry run to preview changes
  npm run seed-zta -- --activities data/activities.csv --dry-run

  # Full import with purge
  npm run seed-zta -- --activities data/activities.csv --capabilities data/capabilities.csv --backup --purge

Environment Variables:
  COSMOS_CONNECTION_STRING   Azure Cosmos DB connection string (required)
  COSMOS_DB_NAME            Database name (default: cato-dashboard)
  COSMOS_CONTAINER_ACTIVITIES    Activities container name
  COSMOS_CONTAINER_CAPABILITIES  Capabilities container name

For more information, see ZTA_IMPORT_README.md
  `);
}

/**
 * Validate file exists and is readable
 */
async function validateFile(filePath) {
  try {
    const resolved = path.resolve(filePath);
    await fs.access(resolved, fs.constants.R_OK);
    log(`✅ File validated: ${resolved}`);
  } catch (error) {
    throw new Error(`File not found or not readable: ${filePath}`);
  }
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  const required = [
    'COSMOS_CONNECTION_STRING',
    'COSMOS_CONTAINER_ACTIVITIES',
    'COSMOS_CONTAINER_CAPABILITIES'
  ];

  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  log('✅ Environment configuration validated');
}

/**
 * Import activities from CSV
 */
async function importActivities(filePath, dryRun = false) {
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

  const container = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_ACTIVITIES);
  log(`Importing ${validActivities.length} activities to Cosmos DB`);

  const importedIds = [];
  for (const activity of validActivities) {
    try {
      await upsertItem(container, activity);
      importedIds.push(activity.id);
      
      if (importedIds.length % 10 === 0) {
        log(`Imported ${importedIds.length}/${validActivities.length} activities`);
      }
    } catch (error) {
      log(`Failed to import activity ${activity.id}: ${error.message}`, 'error');
    }
  }

  log(`Successfully imported ${importedIds.length} activities`);
  return importedIds;
}

/**
 * Import capabilities from CSV
 */
async function importCapabilities(filePath, dryRun = false) {
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

  const container = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_CAPABILITIES);
  log(`Importing ${validCapabilities.length} capabilities to Cosmos DB`);

  const importedIds = [];
  for (const capability of validCapabilities) {
    try {
      await upsertItem(container, capability);
      importedIds.push(capability.id);
      
      if (importedIds.length % 10 === 0) {
        log(`Imported ${importedIds.length}/${validCapabilities.length} capabilities`);
      }
    } catch (error) {
      log(`Failed to import capability ${capability.id}: ${error.message}`, 'error');
    }
  }

  log(`Successfully imported ${importedIds.length} capabilities`);
  return importedIds;
}

/**
 * Create backup of existing data
 */
async function createBackup() {
  if (!fs) {
    log('Backup skipped - file system not available', 'warn');
    return;
  }

  try {
    log('Creating backup of existing data...');
    
    // Backup activities
    const activitiesContainer = process.env.COSMOS_CONTAINER_ACTIVITIES;
    const activitiesBackup = createBackupFilename(activitiesContainer);
    const activitiesContainerObj = await getContainer(getCosmosConfig(), activitiesContainer);
    await backupContainer(activitiesContainerObj, activitiesBackup);
    log(`Activities backup created: ${activitiesBackup}`);

    // Backup capabilities
    const capabilitiesContainer = process.env.COSMOS_CONTAINER_CAPABILITIES;
    const capabilitiesBackup = createBackupFilename(capabilitiesContainer);
    const capabilitiesContainerObj = await getContainer(getCosmosConfig(), capabilitiesContainer);
    await backupContainer(capabilitiesContainerObj, capabilitiesBackup);
    log(`Capabilities backup created: ${capabilitiesBackup}`);

    log('Backup completed successfully');
  } catch (error) {
    log(`Backup failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Purge data not present in CSV files
 */
async function purgeOldData(importedActivityIds, importedCapabilityIds) {
  try {
    log('Purging old data not present in CSV files...');

    // Purge old activities
    const activitiesContainer = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_ACTIVITIES);
    const existingActivityIds = await getExistingIds(activitiesContainer);
    
    const idsToDelete = existingActivityIds.filter(id => !importedActivityIds.includes(id));
    if (idsToDelete.length > 0) {
      await hardDeleteItems(activitiesContainer, idsToDelete);
      log(`Purged ${idsToDelete.length} old activities`);
    }

    // Purge old capabilities
    const capabilitiesContainer = await getContainer(getCosmosConfig(), process.env.COSMOS_CONTAINER_CAPABILITIES);
    const existingCapabilityIds = await getExistingIds(capabilitiesContainer);
    
    const capIdsToDelete = existingCapabilityIds.filter(id => !importedCapabilityIds.includes(id));
    if (capIdsToDelete.length > 0) {
      await hardDeleteItems(capabilitiesContainer, capIdsToDelete);
      log(`Purged ${capIdsToDelete.length} old capabilities`);
    }

    log('Purge completed successfully');
  } catch (error) {
    log(`Purge failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Main CLI function
 */
async function main() {
  console.log('🚀 ZTA Data Import Tool\n');

  try {
    // Parse arguments
    const args = parseArgs();

    // Show help if requested
    if (args.help) {
      showHelp();
      return;
    }

    // Validate at least one CSV file is provided
    if (!args.activities && !args.capabilities) {
      console.error('❌ Error: At least one CSV file must be provided');
      console.error('Use --help for usage information');
      process.exit(1);
    }

    // Load environment variables from .env file if it exists
    try {
      require('dotenv').config();
    } catch {
      // dotenv not available, continue without it
      log('dotenv not available, using environment variables directly', 'info');
    }

    // Validate environment
    validateEnvironment();

    // Validate input files
    if (args.activities) {
      await validateFile(args.activities);
    }
    if (args.capabilities) {
      await validateFile(args.capabilities);
    }

    // Initialize Cosmos client
    initializeCosmosClient(getCosmosConfig());
    log('Connected to Cosmos DB');

    // Create backup if requested
    if (args.backup && !args.dryRun) {
      await createBackup();
    }

    // Track imported IDs for purge operation
    const importedActivityIds = [];
    const importedCapabilityIds = [];

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
    if (args.purge && !args.dryRun) {
      await purgeOldData(importedActivityIds, importedCapabilityIds);
    }

    console.log('\n✅ ZTA Data Import completed successfully!');
    
    if (args.dryRun) {
      console.log('\n⚠️  This was a dry run - no changes were made to the database');
    }

  } catch (error) {
    console.error(`\n❌ Import failed: ${error.message}`);
    
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    
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

module.exports = {
  main,
  importActivities,
  importCapabilities,
  createBackup,
  purgeOldData
};
