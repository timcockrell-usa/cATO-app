import { app, HttpRequest, HttpResponseInit, InvocationContext, Timer } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import { 
  PolicyClient, 
  PolicyAssignment, 
  PolicyComplianceDetail 
} from "@azure/arm-policy";
import { SecurityCenterClient } from "@azure/arm-security";
import { MonitorClient } from "@azure/arm-monitor";

interface ComplianceData {
  controlId: string;
  status: 'compliant' | 'partial' | 'noncompliant';
  lastAssessed: string;
  assessedBy: string;
  findings: any[];
  remediation?: string;
  source: 'azure-policy' | 'security-center' | 'manual';
}

// Cosmos DB configuration
const cosmosEndpoint = process.env.COSMOS_DB_ENDPOINT || '';
const cosmosKey = process.env.COSMOS_DB_KEY || '';
const databaseId = process.env.COSMOS_DB_NAME || 'cato-dashboard';

// Azure clients
const credential = new DefaultAzureCredential();
const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });

/**
 * Timer-triggered function that runs every 6 hours to sync Azure compliance data
 */
export async function azureDataSyncTimer(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
    
    try {
        await syncAzureComplianceData(context);
        context.log('Azure data sync completed successfully');
    } catch (error) {
        context.error('Azure data sync failed:', error);
        throw error;
    }
}

/**
 * HTTP-triggered function for manual Azure data sync
 */
export async function azureDataSyncHttp(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('HTTP trigger function processed request.');

    try {
        // Verify authentication if needed
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                status: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        await syncAzureComplianceData(context);

        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: 'Azure data sync completed successfully',
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        context.error('Azure data sync failed:', error);
        return {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Azure data sync failed',
                details: error.message
            })
        };
    }
}

/**
 * Core function to sync compliance data from Azure services
 */
async function syncAzureComplianceData(context: InvocationContext): Promise<void> {
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    if (!subscriptionId) {
        throw new Error('AZURE_SUBSCRIPTION_ID environment variable is required');
    }

    context.log('Starting Azure compliance data sync...');

    // Initialize Azure service clients
    const policyClient = new PolicyClient(credential, subscriptionId);
    const securityClient = new SecurityCenterClient(credential, subscriptionId);
    const monitorClient = new MonitorClient(credential, subscriptionId);

    // Get database containers
    const database = cosmosClient.database(databaseId);
    const complianceContainer = database.container('compliance-data');
    const controlsContainer = database.container('nist-controls');

    try {
        // 1. Sync Azure Policy compliance data
        context.log('Syncing Azure Policy compliance data...');
        const policyCompliance = await syncPolicyCompliance(policyClient, context);

        // 2. Sync Security Center recommendations
        context.log('Syncing Security Center recommendations...');
        const securityRecommendations = await syncSecurityRecommendations(securityClient, context);

        // 3. Sync monitoring alerts and metrics
        context.log('Syncing monitoring data...');
        const monitoringData = await syncMonitoringData(monitorClient, context);

        // 4. Map Azure compliance data to NIST controls
        context.log('Mapping compliance data to NIST controls...');
        const mappedCompliance = await mapToNISTControls(
            [...policyCompliance, ...securityRecommendations, ...monitoringData],
            context
        );

        // 5. Update Cosmos DB with latest compliance data
        context.log('Updating compliance database...');
        for (const compliance of mappedCompliance) {
            try {
                await complianceContainer.items.upsert(compliance);
                context.log(`Updated compliance data for control: ${compliance.controlId}`);
            } catch (error) {
                context.warn(`Failed to update compliance data for ${compliance.controlId}:`, error);
            }
        }

        context.log(`Successfully synced ${mappedCompliance.length} compliance records`);

    } catch (error) {
        context.error('Error during Azure compliance data sync:', error);
        throw error;
    }
}

/**
 * Sync Azure Policy compliance data
 */
async function syncPolicyCompliance(policyClient: PolicyClient, context: InvocationContext): Promise<ComplianceData[]> {
    const complianceData: ComplianceData[] = [];

    try {
        // Get policy assignments
        const assignments = policyClient.policyAssignments.list();
        
        for await (const assignment of assignments) {
            if (!assignment.name) continue;

            try {
                // Get compliance details for each assignment
                const complianceDetails = policyClient.policyStates.listQueryResultsForPolicyAssignment(
                    'latest',
                    assignment.name
                );

                for await (const detail of complianceDetails) {
                    const controlMapping = mapPolicyToNISTControl(assignment.displayName || '');
                    if (controlMapping) {
                        complianceData.push({
                            controlId: controlMapping,
                            status: detail.complianceState === 'Compliant' ? 'compliant' : 
                                   detail.complianceState === 'NonCompliant' ? 'noncompliant' : 'partial',
                            lastAssessed: new Date().toISOString(),
                            assessedBy: 'Azure Policy Engine',
                            findings: [detail],
                            source: 'azure-policy'
                        });
                    }
                }
            } catch (error) {
                context.warn(`Failed to get compliance for assignment ${assignment.name}:`, error);
            }
        }
    } catch (error) {
        context.error('Error syncing policy compliance:', error);
        throw error;
    }

    return complianceData;
}

/**
 * Sync Security Center recommendations
 */
