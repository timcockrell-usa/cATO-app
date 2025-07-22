/**
 * Software Supply Chain (SSSC) Monitoring Service Implementation
 * 
 * Provides comprehensive monitoring and management of secure software supply chain
 * practices. Integrates with DevSecOps pipelines, vulnerability scanners, and
 * compliance frameworks to ensure continuous security throughout the software lifecycle.
 */

import {
  SSCPipeline,
  ScanResult,
  Vulnerability,
  SoftwareComponent,
  SSCDashboardData,
  SSCServiceInterface,
  SSCConfiguration,
  ComplianceReport,
  ThreatIntelligence,
  SecurityPolicy,
  AuditTrail,
  SSCAlert,
  VulnerabilityRiskAssessment,
  ComponentInventory,
  PolicyViolation,
  ScanType,
  PipelineStage,
  ComplianceFramework,
  RiskLevel,
  VulnerabilityStatus,
  AlertSeverity,
  ComponentType
} from '../types/softwareSupplyChain';

/**
 * Service for managing Software Supply Chain security monitoring
 */
export class SSCMonitoringService implements SSCServiceInterface {
  private readonly cosmosClient: any; // CosmosDB client
  private readonly pipelineContainerName = 'ssc-pipelines';
  private readonly scanContainerName = 'scan-results';
  private readonly componentContainerName = 'software-components';
  private readonly vulnerabilityContainerName = 'vulnerabilities';
  private readonly configContainerName = 'ssc-configurations';
  private readonly auditContainerName = 'ssc-audit-trails';

  constructor(cosmosClient: any) {
    this.cosmosClient = cosmosClient;
  }

  // Pipeline management
  async getPipelines(organizationId: string, projectId?: string): Promise<SSCPipeline[]> {
    try {
      const container = this.cosmosClient.container(this.pipelineContainerName);
      let query = 'SELECT * FROM c WHERE c.organizationId = @organizationId';
      const parameters = [{ name: '@organizationId', value: organizationId }];

      if (projectId) {
        query += ' AND c.projectId = @projectId';
        parameters.push({ name: '@projectId', value: projectId });
      }

      query += ' ORDER BY c.lastExecuted DESC';

      const { resources } = await container.items
        .query({ query, parameters })
        .fetchAll();

      return resources.map(this.mapToSSCPipeline);
    } catch (error) {
      console.error('Error retrieving SSC pipelines:', error);
      throw new Error(`Failed to retrieve SSC pipelines: ${error}`);
    }
  }

  async getPipeline(pipelineId: string): Promise<SSCPipeline> {
    try {
      const container = this.cosmosClient.container(this.pipelineContainerName);
      const { resource } = await container.item(pipelineId, pipelineId).read();

      if (!resource) {
        throw new Error(`SSC pipeline with ID ${pipelineId} not found`);
      }

      return this.mapToSSCPipeline(resource);
    } catch (error) {
      console.error('Error retrieving SSC pipeline:', error);
      throw error;
    }
  }

