/**
 * Azure Cosmos DB client factory with lazy singleton pattern
 */

const { CosmosClient } = require('@azure/cosmos');
const { log } = require('./utils');

let cosmosClient = null;
let database = null;

/**
 * Initialize Cosmos DB client
 */
function initializeCosmosClient(config) {
  if (cosmosClient) {
    return cosmosClient;
  }

  if (config.connectionString) {
    cosmosClient = new CosmosClient(config.connectionString);
    log(`Connected to Cosmos DB using connection string`);
  } else if (config.endpoint && config.key) {
    cosmosClient = new CosmosClient({
      endpoint: config.endpoint,
      key: config.key
    });
    log(`Connected to Cosmos DB at ${config.endpoint}`);
  } else {
    throw new Error('Either connectionString or both endpoint and key must be provided');
  }

  return cosmosClient;
}

/**
 * Get or create database
 */
async function getDatabase(config) {
  if (database) {
    return database;
  }

  const client = initializeCosmosClient(config);
  
  try {
    // Try to read existing database
    const { database: db } = await client.database(config.databaseName).read();
    database = db;
    log(`Connected to existing database: ${config.databaseName}`);
  } catch (error) {
    if (error.code === 404) {
      // Create database if it doesn't exist
      const { database: db } = await client.databases.create({
        id: config.databaseName
      });
      database = db;
      log(`Created new database: ${config.databaseName}`);
    } else {
      throw error;
    }
  }

  return database;
}

/**
 * Get or create container
 */
async function getContainer(config, containerName, partitionKey = '/partitionKey') {
  const db = await getDatabase(config);
  
  try {
    // Try to read existing container
    const { container } = await db.container(containerName).read();
    log(`Connected to existing container: ${containerName}`);
    return container;
  } catch (error) {
    if (error.code === 404) {
      // Create container if it doesn't exist
      const { container } = await db.containers.create({
        id: containerName,
        partitionKey: partitionKey
      });
      log(`Created new container: ${containerName}`);
      return container;
    } else {
      throw error;
    }
  }
}

/**
 * Backup all items from a container to JSON file
 */
async function backupContainer(container, backupPath) {
  log(`Starting backup of container to ${backupPath}`);
  
  const { resources: items } = await container.items.readAll().fetchAll();
  
  // Write to file
  const fs = require('fs').promises;
  await fs.writeFile(backupPath, JSON.stringify(items, null, 2));
  
  log(`Backed up ${items.length} items to ${backupPath}`);
  return items.length;
}

/**
 * Get all item IDs from a container
 */
async function getExistingIds(container) {
  const query = 'SELECT c.id FROM c';
  const { resources: items } = await container.items.query(query).fetchAll();
  return items.map(item => item.id);
}

/**
 * Mark items as deprecated (soft delete)
 */
async function markAsDeprecated(container, idsToDeprecate, timestamp) {
  if (idsToDeprecate.length === 0) {
    return 0;
  }

  log(`Marking ${idsToDeprecate.length} items as deprecated`);
  
  let count = 0;
  for (const id of idsToDeprecate) {
    try {
      // Read the item first
      const { resource: item } = await container.item(id, id).read();
      
      if (item) {
        // Update with deprecated status
        item.status = 'Planned';
        item.notes = `Deprecated by import ${timestamp}`;
        item.deprecated = true;
        item.deprecatedAt = timestamp;
        
        await container.item(id, id).replace(item);
        count++;
      }
    } catch (error) {
      if (error.code !== 404) {
        log(`Failed to deprecate item ${id}: ${error.message}`, 'warn');
      }
    }
  }
  
  log(`Successfully marked ${count} items as deprecated`);
  return count;
}

/**
 * Hard delete items
 */
async function hardDeleteItems(container, idsToDelete) {
  if (idsToDelete.length === 0) {
    return 0;
  }

  log(`Hard deleting ${idsToDelete.length} items`);
  
  let count = 0;
  for (const id of idsToDelete) {
    try {
      await container.item(id, id).delete();
      count++;
    } catch (error) {
      if (error.code !== 404) {
        log(`Failed to delete item ${id}: ${error.message}`, 'warn');
      }
    }
  }
  
  log(`Successfully deleted ${count} items`);
  return count;
}

/**
 * Upsert an item into the container
 */
async function upsertItem(container, item) {
  try {
    await container.items.upsert(item);
  } catch (error) {
    log(`Failed to upsert item ${item.id}: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test connection to Cosmos DB
 */
async function testConnection(config) {
  try {
    const db = await getDatabase(config);
    await db.read();
    log('Cosmos DB connection test successful');
    return true;
  } catch (error) {
    log(`Cosmos DB connection test failed: ${error.message}`, 'error');
    return false;
  }
}

module.exports = {
  initializeCosmosClient,
  getDatabase,
  getContainer,
  backupContainer,
  getExistingIds,
  markAsDeprecated,
  hardDeleteItems,
  upsertItem,
  testConnection
};