async function syncSecurityRecommendations(securityClient: SecurityCenterClient, context: InvocationContext): Promise<ComplianceData[]> {
    const complianceData: ComplianceData[] = [];

    try {
        // Get security recommendations
        const recommendations = securityClient.recommendations.list();

        for await (const recommendation of recommendations) {
            if (!recommendation.name) continue;

            const controlMapping = mapSecurityRecommendationToNISTControl(recommendation.properties?.displayName || '');
            if (controlMapping) {
                complianceData.push({
                    controlId: controlMapping,
                    status: recommendation.properties?.resourceDetails?.state === 'Healthy' ? 'compliant' : 'noncompliant',
                    lastAssessed: new Date().toISOString(),
                    assessedBy: 'Azure Security Center',
                    findings: [recommendation],
                    remediation: recommendation.properties?.remediationDescription,
                    source: 'security-center'
                });
            }
        }
    } catch (error) {
        context.error('Error syncing security recommendations:', error);
        throw error;
    }

    return complianceData;
}

/**
 * Sync monitoring alerts and metrics
 */
async function syncMonitoringData(monitorClient: MonitorClient, context: InvocationContext): Promise<ComplianceData[]> {
    const complianceData: ComplianceData[] = [];

    try {
        // Get active alerts
        const alerts = monitorClient.alerts.getAll();

        for await (const alert of alerts) {
            const controlMapping = mapAlertToNISTControl(alert.name || '');
            if (controlMapping) {
                complianceData.push({
                    controlId: controlMapping,
                    status: alert.properties?.monitorCondition === 'Resolved' ? 'compliant' : 'noncompliant',
                    lastAssessed: new Date().toISOString(),
                    assessedBy: 'Azure Monitor',
                    findings: [alert],
                    source: 'security-center'
                });
            }
        }
    } catch (error) {
        context.error('Error syncing monitoring data:', error);
        throw error;
    }

    return complianceData;
}

/**
 * Map Azure compliance data to NIST controls
 */
async function mapToNISTControls(complianceData: ComplianceData[], context: InvocationContext): Promise<ComplianceData[]> {
    // Group by control ID and determine overall status
    const controlMap = new Map<string, ComplianceData[]>();
    
    for (const data of complianceData) {
        const existing = controlMap.get(data.controlId) || [];
        existing.push(data);
        controlMap.set(data.controlId, existing);
    }

    const mappedControls: ComplianceData[] = [];
    
    for (const [controlId, dataList] of controlMap) {
        // Determine overall status based on all findings
        let overallStatus: 'compliant' | 'partial' | 'noncompliant' = 'compliant';
        
        const hasNonCompliant = dataList.some(d => d.status === 'noncompliant');
        const hasPartial = dataList.some(d => d.status === 'partial');
        
        if (hasNonCompliant) {
            overallStatus = 'noncompliant';
        } else if (hasPartial) {
            overallStatus = 'partial';
        }

        mappedControls.push({
            controlId,
            status: overallStatus,
            lastAssessed: new Date().toISOString(),
            assessedBy: 'Azure Integration Engine',
            findings: dataList.flatMap(d => d.findings),
            source: 'azure-policy'
        });
    }

    return mappedControls;
}

/**
 * Map Azure Policy assignments to NIST controls
 */
function mapPolicyToNISTControl(policyName: string): string | null {
    const mappings: Record<string, string> = {
        'Audit virtual machines without disaster recovery configured': 'CP-2',
        'Audit SQL servers without threat detection enabled': 'SI-4',
        'Audit storage accounts without secure transfer enabled': 'SC-8',
        'Audit VMs without approved disk encryption': 'SC-28',
        'Audit network security groups': 'SC-7',
        'Audit accounts with owner permissions': 'AC-2',
        'Audit privileged accounts without MFA': 'IA-2',
        // Add more mappings as needed
    };

    for (const [pattern, control] of Object.entries(mappings)) {
        if (policyName.toLowerCase().includes(pattern.toLowerCase())) {
            return control;
        }
    }

    return null;
}

/**
 * Map Security Center recommendations to NIST controls
 */
function mapSecurityRecommendationToNISTControl(recommendationName: string): string | null {
    const mappings: Record<string, string> = {
        'Enable MFA for accounts with owner permissions': 'IA-2',
        'Enable disk encryption for virtual machines': 'SC-28',
        'Enable network security groups': 'SC-7',
        'Enable SQL transparent data encryption': 'SC-28',
        'Enable storage account secure transfer': 'SC-8',
        'Configure diagnostic settings': 'AU-3',
        // Add more mappings as needed
    };

    for (const [pattern, control] of Object.entries(mappings)) {
        if (recommendationName.toLowerCase().includes(pattern.toLowerCase())) {
            return control;
        }
    }

    return null;
}

/**
 * Map monitoring alerts to NIST controls
 */
function mapAlertToNISTControl(alertName: string): string | null {
    const mappings: Record<string, string> = {
        'Failed login attempts': 'AC-7',
        'Suspicious network activity': 'SI-4',
        'Unauthorized access attempt': 'AC-3',
        'High CPU usage': 'AU-6',
        'Disk space warning': 'AU-4',
        // Add more mappings as needed
    };

    for (const [pattern, control] of Object.entries(mappings)) {
        if (alertName.toLowerCase().includes(pattern.toLowerCase())) {
            return control;
        }
    }

    return null;
}

// Register the functions
app.timer('azureDataSyncTimer', {
    schedule: '0 0 */6 * * *', // Every 6 hours
    handler: azureDataSyncTimer
});

app.http('azureDataSyncHttp', {
    methods: ['POST'],
    authLevel: 'function',
    handler: azureDataSyncHttp
});
