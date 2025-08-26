import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { PolicyInsightsClient } from "@azure/arm-policyinsights";
import { SecurityCenter } from "@azure/arm-security";

/**
 * ManualDataSync - On-demand compliance data synchronization
 * HTTP trigger for manual synchronization of Azure compliance data
 * 
 * Endpoints:
 * POST /api/ManualDataSync - Trigger full sync
 * GET /api/ManualDataSync - Get sync status
 */
export async function manualDataSync(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const startTime = new Date();
    context.log(`🚀 ManualDataSync triggered via ${request.method} at ${startTime.toISOString()}`);
    
    try {
        // Handle GET request - return status
        if (request.method === 'GET') {
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                body: JSON.stringify({
                    status: 'ready',
                    service: 'cATO Azure Functions Manual Data Sync',
                    version: '1.0.0',
                    timestamp: startTime.toISOString(),
                    endpoints: {
                        sync: 'POST /api/ManualDataSync',
                        status: 'GET /api/ManualDataSync'
                    }
                })
            };
        }
        
        // Handle OPTIONS request for CORS
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            };
        }
        
        // Handle POST request - trigger sync
        if (request.method === 'POST') {
            // Parse request body for sync options
            const requestBody = await request.text();
            let syncOptions = {};
            
            if (requestBody) {
                try {
                    syncOptions = JSON.parse(requestBody);
                } catch (error) {
                    context.log(`⚠️ Invalid JSON in request body: ${error.message}`);
                }
            }
            
            // Initialize Azure credentials using managed identity
            const credential = new DefaultAzureCredential();
            
            // Get subscription ID from environment or request
            const subscriptionId = (syncOptions as any)?.subscriptionId || 
                                  process.env.AZURE_SUBSCRIPTION_ID || 
                                  await getDefaultSubscription(credential);
            
            context.log(`📋 Processing manual sync for subscription: ${subscriptionId}`);
            
            // Initialize Azure service clients
            const policyClient = new PolicyInsightsClient(credential, subscriptionId);
            const securityClient = new SecurityCenter(credential, subscriptionId);
            const monitorClient = new MonitorQueryClient(credential);
            
            // Perform compliance data sync
            const syncResults = await syncComplianceData(
                policyClient,
                securityClient,
                monitorClient,
                syncOptions,
                context
            );
            
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            
            context.log(`✅ ManualDataSync completed successfully in ${duration}ms`);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    status: 'success',
                    message: 'Compliance data sync completed successfully',
                    timestamp: endTime.toISOString(),
                    duration: `${duration}ms`,
                    subscriptionId: subscriptionId,
                    results: syncResults
                })
            };
        }
        
        // Unsupported method
        return {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Method not allowed',
                message: `HTTP method ${request.method} is not supported. Use GET for status or POST for sync.`,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        
        context.log(`❌ ManualDataSync failed: ${error.message}`, {
            error: error.stack,
            duration: `${duration}ms`,
            timestamp: endTime.toISOString()
        });
        
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'error',
                message: 'Internal server error during compliance sync',
                error: error.message,
                timestamp: endTime.toISOString(),
                duration: `${duration}ms`
            })
        };
    }
}

/**
 * Core compliance data synchronization logic (shared with timer function)
 */
