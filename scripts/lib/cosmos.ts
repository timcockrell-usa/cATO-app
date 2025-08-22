/**
 * Azure Cosmos DB client factory with lazy singleton pattern
 */

import { CosmosClient, Database, Container } from '@azure/cosmos';
import { log } from './utils';

let cosmosClient: CosmosClient | null = null;
let database: Database | null = null;

export interface CosmosConfig {
  connectionString?: string;
  endpoint?: string;
  key?: string;
  databaseName: string;
}

/**
 * Initialize Cosmos DB client
 */
export function initializeCosmosClient(config: CosmosConfig): CosmosClient {
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
export async function getDatabase(config: CosmosConfig): Promise<Database> {
  if (database) {
    return database;
  }

  const client = initializeCosmosClient(config);
  
  try {
    // Try to read existing database
    const { database: db } = await client.database(config.databaseName).read();
    database = db;
    log(`Connected to existing database: ${config.databaseName}`);
  } catch (error: any) {
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
export async function getContainer(
  config: CosmosConfig,
  containerName: string,
  partitionKey: string = '/partitionKey'
): Promise<Container> {
  const db = await getDatabase(config);
  
  try {
    // Try to read existing container
    const { container } = await db.container(containerName).read();
    log(`Connected to existing container: ${containerName}`);
    return container;
  } catch (error: any) {
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
export async function backupContainer(
  container: Container,
  backupPath: string
): Promise<number> {
  log(`Starting backup of container to ${backupPath}`);
  
  const { resources: items } = await container.items.readAll().fetchAll();
  
  // Write to file
  const fs = await import('fs/promises');
  await fs.writeFile(backupPath, JSON.stringify(items, null, 2));
  
  log(`Backed up ${items.length} items to ${backupPath}`);
  return items.length;
}

/**
 * Get all item IDs from a container
 */
export async function getExistingIds(container: Container): Promise<string[]> {
  const query = 'SELECT c.id FROM c';
  const { resources: items } = await container.items.query(query).fetchAll();
  return items.map(item => item.id);
}

/**
 * Mark items as deprecated (soft delete)
 */
export async function markAsDeprecated(
  container: Container,
  idsToDeprecate: string[],
  timestamp: string
): Promise<number> {
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
    } catch (error: any) {
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
export async function hardDeleteItems(
  container: Container,
  idsToDelete: string[]
): Promise<number> {
  if (idsToDelete.length === 0) {
    return 0;
  }

  log(`Hard deleting ${idsToDelete.length} items`);
  
  let count = 0;
  for (const id of idsToDelete) {
    try {
      await container.item(id, id).delete();
      count++;
    } catch (error: any) {
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
export async function upsertItem<T>(
  container: Container,
  item: T & { id: string }
): Promise<void> {
  try {
    await container.items.upsert(item);
  } catch (error: any) {
    log(`Failed to upsert item ${item.id}: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test connection to Cosmos DB
 */
export async function testConnection(config: CosmosConfig): Promise<boolean> {
  try {
    const db = await getDatabase(config);
    await db.read();
    log('Cosmos DB connection test successful');
    return true;
  } catch (error: any) {
    log(`Cosmos DB connection test failed: ${error.message}`, 'error');
    return false;
  }
}