  async createPipeline(
    pipeline: Omit<SSCPipeline, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SSCPipeline> {
    try {
      const container = this.cosmosClient.container(this.pipelineContainerName);
      const id = this.generateId();
      const now = new Date();

      const newPipeline: SSCPipeline = {
        ...pipeline,
        id,
        createdAt: now,
        updatedAt: now
      };

      const { resource } = await container.items.create(newPipeline);

      // Log pipeline creation
      await this.logAuditEvent({
        auditId: this.generateId(),
        organizationId: pipeline.organizationId,
        eventType: 'Pipeline_Created',
        entityId: id,
        entityType: 'Pipeline',
        performedBy: pipeline.createdBy,
        performedAt: now,
        details: `SSC pipeline created: ${pipeline.name}`,
        ipAddress: '0.0.0.0', // Would come from request context
        userAgent: 'System',
        metadata: {
          pipelineName: pipeline.name,
          projectId: pipeline.projectId,
          scanTypes: pipeline.scanConfiguration.enabledScans
        }
      });

      return this.mapToSSCPipeline(resource);
    } catch (error) {
      console.error('Error creating SSC pipeline:', error);
      throw new Error(`Failed to create SSC pipeline: ${error}`);
    }
  }

  async updatePipeline(
    pipelineId: string,
    updates: Partial<SSCPipeline>
  ): Promise<SSCPipeline> {
    try {
      const container = this.cosmosClient.container(this.pipelineContainerName);
      const { resource: existing } = await container.item(pipelineId, pipelineId).read();

      if (!existing) {
        throw new Error(`SSC pipeline with ID ${pipelineId} not found`);
      }

      const updatedPipeline = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      const { resource } = await container.item(pipelineId, pipelineId).replace(updatedPipeline);
      return this.mapToSSCPipeline(resource);
    } catch (error) {
      console.error('Error updating SSC pipeline:', error);
      throw new Error(`Failed to update SSC pipeline: ${error}`);
    }
  }

  async executePipeline(pipelineId: string, triggeredBy: string): Promise<SSCPipeline> {
    try {
      const pipeline = await this.getPipeline(pipelineId);
      
      const updatedPipeline = await this.updatePipeline(pipelineId, {
        status: 'Running',
        lastExecuted: new Date(),
        triggeredBy,
        currentStage: pipeline.stages[0]?.stageName || 'Unknown'
      });

      // Trigger actual pipeline execution (would integrate with CI/CD systems)
      await this.triggerPipelineExecution(pipeline, triggeredBy);

      return updatedPipeline;
    } catch (error) {
      console.error('Error executing SSC pipeline:', error);
      throw new Error(`Failed to execute SSC pipeline: ${error}`);
    }
  }

  // Scan management
  async getScanResults(
    organizationId: string,
    pipelineId?: string,
    scanType?: ScanType
  ): Promise<ScanResult[]> {
    try {
      const container = this.cosmosClient.container(this.scanContainerName);
      let query = 'SELECT * FROM c WHERE c.organizationId = @organizationId';
      const parameters = [{ name: '@organizationId', value: organizationId }];

      if (pipelineId) {
        query += ' AND c.pipelineId = @pipelineId';
        parameters.push({ name: '@pipelineId', value: pipelineId });
      }

      if (scanType) {
        query += ' AND c.scanType = @scanType';
        parameters.push({ name: '@scanType', value: scanType });
      }

      query += ' ORDER BY c.scanDate DESC';

      const { resources } = await container.items
        .query({ query, parameters })
        .fetchAll();

      return resources.map(this.mapToScanResult);
    } catch (error) {
      console.error('Error retrieving scan results:', error);
      throw new Error(`Failed to retrieve scan results: ${error}`);
    }
  }

  async createScanResult(
    scanResult: Omit<ScanResult, 'id' | 'createdAt'>
  ): Promise<ScanResult> {
    try {
      const container = this.cosmosClient.container(this.scanContainerName);
      const id = this.generateId();
      const now = new Date();

      const newScanResult: ScanResult = {
        ...scanResult,
        id,
        createdAt: now
      };

      const { resource } = await container.items.create(newScanResult);

      // Process vulnerabilities found in the scan
      await this.processVulnerabilities(scanResult.vulnerabilities, scanResult.organizationId);

      // Check for policy violations
      await this.checkPolicyViolations(newScanResult);

      return this.mapToScanResult(resource);
    } catch (error) {
      console.error('Error creating scan result:', error);
      throw new Error(`Failed to create scan result: ${error}`);
    }
  }

  // Vulnerability management
  async getVulnerabilities(
    organizationId: string,
    severity?: RiskLevel,
    status?: VulnerabilityStatus
  ): Promise<Vulnerability[]> {
    try {
      const container = this.cosmosClient.container(this.vulnerabilityContainerName);
      let query = 'SELECT * FROM c WHERE c.organizationId = @organizationId';
      const parameters = [{ name: '@organizationId', value: organizationId }];

      if (severity) {
        query += ' AND c.severity = @severity';
        parameters.push({ name: '@severity', value: severity });
      }

      if (status) {
        query += ' AND c.status = @status';
        parameters.push({ name: '@status', value: status });
      }

      query += ' ORDER BY c.discoveredDate DESC';

      const { resources } = await container.items
        .query({ query, parameters })
        .fetchAll();

      return resources.map(this.mapToVulnerability);
    } catch (error) {
      console.error('Error retrieving vulnerabilities:', error);
      throw new Error(`Failed to retrieve vulnerabilities: ${error}`);
    }
  }

  async updateVulnerabilityStatus(
    vulnerabilityId: string,
    status: VulnerabilityStatus,
    updatedBy: string,
    notes?: string
  ): Promise<Vulnerability> {
    try {
      const container = this.cosmosClient.container(this.vulnerabilityContainerName);
      const { resource: existing } = await container.item(vulnerabilityId, vulnerabilityId).read();

      if (!existing) {
        throw new Error(`Vulnerability with ID ${vulnerabilityId} not found`);
      }

      const now = new Date();
      const updatedVulnerability = {
        ...existing,
        status,
        statusUpdatedBy: updatedBy,
        statusUpdatedDate: now,
        resolutionNotes: notes || existing.resolutionNotes,
        updatedAt: now
      };

      const { resource } = await container.item(vulnerabilityId, vulnerabilityId).replace(updatedVulnerability);

      // Log status change
      await this.logAuditEvent({
        auditId: this.generateId(),
        organizationId: existing.organizationId,
        eventType: 'Vulnerability_Updated',
        entityId: vulnerabilityId,
        entityType: 'Vulnerability',
        performedBy: updatedBy,
        performedAt: now,
        details: `Vulnerability status changed to ${status}`,
        ipAddress: '0.0.0.0',
        userAgent: 'System',
        metadata: {
          previousStatus: existing.status,
          newStatus: status,
          cveId: existing.cveId
        }
      });

      return this.mapToVulnerability(resource);
    } catch (error) {
      console.error('Error updating vulnerability status:', error);
      throw new Error(`Failed to update vulnerability status: ${error}`);
    }
  }

  // Component management
  async getComponents(
    organizationId: string,
    componentType?: ComponentType
  ): Promise<SoftwareComponent[]> {
    try {
      const container = this.cosmosClient.container(this.componentContainerName);
      let query = 'SELECT * FROM c WHERE c.organizationId = @organizationId';
      const parameters = [{ name: '@organizationId', value: organizationId }];

      if (componentType) {
        query += ' AND c.componentType = @componentType';
        parameters.push({ name: '@componentType', value: componentType });
      }

      const { resources } = await container.items
        .query({ query, parameters })
        .fetchAll();

      return resources.map(this.mapToSoftwareComponent);
    } catch (error) {
      console.error('Error retrieving software components:', error);
      throw new Error(`Failed to retrieve software components: ${error}`);
    }
  }

  async createComponent(
    component: Omit<SoftwareComponent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SoftwareComponent> {
    try {
      const container = this.cosmosClient.container(this.componentContainerName);
      const id = this.generateId();
      const now = new Date();

      const newComponent: SoftwareComponent = {
        ...component,
        id,
        createdAt: now,
        updatedAt: now
      };

      const { resource } = await container.items.create(newComponent);
      return this.mapToSoftwareComponent(resource);
    } catch (error) {
      console.error('Error creating software component:', error);
      throw new Error(`Failed to create software component: ${error}`);
    }
  }

  async updateComponent(
    componentId: string,
    updates: Partial<SoftwareComponent>
  ): Promise<SoftwareComponent> {
    try {
      const container = this.cosmosClient.container(this.componentContainerName);
      const { resource: existing } = await container.item(componentId, componentId).read();

      if (!existing) {
        throw new Error(`Software component with ID ${componentId} not found`);
      }

      const updatedComponent = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      const { resource } = await container.item(componentId, componentId).replace(updatedComponent);
      return this.mapToSoftwareComponent(resource);
    } catch (error) {
      console.error('Error updating software component:', error);
      throw new Error(`Failed to update software component: ${error}`);
    }
  }

  // Dashboard and reporting
  async getDashboardData(
    organizationId: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<SSCDashboardData> {
    try {
      const pipelines = await this.getPipelines(organizationId);
      const recentScans = await this.getRecentScanResults(organizationId, timeframe);
      const vulnerabilities = await this.getVulnerabilities(organizationId);
      const components = await this.getComponents(organizationId);

      return await this.buildDashboardData(organizationId, pipelines, recentScans, vulnerabilities, components, timeframe);
    } catch (error) {
      console.error('Error generating SSC dashboard data:', error);
      throw new Error(`Failed to generate SSC dashboard data: ${error}`);
    }
  }

  async generateComplianceReport(
    organizationId: string,
    framework: ComplianceFramework,
    timeframe?: { start: Date; end: Date }
  ): Promise<ComplianceReport> {
    try {
      const pipelines = await this.getPipelines(organizationId);
      const vulnerabilities = await this.getVulnerabilities(organizationId);
      const components = await this.getComponents(organizationId);

      return await this.buildComplianceReport(organizationId, framework, pipelines, vulnerabilities, components, timeframe);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new Error(`Failed to generate compliance report: ${error}`);
    }
  }

  // Configuration
  async getConfiguration(organizationId: string): Promise<SSCConfiguration> {
    try {
      const container = this.cosmosClient.container(this.configContainerName);
      const { resource } = await container.item(organizationId, organizationId).read();

      if (!resource) {
        return this.getDefaultConfiguration(organizationId);
      }

      return this.mapToSSCConfiguration(resource);
    } catch (error) {
      console.error('Error retrieving SSC configuration:', error);
      throw new Error(`Failed to retrieve SSC configuration: ${error}`);
    }
  }

  async updateConfiguration(
    organizationId: string,
    config: Partial<SSCConfiguration>
  ): Promise<SSCConfiguration> {
    try {
      const container = this.cosmosClient.container(this.configContainerName);
      const existing = await this.getConfiguration(organizationId);

      const updatedConfig = {
        ...existing,
        ...config,
        organizationId,
        updatedAt: new Date()
      };

      const { resource } = await container.items.upsert(updatedConfig);
      return this.mapToSSCConfiguration(resource);
    } catch (error) {
      console.error('Error updating SSC configuration:', error);
      throw new Error(`Failed to update SSC configuration: ${error}`);
    }
  }

  // Policy management
  async createSecurityPolicy(
    policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SecurityPolicy> {
    try {
      const id = this.generateId();
      const now = new Date();

      const newPolicy: SecurityPolicy = {
        ...policy,
        id,
        createdAt: now,
        updatedAt: now
      };

      // Store policy in configuration
      const config = await this.getConfiguration(policy.organizationId);
      const updatedConfig = {
        ...config,
        securityPolicies: [...config.securityPolicies, newPolicy]
      };

      await this.updateConfiguration(policy.organizationId, updatedConfig);

      return newPolicy;
    } catch (error) {
      console.error('Error creating security policy:', error);
      throw new Error(`Failed to create security policy: ${error}`);
    }
  }

  async updateSecurityPolicy(
    organizationId: string,
    policyId: string,
    updates: Partial<SecurityPolicy>
  ): Promise<SecurityPolicy> {
    try {
      const config = await this.getConfiguration(organizationId);
      const policyIndex = config.securityPolicies.findIndex(p => p.id === policyId);

      if (policyIndex === -1) {
        throw new Error(`Security policy with ID ${policyId} not found`);
      }

      const updatedPolicy = {
        ...config.securityPolicies[policyIndex],
        ...updates,
        updatedAt: new Date()
      };

      const updatedPolicies = [...config.securityPolicies];
      updatedPolicies[policyIndex] = updatedPolicy;

      await this.updateConfiguration(organizationId, {
        securityPolicies: updatedPolicies
      });

      return updatedPolicy;
    } catch (error) {
      console.error('Error updating security policy:', error);
      throw new Error(`Failed to update security policy: ${error}`);
    }
  }

  // Private helper methods
  private async triggerPipelineExecution(pipeline: SSCPipeline, triggeredBy: string): Promise<void> {
    try {
      // This would integrate with actual CI/CD systems (Jenkins, Azure DevOps, GitHub Actions, etc.)
      console.log(`Triggering pipeline execution: ${pipeline.name}`);
      
      // Simulate pipeline stages
      for (const stage of pipeline.stages) {
        await this.executeStage(pipeline, stage, triggeredBy);
      }
    } catch (error) {
      console.error('Error in pipeline execution:', error);
      
      // Update pipeline status to failed
      await this.updatePipeline(pipeline.id, {
        status: 'Failed',
        currentStage: 'Failed',
        lastExecuted: new Date()
      });

      throw error;
    }
  }

  private async executeStage(pipeline: SSCPipeline, stage: PipelineStage, triggeredBy: string): Promise<void> {
    try {
      console.log(`Executing stage: ${stage.stageName} for pipeline: ${pipeline.name}`);

      // Update pipeline current stage
      await this.updatePipeline(pipeline.id, {
        currentStage: stage.stageName
      });

      // Execute scans if this stage has them
      for (const scanType of stage.scansToExecute) {
        await this.executeScan(pipeline, stage, scanType, triggeredBy);
      }

      // Mark stage as completed
      console.log(`Completed stage: ${stage.stageName}`);
    } catch (error) {
      console.error(`Error executing stage ${stage.stageName}:`, error);
      throw error;
    }
  }

  private async executeScan(
    pipeline: SSCPipeline,
    stage: PipelineStage,
    scanType: ScanType,
    triggeredBy: string
  ): Promise<void> {
    try {
      console.log(`Executing ${scanType} scan for pipeline: ${pipeline.name}`);

      // Create a scan result (this would integrate with actual scanning tools)
      const scanResult: Omit<ScanResult, 'id' | 'createdAt'> = {
        organizationId: pipeline.organizationId,
        pipelineId: pipeline.id,
        projectId: pipeline.projectId,
        scanType,
        scanDate: new Date(),
        scannerId: `scanner-${scanType.toLowerCase()}`,
        scannerVersion: '1.0.0',
        scanDuration: Math.floor(Math.random() * 300) + 60, // Random duration 1-5 minutes
        exitCode: 0,
        targetRepository: pipeline.repositoryUrl,
        targetBranch: pipeline.configuration.defaultBranch || 'main',
        totalIssuesFound: 0,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        infoIssues: 0,
        vulnerabilities: [], // Would be populated by actual scan
        scanConfiguration: pipeline.scanConfiguration,
        rawOutput: 'Scan completed successfully',
        scanLogs: [`Starting ${scanType} scan`, `Scan completed`],
        complianceResults: [],
        artifacts: []
      };

      await this.createScanResult(scanResult);
    } catch (error) {
      console.error(`Error executing ${scanType} scan:`, error);
      throw error;
    }
  }

  private async processVulnerabilities(vulnerabilities: string[], organizationId: string): Promise<void> {
    try {
      for (const vulnId of vulnerabilities) {
        // Check if vulnerability already exists
        const existingVuln = await this.findExistingVulnerability(vulnId, organizationId);
        
        if (!existingVuln) {
          // Create new vulnerability record (would integrate with vulnerability databases)
          await this.createVulnerabilityFromScan(vulnId, organizationId);
        }
      }
    } catch (error) {
      console.error('Error processing vulnerabilities:', error);
      // Don't throw - this is a background process
    }
  }

  private async findExistingVulnerability(vulnId: string, organizationId: string): Promise<Vulnerability | null> {
    try {
      const container = this.cosmosClient.container(this.vulnerabilityContainerName);
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.organizationId = @organizationId AND c.cveId = @cveId',
          parameters: [
            { name: '@organizationId', value: organizationId },
            { name: '@cveId', value: vulnId }
          ]
        })
        .fetchAll();

      return resources.length > 0 ? this.mapToVulnerability(resources[0]) : null;
    } catch (error) {
      console.error('Error finding existing vulnerability:', error);
      return null;
    }
  }

  private async createVulnerabilityFromScan(vulnId: string, organizationId: string): Promise<void> {
    try {
      const container = this.cosmosClient.container(this.vulnerabilityContainerName);
      const now = new Date();

      // This would integrate with vulnerability databases (NVD, etc.)
      const vulnerability: Vulnerability = {
        id: this.generateId(),
        organizationId,
        cveId: vulnId,
        title: `Vulnerability ${vulnId}`,
        description: `Security vulnerability identified: ${vulnId}`,
        severity: 'Medium', // Would be determined from vulnerability database
        cvssScore: 5.0,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N',
        publishedDate: now,
        discoveredDate: now,
        affectedComponents: [],
        status: 'New',
        source: 'Automated_Scan',
        category: 'Application_Security',
        exploitAvailable: false,
        patchAvailable: false,
        riskAssessment: {
          businessImpact: 'Medium',
          exploitability: 'Low',
          affectedSystems: [],
          mitigationComplexity: 'Medium',
          overallRisk: 'Medium'
        },
        remediation: {
          recommendation: 'Apply security patches when available',
          priority: 'Medium',
          estimatedEffort: '2-4 hours',
          assignedTo: '',
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'Not_Started',
          progressNotes: []
        },
        metadata: {
          scanId: 'auto-scan',
          detectionMethod: 'SAST'
        },
        createdAt: now,
        updatedAt: now
      };

      await container.items.create(vulnerability);
    } catch (error) {
      console.error('Error creating vulnerability from scan:', error);
    }
  }

  private async checkPolicyViolations(scanResult: ScanResult): Promise<void> {
    try {
      const config = await this.getConfiguration(scanResult.organizationId);
      
      for (const policy of config.securityPolicies) {
        if (this.isPolicyViolated(scanResult, policy)) {
          await this.createPolicyViolationAlert(scanResult, policy);
        }
      }
    } catch (error) {
      console.error('Error checking policy violations:', error);
    }
  }

  private isPolicyViolated(scanResult: ScanResult, policy: SecurityPolicy): boolean {
    // Check various policy conditions
    if (policy.policyType === 'Vulnerability_Threshold') {
      const criticalCount = scanResult.criticalIssues;
      const highCount = scanResult.highIssues;
      
      // Example: Policy might require 0 critical and <= 5 high vulnerabilities
      return criticalCount > 0 || highCount > 5;
    }
    
    if (policy.policyType === 'License_Compliance') {
      // Check for restricted licenses in components
      return false; // Would implement license checking logic
    }
    
    return false;
  }

  private async createPolicyViolationAlert(scanResult: ScanResult, policy: SecurityPolicy): Promise<void> {
    try {
      const alert: SSCAlert = {
        alertId: this.generateId(),
        organizationId: scanResult.organizationId,
        alertType: 'Policy_Violation',
        severity: policy.severity as AlertSeverity,
        title: `Policy violation: ${policy.name}`,
        description: `Scan result violates security policy: ${policy.description}`,
        entityId: scanResult.id,
        entityType: 'ScanResult',
        triggeredBy: 'system',
        triggeredAt: new Date(),
        status: 'Open',
        assignedTo: policy.enforcementActions.notificationRecipients,
        acknowledgment: {
          isAcknowledged: false
        },
        metadata: {
          policyId: policy.id,
          scanType: scanResult.scanType,
          pipelineId: scanResult.pipelineId
        }
      };

      // In a real implementation, this would be stored and trigger notifications
      console.log('Policy violation alert created:', alert);
    } catch (error) {
      console.error('Error creating policy violation alert:', error);
    }
  }

  private async getRecentScanResults(
    organizationId: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<ScanResult[]> {
    try {
      const container = this.cosmosClient.container(this.scanContainerName);
      let query = 'SELECT * FROM c WHERE c.organizationId = @organizationId';
      const parameters = [{ name: '@organizationId', value: organizationId }];

      if (timeframe) {
        query += ' AND c.scanDate >= @startDate AND c.scanDate <= @endDate';
        parameters.push(
          { name: '@startDate', value: timeframe.start.toISOString() },
          { name: '@endDate', value: timeframe.end.toISOString() }
        );
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query += ' AND c.scanDate >= @startDate';
        parameters.push({ name: '@startDate', value: thirtyDaysAgo.toISOString() });
      }

      query += ' ORDER BY c.scanDate DESC';

      const { resources } = await container.items
        .query({ query, parameters })
        .fetchAll();

      return resources.map(this.mapToScanResult);
    } catch (error) {
      console.error('Error retrieving recent scan results:', error);
      return [];
    }
  }

  private async buildDashboardData(
    organizationId: string,
    pipelines: SSCPipeline[],
    recentScans: ScanResult[],
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[],
    timeframe?: { start: Date; end: Date }
  ): Promise<SSCDashboardData> {
    const now = new Date();
    const reportingPeriod = timeframe || {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: now
    };

    // Pipeline metrics
    const totalPipelines = pipelines.length;
    const activePipelines = pipelines.filter(p => p.status === 'Running').length;
    const failedPipelines = pipelines.filter(p => p.status === 'Failed').length;
    const pipelineSuccessRate = totalPipelines > 0 ? 
      Math.round(((totalPipelines - failedPipelines) / totalPipelines) * 100) : 100;

    // Scan metrics
    const totalScans = recentScans.length;
    const scansByType = this.calculateScansByType(recentScans);
    const scanTrends = this.calculateScanTrends(recentScans);

    // Vulnerability metrics
    const totalVulnerabilities = vulnerabilities.length;
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'High').length;
    const vulnerabilityTrends = this.calculateVulnerabilityTrends(vulnerabilities);
    const mttr = this.calculateMTTR(vulnerabilities);
    const patchingMetrics = this.calculatePatchingMetrics(vulnerabilities);

    // Component metrics
    const totalComponents = components.length;
    const outdatedComponents = components.filter(c => 
      c.securityStatus === 'Outdated' || c.securityStatus === 'End_of_Life'
    ).length;
    const componentsWithVulns = components.filter(c => 
      c.knownVulnerabilities.length > 0
    ).length;
    const componentRiskDistribution = this.calculateComponentRiskDistribution(components);

    // Compliance metrics
    const complianceScore = this.calculateOverallComplianceScore(pipelines, vulnerabilities, components);
    const complianceByFramework = this.calculateComplianceByFramework(pipelines, vulnerabilities);

    // Risk metrics
    const overallRiskScore = this.calculateOverallRiskScore(vulnerabilities, components);
    const riskTrend = this.calculateRiskTrend(vulnerabilities, components);

    return {
      organizationId,
      generatedAt: now,
      reportingPeriod,
      pipelineMetrics: {
        totalPipelines,
        activePipelines,
        failedPipelines,
        pipelineSuccessRate,
        averageExecutionTime: this.calculateAverageExecutionTime(pipelines),
        pipelinesByStatus: this.calculatePipelinesByStatus(pipelines),
        recentExecutions: this.getRecentPipelineExecutions(pipelines)
      },
      scanMetrics: {
        totalScans,
        scansByType,
        scanTrends,
        averageScanDuration: this.calculateAverageScanDuration(recentScans),
        scanFailureRate: this.calculateScanFailureRate(recentScans)
      },
      vulnerabilityMetrics: {
        totalVulnerabilities,
        criticalVulns,
        highVulns,
        vulnerabilityTrends,
        vulnerabilityAge: this.calculateVulnerabilityAge(vulnerabilities),
        mttr,
        patchingMetrics
      },
      componentMetrics: {
        totalComponents,
        outdatedComponents,
        componentsWithVulns,
        componentRiskDistribution,
        licenseCompliance: this.calculateLicenseCompliance(components),
        componentsByType: this.calculateComponentsByType(components)
      },
      complianceMetrics: {
        overallComplianceScore: complianceScore,
        complianceByFramework,
        policyViolations: this.calculatePolicyViolations(pipelines, vulnerabilities),
        auditFindings: this.getRecentAuditFindings(organizationId)
      },
      riskMetrics: {
        overallRiskScore,
        riskByCategory: this.calculateRiskByCategory(vulnerabilities, components),
        riskTrend,
        topRisks: this.getTopRisks(vulnerabilities, components)
      },
      alerts: await this.getActiveAlerts(organizationId),
      kpis: this.calculateSSCKPIs(pipelines, vulnerabilities, components)
    };
  }

  private calculateScansByType(scans: ScanResult[]) {
    return scans.reduce((acc, scan) => {
      acc[scan.scanType] = (acc[scan.scanType] || 0) + 1;
      return acc;
    }, {} as Record<ScanType, number>);
  }

  private calculateScanTrends(scans: ScanResult[]) {
    // Simplified trend calculation - would implement proper time series analysis
    const last30Days = scans.filter(s => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return s.scanDate >= thirtyDaysAgo;
    });

    return [{
      date: new Date(),
      totalScans: last30Days.length,
      scansByType: this.calculateScansByType(last30Days)
    }];
  }

  private calculateVulnerabilityTrends(vulnerabilities: Vulnerability[]) {
    // Simplified trend calculation
    const last30Days = vulnerabilities.filter(v => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return v.discoveredDate >= thirtyDaysAgo;
    });

    return [{
      date: new Date(),
      totalVulnerabilities: last30Days.length,
      byStatus: last30Days.reduce((acc, vuln) => {
        acc[vuln.status] = (acc[vuln.status] || 0) + 1;
        return acc;
      }, {} as Record<VulnerabilityStatus, number>)
    }];
  }

