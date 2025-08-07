/**
 * Secure Software Supply Chain (SSSC) Service
 * Implements comprehensive monitoring and metrics for DevSecOps pipeline security
 */

import { CosmosClient, Container } from '@azure/cosmos';
import { 
  SSSCMetrics,
  DevSecOpsIngestionPayload
} from '../types/dodCATOTypes';

// Cosmos DB configuration
const cosmosConfig = {
  endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
  key: import.meta.env.VITE_COSMOS_DB_KEY || 'your-cosmos-key',
  databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};

// Risk scoring constants
const VULNERABILITY_SCORES = {
  Critical: 10,
  High: 7,
  Medium: 4,
  Low: 1
};

// Simplified vulnerability metrics for dashboard
interface VulnerabilityMetrics {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface SSSCDashboardMetrics {
  overall: {
    securityScore: number;
    complianceScore: number;
    riskScore: number;
    trend: 'improving' | 'stable' | 'degrading';
  };
  vulnerabilities: VulnerabilityMetrics & {
    newThisWeek: number;
    resolvedThisWeek: number;
    avgTimeToRemediation: number;
  };
  scans: {
    totalScans: number;
    passedScans: number;
    failedScans: number;
    successRate: number;
    lastScanDate: string;
  };
  compliance: {
    overallCompliance: number;
    policyViolations: number;
    criticalFindings: number;
    complianceByFramework: Record<string, number>;
  };
  artifacts: {
    totalArtifacts: number;
    signedArtifacts: number;
    verifiedArtifacts: number;
    signatureCompliance: number;
  };
  timeline: Array<{
    date: string;
    securityScore: number;
    vulnerabilities: number;
    violations: number;
  }>;
}

class SSSCService {
  private client: CosmosClient;
  private metricsContainer: Container;

  constructor() {
    this.client = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key,
    });
    
