/**
 * Enhanced Multi-Cloud Cosmos DB Service
 * Supports multi-tenant, multi-cloud cATO data management with NIST revision management
 */

import { CosmosClient, Container, Database } from '@azure/cosmos';
import { 
  EnhancedNISTControl, 
  EnhancedZTAActivity, 
  EnhancedPOAMItem,
  Tenant,
  CloudEnvironment,
  ComplianceData,
  SSCMetrics,
  ExecutionEnabler,
  MultiCloudRemediation
} from '../types/multiCloud';
import {
  NISTRevisionMapping,
  NISTRevisionUpgradeHistory,
  NISTRevisionGapAnalysis,
  NISTControlMapping,
  RevisionMigrationPlan,
  NISTRevisionSettings,
  RevisionGapAnalysisResponse,
  RevisionUpgradeResponse,
  NISTControlRevisionComparison
} from '../types/nistRevisionManagement';
import { Organization, NistRevision } from '../types/organization';

// Enhanced Cosmos DB configuration for multi-tenancy
const cosmosConfig = {
  endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
  key: import.meta.env.VITE_COSMOS_DB_KEY || 'your-cosmos-key',
  databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

class EnhancedCosmosDBService {
  private client: CosmosClient;
  private database: Database;
  private containers: {
    tenants: Container;
    cloudEnvironments: Container;
    nistControls: Container;
    ztaActivities: Container;
    poamItems: Container;
    complianceData: Container;
    sscMetrics: Container;
    executionEnablers: Container;
    auditLogs: Container;
    nistRevisionMappings: Container;
    nistRevisionUpgradeHistory: Container;
    nistRevisionSettings: Container;
  };

  constructor() {
    this.client = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key,
      connectionPolicy: {
        enableEndpointDiscovery: false,
        preferredLocations: ['East US', 'West US 2'],
      },
      consistencyLevel: 'Session',
    });

    this.database = this.client.database(cosmosConfig.databaseId);
    
    // Initialize containers with partition keys for multi-tenancy
    this.containers = {
      tenants: this.database.container('tenants'),
      cloudEnvironments: this.database.container('cloud-environments'),
      nistControls: this.database.container('nist-controls-enhanced'),
      ztaActivities: this.database.container('zta-activities-enhanced'),
      poamItems: this.database.container('poam-items-enhanced'),
      complianceData: this.database.container('compliance-data'),
      sscMetrics: this.database.container('ssc-metrics'),
      executionEnablers: this.database.container('execution-enablers'),
      auditLogs: this.database.container('audit-logs'),
      nistRevisionMappings: this.database.container('nist-revision-mappings'),
      nistRevisionUpgradeHistory: this.database.container('nist-revision-upgrade-history'),
      nistRevisionSettings: this.database.container('nist-revision-settings')
    };
  }

  // Tenant Management
  async createTenant(tenant: Tenant): Promise<Tenant> {
    try {
      const { resource } = await this.containers.tenants.items.create(tenant);
      return resource as Tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const { resource } = await this.containers.tenants.item(tenantId, tenantId).read();
      return resource as Tenant;
    } catch (error) {
      if ((error as any).code === 404) {
        return null;
      }
      console.error('Error getting tenant:', error);
      throw error;
    }
  }

  async updateTenant(tenant: Tenant): Promise<Tenant> {
    try {
      const { resource } = await this.containers.tenants.item(tenant.id, tenant.id).replace(tenant);
      return resource as Tenant;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  // Cloud Environment Management
  async createCloudEnvironment(environment: CloudEnvironment): Promise<CloudEnvironment> {
    try {
      const { resource } = await this.containers.cloudEnvironments.items.create(environment);
      return resource as CloudEnvironment;
    } catch (error) {
      console.error('Error creating cloud environment:', error);
      throw error;
    }
  }

  async getCloudEnvironments(tenantId: string): Promise<CloudEnvironment[]> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      };

      const { resources } = await this.containers.cloudEnvironments.items.query(querySpec).fetchAll();
      return resources as CloudEnvironment[];
    } catch (error) {
      console.error('Error getting cloud environments:', error);
      throw error;
    }
  }

  async updateCloudEnvironmentStatus(
    environmentId: string, 
    tenantId: string, 
    status: CloudEnvironment['syncStatus']
  ): Promise<void> {
    try {
      const { resource: environment } = await this.containers.cloudEnvironments
        .item(environmentId, tenantId).read();
      
      if (environment) {
        environment.syncStatus = status;
        environment.lastSync = new Date().toISOString();
        environment.updatedAt = new Date().toISOString();
        
        await this.containers.cloudEnvironments.item(environmentId, tenantId).replace(environment);
      }
    } catch (error) {
      console.error('Error updating cloud environment status:', error);
      throw error;
    }
  }

  // Enhanced NIST Controls with Multi-Cloud Support
  async createOrUpdateNISTControl(control: EnhancedNISTControl): Promise<EnhancedNISTControl> {
    try {
      const { resource } = await this.containers.nistControls.items.upsert(control);
      return resource as unknown as EnhancedNISTControl;
    } catch (error) {
      console.error('Error creating/updating NIST control:', error);
      throw error;
    }
  }

  async getNISTControls(
    tenantId: string, 
    environmentIds?: string[]
  ): Promise<EnhancedNISTControl[]> {
    try {
      let querySpec;
      
      if (environmentIds && environmentIds.length > 0) {
        // Filter by specific environments
        const envPlaceholders = environmentIds.map((_, index) => `@env${index}`).join(',');
        querySpec = {
          query: `SELECT * FROM c WHERE c.tenantId = @tenantId AND EXISTS(SELECT VALUE e FROM e IN OBJECT_KEYS(c.environmentStatus) WHERE e IN (${envPlaceholders}))`,
          parameters: [
            { name: '@tenantId', value: tenantId },
            ...environmentIds.map((envId, index) => ({ name: `@env${index}`, value: envId }))
          ]
        };
      } else {
        // Get all controls for tenant
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        };
      }

      const { resources } = await this.containers.nistControls.items.query(querySpec).fetchAll();
      return resources as EnhancedNISTControl[];
    } catch (error) {
      console.error('Error getting NIST controls:', error);
      throw error;
    }
  }

  async getNISTControlById(controlId: string, tenantId: string): Promise<EnhancedNISTControl | null> {
    try {
      const { resource } = await this.containers.nistControls.item(controlId, tenantId).read();
      return resource as EnhancedNISTControl;
    } catch (error) {
      if ((error as any).code === 404) {
        return null;
      }
      console.error('Error getting NIST control by ID:', error);
      throw error;
    }
  }

  // Multi-Cloud Remediation API
  async getNISTControlRemediation(
    controlId: string, 
    tenantId: string, 
    cloudProviders?: string[]
  ): Promise<MultiCloudRemediation> {
    try {
      const control = await this.getNISTControlById(controlId, tenantId);
      if (!control) {
        throw new Error(`NIST control ${controlId} not found`);
      }

      // If specific providers requested, filter the remediation
      if (cloudProviders && cloudProviders.length > 0) {
        const filteredRemediation: MultiCloudRemediation = {};
        for (const provider of cloudProviders) {
          if (control.remediation[provider as keyof MultiCloudRemediation]) {
            filteredRemediation[provider as keyof MultiCloudRemediation] = 
              control.remediation[provider as keyof MultiCloudRemediation];
          }
        }
        return filteredRemediation;
      }

      return control.remediation;
    } catch (error) {
      console.error('Error getting NIST control remediation:', error);
      throw error;
    }
  }

  // Enhanced ZTA Activities with Multi-Cloud Support
  async createOrUpdateZTAActivity(activity: EnhancedZTAActivity): Promise<EnhancedZTAActivity> {
    try {
      const { resource } = await this.containers.ztaActivities.items.upsert(activity);
      return resource as unknown as EnhancedZTAActivity;
    } catch (error) {
      console.error('Error creating/updating ZTA activity:', error);
      throw error;
    }
  }

  async getZTAActivities(
    tenantId: string, 
    environmentIds?: string[]
  ): Promise<EnhancedZTAActivity[]> {
    try {
      let querySpec;
      
      if (environmentIds && environmentIds.length > 0) {
        const envPlaceholders = environmentIds.map((_, index) => `@env${index}`).join(',');
        querySpec = {
          query: `SELECT * FROM c WHERE c.tenantId = @tenantId AND EXISTS(SELECT VALUE e FROM e IN OBJECT_KEYS(c.environmentStatus) WHERE e IN (${envPlaceholders}))`,
          parameters: [
            { name: '@tenantId', value: tenantId },
            ...environmentIds.map((envId, index) => ({ name: `@env${index}`, value: envId }))
          ]
        };
      } else {
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        };
      }

      const { resources } = await this.containers.ztaActivities.items.query(querySpec).fetchAll();
      return resources as EnhancedZTAActivity[];
    } catch (error) {
      console.error('Error getting ZTA activities:', error);
      throw error;
    }
  }

  async getZTAActivityById(activityId: string, tenantId: string): Promise<EnhancedZTAActivity | null> {
    try {
      const { resource } = await this.containers.ztaActivities.item(activityId, tenantId).read();
      return resource as EnhancedZTAActivity;
    } catch (error) {
      if ((error as any).code === 404) {
        return null;
      }
      console.error('Error getting ZTA activity by ID:', error);
      throw error;
    }
  }

  // Enhanced POA&M with Multi-Environment Support
  async createPOAMItem(poam: EnhancedPOAMItem): Promise<EnhancedPOAMItem> {
    try {
      const { resource } = await this.containers.poamItems.items.create(poam);
      
      // Log the POA&M creation for audit
      await this.logAuditEvent({
        id: `audit-${Date.now()}`,
        tenantId: poam.tenantId,
        action: 'POAM_CREATED',
        resourceId: resource.id,
        userId: 'system', // Would be actual user ID in production
        timestamp: new Date().toISOString(),
        details: { title: poam.title, riskLevel: poam.riskLevel }
      });

      return resource as EnhancedPOAMItem;
    } catch (error) {
      console.error('Error creating POA&M item:', error);
      throw error;
    }
  }

  async getPOAMItems(tenantId: string, environmentIds?: string[]): Promise<EnhancedPOAMItem[]> {
    try {
      let querySpec;
      
      if (environmentIds && environmentIds.length > 0) {
        const envPlaceholders = environmentIds.map((_, index) => `@env${index}`).join(',');
        querySpec = {
          query: `SELECT * FROM c WHERE c.tenantId = @tenantId AND EXISTS(SELECT VALUE e FROM e IN c.affectedEnvironments WHERE e IN (${envPlaceholders}))`,
          parameters: [
            { name: '@tenantId', value: tenantId },
            ...environmentIds.map((envId, index) => ({ name: `@env${index}`, value: envId }))
          ]
        };
      } else {
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        };
      }

      const { resources } = await this.containers.poamItems.items.query(querySpec).fetchAll();
      return resources as EnhancedPOAMItem[];
    } catch (error) {
      console.error('Error getting POA&M items:', error);
      throw error;
    }
  }

  // Compliance Data Management
  async storeComplianceData(data: ComplianceData): Promise<ComplianceData> {
    try {
      const { resource } = await this.containers.complianceData.items.create(data);
      return resource as ComplianceData;
    } catch (error) {
      console.error('Error storing compliance data:', error);
      throw error;
    }
  }

  async getLatestComplianceData(
    tenantId: string, 
    environmentId?: string
  ): Promise<ComplianceData[]> {
    try {
      let querySpec;
      
      if (environmentId) {
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.environmentId = @environmentId ORDER BY c.collectedAt DESC',
          parameters: [
            { name: '@tenantId', value: tenantId },
            { name: '@environmentId', value: environmentId }
          ]
        };
      } else {
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.collectedAt DESC',
          parameters: [{ name: '@tenantId', value: tenantId }]
        };
      }

      const { resources } = await this.containers.complianceData.items.query(querySpec).fetchAll();
      return resources as ComplianceData[];
    } catch (error) {
      console.error('Error getting compliance data:', error);
      throw error;
    }
  }

  // SSSC Metrics Management
  async storeSSCMetrics(metrics: SSCMetrics): Promise<SSCMetrics> {
    try {
      const { resource } = await this.containers.sscMetrics.items.upsert(metrics);
      return resource as unknown as SSCMetrics;
    } catch (error) {
      console.error('Error storing SSC metrics:', error);
      throw error;
    }
  }

  async getSSCMetrics(tenantId: string, environmentId?: string): Promise<SSCMetrics[]> {
    try {
      let querySpec;
      
      if (environmentId) {
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.environmentId = @environmentId ORDER BY c.collectedAt DESC',
          parameters: [
            { name: '@tenantId', value: tenantId },
            { name: '@environmentId', value: environmentId }
          ]
        };
      } else {
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.collectedAt DESC',
          parameters: [{ name: '@tenantId', value: tenantId }]
        };
      }

      const { resources } = await this.containers.sscMetrics.items.query(querySpec).fetchAll();
      return resources as SSCMetrics[];
    } catch (error) {
      console.error('Error getting SSC metrics:', error);
      throw error;
    }
  }

  // Execution Enablers (DOTmLPF-P) Management
  async createOrUpdateExecutionEnabler(enabler: ExecutionEnabler): Promise<ExecutionEnabler> {
    try {
      const { resource } = await this.containers.executionEnablers.items.upsert(enabler);
      return resource as unknown as ExecutionEnabler;
    } catch (error) {
      console.error('Error creating/updating execution enabler:', error);
      throw error;
    }
  }

  async getExecutionEnablers(tenantId: string): Promise<ExecutionEnabler[]> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.category, c.name',
        parameters: [{ name: '@tenantId', value: tenantId }]
      };

      const { resources } = await this.containers.executionEnablers.items.query(querySpec).fetchAll();
      return resources as ExecutionEnabler[];
    } catch (error) {
      console.error('Error getting execution enablers:', error);
      throw error;
    }
  }

  // Audit Logging
  async logAuditEvent(event: {
    id: string;
    tenantId: string;
    action: string;
    resourceId: string;
    userId: string;
    timestamp: string;
    details?: any;
  }): Promise<void> {
    try {
      await this.containers.auditLogs.items.create(event);
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw here to avoid breaking main operations
    }
  }

  // Utility Methods
  async getOverallComplianceStatus(tenantId: string): Promise<{
    totalControls: number;
    compliantControls: number;
    partialControls: number;
    nonCompliantControls: number;
    notAssessedControls: number;
    compliancePercentage: number;
  }> {
    try {
      const controls = await this.getNISTControls(tenantId);
      
      const stats = {
        totalControls: controls.length,
        compliantControls: 0,
        partialControls: 0,
        nonCompliantControls: 0,
        notAssessedControls: 0,
        compliancePercentage: 0
      };

      for (const control of controls) {
        switch (control.overallStatus) {
          case 'compliant':
            stats.compliantControls++;
            break;
          case 'partial':
            stats.partialControls++;
            break;
          case 'noncompliant':
            stats.nonCompliantControls++;
            break;
          case 'not-assessed':
            stats.notAssessedControls++;
            break;
        }
      }

      stats.compliancePercentage = stats.totalControls > 0 
        ? Math.round((stats.compliantControls / stats.totalControls) * 100)
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting overall compliance status:', error);
      throw error;
    }
  }

  // ============================================================================
  // NIST REVISION MANAGEMENT METHODS
  // ============================================================================

  /**
   * Helper to convert between revision formats
   */
  private convertRevisionFormat(revision: NistRevision): '4' | '5' {
    return revision === 'Rev4' ? '4' : '5';
  }

  private convertToOrgRevisionFormat(revision: '4' | '5'): NistRevision {
    return revision === '4' ? 'Rev4' : 'Rev5';
  }

  /**
   * Set NIST revision for organization
   */
  async setOrganizationNISTRevision(tenantId: string, revision: NistRevision): Promise<void> {
    try {
      const tenant = await this.getTenant(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      const previousRevision = tenant.nistRevision;
      
      // Update tenant with new NIST revision
      tenant.nistRevision = this.convertRevisionFormat(revision);
      tenant.updatedAt = new Date().toISOString();
      
      await this.updateTenant(tenant);

      // Log the revision change
      await this.logAuditEvent({
        id: `nist-revision-change-${Date.now()}`,
        tenantId,
        action: 'NIST_REVISION_CHANGED',
        resourceId: tenantId,
        userId: 'system', // Would be actual user in real implementation
        timestamp: new Date().toISOString(),
        details: {
          newRevision: revision,
          previousRevision: this.convertToOrgRevisionFormat(previousRevision)
        }
      });

    } catch (error) {
      console.error('Error setting organization NIST revision:', error);
      throw error;
    }
  }

  /**
   * Get NIST controls filtered by revision
   */
  async getNISTControlsByRevision(
    tenantId: string, 
    revision: '4' | '5',
    environmentIds?: string[]
  ): Promise<EnhancedNISTControl[]> {
    try {
      let querySpec;
      
      if (environmentIds && environmentIds.length > 0) {
        const envPlaceholders = environmentIds.map((_, index) => `@env${index}`).join(',');
        querySpec = {
          query: `SELECT * FROM c WHERE c.tenantId = @tenantId AND c.nistRevision = @revision AND EXISTS(SELECT VALUE e FROM e IN OBJECT_KEYS(c.environmentStatus) WHERE e IN (${envPlaceholders}))`,
          parameters: [
            { name: '@tenantId', value: tenantId },
            { name: '@revision', value: revision },
            ...environmentIds.map((envId, index) => ({ name: `@env${index}`, value: envId }))
          ]
        };
      } else {
        querySpec = {
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.nistRevision = @revision',
          parameters: [
            { name: '@tenantId', value: tenantId },
            { name: '@revision', value: revision }
          ]
        };
      }

      const { resources } = await this.containers.nistControls.items.query(querySpec).fetchAll();
      return resources as EnhancedNISTControl[];
    } catch (error) {
      console.error('Error getting NIST controls by revision:', error);
      throw error;
    }
  }

  /**
   * Create or update NIST revision mapping
   */
  async createOrUpdateRevisionMapping(mapping: NISTRevisionMapping): Promise<NISTRevisionMapping> {
    try {
      const { resource } = await this.containers.nistRevisionMappings.items.upsert(mapping);
      return resource as unknown as NISTRevisionMapping;
    } catch (error) {
      console.error('Error creating/updating revision mapping:', error);
      throw error;
    }
  }

  /**
   * Get revision mappings for tenant
   */
  async getRevisionMappings(tenantId: string): Promise<NISTRevisionMapping[]> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId OR c.tenantId = "global"',
        parameters: [{ name: '@tenantId', value: tenantId }]
      };

      const { resources } = await this.containers.nistRevisionMappings.items.query(querySpec).fetchAll();
      return resources as NISTRevisionMapping[];
    } catch (error) {
      console.error('Error getting revision mappings:', error);
      throw error;
    }
  }

  /**
   * Perform gap analysis between NIST revisions
   */
  async performRevisionGapAnalysis(
    tenantId: string,
    targetRevision: 'Rev4' | 'Rev5'
  ): Promise<RevisionGapAnalysisResponse> {
    try {
      const tenant = await this.getTenant(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      const currentTenantRevision = tenant.nistRevision;
      const currentRevision = this.convertToOrgRevisionFormat(currentTenantRevision);
      
      if (currentRevision === targetRevision) {
        throw new Error(`Organization is already using ${targetRevision}`);
      }

      // Get current controls
      const currentControls = await this.getNISTControlsByRevision(
        tenantId, 
        currentTenantRevision
      );

      // Get revision mappings
      const mappings = await this.getRevisionMappings(tenantId);

      // Categorize controls based on mappings
      const gapAnalysis: NISTRevisionGapAnalysis = {
        tenantId,
        currentRevision,
        targetRevision,
        analysisDate: new Date().toISOString(),
        totalCurrentControls: currentControls.length,
        totalTargetControls: 0, // Will be calculated
        mappings: {
          unchanged: [],
          modified: [],
          newControls: [],
          withdrawnControls: [],
          mergedControls: [],
          splitControls: []
        },
        impactAssessment: {
          lowImpact: 0,
          mediumImpact: 0,
          highImpact: 0,
          estimatedEffortHours: 0,
          priorityControls: []
        },
        compliancePrediction: {
          likelyCompliant: 0,
          requiresReview: 0,
          likelyNonCompliant: 0,
          notAssessed: 0
        }
      };

      // Process each mapping to categorize controls
      for (const mapping of mappings) {
        const sourceControlId = currentRevision === 'Rev4' ? mapping.rev4ControlId : mapping.rev5ControlId;
        const targetControlId = targetRevision === 'Rev4' ? mapping.rev4ControlId : mapping.rev5ControlId;

        if (!sourceControlId) continue;

        const currentControl = currentControls.find(c => c.controlIdentifier === sourceControlId);
        if (!currentControl) continue;

        const controlMapping: NISTControlMapping = {
          mappingId: mapping.mappingId,
          sourceControlId,
          targetControlId,
          sourceControlName: currentControl.controlName,
          targetControlName: targetControlId ? `${targetControlId} (${mapping.changeSummary})` : null,
          changeType: mapping.changeType,
          changeSummary: mapping.changeSummary,
          implementationImpact: mapping.implementationImpact,
          currentStatus: currentControl.overallStatus,
          predictedStatus: this.predictComplianceStatus(currentControl.overallStatus, mapping.changeType),
          migrationPriority: this.calculateMigrationPriority(mapping.implementationImpact, currentControl.overallStatus),
          estimatedEffortHours: this.estimateEffortHours(mapping.implementationImpact, mapping.changeType),
          migrationGuidance: mapping.migrationGuidance || this.generateMigrationGuidance(mapping)
        };

        // Categorize the mapping
        switch (mapping.changeType) {
          case 'No Change':
            gapAnalysis.mappings.unchanged.push(controlMapping);
            break;
          case 'Modified':
            gapAnalysis.mappings.modified.push(controlMapping);
            break;
          case 'New Control':
            gapAnalysis.mappings.newControls.push(controlMapping);
            break;
          case 'Withdrawn':
            gapAnalysis.mappings.withdrawnControls.push(controlMapping);
            break;
          case 'Merged':
            gapAnalysis.mappings.mergedControls.push(controlMapping);
            break;
          case 'Split':
            gapAnalysis.mappings.splitControls.push(controlMapping);
            break;
        }

        // Update impact assessment
        switch (mapping.implementationImpact) {
          case 'low':
            gapAnalysis.impactAssessment.lowImpact++;
            break;
          case 'medium':
            gapAnalysis.impactAssessment.mediumImpact++;
            break;
          case 'high':
            gapAnalysis.impactAssessment.highImpact++;
            gapAnalysis.impactAssessment.priorityControls.push(sourceControlId);
            break;
        }

        gapAnalysis.impactAssessment.estimatedEffortHours += controlMapping.estimatedEffortHours;

        // Update compliance prediction
        switch (controlMapping.predictedStatus) {
          case 'likely-compliant':
            gapAnalysis.compliancePrediction.likelyCompliant++;
            break;
          case 'requires-review':
            gapAnalysis.compliancePrediction.requiresReview++;
            break;
          case 'likely-noncompliant':
            gapAnalysis.compliancePrediction.likelyNonCompliant++;
            break;
          case 'not-assessed':
            gapAnalysis.compliancePrediction.notAssessed++;
            break;
        }
      }

      // Calculate total target controls
      gapAnalysis.totalTargetControls = 
        gapAnalysis.mappings.unchanged.length +
        gapAnalysis.mappings.modified.length +
        gapAnalysis.mappings.newControls.length +
        gapAnalysis.mappings.mergedControls.length +
        gapAnalysis.mappings.splitControls.length;

      // Generate recommendations
      const recommendedActions = this.generateRecommendedActions(gapAnalysis);
      const estimatedMigrationTime = this.calculateMigrationTime(gapAnalysis);

      return {
        success: true,
        gapAnalysis,
        recommendedActions,
        estimatedMigrationTime
      };

    } catch (error) {
      console.error('Error performing revision gap analysis:', error);
      throw error;
    }
  }

  /**
   * Initiate NIST revision upgrade
   */
  async initiateRevisionUpgrade(
    tenantId: string,
    targetRevision: 'Rev4' | 'Rev5',
    initiatedBy: string
  ): Promise<RevisionUpgradeResponse> {
    try {
      const tenant = await this.getTenant(tenantId);
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`);
      }

      const currentTenantRevision = tenant.nistRevision;
      const currentRevision = this.convertToOrgRevisionFormat(currentTenantRevision);
      
      if (currentRevision === targetRevision) {
        throw new Error(`Organization is already using ${targetRevision}`);
      }

      // Create upgrade history record
      const upgradeId = `upgrade-${tenantId}-${Date.now()}`;
      const upgradeHistory: NISTRevisionUpgradeHistory = {
        id: upgradeId,
        upgradeId,
        tenantId,
        fromRevision: currentRevision,
        toRevision: targetRevision,
        initiatedBy,
        initiatedAt: new Date().toISOString(),
        completedAt: null,
        status: 'initiated',
        controlsAffected: 0,
        controlsMigrated: 0,
        controlsRequiringReview: 0,
        upgradeSummary: `Initiated upgrade from ${currentRevision} to ${targetRevision}`,
        rollbackData: JSON.stringify({
          previousRevision: currentRevision,
          timestamp: new Date().toISOString()
        })
      };

      await this.containers.nistRevisionUpgradeHistory.items.create(upgradeHistory);

      // Log the upgrade initiation
      await this.logAuditEvent({
        id: `upgrade-initiated-${Date.now()}`,
        tenantId,
        action: 'NIST_REVISION_UPGRADE_INITIATED',
        resourceId: upgradeId,
        userId: initiatedBy,
        timestamp: new Date().toISOString(),
        details: {
          fromRevision: currentRevision,
          toRevision: targetRevision
        }
      });

      return {
        success: true,
        upgradeId,
        message: `NIST revision upgrade from ${currentRevision} to ${targetRevision} has been initiated successfully.`,
        status: 'initiated',
        nextSteps: [
          'Review the gap analysis report',
          'Update control implementations as needed',
          'Verify compliance status for modified controls',
          'Complete the upgrade process'
        ],
        rollbackAvailable: true,
        estimatedCompletionTime: '2-4 weeks depending on control complexity'
      };

    } catch (error) {
      console.error('Error initiating revision upgrade:', error);
      throw error;
    }
  }

  /**
   * Get control comparison between revisions
   */
  async getControlRevisionComparison(
    controlId: string,
    tenantId: string
  ): Promise<NISTControlRevisionComparison> {
    try {
      // Get current control
      const currentControl = await this.getNISTControlById(controlId, tenantId);
      if (!currentControl) {
        throw new Error(`Control ${controlId} not found`);
      }

      // Get revision mappings for this control
      const mappings = await this.getRevisionMappings(tenantId);
      const mapping = mappings.find(m => 
        m.rev4ControlId === controlId || m.rev5ControlId === controlId
      );

      if (!mapping) {
        throw new Error(`No revision mapping found for control ${controlId}`);
      }

      // Determine the other revision's control ID
      const otherRevisionControlId = currentControl.nistRevision === '4' 
        ? mapping.rev5ControlId 
        : mapping.rev4ControlId;

      // Get the other revision's control if it exists
      let otherRevisionControl = null;
      if (otherRevisionControlId) {
        const otherRevisionNum = currentControl.nistRevision === '4' ? '5' : '4';
        const otherControls = await this.getNISTControlsByRevision(tenantId, otherRevisionNum);
        otherRevisionControl = otherControls.find(c => c.controlIdentifier === otherRevisionControlId);
      }

      // Build comparison response
      const comparison: NISTControlRevisionComparison = {
        controlId,
        changeAnalysis: {
          changeType: mapping.changeType,
          changeSummary: mapping.changeSummary,
          implementationImpact: mapping.implementationImpact,
          keyChanges: this.extractKeyChanges(mapping.changeSummary),
          migrationRequired: mapping.changeType !== 'No Change',
          estimatedEffort: this.estimateEffortHours(mapping.implementationImpact, mapping.changeType)
        }
      };

      // Add Rev 4 data if available
      if (currentControl.nistRevision === '4') {
        comparison.rev4Data = {
          controlName: currentControl.controlName,
          description: currentControl.description || '',
          supplementalGuidance: '', // Field doesn't exist in EnhancedNISTControl
          currentStatus: currentControl.overallStatus,
          implementationNotes: currentControl.implementation || ''
        };
      }

      // Add Rev 5 data if available
      if (currentControl.nistRevision === '5') {
        comparison.rev5Data = {
          controlName: currentControl.controlName,
          description: currentControl.description || '',
          supplementalGuidance: '', // Field doesn't exist in EnhancedNISTControl
          predictedStatus: this.predictComplianceStatus(currentControl.overallStatus, mapping.changeType),
          migrationNotes: mapping.migrationGuidance || ''
        };
      }

      // Add other revision data if control exists
      if (otherRevisionControl) {
        if (otherRevisionControl.nistRevision === '4') {
          comparison.rev4Data = {
            controlName: otherRevisionControl.controlName,
            description: otherRevisionControl.description || '',
            supplementalGuidance: '', // Field doesn't exist in EnhancedNISTControl
            currentStatus: otherRevisionControl.overallStatus,
            implementationNotes: otherRevisionControl.implementation || ''
          };
        } else {
          comparison.rev5Data = {
            controlName: otherRevisionControl.controlName,
            description: otherRevisionControl.description || '',
            supplementalGuidance: '', // Field doesn't exist in EnhancedNISTControl
            predictedStatus: this.predictComplianceStatus(otherRevisionControl.overallStatus, mapping.changeType),
            migrationNotes: mapping.migrationGuidance || ''
          };
        }
      }

      return comparison;

    } catch (error) {
      console.error('Error getting control revision comparison:', error);
      throw error;
    }
  }

  /**
   * Get upgrade history for tenant
   */
  async getUpgradeHistory(tenantId: string): Promise<NISTRevisionUpgradeHistory[]> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.initiatedAt DESC',
        parameters: [{ name: '@tenantId', value: tenantId }]
      };

      const { resources } = await this.containers.nistRevisionUpgradeHistory.items.query(querySpec).fetchAll();
      return resources as NISTRevisionUpgradeHistory[];
    } catch (error) {
      console.error('Error getting upgrade history:', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS FOR REVISION MANAGEMENT
  // ============================================================================

  private predictComplianceStatus(
    currentStatus: string, 
    changeType: NISTRevisionMapping['changeType']
  ): NISTControlMapping['predictedStatus'] {
    switch (changeType) {
      case 'No Change':
        return currentStatus === 'compliant' ? 'likely-compliant' : 'requires-review';
      case 'Modified':
        return currentStatus === 'compliant' ? 'requires-review' : 'likely-noncompliant';
      case 'New Control':
        return 'not-assessed';
      case 'Withdrawn':
        return 'deprecated';
      case 'Merged':
      case 'Split':
        return 'requires-review';
      default:
        return 'requires-review';
    }
  }

  private calculateMigrationPriority(
    impact: NISTRevisionMapping['implementationImpact'],
    currentStatus: string
  ): NISTControlMapping['migrationPriority'] {
    if (impact === 'high') return 'immediate';
    if (impact === 'medium' && currentStatus === 'noncompliant') return 'high';
    if (impact === 'medium') return 'medium';
    return 'low';
  }

  private estimateEffortHours(
    impact: NISTRevisionMapping['implementationImpact'],
    changeType: NISTRevisionMapping['changeType']
  ): number {
    const baseHours = {
      'low': 2,
      'medium': 8,
      'high': 24
    };

    const multiplier = {
      'No Change': 0.25,
      'Modified': 1,
      'New Control': 2,
      'Withdrawn': 0.5,
      'Merged': 1.5,
      'Split': 1.5
    };

    return Math.round(baseHours[impact] * multiplier[changeType]);
  }

  private generateMigrationGuidance(mapping: NISTRevisionMapping): string {
    switch (mapping.changeType) {
      case 'Modified':
        return `Review updated requirements for ${mapping.rev5ControlId || mapping.rev4ControlId}. Update implementation to address: ${mapping.changeSummary}`;
      case 'New Control':
        return `Implement new control ${mapping.rev5ControlId || mapping.rev4ControlId}. Focus on: ${mapping.changeSummary}`;
      case 'Withdrawn':
        return `Control ${mapping.rev4ControlId} has been withdrawn. Review if functionality is covered by other controls.`;
      case 'Merged':
        return `Multiple controls have been merged. Review consolidated requirements and update implementation accordingly.`;
      case 'Split':
        return `Control has been split into multiple controls. Ensure all new requirements are addressed.`;
      default:
        return 'No migration required for this control.';
    }
  }

  private generateRecommendedActions(gapAnalysis: NISTRevisionGapAnalysis) {
    return {
      immediate: [
        `Review ${gapAnalysis.impactAssessment.priorityControls.length} high-impact controls`,
        `Address ${gapAnalysis.mappings.newControls.length} new control requirements`,
        'Backup current control implementations before migration'
      ],
      shortTerm: [
        `Update ${gapAnalysis.mappings.modified.length} modified control implementations`,
        `Review ${gapAnalysis.mappings.mergedControls.length} merged controls for consolidated requirements`,
        'Validate compliance status for all affected controls'
      ],
      longTerm: [
        'Establish ongoing revision monitoring process',
        'Train team on new control requirements',
        'Update compliance documentation and evidence'
      ]
    };
  }

  private calculateMigrationTime(gapAnalysis: NISTRevisionGapAnalysis) {
    const baseHours = gapAnalysis.impactAssessment.estimatedEffortHours;
    return {
      optimisticHours: Math.round(baseHours * 0.8),
      realisticHours: baseHours,
      pessimisticHours: Math.round(baseHours * 1.5)
    };
  }

  private extractKeyChanges(changeSummary: string): string[] {
    // Simple extraction - in real implementation, this would be more sophisticated
    const changes = changeSummary.split(/[.;,]/).map(s => s.trim()).filter(s => s.length > 0);
    return changes.slice(0, 3); // Return top 3 key changes
  }
}

export default new EnhancedCosmosDBService();