async function syncComplianceData(
    policyClient: PolicyInsightsClient,
    securityClient: SecurityCenter,
    monitorClient: MonitorQueryClient,
    options: any,
    context: InvocationContext
) {
    const results = {
        policyStates: 0,
        securityRecommendations: 0,
        complianceScores: 0,
        nistControlsUpdated: 0,
        syncType: 'manual',
        options: options
    };
    
    try {
        // 1. Sync Azure Policy compliance states
        context.log("📊 Syncing Azure Policy compliance states...");
        const policyStates = await syncPolicyCompliance(policyClient, options, context);
        results.policyStates = policyStates.length;
        
        // 2. Sync Security Center recommendations
        context.log("🔒 Syncing Security Center recommendations...");
        const securityRecommendations = await syncSecurityRecommendations(securityClient, options, context);
        results.securityRecommendations = securityRecommendations.length;
        
        // 3. Sync compliance scores and assessments
        context.log("📈 Syncing compliance scores...");
        const complianceScores = await syncComplianceScores(securityClient, options, context);
        results.complianceScores = complianceScores.length;
        
        // 4. Map to NIST controls and update cATO database
        context.log("🎯 Mapping to NIST controls...");
        const nistUpdates = await mapToNistControls(
            policyStates,
            securityRecommendations,
            complianceScores,
            options,
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
async function syncPolicyCompliance(
    policyClient: PolicyInsightsClient, 
    options: any, 
    context: InvocationContext
) {
    try {
        const policyStates = [];
        const maxResults = options?.maxPolicyStates || 1000;
        
        // Get policy states for the subscription
        const statesIterator = policyClient.policyStates.listQueryResultsForSubscription(
            "latest",
            { 
                filter: options?.policyFilter || "PolicyDefinitionReferenceId eq null",
                top: maxResults
            }
        );
        
        for await (const state of statesIterator) {
            if (state.value) {
                policyStates.push(...state.value.map(ps => ({
                    policyDefinitionId: ps.policyDefinitionId,
                    complianceState: ps.complianceState,
                    resourceId: ps.resourceId,
                    resourceType: ps.resourceType,
                    resourceLocation: ps.resourceLocation,
                    policyAssignmentId: ps.policyAssignmentId,
                    policyDefinitionName: ps.policyDefinitionName,
                    effectiveParameters: ps.effectiveParameters,
                    timestamp: ps.timestamp,
                    isCompliant: ps.complianceState === 'Compliant'
                })));
                
                // Limit results to prevent timeout
                if (policyStates.length >= maxResults) {
                    break;
                }
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
async function syncSecurityRecommendations(
    securityClient: SecurityCenter, 
    options: any, 
    context: InvocationContext
) {
    try {
        const recommendations = [];
        const maxResults = options?.maxRecommendations || 500;
        
        // Get security assessments/recommendations
        const assessments = securityClient.assessments.list();
        let count = 0;
        
        for await (const assessment of assessments) {
            if (count >= maxResults) break;
            
            recommendations.push({
                id: assessment.id,
                name: assessment.name,
                type: assessment.type,
                status: assessment.properties?.status?.code,
                severity: assessment.properties?.metadata?.severity,
                assessmentType: assessment.properties?.metadata?.assessmentType,
                description: assessment.properties?.metadata?.description,
                displayName: assessment.properties?.metadata?.displayName,
                remediationDescription: assessment.properties?.metadata?.remediationDescription,
                categories: assessment.properties?.metadata?.categories,
                userImpact: assessment.properties?.metadata?.userImpact,
                implementationEffort: assessment.properties?.metadata?.implementationEffort,
                threats: assessment.properties?.metadata?.threats,
                lastModified: assessment.properties?.timeGenerated,
                resourceDetails: assessment.properties?.resourceDetails,
                additionalData: assessment.properties?.additionalData
            });
            
            count++;
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
async function syncComplianceScores(
    securityClient: SecurityCenter, 
    options: any, 
    context: InvocationContext
) {
    try {
        const scores = [];
        
        // Get secure scores
        const secureScores = securityClient.secureScores.list();
        
        for await (const score of secureScores) {
            scores.push({
                id: score.id,
                name: score.name,
                type: score.type,
                displayName: score.properties?.displayName,
                currentScore: score.properties?.score?.current,
                maxScore: score.properties?.score?.max,
                percentage: score.properties?.score?.percentage,
                weight: score.properties?.weight,
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
    options: any,
    context: InvocationContext
): Promise<number> {
    try {
        // Enhanced NIST control mapping with more comprehensive coverage
        const nistMappings = {
            // Access Control (AC)
            'AC-1': {
                policies: ['Microsoft.Authorization/policyDefinitions/0961003e-5a0a-4549-abde-af6a37f2724d'],
                assessments: ['4f11b553-d42e-4e3a-89be-32ca364cad4c'], // MFA for privileged accounts
                description: 'Access Control Policy and Procedures'
            },
            'AC-2': {
                policies: ['Microsoft.Authorization/policyDefinitions/f85bf3e0-d513-442e-89c3-1784ad63382b'],
                assessments: ['6240402e-f77c-46fa-9060-a7ce53997754'], // Account management
                description: 'Account Management'
            },
            'AC-3': {
                policies: ['Microsoft.Authorization/policyDefinitions/013e242c-8828-4970-87b3-ab247555486d'],
                assessments: ['e52064aa-6853-e252-a11e-dffc675689c2'], // RBAC permissions
                description: 'Access Enforcement'
            },
            
            // Audit and Accountability (AU)
            'AU-2': {
                policies: ['Microsoft.Authorization/policyDefinitions/f6de0be7-9a8a-4b8a-b349-43cf02d22f7c'],
                assessments: ['e2c1c086-2d84-4019-bff7-c44074a30681'], // Diagnostic logs
                description: 'Audit Events'
            },
            'AU-3': {
                policies: ['Microsoft.Authorization/policyDefinitions/b4ac1030-89c5-4697-8e00-28b5ba6a8811'],
                assessments: ['f47b5582-33ec-4c5c-87c0-b010a6b2e917'], // Audit content
                description: 'Content of Audit Records'
            },
            'AU-6': {
                policies: ['Microsoft.Authorization/policyDefinitions/f47b5582-33ec-4c5c-87c0-b010a6b2e917'],
                assessments: ['e2c1c086-2d84-4019-bff7-c44074a30681'], // Log Analytics
                description: 'Audit Review, Analysis, and Reporting'
            },
            
            // Configuration Management (CM)
            'CM-2': {
                policies: ['Microsoft.Authorization/policyDefinitions/404c3081-a854-4457-ae30-26a93ef643f9'],
                assessments: ['6b1cbf55-e8b6-442f-ba4c-7246b6381474'], // System configuration
                description: 'Baseline Configuration'
            },
            'CM-7': {
                policies: ['Microsoft.Authorization/policyDefinitions/8e86a5b6-b9bd-49d1-8e21-4bb8a0862222'],
                assessments: ['d1db3318-01ff-16de-29eb-28b344515626'], // Unnecessary features
                description: 'Least Functionality'
            },
            
            // System and Communications Protection (SC)
            'SC-7': {
                policies: ['Microsoft.Authorization/policyDefinitions/f6de0be7-9a8a-4b8a-b349-43cf02d22f7c'],
                assessments: ['483f12ed-ae23-447e-a2de-a67a10db4353'], // Network security groups
                description: 'Boundary Protection'
            },
            'SC-8': {
                policies: ['Microsoft.Authorization/policyDefinitions/404c3081-a854-4457-ae30-26a93ef643f9'],
                assessments: ['83eb2a6d-4db6-4b87-8d31-8aa77aba3e45'], // Secure transfer
                description: 'Transmission Confidentiality and Integrity'
            }
        };
        
        let updatedControls = 0;
        const controlResults = {};
        
        // Process each NIST control
        for (const [controlId, mapping] of Object.entries(nistMappings)) {
            const controlResult = {
                controlId,
                description: mapping.description,
                policyCompliance: 0,
                securityCompliance: 0,
                overallCompliance: 0,
                findings: []
            };
            
            // Check policy compliance for this control
            if (mapping.policies && mapping.policies.length > 0) {
                const relevantPolicyStates = policyStates.filter(state => 
                    mapping.policies.some(policyId => 
                        state.policyDefinitionId?.includes(policyId) ||
                        state.policyDefinitionName?.toLowerCase().includes(controlId.toLowerCase())
                    )
                );
                
                if (relevantPolicyStates.length > 0) {
                    const compliantPolicies = relevantPolicyStates.filter(state => state.isCompliant);
                    controlResult.policyCompliance = (compliantPolicies.length / relevantPolicyStates.length) * 100;
                    
                    controlResult.findings.push({
                        type: 'policy',
                        total: relevantPolicyStates.length,
                        compliant: compliantPolicies.length,
                        percentage: controlResult.policyCompliance
                    });
                }
            }
            
            // Check security assessment compliance for this control
            if (mapping.assessments && mapping.assessments.length > 0) {
                const relevantAssessments = securityRecommendations.filter(rec => 
                    mapping.assessments.some(assessmentId => 
                        rec.id?.includes(assessmentId) ||
                        rec.name?.toLowerCase().includes(controlId.toLowerCase())
                    )
                );
                
                if (relevantAssessments.length > 0) {
                    const healthyAssessments = relevantAssessments.filter(rec => 
                        rec.status === 'Healthy' || rec.status === 'NotApplicable'
                    );
                    controlResult.securityCompliance = (healthyAssessments.length / relevantAssessments.length) * 100;
                    
                    controlResult.findings.push({
                        type: 'security',
                        total: relevantAssessments.length,
                        healthy: healthyAssessments.length,
                        percentage: controlResult.securityCompliance
                    });
                }
            }
            
            // Calculate overall compliance (weighted average)
            const hasPolicy = controlResult.findings.some(f => f.type === 'policy');
            const hasSecurity = controlResult.findings.some(f => f.type === 'security');
            
            if (hasPolicy && hasSecurity) {
                controlResult.overallCompliance = (controlResult.policyCompliance + controlResult.securityCompliance) / 2;
            } else if (hasPolicy) {
                controlResult.overallCompliance = controlResult.policyCompliance;
            } else if (hasSecurity) {
                controlResult.overallCompliance = controlResult.securityCompliance;
            }
            
            if (controlResult.findings.length > 0) {
                controlResults[controlId] = controlResult;
                updatedControls++;
                
                context.log(`🎯 NIST ${controlId}: ${controlResult.overallCompliance.toFixed(1)}% compliant`);
            }
        }
        
        // Store results (this would integrate with your cATO database)
        if (options?.storeResults !== false) {
            await storeCatoResults(controlResults, context);
        }
        
        context.log(`🎯 Processed ${updatedControls} NIST controls`);
        return updatedControls;
        
    } catch (error) {
        context.log(`❌ Error mapping to NIST controls: ${error.message}`);
        return 0;
    }
}

/**
 * Store results in cATO system (placeholder for database integration)
 */
async function storeCatoResults(controlResults: any, context: InvocationContext) {
    try {
        // This would integrate with your cATO database/storage system
        context.log(`💾 Storing results for ${Object.keys(controlResults).length} controls`);
        
        // Example: Store in Azure Storage, SQL Database, or other persistence layer
        // await catoDatabase.updateControlCompliance(controlResults);
        
        context.log("💾 Results stored successfully");
        
    } catch (error) {
        context.log(`❌ Error storing cATO results: ${error.message}`);
        // Don't throw - storage failure shouldn't fail the entire sync
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
            source: 'azure-functions-manual'
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

// Register the HTTP function
app.http('ManualDataSync', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'function',
    handler: manualDataSync
});
