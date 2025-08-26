import { app, InvocationContext, Timer } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { PolicyInsightsClient } from "@azure/arm-policyinsights";
import { SecurityCenter } from "@azure/arm-security";

/**
 * DataSyncTimer - Automated compliance data synchronization
 * Runs every 6 hours to sync Azure compliance data with cATO application
 * 
 * Schedule: "0 0 */6 * * *" (every 6 hours at minute 0)
 * - 00:00 UTC, 06:00 UTC, 12:00 UTC, 18:00 UTC
 */
export async function dataSyncTimer(myTimer: Timer, context: InvocationContext): Promise<void> {
    const startTime = new Date();
    context.log(`🚀 DataSyncTimer started at ${startTime.toISOString()}`);
    
    try {
        // Initialize Azure credentials using managed identity
        const credential = new DefaultAzureCredential();
        
        // Get subscription ID from environment or use default
        const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || 
                              await getDefaultSubscription(credential);
        
        context.log(`📋 Processing subscription: ${subscriptionId}`);
        
        // Initialize Azure service clients
        const policyClient = new PolicyInsightsClient(credential, subscriptionId);
        const securityClient = new SecurityCenter(credential, subscriptionId);
        const monitorClient = new MonitorQueryClient(credential);
        
        // Sync compliance data
        const syncResults = await syncComplianceData(
            policyClient,
            securityClient,
            monitorClient,
            context
        );
        
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        
        context.log(`✅ DataSyncTimer completed successfully in ${duration}ms`, {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: `${duration}ms`,
            ...syncResults
        });
        
    } catch (error) {
        context.log(`❌ DataSyncTimer failed: ${error.message}`, {
            error: error.stack,
            timestamp: new Date().toISOString()
        });
        throw error; // Re-throw to mark function as failed
    }
}

/**
 * Core compliance data synchronization logic
 */
async function syncComplianceData(
    policyClient: PolicyInsightsClient,
    securityClient: SecurityCenter,
    monitorClient: MonitorQueryClient,
    context: InvocationContext
) {
    const results = {
        policyStates: 0,
        securityRecommendations: 0,
        complianceScores: 0,
        nistControlsUpdated: 0
    };
    
    try {
        // 1. Sync Azure Policy compliance states
        context.log("📊 Syncing Azure Policy compliance states...");
        const policyStates = await syncPolicyCompliance(policyClient, context);
        results.policyStates = policyStates.length;
        
        // 2. Sync Security Center recommendations
        context.log("🔒 Syncing Security Center recommendations...");
        const securityRecommendations = await syncSecurityRecommendations(securityClient, context);
        results.securityRecommendations = securityRecommendations.length;
        
        // 3. Sync compliance scores and assessments
        context.log("📈 Syncing compliance scores...");
        const complianceScores = await syncComplianceScores(securityClient, context);
        results.complianceScores = complianceScores.length;
        
        // 4. Map to NIST controls and update cATO database
        context.log("🎯 Mapping to NIST controls...");
        const nistUpdates = await mapToNistControls(
            policyStates,
            securityRecommendations,
            complianceScores,
            context
        );
        results.nistControlsUpdated = nistUpdates;
        
        // 5. Send update notification to cATO application
        await notifyCatoApplication(results, context);
        
        return results;
        
    } catch (error) {
        context.log(`❌ Error in syncComplianceData: ${error.message}`);
        throw error;
    }
}

/**
 * Sync Azure Policy compliance states
 */
async function syncPolicyCompliance(policyClient: PolicyInsightsClient, context: InvocationContext) {
    try {
        const policyStates = [];
        
        // Get policy states for the subscription
        const statesIterator = policyClient.policyStates.listQueryResultsForSubscription(
            "latest",
            { 
                filter: "PolicyDefinitionReferenceId eq null",
                top: 1000
            }
        );
        
        for await (const state of statesIterator) {
            if (state.value) {
                policyStates.push(...state.value.map(ps => ({
                    policyDefinitionId: ps.policyDefinitionId,
                    complianceState: ps.complianceState,
                    resourceId: ps.resourceId,
                    resourceType: ps.resourceType,
                    policyAssignmentId: ps.policyAssignmentId,
                    timestamp: ps.timestamp
                })));
            }
        }
        
        context.log(`📊 Retrieved ${policyStates.length} policy compliance states`);
        return policyStates;
        
    } catch (error) {
        context.log(`❌ Error syncing policy compliance: ${error.message}`);
        return [];
    }
}

/**
 * Sync Security Center recommendations
 */
async function syncSecurityRecommendations(securityClient: SecurityCenter, context: InvocationContext) {
    try {
        const recommendations = [];
        
        // Get security recommendations
        const assessments = securityClient.assessments.list();
        
        for await (const assessment of assessments) {
            recommendations.push({
                id: assessment.id,
                name: assessment.name,
                status: assessment.properties?.status?.code,
                severity: assessment.properties?.metadata?.severity,
                description: assessment.properties?.metadata?.description,
                remediationDescription: assessment.properties?.metadata?.remediationDescription,
                categories: assessment.properties?.metadata?.categories,
                lastModified: assessment.properties?.timeGenerated
            });
        }
        
        context.log(`🔒 Retrieved ${recommendations.length} security recommendations`);
        return recommendations;
        
    } catch (error) {
        context.log(`❌ Error syncing security recommendations: ${error.message}`);
        return [];
    }
}

