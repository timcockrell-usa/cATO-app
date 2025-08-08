/**
 * ATO Package Generation Service
 * Backend service for generating comprehensive ATO documentation packages
 */
import enhancedCosmosService from './enhancedCosmosService';
export class ATOPackageGenerationService {
    /**
     * Generate complete ATO package data structure
     */
    async generateATOPackage(tenantId) {
        try {
            // Get organization details
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (!tenant) {
                throw new Error('Organization not found');
            }
            // Generate all package components
            const [systemSecurityPlan, planOfActionAndMilestones, complianceMetrics, zeroTrustAssessment, executionEnablers] = await Promise.all([
                this.generateSystemSecurityPlan(tenantId),
                this.generatePOAMData(tenantId),
                this.generateComplianceMetrics(tenantId),
                this.generateZeroTrustAssessment(tenantId),
                this.generateExecutionEnablers(tenantId)
            ]);
            const packageData = {
                packageName: `${tenant.organizationName} - ATO Package`,
                generationDate: new Date().toISOString(),
                packageVersion: '1.0',
                tenantId,
                organizationName: tenant.organizationName,
                metadata: {
                    generatedBy: 'cATO Command Center',
                    totalControls: systemSecurityPlan.controls.length,
                    compliantControls: systemSecurityPlan.controls.filter(c => c.implementationStatus === 'Implemented').length,
                    nonCompliantControls: planOfActionAndMilestones.length,
                    totalPOAMItems: planOfActionAndMilestones.length,
                    highRiskItems: planOfActionAndMilestones.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Very High').length,
                    packageSize: '0MB', // Will be calculated after generation
                    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
                },
                systemSecurityPlan,
                planOfActionAndMilestones,
                complianceMetrics,
                zeroTrustAssessment,
                executionEnablers
            };
            return packageData;
        }
        catch (error) {
            console.error('Error generating ATO package:', error);
            throw error;
        }
    }
    /**
     * Generate System Security Plan data
     */
    async generateSystemSecurityPlan(tenantId) {
        try {
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            const environments = await enhancedCosmosService.getCloudEnvironments(tenantId);
            const nistControls = await enhancedCosmosService.getNISTControls(tenantId);
            // Get tenant name as primary system name
            const systemName = tenant?.organizationName || `${tenantId} System`;
            const controls = nistControls.map(control => ({
                controlId: control.id,
                controlName: control.controlName,
                controlFamily: control.controlFamily,
                implementationStatus: this.mapComplianceToImplementationStatus(control.overallStatus),
                inheritanceStatus: 'System-Specific',
                implementationStatement: control.implementation || `Implementation for ${control.id}`,
                responsibleRole: 'System Administrator',
                implementationGuidance: '',
                assessmentProcedures: `Assessment procedures for ${control.id}`,
                complianceEvidence: [],
                lastAssessmentDate: new Date().toISOString(),
                nextAssessmentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                riskLevel: this.mapComplianceToRiskLevel(control.overallStatus),
                remediation: control.overallStatus !== 'compliant' ? {
                    required: true,
                    priority: this.getRiskPriority(control.overallStatus),
                    estimatedEffort: this.estimateRemediationEffort(control.overallStatus),
                    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                } : undefined
            }));
            const systemSecurityPlan = {
                systemName,
                systemOwner: 'System Owner',
                securityCategorization: this.determineSecurityCategorization(nistControls),
                systemType: 'Major Application',
                operationalStatus: 'Operational',
                authorizationBoundary: `${tenant?.organizationName || tenantId} Authorization Boundary`,
                systemDescription: `Comprehensive compliance management system for ${tenant?.organizationName || tenantId}`,
                systemEnvironment: 'Production',
                controls,
                systemCharacteristics: {
                    users: {
                        privilegedUsers: 5,
                        generalUsers: 50,
                        guestUsers: 0
                    },
                    dataTypes: ['PII', 'CUI', 'System Configuration Data', 'Audit Logs'],
                    interconnections: environments.map(env => ({
                        connectedSystemName: env.name,
                        connectionType: env.provider === 'azure' ? 'Internet' : 'Intranet',
                        dataDirection: 'Bidirectional',
                        informationType: 'System Management Data',
                        securityCategorization: 'Moderate',
                        authorizationStatus: 'Authorized'
                    })),
                    cloudServices: environments.map(env => ({
                        serviceName: `${env.provider} ${env.name}`,
                        provider: env.provider,
                        serviceType: 'PaaS',
                        fedRampStatus: env.provider === 'azure' ? 'Authorized' : 'Not Applicable',
                        securityCategorization: 'Moderate'
                    }))
                },
                authorization: {
                    authorizingOfficial: 'Authorizing Official',
                    authorizationDate: tenant?.createdAt || new Date().toISOString(),
                    authorizationTerminationDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 years
                    riskLevel: this.calculateOverallRiskLevel(controls)
                }
            };
            return systemSecurityPlan;
        }
        catch (error) {
            console.error('Error generating System Security Plan:', error);
            throw error;
        }
    }
    /**
     * Generate Plan of Action and Milestones data
     */
    async generatePOAMData(tenantId) {
        try {
            const poams = await enhancedCosmosService.getPOAMItems(tenantId);
            const nistControls = await enhancedCosmosService.getNISTControls(tenantId);
            // Get non-compliant controls
            const nonCompliantControls = nistControls.filter(control => control.overallStatus !== 'compliant');
            const poamItems = [];
            // Add existing POAM items
            poams.forEach(poam => {
                poamItems.push({
                    poamId: poam.id,
                    weaknessId: poam.id,
                    weaknessDescription: poam.description,
                    relatedControlId: poam.relatedControls?.join(', ') || '',
                    findingSource: 'Security Assessment',
                    findingDetails: poam.description,
                    riskLevel: this.mapPOAMSeverityToRiskLevel(poam.riskLevel),
                    threatStatement: `Threat related to ${poam.relatedControls?.join(', ') || 'system'}`,
                    vulnerabilityStatement: poam.description,
                    recommendedCorrectiveAction: poam.mitigationSteps?.join('. ') || 'Address finding',
                    remediationPlan: poam.mitigationSteps?.join('. ') || 'Address finding',
                    resourcesRequired: 'TBD',
                    milestones: [{
                            milestoneId: `${poam.id}-M1`,
                            description: 'Complete remediation action',
                            targetDate: poam.dueDate,
                            status: poam.status === 'closed' ? 'Completed' : 'In Progress',
                            responsibleParty: poam.assignee
                        }],
                    responsibleRole: poam.assignee,
                    scheduledCompletionDate: poam.dueDate,
                    actualCompletionDate: poam.status === 'closed' ? poam.lastUpdated : undefined,
                    status: this.mapPOAMStatusToStandard(poam.status),
                    vendorDependency: false,
                    costImpact: this.estimateCostImpact(poam.riskLevel),
                    businessImpact: this.estimateBusinessImpact(poam.riskLevel),
                    originalDetectionDate: poam.createdDate,
                    lastUpdated: poam.lastUpdated
                });
            });
            // Add POAM items for non-compliant controls not already covered
            nonCompliantControls.forEach(control => {
                const existingPOAM = poamItems.find(item => item.relatedControlId === control.id);
                if (!existingPOAM) {
                    poamItems.push({
                        poamId: `AUTO-${control.id}`,
                        weaknessId: `AUTO-${control.id}`,
                        weaknessDescription: `Non-compliance identified for control ${control.id}`,
                        relatedControlId: control.id,
                        findingSource: 'Continuous Monitoring',
                        findingDetails: `Control ${control.id} is not fully compliant`,
                        riskLevel: this.mapComplianceToRiskLevel(control.overallStatus),
                        threatStatement: `Potential security gap in ${control.controlFamily} controls`,
                        vulnerabilityStatement: `Incomplete implementation of ${control.controlName}`,
                        recommendedCorrectiveAction: `Implement missing requirements for ${control.id}`,
                        remediationPlan: `Review and implement all requirements for ${control.id}`,
                        resourcesRequired: 'Security Team, 40 hours',
                        milestones: [{
                                milestoneId: `AUTO-${control.id}-M1`,
                                description: `Complete implementation of ${control.id}`,
                                targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                                status: 'Not Started',
                                responsibleParty: 'Security Team'
                            }],
                        responsibleRole: 'Information System Security Officer',
                        scheduledCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Open',
                        vendorDependency: false,
                        costImpact: 'Medium',
                        businessImpact: 'Medium',
                        originalDetectionDate: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    });
                }
            });
            return poamItems;
        }
        catch (error) {
            console.error('Error generating POAM data:', error);
            throw error;
        }
    }
    /**
     * Generate compliance metrics
     */
    async generateComplianceMetrics(tenantId) {
        try {
            const nistControls = await enhancedCosmosService.getNISTControls(tenantId);
            // Calculate control family compliance
            const familyMap = new Map();
            nistControls.forEach(control => {
                const family = control.controlFamily;
                if (!familyMap.has(family)) {
                    familyMap.set(family, { total: 0, compliant: 0 });
                }
                const familyData = familyMap.get(family);
                familyData.total++;
                if (control.overallStatus === 'compliant') {
                    familyData.compliant++;
                }
            });
            const controlFamilyCompliance = Array.from(familyMap.entries()).map(([family, data]) => ({
                family,
                familyName: this.getControlFamilyName(family),
                totalControls: data.total,
                compliantControls: data.compliant,
                compliancePercentage: Math.round((data.compliant / data.total) * 100)
            }));
            // Calculate risk profile
            const riskCounts = {
                high: nistControls.filter(c => ['noncompliant', 'high-risk'].includes(c.overallStatus)).length,
                medium: nistControls.filter(c => c.overallStatus === 'partial').length,
                low: nistControls.filter(c => c.overallStatus === 'compliant').length,
                accepted: 0 // Would come from risk acceptance records
            };
            const riskProfile = {
                overallRiskLevel: this.calculateOverallRiskLevel(nistControls.map(c => ({ riskLevel: this.mapComplianceToRiskLevel(c.overallStatus) }))),
                highRiskControlsCount: riskCounts.high,
                mediumRiskControlsCount: riskCounts.medium,
                lowRiskControlsCount: riskCounts.low,
                acceptedRisksCount: riskCounts.accepted
            };
            // Calculate continuous monitoring status
            const continuousMonitoringStatus = {
                isActive: true,
                lastAssessmentDate: new Date().toISOString(),
                nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                monitoringFrequency: 'Monthly',
                automatedToolsUsed: ['cATO Command Center', 'Azure Security Center', 'Compliance Dashboard']
            };
            const totalControls = nistControls.length;
            const compliantControls = nistControls.filter(c => c.overallStatus === 'compliant').length;
            return {
                overallCompliancePercentage: Math.round((compliantControls / totalControls) * 100),
                controlFamilyCompliance,
                riskProfile,
                continuousMonitoringStatus
            };
        }
        catch (error) {
            console.error('Error generating compliance metrics:', error);
            throw error;
        }
    }
    /**
     * Generate Zero Trust Assessment data
     */
    async generateZeroTrustAssessment(tenantId) {
        try {
            const ztaActivities = await enhancedCosmosService.getZTAActivities(tenantId);
            // Group by pillars and calculate maturity
            const pillarMap = new Map();
            ztaActivities.forEach(activity => {
                if (!pillarMap.has(activity.pillar)) {
                    pillarMap.set(activity.pillar, []);
                }
                pillarMap.get(activity.pillar).push(activity);
            });
            const pillarReadiness = Array.from(pillarMap.entries()).map(([pillar, activities]) => {
                const implementedCount = activities.filter(a => a.overallStatus === 'complete').length;
                const totalCount = activities.length;
                const score = totalCount > 0 ? Math.round((implementedCount / totalCount) * 100) : 0;
                let maturityLevel = 'Traditional';
                if (score >= 80)
                    maturityLevel = 'Optimal';
                else if (score >= 60)
                    maturityLevel = 'Advanced';
                return {
                    pillar,
                    maturityLevel,
                    score,
                    capabilities: activities.map(activity => ({
                        name: activity.activityName,
                        status: this.mapZTAStatus(activity.overallStatus),
                        maturityLevel: activity.overallMaturity
                    }))
                };
            });
            const overallScore = pillarReadiness.length > 0
                ? Math.round(pillarReadiness.reduce((sum, p) => sum + p.score, 0) / pillarReadiness.length)
                : 0;
            let overallMaturity = 'Traditional';
            if (overallScore >= 80)
                overallMaturity = 'Optimal';
            else if (overallScore >= 60)
                overallMaturity = 'Advanced';
            return {
                maturityLevel: overallMaturity,
                pillarReadiness,
                overallScore
            };
        }
        catch (error) {
            console.error('Error generating Zero Trust assessment:', error);
            return undefined;
        }
    }
    /**
     * Generate Execution Enablers data
     */
    async generateExecutionEnablers(tenantId) {
        try {
            const executionEnablers = await enhancedCosmosService.getExecutionEnablers(tenantId);
            const enablerMap = {
                doctrine: this.generateEnablerStatus('Doctrine', executionEnablers.filter(e => e.category === 'doctrine')),
                organization: this.generateEnablerStatus('Organization', executionEnablers.filter(e => e.category === 'organization')),
                training: this.generateEnablerStatus('Training', executionEnablers.filter(e => e.category === 'training')),
                materiel: this.generateEnablerStatus('Materiel', executionEnablers.filter(e => e.category === 'materiel')),
                leadership: this.generateEnablerStatus('Leadership', executionEnablers.filter(e => e.category === 'leadership')),
                personnel: this.generateEnablerStatus('Personnel', executionEnablers.filter(e => e.category === 'personnel')),
                facilities: this.generateEnablerStatus('Facilities', executionEnablers.filter(e => e.category === 'facilities')),
                policy: this.generateEnablerStatus('Policy', executionEnablers.filter(e => e.category === 'policy'))
            };
            return enablerMap;
        }
        catch (error) {
            console.error('Error generating execution enablers:', error);
            return undefined;
        }
    }
    /**
     * Convert POAM data to eMASS CSV format
     */
    async generateeMASS_POAMData(tenantId) {
        try {
            const poamData = await this.generatePOAMData(tenantId);
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            return poamData.map(poam => ({
                'Control Vulnerability Description': poam.weaknessDescription,
                'Security Control Number (e.g., AC-1)': poam.relatedControlId,
                'Office/Org': tenant?.organizationName || 'Organization',
                'Security Control Name': this.getControlName(poam.relatedControlId),
                'Raw Severity Value': this.mapRiskLevelToeMASS(poam.riskLevel),
                'Adjusted Severity Value': this.mapRiskLevelToeMASS(poam.riskLevel),
                'Relevance of Threat': this.mapRiskLevelToeMASS(poam.riskLevel),
                'Threat Description': poam.threatStatement,
                'Likelihood': this.mapRiskLevelToeMASS(poam.riskLevel),
                'Impact': this.mapRiskLevelToeMASS(poam.riskLevel),
                'Impact Description': poam.vulnerabilityStatement,
                'Residual Risk Level': this.mapRiskLevelToeMASS(poam.riskLevel),
                'Recommendations': poam.recommendedCorrectiveAction,
                'Scheduled Completion Date': this.formatDateForeMASS(poam.scheduledCompletionDate),
                'Milestone with Completion Dates': this.formatMilestonesForeMASS(poam.milestones),
                'Milestone Changes': '',
                'Source Identifying Vulnerability': poam.findingSource,
                'Status': this.mapStatusToeMASS(poam.status),
                'Comments': `Last Updated: ${this.formatDateForeMASS(poam.lastUpdated)}`
            }));
        }
        catch (error) {
            console.error('Error generating eMASS POAM data:', error);
            throw error;
        }
    }
    // Helper methods
    mapComplianceToImplementationStatus(status) {
        switch (status) {
            case 'compliant': return 'Implemented';
            case 'partial': return 'Partially Implemented';
            case 'noncompliant': return 'Planned';
            default: return 'Planned';
        }
    }
    mapComplianceToRiskLevel(status) {
        switch (status) {
            case 'compliant': return 'Low';
            case 'partial': return 'Moderate';
            case 'noncompliant': return 'High';
            default: return 'High';
        }
    }
    mapPOAMSeverityToRiskLevel(severity) {
        switch (severity?.toLowerCase()) {
            case 'low': return 'Low';
            case 'medium': return 'Moderate';
            case 'high': return 'High';
            case 'critical': return 'Very High';
            default: return 'Moderate';
        }
    }
    mapPOAMStatusToStandard(status) {
        switch (status?.toLowerCase()) {
            case 'open': return 'Open';
            case 'in-progress': return 'In Progress';
            case 'closed': return 'Completed';
            case 'accepted': return 'Risk Accepted';
            default: return 'Open';
        }
    }
    getRiskPriority(status) {
        switch (status) {
            case 'compliant': return 'Low';
            case 'partial': return 'Medium';
            case 'noncompliant': return 'High';
            default: return 'High';
        }
    }
    estimateRemediationEffort(status) {
        switch (status) {
            case 'partial': return '20-40 hours';
            case 'noncompliant': return '40-80 hours';
            default: return '10-20 hours';
        }
    }
    estimateCostImpact(severity) {
        switch (severity?.toLowerCase()) {
            case 'low': return 'Low';
            case 'medium': return 'Medium';
            case 'high':
            case 'critical': return 'High';
            default: return 'Medium';
        }
    }
    estimateBusinessImpact(severity) {
        return this.estimateCostImpact(severity);
    }
    mapZTAStatus(status) {
        switch (status) {
            case 'complete':
                return 'Implemented';
            case 'in-progress':
                return 'In Progress';
            default:
                return 'Not Started';
        }
    }
    determineSecurityCategorization(controls) {
        const nonCompliantCount = controls.filter(c => c.overallStatus !== 'compliant').length;
        const totalCount = controls.length;
        const compliancePercentage = (totalCount - nonCompliantCount) / totalCount * 100;
        if (compliancePercentage >= 90)
            return 'Low';
        if (compliancePercentage >= 70)
            return 'Moderate';
        return 'High';
    }
    calculateOverallRiskLevel(controls) {
        const riskCounts = {
            'Very High': controls.filter(c => c.riskLevel === 'Very High').length,
            'High': controls.filter(c => c.riskLevel === 'High').length,
            'Moderate': controls.filter(c => c.riskLevel === 'Moderate').length,
            'Low': controls.filter(c => c.riskLevel === 'Low').length
        };
        if (riskCounts['Very High'] > 0)
            return 'Very High';
        if (riskCounts['High'] > 3)
            return 'High';
        if (riskCounts['High'] > 0 || riskCounts['Moderate'] > 5)
            return 'Moderate';
        return 'Low';
    }
    getControlFamilyName(family) {
        const familyNames = {
            'AC': 'Access Control',
            'AT': 'Awareness and Training',
            'AU': 'Audit and Accountability',
            'CA': 'Assessment, Authorization, and Monitoring',
            'CM': 'Configuration Management',
            'CP': 'Contingency Planning',
            'IA': 'Identification and Authentication',
            'IR': 'Incident Response',
            'MA': 'Maintenance',
            'MP': 'Media Protection',
            'PE': 'Physical and Environmental Protection',
            'PL': 'Planning',
            'PS': 'Personnel Security',
            'PT': 'PII Processing and Transparency',
            'RA': 'Risk Assessment',
            'SA': 'System and Services Acquisition',
            'SC': 'System and Communications Protection',
            'SI': 'System and Information Integrity',
            'SR': 'Supply Chain Risk Management'
        };
        return familyNames[family] || family;
    }
    mapMaturityToNumber(maturity) {
        return maturity;
    }
    generateEnablerStatus(name, enablers) {
        const implemented = enablers.filter(e => e.status === 'complete').length;
        const total = enablers.length;
        const score = total > 0 ? Math.round((implemented / total) * 100) : 0;
        let status = 'Not Addressed';
        if (score >= 90)
            status = 'Fully Addressed';
        else if (score >= 70)
            status = 'Largely Addressed';
        else if (score >= 30)
            status = 'Partially Addressed';
        return {
            name,
            status,
            score,
            description: `${name} implementation status: ${implemented}/${total} complete`,
            gaps: enablers.filter(e => e.status !== 'complete').map(e => e.name),
            recommendations: [`Complete remaining ${name.toLowerCase()} implementations`]
        };
    }
    mapRiskLevelToeMASS(riskLevel) {
        switch (riskLevel) {
            case 'Low': return 'Low';
            case 'Moderate': return 'Moderate';
            case 'High': return 'High';
            case 'Very High': return 'Very High';
            default: return 'Moderate';
        }
    }
    mapStatusToeMASS(status) {
        switch (status) {
            case 'Open':
            case 'In Progress': return 'Ongoing';
            case 'Completed': return 'Completed';
            case 'Risk Accepted': return 'Risk Accepted';
            case 'False Positive': return 'Not Applicable';
            default: return 'Ongoing';
        }
    }
    formatDateForeMASS(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    }
    formatMilestonesForeMASS(milestones) {
        return milestones.map(m => `${m.description} (${this.formatDateForeMASS(m.targetDate)})`).join('; ');
    }
    getControlName(controlId) {
        // This would typically lookup the control name from a database
        // For now, return a placeholder
        return `Control ${controlId}`;
    }
}
export default new ATOPackageGenerationService();
