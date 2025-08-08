/**
 * Azure Cloud Connector
 * Implements Azure-specific compliance data collection using Azure SDKs
 */
import { DefaultAzureCredential } from '@azure/identity';
import { SecurityCenter } from '@azure/arm-security';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ComputeManagementClient } from '@azure/arm-compute';
import { BaseCloudConnector } from './BaseCloudConnector';
export class AzureCloudConnector extends BaseCloudConnector {
    constructor(tenantId, environmentId, credentials) {
        super('azure', tenantId, environmentId, credentials);
        this.subscriptionId = credentials.subscriptionId;
        // Use Managed Identity when available, fallback to service principal
        this.credential = new DefaultAzureCredential();
        // Initialize Azure SDK clients
        this.securityClient = new SecurityCenter(this.credential, this.subscriptionId);
        this.resourceClient = new ResourceManagementClient(this.credential, this.subscriptionId);
        this.computeClient = new ComputeManagementClient(this.credential, this.subscriptionId);
    }
    async testConnection() {
        try {
            await this.retryOperation(async () => {
                // Test connection by listing resource groups
                const resourceGroups = this.resourceClient.resourceGroups.list();
                await resourceGroups.next();
            });
            return true;
        }
        catch (error) {
            this.handleError(error, 'testConnection');
            return false;
        }
    }
    async collectComplianceData() {
        try {
            const [securityFindings, configCompliance] = await Promise.all([
                this.getSecurityFindings(),
                this.getConfigurationCompliance()
            ]);
            const allFindings = [...securityFindings, ...configCompliance];
            return {
                id: `azure-${this.environmentId}-${Date.now()}`,
                tenantId: this.tenantId,
                environmentId: this.environmentId,
                provider: 'azure',
                collectedAt: new Date().toISOString(),
                rawData: {
                    securityFindings,
                    configCompliance
                },
                findings: allFindings
            };
        }
        catch (error) {
            this.handleError(error, 'collectComplianceData');
            throw error;
        }
    }
    async getSecurityFindings() {
        try {
            return await this.retryOperation(async () => {
                const findings = [];
                // Get Microsoft Defender for Cloud security assessments
                // Note: Using assessments instead of alerts for better compliance data
                const assessments = this.securityClient.assessments.list(`/subscriptions/${this.subscriptionId}`);
                for await (const assessment of assessments) {
                    const finding = {
                        id: assessment.name || `azure-assessment-${Date.now()}`,
                        provider: 'azure',
                        severity: this.mapAssessmentSeverity(assessment.status?.code),
                        status: this.mapAssessmentStatus(assessment.status?.code),
                        mappedControls: this.mapToNISTControls(assessment),
                        resourceId: assessment.resourceDetails?.source || assessment.id,
                        ruleName: assessment.displayName || 'Unknown Assessment',
                        description: assessment.status?.description || assessment.displayName || '',
                        remediation: assessment.links?.azurePortalUri || 'Check Azure Security Center for remediation steps',
                        discoveredAt: new Date().toISOString(),
                        lastChecked: new Date().toISOString()
                    };
                    findings.push(finding);
                }
                return findings;
            });
        }
        catch (error) {
            this.handleError(error, 'getSecurityFindings');
            return [];
        }
    }
    async getConfigurationCompliance() {
        try {
            return await this.retryOperation(async () => {
                const findings = [];
                // Get Azure Resource Graph compliance data
                // This would typically use Azure Resource Graph queries
                // For now, implementing basic resource configuration checks
                const resourceGroups = this.resourceClient.resourceGroups.list();
                for await (const rg of resourceGroups) {
                    // Check for required tags (example compliance check)
                    const requiredTags = ['Environment', 'Owner', 'CostCenter'];
                    const missingTags = requiredTags.filter(tag => !rg.tags?.[tag]);
                    if (missingTags.length > 0) {
                        const finding = {
                            id: `azure-config-${rg.name}-${Date.now()}`,
                            provider: 'azure',
                            severity: 'medium',
                            status: 'fail',
                            mappedControls: ['CM-8', 'AC-2'], // Configuration Management, Account Management
                            resourceId: rg.id,
                            ruleName: 'Required Resource Tags',
                            description: `Resource group missing required tags: ${missingTags.join(', ')}`,
                            remediation: 'Add the required tags to the resource group',
                            discoveredAt: new Date().toISOString(),
                            lastChecked: new Date().toISOString()
                        };
                        findings.push(finding);
                    }
                }
                return findings;
            });
        }
        catch (error) {
            this.handleError(error, 'getConfigurationCompliance');
            return [];
        }
    }
    normalizeFindings(rawData) {
        // This method would normalize Azure-specific findings
        // Implementation depends on the specific Azure service data structure
        return rawData.findings || [];
    }
    mapToNISTControls(finding) {
        // Map Azure findings to NIST 800-53 controls
        // This is a simplified mapping - in production, this would be more comprehensive
        const controlMappings = {
            'Storage account should use a virtual network service endpoint': ['SC-7'],
            'Vulnerabilities on your virtual machines should be remediated': ['SI-2'],
            'System updates should be installed on your machines': ['SI-2'],
            'Endpoint protection should be installed on your machines': ['SI-3'],
            'Network security groups should not have inbound rules that allow any (*) source': ['SC-7'],
            'Function apps should only be accessible over HTTPS': ['SC-8'],
            'Web Application should only be accessible over HTTPS': ['SC-8'],
            'Transparent Data Encryption should be enabled on SQL databases': ['SC-28'],
            'Auditing should be enabled on advanced data security settings on SQL Server': ['AU-2', 'AU-12'],
            'MFA should be enabled on accounts with write permissions on your subscription': ['IA-2'],
            'MFA should be enabled on accounts with read permissions on your subscription': ['IA-2'],
            'External accounts with write permissions should be removed from your subscription': ['AC-2'],
            'Deprecated accounts should be removed from your subscription': ['AC-2']
        };
        const displayName = finding.displayName || finding.name || '';
        return controlMappings[displayName] || ['SC-1']; // Default to Security and Privacy baseline
    }
    mapAzureSeverity(severity) {
        switch (severity?.toLowerCase()) {
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            case 'informational': return 'low';
            default: return 'medium';
        }
    }
    mapAzureStatus(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'fail';
            case 'resolved': return 'pass';
            case 'dismissed': return 'not-applicable';
            default: return 'manual';
        }
    }
    mapAssessmentSeverity(severity) {
        switch (severity?.toLowerCase()) {
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'medium';
        }
    }
    mapAssessmentStatus(code) {
        switch (code?.toLowerCase()) {
            case 'healthy': return 'pass';
            case 'unhealthy': return 'fail';
            case 'notapplicable': return 'not-applicable';
            default: return 'manual';
        }
    }
}