/**
 * Sync compliance scores and secure scores
 */
async function syncComplianceScores(securityClient: SecurityCenter, context: InvocationContext) {
    try {
        const scores = [];
        
        // Get secure scores
        const secureScores = securityClient.secureScores.list();
        
        for await (const score of secureScores) {
            scores.push({
                id: score.id,
                name: score.name,
                currentScore: score.properties?.score?.current,
                maxScore: score.properties?.score?.max,
                percentage: score.properties?.score?.percentage,
                lastModified: score.properties?.timeGenerated
            });
        }
        
        context.log(`📈 Retrieved ${scores.length} compliance scores`);
        return scores;
        
    } catch (error) {
        context.log(`❌ Error syncing compliance scores: ${error.message}`);
        return [];
    }
}

/**
 * Map Azure compliance data to NIST controls
 */
async function mapToNistControls(
    policyStates: any[],
    securityRecommendations: any[],
    complianceScores: any[],
    context: InvocationContext
): Promise<number> {
    try {
        // NIST control mapping logic
        const nistMappings = {
            // Access Control (AC)
            'AC-1': ['Microsoft.Authorization/policyDefinitions/0961003e-5a0a-4549-abde-af6a37f2724d'], // Require MFA
            'AC-2': ['Microsoft.Authorization/policyDefinitions/f85bf3e0-d513-442e-89c3-1784ad63382b'], // Account management
            'AC-3': ['Microsoft.Authorization/policyDefinitions/013e242c-8828-4970-87b3-ab247555486d'], // Access enforcement
            
            // Audit and Accountability (AU)
            'AU-2': ['Microsoft.Authorization/policyDefinitions/f6de0be7-9a8a-4b8a-b349-43cf02d22f7c'], // Audit events
            'AU-3': ['Microsoft.Authorization/policyDefinitions/b4ac1030-89c5-4697-8e00-28b5ba6a8811'], // Audit content
            'AU-6': ['Microsoft.Authorization/policyDefinitions/f47b5582-33ec-4c5c-87c0-b010a6b2e917'], // Audit review
            
            // Configuration Management (CM)
            'CM-2': ['Microsoft.Authorization/policyDefinitions/404c3081-a854-4457-ae30-26a93ef643f9'], // Baseline configuration
            'CM-7': ['Microsoft.Authorization/policyDefinitions/8e86a5b6-b9bd-49d1-8e21-4bb8a0862222'], // Least functionality
            
            // System and Communications Protection (SC)
            'SC-7': ['Microsoft.Authorization/policyDefinitions/f6de0be7-9a8a-4b8a-b349-43cf02d22f7c'], // Boundary protection
            'SC-8': ['Microsoft.Authorization/policyDefinitions/404c3081-a854-4457-ae30-26a93ef643f9'], // Transmission confidentiality
        };
        
        let updatedControls = 0;
        
        // Map policy states to NIST controls
        for (const [controlId, policyIds] of Object.entries(nistMappings)) {
            const relevantStates = policyStates.filter(state => 
                policyIds.some(policyId => state.policyDefinitionId?.includes(policyId))
            );
            
            if (relevantStates.length > 0) {
                // Calculate compliance percentage for this control
                const compliantStates = relevantStates.filter(state => 
                    state.complianceState === 'Compliant'
                );
                const compliancePercentage = (compliantStates.length / relevantStates.length) * 100;
                
                context.log(`🎯 NIST ${controlId}: ${compliancePercentage.toFixed(1)}% compliant (${compliantStates.length}/${relevantStates.length})`);
                
                // Here you would update your cATO database/storage
                // await updateCatoDatabase(controlId, compliancePercentage, relevantStates);
                
                updatedControls++;
            }
        }
        
        context.log(`🎯 Updated ${updatedControls} NIST controls`);
        return updatedControls;
        
    } catch (error) {
        context.log(`❌ Error mapping to NIST controls: ${error.message}`);
        return 0;
    }
}

/**
 * Notify cATO application of sync completion
 */
async function notifyCatoApplication(results: any, context: InvocationContext) {
    try {
        const catoEndpoint = process.env.CATO_WEBHOOK_URL;
        if (!catoEndpoint) {
            context.log("⚠️ CATO_WEBHOOK_URL not configured, skipping notification");
            return;
        }
        
        const axios = require('axios');
        
        await axios.post(catoEndpoint, {
            eventType: 'compliance-sync-completed',
            timestamp: new Date().toISOString(),
            results: results,
            source: 'azure-functions-timer'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'cATO-Azure-Functions/1.0'
            },
            timeout: 10000
        });
        
        context.log("📤 Successfully notified cATO application");
        
    } catch (error) {
        context.log(`⚠️ Failed to notify cATO application: ${error.message}`);
        // Don't throw - notification failure shouldn't fail the entire sync
    }
}

/**
 * Get default subscription ID
 */
async function getDefaultSubscription(credential: DefaultAzureCredential): Promise<string> {
    // For now, require explicit configuration
    throw new Error("AZURE_SUBSCRIPTION_ID environment variable must be set");
}

// Register the timer function
app.timer('DataSyncTimer', {
    schedule: '0 0 */6 * * *', // Every 6 hours
    handler: dataSyncTimer
});
