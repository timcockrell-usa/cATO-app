// Cosmos DB Azure Coverage Update Script
// Generated: 2025-08-26T07:58:52.266Z

const { CosmosClient } = require('@azure/cosmos');

const cosmosConfig = {
  endpoint: process.env.COSMOS_ENDPOINT || '',
  key: process.env.COSMOS_KEY || '',
  databaseId: 'cato-dashboard',
  containerId: 'nist-controls'
};

const client = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key
});

const database = client.database(cosmosConfig.databaseId);
const container = database.container(cosmosConfig.containerId);

// Azure coverage updates
const azureCoverageUpdates = [
  {
    "id": "AC-1",
    "controlIdentifier": "AC-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2",
    "controlIdentifier": "AC-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(1)",
    "controlIdentifier": "AC-2(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(2)",
    "controlIdentifier": "AC-2(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(3)",
    "controlIdentifier": "AC-2(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(4)",
    "controlIdentifier": "AC-2(4)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(5)",
    "controlIdentifier": "AC-2(5)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(6)",
    "controlIdentifier": "AC-2(6)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(7)",
    "controlIdentifier": "AC-2(7)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(8)",
    "controlIdentifier": "AC-2(8)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(9)",
    "controlIdentifier": "AC-2(9)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-2(10)",
    "controlIdentifier": "AC-2(10)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-3",
    "controlIdentifier": "AC-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-3(3)",
    "controlIdentifier": "AC-3(3)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-4",
    "controlIdentifier": "AC-4",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-5",
    "controlIdentifier": "AC-5",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-6",
    "controlIdentifier": "AC-6",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-6(1)",
    "controlIdentifier": "AC-6(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-6(2)",
    "controlIdentifier": "AC-6(2)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-6(5)",
    "controlIdentifier": "AC-6(5)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-6(9)",
    "controlIdentifier": "AC-6(9)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-6(10)",
    "controlIdentifier": "AC-6(10)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-7",
    "controlIdentifier": "AC-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-8",
    "controlIdentifier": "AC-8",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-10",
    "controlIdentifier": "AC-10",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-11",
    "controlIdentifier": "AC-11",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-12",
    "controlIdentifier": "AC-12",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-14",
    "controlIdentifier": "AC-14",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-17",
    "controlIdentifier": "AC-17",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-17(1)",
    "controlIdentifier": "AC-17(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-17(2)",
    "controlIdentifier": "AC-17(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-17(3)",
    "controlIdentifier": "AC-17(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-18",
    "controlIdentifier": "AC-18",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-19",
    "controlIdentifier": "AC-19",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-19(5)",
    "controlIdentifier": "AC-19(5)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-20",
    "controlIdentifier": "AC-20",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-20(1)",
    "controlIdentifier": "AC-20(1)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-20(2)",
    "controlIdentifier": "AC-20(2)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AC-20(3)",
    "controlIdentifier": "AC-20(3)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AT-1",
    "controlIdentifier": "AT-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AT-2",
    "controlIdentifier": "AT-2",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AT-3",
    "controlIdentifier": "AT-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AT-4",
    "controlIdentifier": "AT-4",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-1",
    "controlIdentifier": "AU-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-2",
    "controlIdentifier": "AU-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-2(1)",
    "controlIdentifier": "AU-2(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-3",
    "controlIdentifier": "AU-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-3(1)",
    "controlIdentifier": "AU-3(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-4",
    "controlIdentifier": "AU-4",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-5",
    "controlIdentifier": "AU-5",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-6",
    "controlIdentifier": "AU-6",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-6(1)",
    "controlIdentifier": "AU-6(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-6(3)",
    "controlIdentifier": "AU-6(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-7",
    "controlIdentifier": "AU-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-8",
    "controlIdentifier": "AU-8",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-8(1)",
    "controlIdentifier": "AU-8(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-9",
    "controlIdentifier": "AU-9",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-9(2)",
    "controlIdentifier": "AU-9(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-9(4)",
    "controlIdentifier": "AU-9(4)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-11",
    "controlIdentifier": "AU-11",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "AU-12",
    "controlIdentifier": "AU-12",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CA-1",
    "controlIdentifier": "CA-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CA-2",
    "controlIdentifier": "CA-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CA-3",
    "controlIdentifier": "CA-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CA-5",
    "controlIdentifier": "CA-5",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CA-6",
    "controlIdentifier": "CA-6",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CA-7",
    "controlIdentifier": "CA-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CA-9",
    "controlIdentifier": "CA-9",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-1",
    "controlIdentifier": "CM-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-2",
    "controlIdentifier": "CM-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-2(1)",
    "controlIdentifier": "CM-2(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-3",
    "controlIdentifier": "CM-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-3(2)",
    "controlIdentifier": "CM-3(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-4",
    "controlIdentifier": "CM-4",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-5",
    "controlIdentifier": "CM-5",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-6",
    "controlIdentifier": "CM-6",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-7",
    "controlIdentifier": "CM-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-7(1)",
    "controlIdentifier": "CM-7(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-7(2)",
    "controlIdentifier": "CM-7(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-8",
    "controlIdentifier": "CM-8",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-8(1)",
    "controlIdentifier": "CM-8(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-8(3)",
    "controlIdentifier": "CM-8(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-9",
    "controlIdentifier": "CM-9",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-10",
    "controlIdentifier": "CM-10",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CM-11",
    "controlIdentifier": "CM-11",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-1",
    "controlIdentifier": "CP-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-2",
    "controlIdentifier": "CP-2",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-3",
    "controlIdentifier": "CP-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-4",
    "controlIdentifier": "CP-4",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-6",
    "controlIdentifier": "CP-6",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-7",
    "controlIdentifier": "CP-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-8",
    "controlIdentifier": "CP-8",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-9",
    "controlIdentifier": "CP-9",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "CP-10",
    "controlIdentifier": "CP-10",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-1",
    "controlIdentifier": "IA-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-2",
    "controlIdentifier": "IA-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-2(1)",
    "controlIdentifier": "IA-2(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-2(2)",
    "controlIdentifier": "IA-2(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-2(3)",
    "controlIdentifier": "IA-2(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-2(8)",
    "controlIdentifier": "IA-2(8)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-3",
    "controlIdentifier": "IA-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-4",
    "controlIdentifier": "IA-4",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-5",
    "controlIdentifier": "IA-5",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-5(1)",
    "controlIdentifier": "IA-5(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-5(2)",
    "controlIdentifier": "IA-5(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-5(7)",
    "controlIdentifier": "IA-5(7)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-5(13)",
    "controlIdentifier": "IA-5(13)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-6",
    "controlIdentifier": "IA-6",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-7",
    "controlIdentifier": "IA-7",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-8",
    "controlIdentifier": "IA-8",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-8(1)",
    "controlIdentifier": "IA-8(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-8(3)",
    "controlIdentifier": "IA-8(3)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-8(4)",
    "controlIdentifier": "IA-8(4)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-8(5)",
    "controlIdentifier": "IA-8(5)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-8(6)",
    "controlIdentifier": "IA-8(6)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IA-11",
    "controlIdentifier": "IA-11",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-1",
    "controlIdentifier": "IR-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-2",
    "controlIdentifier": "IR-2",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-3",
    "controlIdentifier": "IR-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-4",
    "controlIdentifier": "IR-4",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-4(1)",
    "controlIdentifier": "IR-4(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-5",
    "controlIdentifier": "IR-5",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-6",
    "controlIdentifier": "IR-6",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-7",
    "controlIdentifier": "IR-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "IR-8",
    "controlIdentifier": "IR-8",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MA-1",
    "controlIdentifier": "MA-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MA-2",
    "controlIdentifier": "MA-2",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MA-3",
    "controlIdentifier": "MA-3",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MA-4",
    "controlIdentifier": "MA-4",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MA-4(1)",
    "controlIdentifier": "MA-4(1)",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MA-5",
    "controlIdentifier": "MA-5",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MA-6",
    "controlIdentifier": "MA-6",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MP-1",
    "controlIdentifier": "MP-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MP-2",
    "controlIdentifier": "MP-2",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MP-3",
    "controlIdentifier": "MP-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MP-4",
    "controlIdentifier": "MP-4",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MP-5",
    "controlIdentifier": "MP-5",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MP-6",
    "controlIdentifier": "MP-6",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "MP-7",
    "controlIdentifier": "MP-7",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-1",
    "controlIdentifier": "PE-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-2",
    "controlIdentifier": "PE-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-3",
    "controlIdentifier": "PE-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-4",
    "controlIdentifier": "PE-4",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-5",
    "controlIdentifier": "PE-5",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-6",
    "controlIdentifier": "PE-6",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-8",
    "controlIdentifier": "PE-8",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-9",
    "controlIdentifier": "PE-9",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-11",
    "controlIdentifier": "PE-11",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-12",
    "controlIdentifier": "PE-12",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-13",
    "controlIdentifier": "PE-13",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-14",
    "controlIdentifier": "PE-14",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-15",
    "controlIdentifier": "PE-15",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PE-16",
    "controlIdentifier": "PE-16",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PL-1",
    "controlIdentifier": "PL-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PL-2",
    "controlIdentifier": "PL-2",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PL-4",
    "controlIdentifier": "PL-4",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PL-8",
    "controlIdentifier": "PL-8",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PL-10",
    "controlIdentifier": "PL-10",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PL-11",
    "controlIdentifier": "PL-11",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-1",
    "controlIdentifier": "PM-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-2",
    "controlIdentifier": "PM-2",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-3",
    "controlIdentifier": "PM-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-4",
    "controlIdentifier": "PM-4",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-5",
    "controlIdentifier": "PM-5",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-6",
    "controlIdentifier": "PM-6",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-7",
    "controlIdentifier": "PM-7",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-8",
    "controlIdentifier": "PM-8",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-9",
    "controlIdentifier": "PM-9",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-10",
    "controlIdentifier": "PM-10",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-11",
    "controlIdentifier": "PM-11",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-12",
    "controlIdentifier": "PM-12",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-14",
    "controlIdentifier": "PM-14",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PM-16",
    "controlIdentifier": "PM-16",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-1",
    "controlIdentifier": "PS-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-2",
    "controlIdentifier": "PS-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-3",
    "controlIdentifier": "PS-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-3(2)",
    "controlIdentifier": "PS-3(2)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-4",
    "controlIdentifier": "PS-4",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-5",
    "controlIdentifier": "PS-5",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-6",
    "controlIdentifier": "PS-6",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-7",
    "controlIdentifier": "PS-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "PS-8",
    "controlIdentifier": "PS-8",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-1",
    "controlIdentifier": "RA-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-2",
    "controlIdentifier": "RA-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-2(1)",
    "controlIdentifier": "RA-2(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-3",
    "controlIdentifier": "RA-3",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-5",
    "controlIdentifier": "RA-5",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-5(1)",
    "controlIdentifier": "RA-5(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-5(2)",
    "controlIdentifier": "RA-5(2)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-5(3)",
    "controlIdentifier": "RA-5(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-5(4)",
    "controlIdentifier": "RA-5(4)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "RA-6",
    "controlIdentifier": "RA-6",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-1",
    "controlIdentifier": "SA-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-2",
    "controlIdentifier": "SA-2",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-3",
    "controlIdentifier": "SA-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-4",
    "controlIdentifier": "SA-4",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-4(1)",
    "controlIdentifier": "SA-4(1)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-4(2)",
    "controlIdentifier": "SA-4(2)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-4(3)",
    "controlIdentifier": "SA-4(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-5",
    "controlIdentifier": "SA-5",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-5(1)",
    "controlIdentifier": "SA-5(1)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-6",
    "controlIdentifier": "SA-6",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SA-7",
    "controlIdentifier": "SA-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-1",
    "controlIdentifier": "SC-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-2",
    "controlIdentifier": "SC-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-3",
    "controlIdentifier": "SC-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-4",
    "controlIdentifier": "SC-4",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-5",
    "controlIdentifier": "SC-5",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-7",
    "controlIdentifier": "SC-7",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-7(1)",
    "controlIdentifier": "SC-7(1)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-7(3)",
    "controlIdentifier": "SC-7(3)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-8",
    "controlIdentifier": "SC-8",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-8(1)",
    "controlIdentifier": "SC-8(1)",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-10",
    "controlIdentifier": "SC-10",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-12",
    "controlIdentifier": "SC-12",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-13",
    "controlIdentifier": "SC-13",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-13(1)",
    "controlIdentifier": "SC-13(1)",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-15",
    "controlIdentifier": "SC-15",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-17",
    "controlIdentifier": "SC-17",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-18",
    "controlIdentifier": "SC-18",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-19",
    "controlIdentifier": "SC-19",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-20",
    "controlIdentifier": "SC-20",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-21",
    "controlIdentifier": "SC-21",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-22",
    "controlIdentifier": "SC-22",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-23",
    "controlIdentifier": "SC-23",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-28",
    "controlIdentifier": "SC-28",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-28(1)",
    "controlIdentifier": "SC-28(1)",
    "providerCovered": true,
    "providerCoverageType": "Full",
    "azureInherited": true,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SC-39",
    "controlIdentifier": "SC-39",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-1",
    "controlIdentifier": "SI-1",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-2",
    "controlIdentifier": "SI-2",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-3",
    "controlIdentifier": "SI-3",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-4",
    "controlIdentifier": "SI-4",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-4(14)",
    "controlIdentifier": "SI-4(14)",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-5",
    "controlIdentifier": "SI-5",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-7",
    "controlIdentifier": "SI-7",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-7(8)",
    "controlIdentifier": "SI-7(8)",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-8",
    "controlIdentifier": "SI-8",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-10",
    "controlIdentifier": "SI-10",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-12",
    "controlIdentifier": "SI-12",
    "providerCovered": false,
    "providerCoverageType": "None",
    "azureInherited": false,
    "azureSharedResponsibility": false,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  },
  {
    "id": "SI-16",
    "controlIdentifier": "SI-16",
    "providerCovered": true,
    "providerCoverageType": "Partial",
    "azureInherited": false,
    "azureSharedResponsibility": true,
    "lastUpdated": "2025-08-26T07:58:52.151Z",
    "updatedBy": "Azure Coverage Import"
  }
];