  private calculateMTTR(vulnerabilities: Vulnerability[]): number {
    const resolvedVulns = vulnerabilities.filter(v => v.status === 'Resolved');
    if (resolvedVulns.length === 0) return 0;

    const totalTime = resolvedVulns.reduce((sum, vuln) => {
      if (vuln.statusUpdatedDate) {
        const discoveryTime = vuln.discoveredDate.getTime();
        const resolutionTime = vuln.statusUpdatedDate.getTime();
        return sum + (resolutionTime - discoveryTime);
      }
      return sum;
    }, 0);

    // Return MTTR in days
    return Math.round(totalTime / (resolvedVulns.length * 24 * 60 * 60 * 1000));
  }

  private calculatePatchingMetrics(vulnerabilities: Vulnerability[]) {
    const totalVulns = vulnerabilities.length;
    const patchedVulns = vulnerabilities.filter(v => v.patchAvailable && v.status === 'Resolved').length;
    
    return {
      totalVulnerabilities: totalVulns,
      patchedVulnerabilities: patchedVulns,
      patchingRate: totalVulns > 0 ? Math.round((patchedVulns / totalVulns) * 100) : 0,
      averagePatchTime: this.calculateMTTR(vulnerabilities.filter(v => v.patchAvailable))
    };
  }

