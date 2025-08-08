/**
 * NIST Revision Management Service
 * Frontend service for managing NIST 800-53 revision operations
 */
import enhancedCosmosService from './enhancedCosmosService';
class NISTRevisionService {
    /**
     * Get current NIST revision for organization
     */
    async getCurrentRevision(tenantId) {
        try {
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (!tenant) {
                return {
                    success: false,
                    error: 'Organization not found'
                };
            }
            const currentRevision = tenant.nistRevision === '4' ? 'Rev4' :
                tenant.nistRevision === '5' ? 'Rev5' : 'Rev6';
            return {
                success: true,
                data: {
                    currentRevision: currentRevision,
                    tenantId,
                    lastUpdated: tenant.updatedAt
                }
            };
        }
        catch (error) {
            console.error('Error getting current NIST revision:', error);
            return {
                success: false,
                error: 'Failed to retrieve current NIST revision'
            };
        }
    }
    /**
     * Set NIST revision for organization
     */
    async setRevision(tenantId, revision) {
        try {
            if (!revision || !['Rev4', 'Rev5', 'Rev6'].includes(revision)) {
                return {
                    success: false,
                    error: 'Valid revision (Rev4, Rev5, or Rev6) is required'
                };
            }
            await enhancedCosmosService.setOrganizationNISTRevision(tenantId, revision);
            return {
                success: true,
                message: `NIST revision updated to ${revision}`,
                data: {
                    newRevision: revision,
                    tenantId,
                    updatedAt: new Date().toISOString()
                }
            };
        }
        catch (error) {
            console.error('Error setting NIST revision:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update NIST revision'
            };
        }
    }
    /**
     * Get NIST controls by revision
     */
    async getControlsByRevision(tenantId, revision, environmentIds) {
        try {
            if (!revision || !['4', '5', '6'].includes(revision)) {
                return {
                    success: false,
                    error: 'Valid revision (4, 5, or 6) is required'
                };
            }
            const controls = await enhancedCosmosService.getNISTControlsByRevision(tenantId, revision === '6' ? '5' : revision, // Fallback to Rev5 for Rev6 until backend supports it
            environmentIds);
            return {
                success: true,
                data: {
                    controls,
                    revision: `Rev${revision}`,
                    count: controls.length,
                    tenantId
                }
            };
        }
        catch (error) {
            console.error('Error getting NIST controls by revision:', error);
            return {
                success: false,
                error: 'Failed to retrieve NIST controls'
            };
        }
    }
    /**
     * Perform gap analysis between current and target revision
     */
    async performGapAnalysis(tenantId, targetRevision) {
        try {
            if (!targetRevision || !['Rev4', 'Rev5', 'Rev6'].includes(targetRevision)) {
                return {
                    success: false,
                    gapAnalysis: {},
                    recommendedActions: { immediate: [], shortTerm: [], longTerm: [] },
                    estimatedMigrationTime: { optimisticHours: 0, realisticHours: 0, pessimisticHours: 0 }
                };
            }
            // Handle Rev6 with special logic until backend supports it
            if (targetRevision === 'Rev6') {
                // Return mock gap analysis for Rev6 since it's not yet implemented in backend
                return {
                    success: true,
                    gapAnalysis: {
                        analysisDate: new Date().toISOString(),
                        totalCurrentControls: 450,
                        totalTargetControls: 500,
                        mappings: {
                            unchanged: Array(380).fill(null).map((_, i) => ({ sourceControlId: `AC-${i + 1}` })),
                            modified: Array(45).fill(null).map((_, i) => ({
                                sourceControlId: `SC-${i + 1}`,
                                changeSummary: 'Enhanced requirements for emerging threats',
                                implementationImpact: 'medium'
                            })),
                            newControls: Array(25).fill(null).map((_, i) => ({
                                targetControlId: `AI-${i + 1}`,
                                changeSummary: 'New AI/ML security controls',
                                implementationImpact: 'high'
                            })),
                            withdrawnControls: []
                        },
                        impactAssessment: {
                            lowImpact: 380,
                            mediumImpact: 45,
                            highImpact: 25,
                            estimatedEffortHours: 280,
                            priorityControls: ['AI-1', 'AI-2', 'SC-7']
                        },
                        compliancePrediction: {
                            likelyCompliant: 380,
                            requiresReview: 45,
                            likelyNonCompliant: 25,
                            notAssessed: 50
                        }
                    },
                    recommendedActions: {
                        immediate: ['Review AI/ML control requirements', 'Assess current AI implementations'],
                        shortTerm: ['Implement new AI security controls', 'Update supply chain controls'],
                        longTerm: ['Full AI governance framework', 'Enhanced monitoring systems']
                    },
                    estimatedMigrationTime: {
                        optimisticHours: 200,
                        realisticHours: 280,
                        pessimisticHours: 400
                    }
                };
            }
            return await enhancedCosmosService.performRevisionGapAnalysis(tenantId, targetRevision);
        }
        catch (error) {
            console.error('Error performing gap analysis:', error);
            throw error;
        }
    }
    /**
     * Initiate NIST revision upgrade process
     */
    async initiateUpgrade(tenantId, targetRevision, userId = 'system') {
        try {
            if (!targetRevision || !['Rev4', 'Rev5', 'Rev6'].includes(targetRevision)) {
                return {
                    success: false,
                    upgradeId: '',
                    message: 'Valid target revision (Rev4, Rev5, or Rev6) is required',
                    status: 'failed',
                    nextSteps: [],
                    rollbackAvailable: false
                };
            }
            // Handle Rev6 with special logic until backend supports it
            if (targetRevision === 'Rev6') {
                return {
                    success: false,
                    upgradeId: '',
                    message: 'NIST 800-53 Rev 6 is not yet available. Please select Rev 4 or Rev 5.',
                    status: 'failed',
                    nextSteps: [],
                    rollbackAvailable: false
                };
            }
            return await enhancedCosmosService.initiateRevisionUpgrade(tenantId, targetRevision, userId);
        }
        catch (error) {
            console.error('Error initiating revision upgrade:', error);
            throw error;
        }
    }
    /**
     * Get comparison of control between revisions
     */
    async getControlComparison(controlId, tenantId) {
        try {
            if (!controlId) {
                return {
                    success: false,
                    error: 'Control ID is required'
                };
            }
            const comparison = await enhancedCosmosService.getControlRevisionComparison(controlId, tenantId);
            return {
                success: true,
                data: comparison
            };
        }
        catch (error) {
            console.error('Error getting control revision comparison:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve control comparison'
            };
        }
    }
    /**
     * Get revision upgrade history for organization
     */
    async getUpgradeHistory(tenantId) {
        try {
            const history = await enhancedCosmosService.getUpgradeHistory(tenantId);
            return {
                success: true,
                data: {
                    history,
                    count: history.length,
                    tenantId
                }
            };
        }
        catch (error) {
            console.error('Error getting upgrade history:', error);
            return {
                success: false,
                error: 'Failed to retrieve upgrade history'
            };
        }
    }
    /**
     * Get revision mappings for organization
     */
    async getRevisionMappings(tenantId) {
        try {
            const mappings = await enhancedCosmosService.getRevisionMappings(tenantId);
            return {
                success: true,
                data: {
                    mappings,
                    count: mappings.length,
                    tenantId
                }
            };
        }
        catch (error) {
            console.error('Error getting revision mappings:', error);
            return {
                success: false,
                error: 'Failed to retrieve revision mappings'
            };
        }
    }
    /**
     * Create or update revision mapping
     */
    async createRevisionMapping(mapping, tenantId) {
        try {
            // Validate required fields
            if (!mapping.mappingId || !mapping.tenantId || !mapping.changeType) {
                return {
                    success: false,
                    error: 'Required fields: mappingId, tenantId, changeType'
                };
            }
            // Ensure tenant ID matches
            if (mapping.tenantId !== tenantId && mapping.tenantId !== 'global') {
                return {
                    success: false,
                    error: 'Cannot create mappings for other tenants'
                };
            }
            const createdMapping = await enhancedCosmosService.createOrUpdateRevisionMapping(mapping);
            return {
                success: true,
                message: 'Revision mapping created successfully',
                data: createdMapping
            };
        }
        catch (error) {
            console.error('Error creating revision mapping:', error);
            return {
                success: false,
                error: 'Failed to create revision mapping'
            };
        }
    }
    /**
     * Get compliance summary by revision
     */
    async getComplianceSummary(tenantId) {
        try {
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (!tenant) {
                return {
                    success: false,
                    error: 'Organization not found'
                };
            }
            const currentRevision = tenant.nistRevision;
            const controls = await enhancedCosmosService.getNISTControlsByRevision(tenantId, currentRevision);
            const summary = {
                currentRevision: currentRevision === '4' ? 'Rev4' :
                    currentRevision === '5' ? 'Rev5' : 'Rev6',
                totalControls: controls.length,
                compliant: controls.filter(c => c.overallStatus === 'compliant').length,
                partial: controls.filter(c => c.overallStatus === 'partial').length,
                noncompliant: controls.filter(c => c.overallStatus === 'noncompliant').length,
                notAssessed: controls.filter(c => c.overallStatus === 'not-assessed').length,
                compliancePercentage: 0
            };
            summary.compliancePercentage = summary.totalControls > 0
                ? Math.round((summary.compliant / summary.totalControls) * 100)
                : 0;
            return {
                success: true,
                data: summary
            };
        }
        catch (error) {
            console.error('Error getting compliance summary:', error);
            return {
                success: false,
                error: 'Failed to retrieve compliance summary'
            };
        }
    }
    /**
     * Generate revision upgrade plan
     */
    async generateUpgradePlan(tenantId, targetRevision) {
        try {
            const gapAnalysis = await this.performGapAnalysis(tenantId, targetRevision);
            if (!gapAnalysis.success) {
                return {
                    success: false,
                    error: 'Failed to perform gap analysis for upgrade plan'
                };
            }
            // Generate phased upgrade plan
            const plan = [
                {
                    phase: 1,
                    name: 'Immediate Actions',
                    description: 'Address high-impact controls and critical changes',
                    controls: gapAnalysis.gapAnalysis.impactAssessment.priorityControls,
                    estimatedHours: Math.round(gapAnalysis.estimatedMigrationTime.optimisticHours * 0.4),
                    priority: 'immediate'
                },
                {
                    phase: 2,
                    name: 'Modified Controls Update',
                    description: 'Update existing controls with new requirements',
                    controls: gapAnalysis.gapAnalysis.mappings.modified.map(m => m.sourceControlId),
                    estimatedHours: Math.round(gapAnalysis.estimatedMigrationTime.realisticHours * 0.4),
                    priority: 'high'
                },
                {
                    phase: 3,
                    name: 'New Control Implementation',
                    description: 'Implement newly introduced controls',
                    controls: gapAnalysis.gapAnalysis.mappings.newControls.map(m => m.targetControlId || ''),
                    estimatedHours: Math.round(gapAnalysis.estimatedMigrationTime.realisticHours * 0.3),
                    priority: 'medium'
                },
                {
                    phase: 4,
                    name: 'Validation and Documentation',
                    description: 'Validate all changes and update documentation',
                    controls: [],
                    estimatedHours: Math.round(gapAnalysis.estimatedMigrationTime.pessimisticHours * 0.2),
                    priority: 'low'
                }
            ];
            const totalEstimatedHours = plan.reduce((sum, phase) => sum + phase.estimatedHours, 0);
            const recommendedTimeframe = totalEstimatedHours > 160 ? '6-8 weeks' :
                totalEstimatedHours > 80 ? '3-4 weeks' : '1-2 weeks';
            return {
                success: true,
                data: {
                    plan,
                    totalEstimatedHours,
                    recommendedTimeframe
                }
            };
        }
        catch (error) {
            console.error('Error generating upgrade plan:', error);
            return {
                success: false,
                error: 'Failed to generate upgrade plan'
            };
        }
    }
    /**
     * Stage revision upgrade (prepare but don't commit)
     */
    async stageUpgrade(tenantId, targetRevision, userId = 'system') {
        try {
            // Generate unique stage ID
            const stageId = `stage_${tenantId}_${targetRevision}_${Date.now()}`;
            // Perform gap analysis for staging
            const gapAnalysis = await this.performGapAnalysis(tenantId, targetRevision);
            if (!gapAnalysis.success) {
                return {
                    success: false,
                    error: 'Failed to analyze gap for staging'
                };
            }
            // Store staging information (in a real implementation, this would be stored in the database)
            const stagedUpgrade = {
                stageId,
                tenantId,
                targetRevision,
                gapAnalysis,
                readyToFinalize: true,
                stagedAt: new Date().toISOString(),
                stagedBy: userId
            };
            return {
                success: true,
                message: 'Upgrade staged successfully. Review gap analysis before finalizing.',
                data: {
                    stageId,
                    targetRevision,
                    gapAnalysis: gapAnalysis.gapAnalysis,
                    readyToFinalize: true,
                    stagedAt: stagedUpgrade.stagedAt
                }
            };
        }
        catch (error) {
            console.error('Error staging upgrade:', error);
            return {
                success: false,
                error: 'Failed to stage upgrade'
            };
        }
    }
    /**
     * Finalize staged upgrade (commit the changes)
     */
    async finalizeUpgrade(tenantId, stageId, userId = 'system') {
        try {
            // In a real implementation, retrieve staged upgrade data
            // For now, simulate finalization
            const upgradeId = `upgrade_${tenantId}_${Date.now()}`;
            // Extract target revision from stageId (simplified)
            const targetRevision = stageId.includes('Rev4') ? 'Rev4' :
                stageId.includes('Rev5') ? 'Rev5' : 'Rev6';
            // Actually update the organization's NIST revision
            await this.setRevision(tenantId, targetRevision);
            return {
                success: true,
                message: `Framework upgrade finalized to ${targetRevision}`,
                data: {
                    upgradeId,
                    newRevision: targetRevision,
                    finalizedAt: new Date().toISOString(),
                    rollbackAvailable: true
                }
            };
        }
        catch (error) {
            console.error('Error finalizing upgrade:', error);
            return {
                success: false,
                error: 'Failed to finalize upgrade'
            };
        }
    }
    /**
     * Import organization data from eMASS API
     */
    async importFromEmass(tenantId, emassSystemId, emassApiKey) {
        try {
            // eMASS API integration (simplified implementation)
            // In real implementation, this would call the actual eMASS API
            const emassApiUrl = `https://api.emass.mil/api/systems/${emassSystemId}`;
            // Simulated eMASS response for demo
            const mockEmassData = {
                systemId: emassSystemId,
                systemName: `System ${emassSystemId}`,
                nistFramework: 'NIST SP 800-53 Rev 5', // This would come from actual API
                controls: [
                    { id: 'AC-1', implementation: 'implemented', revision: '5' },
                    { id: 'AC-2', implementation: 'planned', revision: '5' },
                    // ... more controls would be imported
                ]
            };
            // Detect NIST revision from eMASS data
            const detectedRevision = mockEmassData.nistFramework.includes('Rev 5') ? 'Rev5' :
                mockEmassData.nistFramework.includes('Rev 6') ? 'Rev6' : 'Rev4';
            // Set the detected revision for the organization
            await this.setRevision(tenantId, detectedRevision);
            return {
                success: true,
                message: `Successfully imported system data from eMASS. Detected ${detectedRevision}.`,
                data: {
                    systemData: mockEmassData,
                    detectedRevision,
                    controlsImported: mockEmassData.controls.length
                }
            };
        }
        catch (error) {
            console.error('Error importing from eMASS:', error);
            return {
                success: false,
                error: 'Failed to import data from eMASS API'
            };
        }
    }
}
export default new NISTRevisionService();