async function updateNISTControlsWithAzureCoverage() {
  console.log('🚀 Starting Azure coverage update for NIST controls');
  
  let successCount = 0;
  let errorCount = 0;

  for (const update of azureCoverageUpdates) {
    try {
      // Read the existing control
      const { resource: existingControl } = await container.item(
        update.controlIdentifier, 
        update.controlIdentifier
      ).read();

      if (existingControl) {
        // Update with Azure coverage information
        const updatedControl = {
          ...existingControl,
          providerCovered: update.providerCovered,
          providerCoverageType: update.providerCoverageType,
          azureInherited: update.azureInherited,
          azureSharedResponsibility: update.azureSharedResponsibility,
          lastUpdated: update.lastUpdated,
          updatedBy: update.updatedBy
        };

        // Replace the document
        await container.item(update.controlIdentifier, update.controlIdentifier)
          .replace(updatedControl);
        
        successCount++;
        console.log(`✅ Updated ${update.controlIdentifier}`);
      } else {
        console.warn(`⚠️  Control ${update.controlIdentifier} not found`);
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.controlIdentifier}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Update Summary:`);
  console.log(`✅ Successfully updated: ${successCount} controls`);
  console.log(`❌ Errors: ${errorCount} controls`);
  console.log(`🎯 Total processed: ${successCount + errorCount} controls`);
}

// Run the update
updateNISTControlsWithAzureCoverage()
  .then(() => {
    console.log('🎉 Azure coverage update completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Update failed:', error);
    process.exit(1);
  });