  private calculateComponentRiskDistribution(components: SoftwareComponent[]) {
    return components.reduce((acc, component) => {
      acc[component.riskLevel] = (acc[component.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<RiskLevel, number>);
  }

  private calculateOverallComplianceScore(
    pipelines: SSCPipeline[],
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[]
  ): number {
    // Simplified compliance score calculation
    let score = 100;

    // Deduct for high/critical vulnerabilities
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'High').length;
    score -= (criticalVulns * 10) + (highVulns * 5);

    // Deduct for failed pipelines
    const failedPipelines = pipelines.filter(p => p.status === 'Failed').length;
    score -= failedPipelines * 5;

    // Deduct for outdated components
    const outdatedComponents = components.filter(c => c.securityStatus === 'Outdated').length;
    score -= outdatedComponents * 2;

    return Math.max(0, Math.min(100, score));
  }

  private calculateComplianceByFramework(
    pipelines: SSCPipeline[],
    vulnerabilities: Vulnerability[]
  ) {
    // This would integrate with compliance framework mappings
    return [
      {
        framework: 'NIST_Cybersecurity_Framework' as ComplianceFramework,
        score: 85,
        controlsCovered: 45,
        totalControls: 53,
        lastAssessed: new Date()
      },
      {
        framework: 'OWASP_Top_10' as ComplianceFramework,
        score: 78,
        controlsCovered: 8,
        totalControls: 10,
        lastAssessed: new Date()
      }
    ];
  }

  private calculateOverallRiskScore(
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[]
  ): number {
    // Simplified risk score calculation
    let riskScore = 0;

    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'Critical': riskScore += 10; break;
        case 'High': riskScore += 7; break;
        case 'Medium': riskScore += 4; break;
        case 'Low': riskScore += 1; break;
      }
    });