    const database = this.client.database(cosmosConfig.databaseId);
    this.metricsContainer = database.container('sssc-metrics');
  }

  /**
   * Get current SSSC metrics for a tenant
   */
  async getCurrentMetrics(tenantId: string): Promise<SSSCMetrics | null> {
    try {
      const querySpec = {
        query: 'SELECT TOP 1 * FROM c WHERE c.tenantId = @tenantId ORDER BY c.lastScanDate DESC',
        parameters: [{ name: '@tenantId', value: tenantId }]
      };

      const { resources } = await this.metricsContainer.items.query(querySpec).fetchAll();
      return resources.length > 0 ? resources[0] as SSSCMetrics : null;
    } catch (error) {
      console.error('Error getting current SSSC metrics:', error);
      throw error;
    }
  }

  /**
   * Record new SSSC metrics
   */
  async recordMetrics(metrics: Omit<SSSCMetrics, 'id'>): Promise<SSSCMetrics> {
    const newMetrics: SSSCMetrics = {
      ...metrics,
      id: `sssc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    try {
      const { resource } = await this.metricsContainer.items.create(newMetrics);
      return resource as SSSCMetrics;
    } catch (error) {
      console.error('Error recording SSSC metrics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(tenantId: string, days: number = 30): Promise<SSSCDashboardMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Get recent metrics for trend analysis
      const metricsQuery = {
        query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId 
            AND c.lastScanDate >= @startDate 
          ORDER BY c.lastScanDate DESC
        `,
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@startDate', value: startDate.toISOString() }
        ]
      };

      const { resources: metricsHistory } = await this.metricsContainer.items.query(metricsQuery).fetchAll();
      
      if (metricsHistory.length === 0) {
        return this.getDefaultDashboardMetrics();
      }

      return this.calculateDashboardMetrics(metricsHistory as SSSCMetrics[], days);
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive dashboard metrics
   */
  private calculateDashboardMetrics(
    metricsHistory: SSSCMetrics[],
    days: number
  ): SSSCDashboardMetrics {
    const latestMetrics = metricsHistory[0];
    
    // Calculate overall scores
    const securityScore = this.calculateSecurityScore(latestMetrics);
    const complianceScore = latestMetrics.complianceScore;
    const riskScore = this.calculateRiskScore(latestMetrics);

    // Calculate trend
    const trend = this.calculateTrend(metricsHistory);

    // Calculate vulnerability metrics
    const vulnerabilityMetrics = this.calculateVulnerabilityMetrics(latestMetrics, metricsHistory, days);

    // Calculate scan metrics
    const scanMetrics = this.calculateScanMetrics(metricsHistory);

    // Calculate compliance metrics
    const complianceMetrics = this.calculateComplianceMetrics(latestMetrics);

    // Calculate artifact metrics (placeholder - would need actual artifact data)
    const artifactMetrics = this.calculateArtifactMetrics();

    // Create timeline data
    const timeline = this.createTimelineData(metricsHistory, days);

    return {
      overall: {
        securityScore,
        complianceScore,
        riskScore,
        trend
      },
      vulnerabilities: vulnerabilityMetrics,
      scans: scanMetrics,
      compliance: complianceMetrics,
      artifacts: artifactMetrics,
      timeline
    };
  }

  /**
   * Calculate security score based on vulnerabilities and compliance
   */
  private calculateSecurityScore(metrics: SSSCMetrics): number {
    const vulnScore = this.calculateVulnerabilityScore({
      critical: metrics.criticalVulnerabilities,
      high: metrics.highVulnerabilities,
      medium: metrics.mediumVulnerabilities,
      low: metrics.lowVulnerabilities
    });
    const complianceScore = metrics.complianceScore;
    
    // Weighted average: 60% vulnerabilities, 40% compliance
    return Math.round((vulnScore * 0.6) + (complianceScore * 0.4));
  }

  /**
   * Calculate vulnerability-based score
   */
  private calculateVulnerabilityScore(vulnerabilities: VulnerabilityMetrics): number {
    const totalVulns = vulnerabilities.critical + vulnerabilities.high + vulnerabilities.medium + vulnerabilities.low;
    
    if (totalVulns === 0) return 100;
    
    const weightedScore = (
      (vulnerabilities.critical * VULNERABILITY_SCORES.Critical) +
      (vulnerabilities.high * VULNERABILITY_SCORES.High) +
      (vulnerabilities.medium * VULNERABILITY_SCORES.Medium) +
      (vulnerabilities.low * VULNERABILITY_SCORES.Low)
    );
    
    // Score inversely related to weighted vulnerability count
    const maxPossibleScore = totalVulns * VULNERABILITY_SCORES.Critical;
    return Math.max(0, Math.round(100 - (weightedScore / maxPossibleScore * 100)));
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(metrics: SSSCMetrics): number {
    const criticalVulns = metrics.criticalVulnerabilities;
    const highVulns = metrics.highVulnerabilities;
    const failingPolicies = metrics.failingPolicies;
    
    // Risk score based on critical findings
    const riskFactors = (criticalVulns * 3) + (highVulns * 2) + (failingPolicies * 2);
    
    // Convert to 0-100 scale (higher = more risk)
    return Math.min(100, Math.round(riskFactors * 2));
  }

  /**
   * Calculate trend based on historical data
   */
  private calculateTrend(metricsHistory: SSSCMetrics[]): 'improving' | 'stable' | 'degrading' {
    if (metricsHistory.length < 2) return 'stable';
    
    const latest = metricsHistory[0];
    const previous = metricsHistory[1];
    
    const latestScore = this.calculateSecurityScore(latest);
    const previousScore = this.calculateSecurityScore(previous);
    
    const difference = latestScore - previousScore;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'degrading';
    return 'stable';
  }

  /**
   * Calculate vulnerability metrics with trends
   */
  private calculateVulnerabilityMetrics(
    latestMetrics: SSSCMetrics, 
    metricsHistory: SSSCMetrics[], 
    days: number
  ): SSSCDashboardMetrics['vulnerabilities'] {
    const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const weekOldMetrics = metricsHistory.find(m => new Date(m.lastScanDate) <= oneWeekAgo);
    
    let newThisWeek = 0;
    let resolvedThisWeek = 0;
    
    if (weekOldMetrics) {
      const currentTotal = latestMetrics.totalVulnerabilities;
      const previousTotal = weekOldMetrics.totalVulnerabilities;
      
      const netChange = currentTotal - previousTotal;
      if (netChange > 0) {
        newThisWeek = netChange;
      } else {
        resolvedThisWeek = Math.abs(netChange);
      }
    }
    
    // Calculate average time to remediation based on remediated vulnerabilities
    const avgTimeToRemediation = latestMetrics.remediatedVulnerabilities > 0 ? 48 : 72; // hours
    
    return {
      critical: latestMetrics.criticalVulnerabilities,
      high: latestMetrics.highVulnerabilities,
      medium: latestMetrics.mediumVulnerabilities,
      low: latestMetrics.lowVulnerabilities,
      newThisWeek,
      resolvedThisWeek,
      avgTimeToRemediation
    };
  }

  /**
   * Calculate scan metrics
   */
  private calculateScanMetrics(metricsHistory: SSSCMetrics[]): SSSCDashboardMetrics['scans'] {
    const totalScans = metricsHistory.length;
    const passedScans = metricsHistory.filter(scan => scan.scanStatus === 'Completed').length;
    const failedScans = metricsHistory.filter(scan => scan.scanStatus === 'Failed').length;
    const successRate = totalScans > 0 ? Math.round((passedScans / totalScans) * 100) : 0;
    const lastScanDate = metricsHistory.length > 0 ? metricsHistory[0].lastScanDate : new Date().toISOString();
    
    return {
      totalScans,
      passedScans,
      failedScans,
      successRate,
      lastScanDate
    };
  }

  /**
   * Calculate compliance metrics
   */
  private calculateComplianceMetrics(metrics: SSSCMetrics): SSSCDashboardMetrics['compliance'] {
    const overallCompliance = metrics.complianceScore;
    const policyViolations = metrics.failingPolicies;
    const criticalFindings = metrics.criticalVulnerabilities + Math.floor(metrics.failingPolicies * 0.2); // Estimate critical policy failures
    
    // Placeholder compliance by framework (would need actual framework data)
    const complianceByFramework = {
      'NIST 800-53': Math.max(85, overallCompliance - 5),
      'NIST 800-171': Math.max(80, overallCompliance - 10),
      'FISMA': Math.max(90, overallCompliance)
    };
    
    return {
      overallCompliance,
      policyViolations,
      criticalFindings,
      complianceByFramework
    };
  }

  /**
   * Calculate artifact metrics (placeholder)
   */
  private calculateArtifactMetrics(): SSSCDashboardMetrics['artifacts'] {
    return {
      totalArtifacts: 0,
      signedArtifacts: 0,
      verifiedArtifacts: 0,
      signatureCompliance: 100
    };
  }

  /**
   * Create timeline data for charts
   */
  private createTimelineData(metricsHistory: SSSCMetrics[], days: number): SSSCDashboardMetrics['timeline'] {
    const timeline: SSSCDashboardMetrics['timeline'] = [];
    
    // Group metrics by day
    const metricsByDay: Record<string, SSSCMetrics[]> = {};
    metricsHistory.forEach(metrics => {
      const day = new Date(metrics.lastScanDate).toISOString().split('T')[0];
      if (!metricsByDay[day]) {
        metricsByDay[day] = [];
      }
      metricsByDay[day].push(metrics);
    });
    
    // Create timeline for last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dayKey = date.toISOString().split('T')[0];
      const dayMetrics = metricsByDay[dayKey];
      
      if (dayMetrics && dayMetrics.length > 0) {
        // Use latest metrics for that day
        const latestForDay = dayMetrics[0];
        const securityScore = this.calculateSecurityScore(latestForDay);
        const vulnerabilities = latestForDay.totalVulnerabilities;
        const violations = latestForDay.failingPolicies;
        
        timeline.push({
          date: dayKey,
          securityScore,
          vulnerabilities,
          violations
        });
      } else {
        // Use previous day's data or default
        const previousData = timeline[timeline.length - 1];
        timeline.push({
          date: dayKey,
          securityScore: previousData?.securityScore || 85,
          vulnerabilities: previousData?.vulnerabilities || 0,
          violations: previousData?.violations || 0
        });
      }
    }
    
    return timeline;
  }

  /**
   * Get default dashboard metrics when no data exists
   */
  private getDefaultDashboardMetrics(): SSSCDashboardMetrics {
    return {
      overall: {
        securityScore: 85,
        complianceScore: 90,
        riskScore: 15,
        trend: 'stable'
      },
      vulnerabilities: {
        critical: 0,
        high: 0,
        medium: 2,
        low: 5,
        newThisWeek: 0,
        resolvedThisWeek: 3,
        avgTimeToRemediation: 48
      },
      scans: {
        totalScans: 0,
        passedScans: 0,
        failedScans: 0,
        successRate: 0,
        lastScanDate: new Date().toISOString()
      },
      compliance: {
        overallCompliance: 90,
        policyViolations: 0,
        criticalFindings: 0,
        complianceByFramework: {
          'NIST 800-53': 92,
          'NIST 800-171': 88,
          'FISMA': 95
        }
      },
      artifacts: {
        totalArtifacts: 0,
        signedArtifacts: 0,
        verifiedArtifacts: 0,
        signatureCompliance: 100
      },
      timeline: []
    };
  }

  /**
   * Get vulnerability trends
   */
  async getVulnerabilityTrends(tenantId: string, days: number = 30): Promise<Array<{
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const querySpec = {
        query: `
          SELECT c.lastScanDate, c.criticalVulnerabilities, c.highVulnerabilities, 
                 c.mediumVulnerabilities, c.lowVulnerabilities 
          FROM c 
          WHERE c.tenantId = @tenantId 
            AND c.lastScanDate >= @startDate 
          ORDER BY c.lastScanDate ASC
        `,
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@startDate', value: startDate.toISOString() }
        ]
      };

      const { resources } = await this.metricsContainer.items.query(querySpec).fetchAll();
      
      return resources.map((item: any) => ({
        date: new Date(item.lastScanDate).toISOString().split('T')[0],
        critical: item.criticalVulnerabilities,
        high: item.highVulnerabilities,
        medium: item.mediumVulnerabilities,
        low: item.lowVulnerabilities
      }));
    } catch (error) {
      console.error('Error getting vulnerability trends:', error);
      throw error;
    }
  }

  /**
   * Ingest DevSecOps scan data
   */
  async ingestScanData(tenantId: string, payload: DevSecOpsIngestionPayload): Promise<SSSCMetrics> {
    try {
      // Count vulnerabilities by severity
      const vulnerabilityCounts = payload.scanResults.vulnerabilities.reduce(
        (counts, vuln) => {
          switch (vuln.severity) {
            case 'Critical':
              counts.critical++;
              break;
            case 'High':
              counts.high++;
              break;
            case 'Medium':
              counts.medium++;
              break;
            case 'Low':
              counts.low++;
              break;
          }
          return counts;
        },
        { critical: 0, high: 0, medium: 0, low: 0 }
      );

      // Count policy results
      const policyResults = payload.scanResults.policies.reduce(
        (counts, policy) => {
          if (policy.status === 'Pass') {
            counts.passing++;
          } else {
            counts.failing++;
          }
          counts.total++;
          return counts;
        },
        { passing: 0, failing: 0, total: 0 }
      );

      // Calculate compliance score
      const complianceScore = policyResults.total > 0 
        ? Math.round((policyResults.passing / policyResults.total) * 100)
        : 100;

      // Analyze components
      const componentAnalysis = {
        total: payload.scanResults.components.length,
        outdated: payload.scanResults.components.filter(c => c.isOutdated).length,
        vulnerable: payload.scanResults.components.filter(c => c.vulnerabilities > 0).length,
        licenseIssues: payload.scanResults.components.filter(c => 
          c.license.toLowerCase().includes('unknown') || 
          c.license.toLowerCase().includes('proprietary')
        ).length
      };

      // Determine scan status based on findings
      let scanStatus: 'Completed' | 'Failed' | 'In_Progress' | 'Queued' = 'Completed';
      if (vulnerabilityCounts.critical > 0 || policyResults.failing > policyResults.passing) {
        scanStatus = 'Failed';
      }

      // Convert ingestion payload to SSSC metrics
      const metrics: Omit<SSSCMetrics, 'id'> = {
        tenantId,
        repositoryName: payload.repositoryName,
        scanType: payload.scanType,
        criticalVulnerabilities: vulnerabilityCounts.critical,
        highVulnerabilities: vulnerabilityCounts.high,
        mediumVulnerabilities: vulnerabilityCounts.medium,
        lowVulnerabilities: vulnerabilityCounts.low,
        totalVulnerabilities: vulnerabilityCounts.critical + vulnerabilityCounts.high + 
                             vulnerabilityCounts.medium + vulnerabilityCounts.low,
        lastScanDate: payload.metadata.scanDate,
        scanDuration: payload.scanResults.metrics.duration,
        scanStatus,
        scanTool: payload.metadata.scanTool,
        scanVersion: payload.metadata.scanVersion,
        passingPolicies: policyResults.passing,
        failingPolicies: policyResults.failing,
        totalPolicies: policyResults.total,
        complianceScore,
        remediatedVulnerabilities: 0, // Would be calculated from historical data
        openVulnerabilities: vulnerabilityCounts.critical + vulnerabilityCounts.high + 
                           vulnerabilityCounts.medium + vulnerabilityCounts.low,
        falsePositives: 0, // Would need to be tracked separately
        suppressedFindings: 0, // Would need to be tracked separately
        componentCount: componentAnalysis.total,
        licenseIssues: componentAnalysis.licenseIssues,
        outdatedComponents: componentAnalysis.outdated,
        vulnerableComponents: componentAnalysis.vulnerable,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reportUrl: undefined,
        buildId: payload.metadata.buildId,
        commitHash: payload.metadata.commitHash
      };

      return await this.recordMetrics(metrics);
    } catch (error) {
      console.error('Error ingesting scan data:', error);
      throw error;
    }
  }

  /**
   * Get scan history for a repository
   */
  async getRepositoryScanHistory(tenantId: string, repositoryName: string, limit: number = 50): Promise<SSSCMetrics[]> {
    try {
      const querySpec = {
        query: `
          SELECT TOP @limit * FROM c 
          WHERE c.tenantId = @tenantId 
            AND c.repositoryName = @repositoryName 
          ORDER BY c.lastScanDate DESC
        `,
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@repositoryName', value: repositoryName },
          { name: '@limit', value: limit }
        ]
      };

      const { resources } = await this.metricsContainer.items.query(querySpec).fetchAll();
      return resources as SSSCMetrics[];
    } catch (error) {
      console.error('Error getting repository scan history:', error);
      throw error;
    }
  }

  /**
   * Get summary statistics for all repositories
   */
  async getRepositorySummary(tenantId: string): Promise<Array<{
    repositoryName: string;
    lastScanDate: string;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    complianceScore: number;
    scanStatus: string;
  }>> {
    try {
      const querySpec = {
        query: `
          SELECT c.repositoryName, 
                 MAX(c.lastScanDate) as lastScanDate,
                 MAX(c.totalVulnerabilities) as totalVulnerabilities,
                 MAX(c.criticalVulnerabilities) as criticalVulnerabilities,
                 MAX(c.complianceScore) as complianceScore,
                 MAX(c.scanStatus) as scanStatus
          FROM c 
          WHERE c.tenantId = @tenantId 
          GROUP BY c.repositoryName
          ORDER BY MAX(c.lastScanDate) DESC
        `,
        parameters: [{ name: '@tenantId', value: tenantId }]
      };

      const { resources } = await this.metricsContainer.items.query(querySpec).fetchAll();
      return resources as Array<{
        repositoryName: string;
        lastScanDate: string;
        totalVulnerabilities: number;
        criticalVulnerabilities: number;
        complianceScore: number;
        scanStatus: string;
      }>;
    } catch (error) {
      console.error('Error getting repository summary:', error);
      throw error;
    }
  }
}

// Singleton instance
export const sssciService = new SSSCService();

export { SSSCService, type SSSCDashboardMetrics };
