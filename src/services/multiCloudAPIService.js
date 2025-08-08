/**
 * Multi-Cloud API Service
 * Enhanced API layer supporting multi-cloud remediation and context-aware responses
 */
import enhancedCosmosService from './enhancedCosmosService';
import { CloudConnectorManager } from './connectors/CloudConnectorManager';
export class MultiCloudAPIService {
    constructor(tenantId) {
        this.tenantId = tenantId;
        this.connectorManager = new CloudConnectorManager(tenantId);
    }
    // Context-Aware NIST Controls API
    async getNISTControls(cloudProviders) {
        try {
            // Get cloud environments for the tenant
            const environments = await enhancedCosmosService.getCloudEnvironments(this.tenantId);
            // Filter environments by requested cloud providers
            let targetEnvironments = environments;
            if (cloudProviders && cloudProviders.length > 0) {
                targetEnvironments = environments.filter(env => cloudProviders.includes(env.provider) && env.isActive);
            }
            const environmentIds = targetEnvironments.map(env => env.id);
            return await enhancedCosmosService.getNISTControls(this.tenantId, environmentIds);
        }
        catch (error) {
            console.error('Error getting NIST controls:', error);
            throw error;
        }
    }
    async getNISTControlRemediation(controlId, cloudProviders) {
        try {
            return await enhancedCosmosService.getNISTControlRemediation(controlId, this.tenantId, cloudProviders);
        }
        catch (error) {
            console.error('Error getting NIST control remediation:', error);
            throw error;
        }
    }
    // Context-Aware ZTA Activities API
    async getZTAActivities(cloudProviders) {
        try {
            const environments = await enhancedCosmosService.getCloudEnvironments(this.tenantId);
            let targetEnvironments = environments;
            if (cloudProviders && cloudProviders.length > 0) {
                targetEnvironments = environments.filter(env => cloudProviders.includes(env.provider) && env.isActive);
            }
            const environmentIds = targetEnvironments.map(env => env.id);
            return await enhancedCosmosService.getZTAActivities(this.tenantId, environmentIds);
        }
        catch (error) {
            console.error('Error getting ZTA activities:', error);
            throw error;
        }
    }
    async getZTAActivityImplementation(activityId, cloudProviders) {
        try {
            const activity = await enhancedCosmosService.getZTAActivityById(activityId, this.tenantId);
            if (!activity) {
                throw new Error(`ZTA activity ${activityId} not found`);
            }
            // Filter implementation by requested cloud providers
            if (cloudProviders && cloudProviders.length > 0) {
                const filteredImplementation = {};
                for (const provider of cloudProviders) {
                    if (activity.implementation[provider]) {
                        filteredImplementation[provider] =
                            activity.implementation[provider];
                    }
                }
                return filteredImplementation;
            }
            return activity.implementation;
        }
        catch (error) {
            console.error('Error getting ZTA activity implementation:', error);
            throw error;
        }
    }
    // Dashboard Data Aggregation
    async getDashboardData(viewMode, environmentId) {
        try {
            const environments = await enhancedCosmosService.getCloudEnvironments(this.tenantId);
            let targetEnvironments = environments;
            if (viewMode === 'single' && environmentId) {
                targetEnvironments = environments.filter(env => env.id === environmentId);
            }
            const environmentIds = targetEnvironments.map(env => env.id);
            const [nistControls, ztaActivities, complianceStatus] = await Promise.all([
                enhancedCosmosService.getNISTControls(this.tenantId, environmentIds),
                enhancedCosmosService.getZTAActivities(this.tenantId, environmentIds),
                enhancedCosmosService.getOverallComplianceStatus(this.tenantId)
            ]);
            // Get recent compliance findings
            const recentComplianceData = await enhancedCosmosService.getLatestComplianceData(this.tenantId, viewMode === 'single' ? environmentId : undefined);
            const recentFindings = recentComplianceData
                .flatMap(data => data.findings)
                .sort((a, b) => new Date(b.lastChecked).getTime() - new Date(a.lastChecked).getTime())
                .slice(0, 10);
            return {
                nistControls,
                ztaActivities,
                complianceStatus,
                environments: targetEnvironments,
                recentFindings
            };
        }
        catch (error) {
            console.error('Error getting dashboard data:', error);
            throw error;
        }
    }
    // Cloud Environment Management
    async getCloudEnvironments() {
        try {
            return await enhancedCosmosService.getCloudEnvironments(this.tenantId);
        }
        catch (error) {
            console.error('Error getting cloud environments:', error);
            throw error;
        }
    }
    async syncCloudEnvironment(environmentId) {
        try {
            // Update sync status to 'syncing'
            await enhancedCosmosService.updateCloudEnvironmentStatus(environmentId, this.tenantId, 'syncing');
            // Collect compliance data using the appropriate connector
            const complianceData = await this.connectorManager.collectComplianceData(environmentId);
            if (complianceData) {
                // Store the collected data
                await enhancedCosmosService.storeComplianceData(complianceData);
                // Update sync status to 'connected'
                await enhancedCosmosService.updateCloudEnvironmentStatus(environmentId, this.tenantId, 'connected');
            }
            else {
                // Update sync status to 'error'
                await enhancedCosmosService.updateCloudEnvironmentStatus(environmentId, this.tenantId, 'error');
            }
            return complianceData;
        }
        catch (error) {
            console.error('Error syncing cloud environment:', error);
            // Update sync status to 'error'
            await enhancedCosmosService.updateCloudEnvironmentStatus(environmentId, this.tenantId, 'error');
            throw error;
        }
    }
    async syncAllEnvironments() {
        try {
            const environments = await enhancedCosmosService.getCloudEnvironments(this.tenantId);
            const activeEnvironments = environments.filter(env => env.isActive);
            const results = await this.connectorManager.syncEnvironments(activeEnvironments.map(env => env.id));
            // Store successful compliance data
            for (const data of results.success) {
                await enhancedCosmosService.storeComplianceData(data);
            }
            return results;
        }
        catch (error) {
            console.error('Error syncing all environments:', error);
            throw error;
        }
    }
    // SSSC Dashboard API
    async getSSCMetrics(environmentId) {
        try {
            return await enhancedCosmosService.getSSCMetrics(this.tenantId, environmentId);
        }
        catch (error) {
            console.error('Error getting SSC metrics:', error);
            throw error;
        }
    }
    async updateSSCMetrics(metrics) {
        try {
            return await enhancedCosmosService.storeSSCMetrics(metrics);
        }
        catch (error) {
            console.error('Error updating SSC metrics:', error);
            throw error;
        }
    }
    // Execution Enablers (DOTmLPF-P) API
    async getExecutionEnablers() {
        try {
            return await enhancedCosmosService.getExecutionEnablers(this.tenantId);
        }
        catch (error) {
            console.error('Error getting execution enablers:', error);
            throw error;
        }
    }
    async updateExecutionEnabler(enabler) {
        try {
            return await enhancedCosmosService.createOrUpdateExecutionEnabler(enabler);
        }
        catch (error) {
            console.error('Error updating execution enabler:', error);
            throw error;
        }
    }
    // Compliance Reporting
    async generateComplianceReport(environmentIds, nistRevision) {
        try {
            // Get controls filtered by environment and NIST revision
            let controls = await enhancedCosmosService.getNISTControls(this.tenantId, environmentIds);
            if (nistRevision) {
                controls = controls.filter(control => control.nistRevision === nistRevision);
            }
            // Calculate summary statistics
            const summary = {
                totalControls: controls.length,
                compliantControls: controls.filter(c => c.overallStatus === 'compliant').length,
                partialControls: controls.filter(c => c.overallStatus === 'partial').length,
                nonCompliantControls: controls.filter(c => c.overallStatus === 'noncompliant').length,
                notAssessedControls: controls.filter(c => c.overallStatus === 'not-assessed').length,
                compliancePercentage: 0
            };
            summary.compliancePercentage = summary.totalControls > 0
                ? Math.round((summary.compliantControls / summary.totalControls) * 100)
                : 0;
            // Get recent compliance findings
            const complianceData = await enhancedCosmosService.getLatestComplianceData(this.tenantId);
            const findings = complianceData
                .flatMap(data => data.findings)
                .filter(finding => finding.status === 'fail')
                .sort((a, b) => new Date(b.lastChecked).getTime() - new Date(a.lastChecked).getTime());
            // Generate recommendations based on non-compliant controls
            const recommendations = this.generateRecommendations(controls, findings);
            return {
                summary,
                controlDetails: controls,
                findings: findings.slice(0, 50), // Limit to top 50 findings
                recommendations
            };
        }
        catch (error) {
            console.error('Error generating compliance report:', error);
            throw error;
        }
    }
    generateRecommendations(controls, findings) {
        const recommendations = [];
        // Analyze non-compliant controls
        const nonCompliantControls = controls.filter(c => c.overallStatus === 'noncompliant');
        const highRiskControls = nonCompliantControls.filter(c => c.overallRiskLevel === 'high' || c.overallRiskLevel === 'critical');
        if (highRiskControls.length > 0) {
            recommendations.push(`Priority: Address ${highRiskControls.length} high/critical risk controls immediately`);
        }
        // Analyze findings by severity
        const criticalFindings = findings.filter(f => f.severity === 'critical');
        const highFindings = findings.filter(f => f.severity === 'high');
        if (criticalFindings.length > 0) {
            recommendations.push(`Critical: Remediate ${criticalFindings.length} critical security findings`);
        }
        if (highFindings.length > 0) {
            recommendations.push(`High Priority: Address ${highFindings.length} high severity findings`);
        }
        // Control family analysis
        const controlFamilies = new Map();
        nonCompliantControls.forEach(control => {
            const count = controlFamilies.get(control.controlFamily) || 0;
            controlFamilies.set(control.controlFamily, count + 1);
        });
        const topFamilies = Array.from(controlFamilies.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
        if (topFamilies.length > 0) {
            recommendations.push(`Focus Areas: ${topFamilies.map(([family, count]) => `${family} (${count} controls)`).join(', ')}`);
        }
        return recommendations;
    }
    // Cleanup
    dispose() {
        this.connectorManager.dispose();
    }
}