    components.forEach(component => {
      switch (component.riskLevel) {
        case 'Very_High': riskScore += 5; break;
        case 'High': riskScore += 3; break;
        case 'Moderate': riskScore += 1; break;
      }
    });

    return Math.min(100, riskScore);
  }

  private calculateRiskTrend(
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[]
  ) {
    // Simplified risk trend calculation
    return [{
      date: new Date(),
      riskScore: this.calculateOverallRiskScore(vulnerabilities, components),
      trendDirection: 'Stable' as const
    }];
  }

  private calculateAverageExecutionTime(pipelines: SSCPipeline[]): number {
    const executedPipelines = pipelines.filter(p => p.executionTime);
    if (executedPipelines.length === 0) return 0;

    const totalTime = executedPipelines.reduce((sum, p) => sum + (p.executionTime || 0), 0);
    return Math.round(totalTime / executedPipelines.length);
  }

  private calculatePipelinesByStatus(pipelines: SSCPipeline[]) {
    return pipelines.reduce((acc, pipeline) => {
      acc[pipeline.status] = (acc[pipeline.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getRecentPipelineExecutions(pipelines: SSCPipeline[]) {
    return pipelines
      .filter(p => p.lastExecuted)
      .sort((a, b) => (b.lastExecuted?.getTime() || 0) - (a.lastExecuted?.getTime() || 0))
      .slice(0, 10)
      .map(p => ({
        pipelineId: p.id,
        name: p.name,
        status: p.status,
        executedAt: p.lastExecuted!,
        duration: p.executionTime || 0,
        triggeredBy: p.triggeredBy || 'Unknown'
      }));
  }

  private calculateAverageScanDuration(scans: ScanResult[]): number {
    if (scans.length === 0) return 0;
    const totalDuration = scans.reduce((sum, scan) => sum + scan.scanDuration, 0);
    return Math.round(totalDuration / scans.length);
  }

  private calculateScanFailureRate(scans: ScanResult[]): number {
    if (scans.length === 0) return 0;
    const failedScans = scans.filter(s => s.exitCode !== 0).length;
    return Math.round((failedScans / scans.length) * 100);
  }

  private calculateVulnerabilityAge(vulnerabilities: Vulnerability[]) {
    const now = new Date();
    const ages = vulnerabilities.map(v => {
      const ageInDays = Math.floor((now.getTime() - v.discoveredDate.getTime()) / (24 * 60 * 60 * 1000));
      return ageInDays;
    });

    if (ages.length === 0) return { average: 0, median: 0, maximum: 0 };

    const sum = ages.reduce((acc, age) => acc + age, 0);
    const sortedAges = ages.sort((a, b) => a - b);
    
    return {
      average: Math.round(sum / ages.length),
      median: sortedAges[Math.floor(sortedAges.length / 2)],
      maximum: Math.max(...ages)
    };
  }

  private calculateLicenseCompliance(components: SoftwareComponent[]) {
    const totalComponents = components.length;
    const compliantComponents = components.filter(c => 
      c.license && !c.license.isRestrictive
    ).length;

    return {
      totalComponents,
      compliantComponents,
      complianceRate: totalComponents > 0 ? Math.round((compliantComponents / totalComponents) * 100) : 100,
      restrictedLicenses: components.filter(c => c.license?.isRestrictive).length
    };
  }

  private calculateComponentsByType(components: SoftwareComponent[]) {
    return components.reduce((acc, component) => {
      acc[component.componentType] = (acc[component.componentType] || 0) + 1;
      return acc;
    }, {} as Record<ComponentType, number>);
  }

  private calculatePolicyViolations(pipelines: SSCPipeline[], vulnerabilities: Vulnerability[]) {
    // This would check against actual policy configurations
    return {
      totalViolations: 3,
      violationsByType: {
        'Vulnerability_Threshold': 2,
        'License_Compliance': 1
      },
      recentViolations: []
    };
  }

  private getRecentAuditFindings(organizationId: string) {
    // This would query actual audit trail data
    return {
      totalFindings: 5,
      findingsBySeverity: {
        'Critical': 0,
        'High': 2,
        'Medium': 2,
        'Low': 1
      },
      recentFindings: []
    };
  }

  private calculateRiskByCategory(vulnerabilities: Vulnerability[], components: SoftwareComponent[]) {
    const categories = ['Application_Security', 'Infrastructure_Security', 'Data_Security', 'Third_Party_Risk'];
    
    return categories.map(category => ({
      category,
      totalRisks: vulnerabilities.filter(v => v.category === category).length,
      highRisks: vulnerabilities.filter(v => v.category === category && v.severity === 'High').length,
      averageRiskScore: 5.0, // Would calculate based on actual risk assessment
      trendDirection: 'Stable' as const
    }));
  }

  private getTopRisks(vulnerabilities: Vulnerability[], components: SoftwareComponent[]) {
    return vulnerabilities
      .filter(v => v.severity === 'Critical' || v.severity === 'High')
      .slice(0, 10)
      .map(v => ({
        riskId: v.id,
        title: v.title,
        severity: v.severity,
        description: v.description,
        affectedAssets: v.affectedComponents.length,
        riskScore: v.cvssScore,
        daysOpen: Math.floor((new Date().getTime() - v.discoveredDate.getTime()) / (24 * 60 * 60 * 1000))
      }));
  }

  private async getActiveAlerts(organizationId: string): Promise<SSCAlert[]> {
    // This would query actual alert data
    return [
      {
        alertId: this.generateId(),
        organizationId,
        alertType: 'Vulnerability_Detected',
        severity: 'High',
        title: 'Critical vulnerability detected',
        description: 'New critical vulnerability found in production system',
        entityId: 'vuln-123',
        entityType: 'Vulnerability',
        triggeredBy: 'system',
        triggeredAt: new Date(),
        status: 'Open',
        assignedTo: ['security-team'],
        acknowledgment: {
          isAcknowledged: false
        },
        metadata: {
          cveId: 'CVE-2024-1234'
        }
      }
    ];
  }

  private calculateSSCKPIs(
    pipelines: SSCPipeline[],
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[]
  ) {
    return [
      {
        name: 'Pipeline Success Rate',
        description: 'Percentage of successful pipeline executions',
        value: this.calculatePipelineSuccessRate(pipelines),
        unit: '%',
        target: 95,
        status: 'On_Target' as const,
        trendDirection: 'Improving' as const,
        lastUpdated: new Date()
      },
      {
        name: 'Mean Time to Resolution (MTTR)',
        description: 'Average time to resolve vulnerabilities',
        value: this.calculateMTTR(vulnerabilities),
        unit: 'days',
        target: 14,
        status: 'At_Risk' as const,
        trendDirection: 'Stable' as const,
        lastUpdated: new Date()
      },
      {
        name: 'Component Security Coverage',
        description: 'Percentage of components with security monitoring',
        value: this.calculateComponentSecurityCoverage(components),
        unit: '%',
        target: 100,
        status: 'On_Target' as const,
        trendDirection: 'Improving' as const,
        lastUpdated: new Date()
      }
    ];
  }

  private calculatePipelineSuccessRate(pipelines: SSCPipeline[]): number {
    if (pipelines.length === 0) return 100;
    const successfulPipelines = pipelines.filter(p => p.status === 'Completed').length;
    return Math.round((successfulPipelines / pipelines.length) * 100);
  }

  private calculateComponentSecurityCoverage(components: SoftwareComponent[]): number {
    if (components.length === 0) return 100;
    const monitoredComponents = components.filter(c => 
      c.securityStatus !== 'Unknown'
    ).length;
    return Math.round((monitoredComponents / components.length) * 100);
  }

  private async buildComplianceReport(
    organizationId: string,
    framework: ComplianceFramework,
    pipelines: SSCPipeline[],
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[],
    timeframe?: { start: Date; end: Date }
  ): Promise<ComplianceReport> {
    const reportId = this.generateId();
    const now = new Date();

    // Build compliance report based on framework
    const executiveSummary = this.generateComplianceExecutiveSummary(framework, pipelines, vulnerabilities, components);
    const controlAssessment = this.generateControlAssessment(framework, pipelines, vulnerabilities, components);
    const gaps = this.identifyComplianceGaps(framework, pipelines, vulnerabilities, components);
    const recommendations = this.generateComplianceRecommendations(framework, gaps);

    return {
      reportId,
      organizationId,
      generatedAt: now,
      framework,
      reportingPeriod: timeframe || {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: now
      },
      overallComplianceScore: this.calculateOverallComplianceScore(pipelines, vulnerabilities, components),
      executiveSummary,
      controlAssessment,
      gaps,
      recommendations,
      evidenceCollected: [],
      attestations: [],
      generatedBy: 'system',
      reviewers: [],
      approvalStatus: 'Draft'
    };
  }

  private generateComplianceExecutiveSummary(
    framework: ComplianceFramework,
    pipelines: SSCPipeline[],
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[]
  ): string {
    const overallScore = this.calculateOverallComplianceScore(pipelines, vulnerabilities, components);
    const criticalFindings = vulnerabilities.filter(v => v.severity === 'Critical').length;
    
    return `This compliance assessment evaluates ${framework} requirements across the software supply chain. The overall compliance score is ${overallScore}%. ${criticalFindings} critical security findings require immediate attention to maintain compliance posture.`;
  }

  private generateControlAssessment(
    framework: ComplianceFramework,
    pipelines: SSCPipeline[],
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[]
  ) {
    // This would map to actual compliance framework controls
    return [
      {
        controlId: 'SC-1',
        controlName: 'System and Communications Protection Policy',
        implementationStatus: 'Implemented' as const,
        complianceLevel: 'Full' as const,
        evidence: ['Security policies documented', 'Regular security assessments conducted'],
        gaps: [],
        lastAssessed: new Date()
      }
    ];
  }

  private identifyComplianceGaps(
    framework: ComplianceFramework,
    pipelines: SSCPipeline[],
    vulnerabilities: Vulnerability[],
    components: SoftwareComponent[]
  ) {
    return [
      {
        gapId: this.generateId(),
        controlId: 'SI-2',
        controlName: 'Flaw Remediation',
        description: 'High-severity vulnerabilities not remediated within required timeframe',
        severity: 'High' as const,
        impact: 'May result in compliance violation and security exposure',
        affectedAssets: vulnerabilities.filter(v => v.severity === 'High').map(v => v.id),
        remediation: {
          recommendation: 'Establish automated vulnerability management process',
          estimatedEffort: '2-4 weeks',
          priority: 'High' as const,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    ];
  }

  private generateComplianceRecommendations(framework: ComplianceFramework, gaps: any[]) {
    return gaps.map(gap => ({
      category: 'Vulnerability_Management' as const,
      recommendation: gap.remediation.recommendation,
      priority: gap.remediation.priority,
      estimatedEffort: gap.remediation.estimatedEffort,
      expectedBenefits: 'Improved compliance posture and reduced security risk'
    }));
  }

  private async logAuditEvent(event: AuditTrail): Promise<void> {
    try {
      const container = this.cosmosClient.container(this.auditContainerName);
      await container.items.create(event);
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  private getDefaultConfiguration(organizationId: string): SSCConfiguration {
    const now = new Date();

    return {
      organizationId,
      scanConfiguration: {
        enabledScans: ['SAST', 'DAST', 'SCA', 'Container_Scan'],
        scanSchedule: {
          frequency: 'Daily',
          timeOfDay: '02:00',
          timezone: 'UTC'
        },
        scanThresholds: {
          critical: 0,
          high: 5,
          medium: 20,
          low: 50
        },
        retentionPolicy: {
          scanResults: 365,
          rawOutput: 90,
          artifacts: 30
        }
      },
      integrationSettings: {
        cicdPlatforms: [],
        vulnerabilityScanners: [],
        ticketingSystem: null,
        notificationChannels: []
      },
      securityPolicies: [
        {
          id: this.generateId(),
          organizationId,
          name: 'Zero Critical Vulnerabilities',
          description: 'No critical vulnerabilities allowed in production',
          policyType: 'Vulnerability_Threshold',
          isActive: true,
          severity: 'Critical',
          conditions: [{
            field: 'severity',
            operator: 'equals',
            value: 'Critical',
            action: 'Block_Deployment'
          }],
          enforcementActions: {
            blockDeployment: true,
            createTicket: true,
            sendAlert: true,
            notificationRecipients: ['security-team']
          },
          exemptions: [],
          createdBy: 'system',
          createdAt: now,
          updatedAt: now
        }
      ],
      complianceFrameworks: ['NIST_Cybersecurity_Framework', 'OWASP_Top_10'],
      alerting: {
        channels: [],
        escalationRules: [],
        mutingRules: []
      },
      reportingSettings: {
        automaticReports: [],
        dashboardRefreshInterval: 300,
        dataRetentionDays: 365
      },
      createdAt: now,
      updatedAt: now
    };
  }

  private generateId(): string {
    return `ssc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapToSSCPipeline(resource: any): SSCPipeline {
    return {
      ...resource,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
      lastExecuted: resource.lastExecuted ? new Date(resource.lastExecuted) : undefined,
      stages: resource.stages || []
    };
  }

  private mapToScanResult(resource: any): ScanResult {
    return {
      ...resource,
      scanDate: new Date(resource.scanDate),
      createdAt: new Date(resource.createdAt),
      vulnerabilities: resource.vulnerabilities || [],
      complianceResults: resource.complianceResults || [],
      artifacts: resource.artifacts || []
    };
  }

  private mapToVulnerability(resource: any): Vulnerability {
    return {
      ...resource,
      publishedDate: new Date(resource.publishedDate),
      discoveredDate: new Date(resource.discoveredDate),
      statusUpdatedDate: resource.statusUpdatedDate ? new Date(resource.statusUpdatedDate) : undefined,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
      affectedComponents: resource.affectedComponents || [],
      riskAssessment: resource.riskAssessment || {},
      remediation: resource.remediation || {},
      metadata: resource.metadata || {}
    };
  }

  private mapToSoftwareComponent(resource: any): SoftwareComponent {
    return {
      ...resource,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
      lastScanned: resource.lastScanned ? new Date(resource.lastScanned) : undefined,
      knownVulnerabilities: resource.knownVulnerabilities || [],
      dependencies: resource.dependencies || [],
      license: resource.license || null,
      metadata: resource.metadata || {}
    };
  }

  private mapToSSCConfiguration(resource: any): SSCConfiguration {
    return {
      ...resource,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
      securityPolicies: (resource.securityPolicies || []).map((policy: any) => ({
        ...policy,
        createdAt: new Date(policy.createdAt),
        updatedAt: new Date(policy.updatedAt)
      }))
    };
  }
}
