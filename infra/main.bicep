@description('The name of the environment (dev, test, prod)')
param environmentName string = 'dev'

@description('The primary Azure region for deployment')
param location string = resourceGroup().location

@description('The resource token to make resource names unique')
param resourceToken string = toLower(uniqueString(subscription().id, environmentName, location))

@description('The Azure Entra ID tenant ID')
param tenantId string = tenant().tenantId

@description('The object ID of the Azure Entra ID group for administrators')
param adminGroupObjectId string

// Core naming conventions
var abbrs = {
  cosmosDBAccounts: 'cosmos-'
  staticSites: 'stapp-'
  managedIdentity: 'id-'
  keyVault: 'kv-'
  logAnalyticsWorkspace: 'log-'
  applicationInsights: 'appi-'
}

var resourceNames = {
  cosmosAccount: '${abbrs.cosmosDBAccounts}${resourceToken}'
  staticWebApp: '${abbrs.staticSites}${resourceToken}'
  managedIdentity: '${abbrs.managedIdentity}${resourceToken}'
  keyVault: '${abbrs.keyVault}${resourceToken}'
  logAnalytics: '${abbrs.logAnalyticsWorkspace}${resourceToken}'
  appInsights: '${abbrs.applicationInsights}${resourceToken}'
}

// Tags for resource organization and cost management
var tags = {
  'azd-env-name': environmentName
  'project': 'cato-dashboard'
  'environment': environmentName
  'cost-center': 'security-operations'
  'data-classification': 'cui'
}

// User-assigned managed identity for secure authentication
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: resourceNames.managedIdentity
  location: location
  tags: tags
}

// Key Vault for secure configuration storage
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: resourceNames.keyVault
  location: location
  tags: tags
  properties: {
    tenantId: tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enabledForDeployment: false
    enabledForTemplateDeployment: false
    enabledForDiskEncryption: false
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled' // Should be 'Disabled' in production with private endpoints
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
      ipRules: [] // Add your IP ranges here
    }
  }
}

// Log Analytics workspace for centralized logging
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: resourceNames.logAnalytics
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 90 // Adjust based on compliance requirements
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Application Insights for application monitoring
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: resourceNames.appInsights
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Cosmos DB account for data persistence
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: resourceNames.cosmosAccount
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    databaseAccountOfferType: 'Standard'
    enableAutomaticFailover: false
    enableMultipleWriteLocations: false
    disableKeyBasedMetadataWriteAccess: true // Enforce RBAC
    publicNetworkAccess: 'Enabled' // Should be 'Disabled' in production
    networkAclBypass: 'AzureServices'
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 8
        backupStorageRedundancy: 'Local'
      }
    }
  }
}

// Cosmos DB database
resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-11-15' = {
  parent: cosmosAccount
  name: 'cato-dashboard'
  properties: {
    resource: {
      id: 'cato-dashboard'
    }
  }
}

// Cosmos DB containers with optimized partition keys and indexing
resource nistControlsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'nist-controls'
  properties: {
    resource: {
      id: 'nist-controls'
      partitionKey: {
        paths: ['/controlFamily']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/controlFamily/?'
          }
          {
            path: '/status/?'
          }
          {
            path: '/riskLevel/?'
          }
          {
            path: '/lastAssessed/?'
          }
        ]
        excludedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

resource ztaActivitiesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'zta-activities'
  properties: {
    resource: {
      id: 'zta-activities'
      partitionKey: {
        paths: ['/pillar']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/pillar/?'
          }
          {
            path: '/status/?'
          }
          {
            path: '/phaseLevel/?'
          }
          {
            path: '/maturity/?'
          }
        ]
        excludedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

resource poamItemsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'poam-items'
  properties: {
    resource: {
      id: 'poam-items'
      partitionKey: {
        paths: ['/riskLevel']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/status/?'
          }
          {
            path: '/riskLevel/?'
          }
          {
            path: '/assignee/?'
          }
          {
            path: '/dueDate/?'
          }
        ]
        excludedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

resource controlHistoryContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'control-history'
  properties: {
    resource: {
      id: 'control-history'
      partitionKey: {
        paths: ['/controlId']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/controlId/?'
          }
          {
            path: '/changeDate/?'
          }
          {
            path: '/eventSource/?'
          }
        ]
        excludedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

resource vulnerabilitiesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = {
  parent: cosmosDatabase
  name: 'vulnerabilities'
  properties: {
    resource: {
      id: 'vulnerabilities'
      partitionKey: {
        paths: ['/severity']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/severity/?'
          }
          {
            path: '/status/?'
          }
          {
            path: '/discoveryDate/?'
          }
        ]
        excludedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

// Static Web App for hosting the React application
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: resourceNames.staticWebApp
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    buildProperties: {
      skipGithubActionWorkflowGeneration: true
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    enterpriseGradeCdnStatus: 'Enabled'
  }
}

// RBAC assignments for the managed identity
resource cosmosDataContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: cosmosAccount
  name: guid(cosmosAccount.id, managedIdentity.id, 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b') // Cosmos DB Built-in Data Contributor
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource keyVaultSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(keyVault.id, managedIdentity.id, '4633458b-17de-408a-b874-0445c86b69e6')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource logAnalyticsContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: logAnalytics
  name: guid(logAnalytics.id, managedIdentity.id, '92aaf0da-9dab-42b6-94a3-d43ce8d16293')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '92aaf0da-9dab-42b6-94a3-d43ce8d16293') // Log Analytics Contributor
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Store configuration in Key Vault
resource cosmosConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'cosmos-connection-string'
  properties: {
    value: 'AccountEndpoint=${cosmosAccount.properties.documentEndpoint};AccountKey=${cosmosAccount.listKeys().primaryMasterKey};'
    contentType: 'text/plain'
  }
}

resource appInsightsConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'appinsights-connection-string'
  properties: {
    value: appInsights.properties.ConnectionString
    contentType: 'text/plain'
  }
}

// Outputs for use by the application and other resources
output AZURE_COSMOS_ENDPOINT string = cosmosAccount.properties.documentEndpoint
output AZURE_COSMOS_DATABASE_NAME string = cosmosDatabase.name
output AZURE_KEY_VAULT_ENDPOINT string = keyVault.properties.vaultUri
output AZURE_MANAGED_IDENTITY_CLIENT_ID string = managedIdentity.properties.clientId
output AZURE_STATIC_WEB_APP_NAME string = staticWebApp.name
output AZURE_STATIC_WEB_APP_HOSTNAME string = staticWebApp.properties.defaultHostname
output APPLICATIONINSIGHTS_CONNECTION_STRING string = appInsights.properties.ConnectionString
output AZURE_LOG_ANALYTICS_WORKSPACE_ID string = logAnalytics.properties.customerId
