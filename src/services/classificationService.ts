/**
 * Impact Level and Classification Service
 * Manages dynamic classification and impact level display based on imported data
 */

import { CosmosClient, Container } from '@azure/cosmos';

// Configuration
const cosmosConfig = {
  endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
  key: import.meta.env.VITE_COSMOS_DB_KEY || 'your-cosmos-key',
  databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

export interface SystemClassification {
  impactLevel: 'IL1' | 'IL2' | 'IL3' | 'IL4' | 'IL5' | 'IL6';
  dataClassification: 'Unclassified' | 'CUI' | 'Confidential' | 'Secret' | 'Top Secret';
  fismaLevel: 'Low' | 'Moderate' | 'High';
  lastUpdated: Date;
  source: 'manual' | 'imported' | 'calculated';
}

export interface CloudEnvironment {
  id: string;
  name: string;
  provider: 'azure' | 'aws' | 'google' | 'oracle' | 'other';
  impactLevel: SystemClassification['impactLevel'];
  dataClassification: SystemClassification['dataClassification'];
  isActive: boolean;
}

class ClassificationService {
  private client: CosmosClient;
  private systemConfigContainer: Container;
  private environmentsContainer: Container;

  constructor() {
    this.client = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key,
    });
    
    const database = this.client.database(cosmosConfig.databaseId);
    this.systemConfigContainer = database.container('system-configuration');
    this.environmentsContainer = database.container('cloud-environments');
  }

  /**
   * Get current system classification
   */
  async getCurrentClassification(tenantId: string): Promise<SystemClassification> {
    try {
      const { resource } = await this.systemConfigContainer
        .item(`classification-${tenantId}`, tenantId)
        .read();
      
      if (resource) {
        return resource;
      }
    } catch (error) {
      if (error.code !== 404) {
        console.error('Error fetching classification:', error);
      }
    }

    // Return default classification
    return this.getDefaultClassification();
  }

  /**
   * Update system classification
   */
  async updateClassification(
    tenantId: string, 
    classification: Partial<SystemClassification>
  ): Promise<SystemClassification> {
    const current = await this.getCurrentClassification(tenantId);
    
    const updated: SystemClassification = {
      ...current,
      ...classification,
      lastUpdated: new Date(),
    };

    await this.systemConfigContainer.items.upsert({
      id: `classification-${tenantId}`,
      tenantId,
      ...updated
    });

    return updated;
  }

  /**
   * Calculate classification from imported environments
   */
  async calculateClassificationFromEnvironments(tenantId: string): Promise<SystemClassification> {
    try {
      const environments = await this.getCloudEnvironments(tenantId);
      
      if (environments.length === 0) {
        return this.getDefaultClassification();
      }

      // Find highest impact level
      const impactLevels = ['IL1', 'IL2', 'IL3', 'IL4', 'IL5', 'IL6'];
      const maxImpactLevel = environments.reduce((max, env) => {
        const maxIndex = impactLevels.indexOf(max);
        const envIndex = impactLevels.indexOf(env.impactLevel);
        return envIndex > maxIndex ? env.impactLevel : max;
      }, 'IL1' as SystemClassification['impactLevel']);

      // Find highest data classification
      const classifications = ['Unclassified', 'CUI', 'Confidential', 'Secret', 'Top Secret'];
      const maxClassification = environments.reduce((max, env) => {
        const maxIndex = classifications.indexOf(max);
        const envIndex = classifications.indexOf(env.dataClassification);
        return envIndex > maxIndex ? env.dataClassification : max;
      }, 'Unclassified' as SystemClassification['dataClassification']);

      // Map to FISMA level
      const fismaLevel = this.mapToFismaLevel(maxImpactLevel);

      const calculated: SystemClassification = {
        impactLevel: maxImpactLevel,
        dataClassification: maxClassification,
        fismaLevel,
        lastUpdated: new Date(),
        source: 'calculated'
      };

      // Save calculated classification
      await this.updateClassification(tenantId, calculated);
      
      return calculated;
    } catch (error) {
      console.error('Error calculating classification:', error);
      return this.getDefaultClassification();
    }
  }

  /**
   * Get cloud environments
   */
  async getCloudEnvironments(tenantId: string): Promise<CloudEnvironment[]> {
    try {
      const { resources } = await this.environmentsContainer.items
        .query({
          query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
          parameters: [{ name: "@tenantId", value: tenantId }]
        })
        .fetchAll();
      
      return resources || [];
    } catch (error) {
      console.error('Error fetching environments:', error);
      return [];
    }
  }

  /**
   * Add cloud environment
   */
  async addCloudEnvironment(
    tenantId: string,
    environment: Omit<CloudEnvironment, 'id'>
  ): Promise<CloudEnvironment> {
    const newEnvironment: CloudEnvironment = {
      ...environment,
      id: `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    await this.environmentsContainer.items.create({
      id: newEnvironment.id,
      tenantId,
      ...newEnvironment
    });

    // Recalculate system classification
    await this.calculateClassificationFromEnvironments(tenantId);

    return newEnvironment;
  }

  /**
   * Get classification badge styling
   */
  getClassificationBadgeStyle(classification: SystemClassification) {
    const { impactLevel, dataClassification } = classification;
    
    // Primary display is based on impact level
    switch (impactLevel) {
      case 'IL1':
        return {
          text: 'IL1 ACTIVE',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'IL2':
        return {
          text: 'IL2 ACTIVE',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'IL3':
        return {
          text: 'IL3 ACTIVE',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'IL4':
        return {
          text: 'IL4 ACTIVE',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'IL5':
        return {
          text: 'IL5 ACTIVE',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'IL6':
        return {
          text: 'IL6 ACTIVE',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          text: 'IL2 ACTIVE',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
    }
  }

  /**
   * Get CUI badge styling
   */
  getCUIBadgeStyle(classification: SystemClassification) {
    const { dataClassification } = classification;
    
    switch (dataClassification) {
      case 'Unclassified':
        return {
          text: 'UNCLASSIFIED',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'CUI':
        return {
          text: 'CUI',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'Confidential':
        return {
          text: 'CONFIDENTIAL',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'Secret':
        return {
          text: 'SECRET',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'Top Secret':
        return {
          text: 'TOP SECRET',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          text: 'CUI',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
    }
  }

  /**
   * Get default classification
   */
  private getDefaultClassification(): SystemClassification {
    return {
      impactLevel: 'IL2',
      dataClassification: 'CUI',
      fismaLevel: 'Moderate',
      lastUpdated: new Date(),
      source: 'manual'
    };
  }

  /**
   * Map impact level to FISMA level
   */
  private mapToFismaLevel(impactLevel: SystemClassification['impactLevel']): SystemClassification['fismaLevel'] {
    switch (impactLevel) {
      case 'IL1':
      case 'IL2':
        return 'Low';
      case 'IL3':
      case 'IL4':
        return 'Moderate';
      case 'IL5':
      case 'IL6':
        return 'High';
      default:
        return 'Moderate';
    }
  }
}

// Export singleton instance
export const classificationService = new ClassificationService();
export { ClassificationService };
