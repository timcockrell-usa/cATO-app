/**
 * Execution Enablers Service for DOTmLPF-P Management
 * Implements comprehensive tracking of organizational readiness factors for cATO
 */
import { CosmosClient } from '@azure/cosmos';
// Cosmos DB configuration
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    key: import.meta.env.VITE_COSMOS_DB_KEY || 'your-cosmos-key',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
// Pre-defined execution enablers for each DOTmLPF-P category
const DEFAULT_EXECUTION_ENABLERS = {
    Doctrine: [
        {
            name: 'cATO Policy Framework',
            description: 'Establish organizational policy and doctrine for continuous authorization processes',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Policy document', 'Doctrine publication', 'Training materials'],
            impactOnCATO: 'Fundamental - Provides the foundation for all cATO activities'
        },
        {
            name: 'Risk Management Doctrine',
            description: 'Implement risk management principles and methodologies aligned with DoD standards',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['Risk management plan', 'Process documentation', 'Training records'],
            impactOnCATO: 'High - Essential for effective risk-based decision making'
        }
    ],
    Organization: [
        {
            name: 'cATO Governance Structure',
            description: 'Establish organizational structure with defined roles and responsibilities for cATO',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Organizational chart', 'Role definitions', 'Responsibility matrix'],
            impactOnCATO: 'Critical - Ensures accountability and clear ownership'
        },
        {
            name: 'Cross-Functional Teams',
            description: 'Form integrated teams spanning security, operations, and development functions',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['Team charters', 'Meeting records', 'Collaboration metrics'],
            impactOnCATO: 'High - Enables effective coordination across organizational boundaries'
        }
    ],
    Training: [
        {
            name: 'cATO Awareness Training',
            description: 'Provide organization-wide awareness training on continuous authorization concepts',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Training curriculum', 'Completion records', 'Assessment results'],
            impactOnCATO: 'High - Ensures all personnel understand their role in cATO'
        },
        {
            name: 'Technical Skills Development',
            description: 'Develop technical competencies required for automated security controls and monitoring',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['Skills assessment', 'Training plans', 'Certification records'],
            impactOnCATO: 'Critical - Essential for technical implementation of cATO'
        }
    ],
    Materiel: [
        {
            name: 'Automated Security Tools',
            description: 'Acquire and deploy automated tools for continuous monitoring and assessment',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['Tool inventory', 'Integration documentation', 'Performance metrics'],
            impactOnCATO: 'Critical - Enables automated continuous monitoring'
        },
        {
            name: 'Infrastructure Modernization',
            description: 'Modernize IT infrastructure to support cloud-native security controls',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Architecture diagrams', 'Migration plans', 'Implementation status'],
            impactOnCATO: 'High - Provides foundation for modern security controls'
        }
    ],
    Leadership: [
        {
            name: 'Executive Sponsorship',
            description: 'Secure visible executive leadership support and sponsorship for cATO initiatives',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Executive communications', 'Resource allocations', 'Program charters'],
            impactOnCATO: 'Critical - Ensures organizational commitment and resource availability'
        },
        {
            name: 'Change Management Leadership',
            description: 'Develop leadership capabilities for managing organizational change to cATO',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['Change plans', 'Communication strategies', 'Success metrics'],
            impactOnCATO: 'High - Critical for successful organizational transformation'
        }
    ],
    Personnel: [
        {
            name: 'Staffing and Recruitment',
            description: 'Ensure adequate staffing with appropriate skills for cATO implementation and operation',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Staffing plans', 'Job descriptions', 'Recruitment records'],
            impactOnCATO: 'High - Ensures sufficient human resources for cATO operations'
        },
        {
            name: 'Performance Management',
            description: 'Align individual performance objectives with cATO goals and metrics',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['Performance objectives', 'Evaluation criteria', 'Incentive programs'],
            impactOnCATO: 'Medium - Aligns individual contributions with organizational goals'
        }
    ],
    Facilities: [
        {
            name: 'Security Operations Center',
            description: 'Establish or enhance SOC capabilities for continuous monitoring and response',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['SOC design', 'Equipment specifications', 'Operating procedures'],
            impactOnCATO: 'High - Provides centralized monitoring and response capabilities'
        },
        {
            name: 'Collaboration Spaces',
            description: 'Create physical and virtual spaces for cross-functional collaboration on cATO activities',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Facility plans', 'Technology specifications', 'Usage metrics'],
            impactOnCATO: 'Medium - Facilitates collaboration and communication'
        }
    ],
    Policy: [
        {
            name: 'Information Security Policies',
            description: 'Update information security policies to support continuous authorization model',
            targetMaturityLevel: 'Defined',
            evidenceRequired: ['Policy documents', 'Review records', 'Approval documentation'],
            impactOnCATO: 'Critical - Provides regulatory framework for cATO operations'
        },
        {
            name: 'Compliance Management Policies',
            description: 'Establish policies for ongoing compliance monitoring and reporting',
            targetMaturityLevel: 'Managed',
            evidenceRequired: ['Compliance policies', 'Monitoring procedures', 'Reporting templates'],
            impactOnCATO: 'High - Ensures systematic approach to compliance management'
        }
    ]
};
class ExecutionEnablersService {
    constructor() {
        this.client = new CosmosClient({
            endpoint: cosmosConfig.endpoint,
            key: cosmosConfig.key,
        });
        this.container = this.client.database(cosmosConfig.databaseId).container('execution-enablers');
    }
    /**
     * Initialize default execution enablers for a tenant
     */
    async initializeDefaultEnablers(tenantId, createdBy) {
        const enablers = [];
        for (const [category, categoryEnablers] of Object.entries(DEFAULT_EXECUTION_ENABLERS)) {
            for (const enablerTemplate of categoryEnablers) {
                const enabler = {
                    id: `enabler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    tenantId,
                    category: category,
                    name: enablerTemplate.name,
                    description: enablerTemplate.description,
                    status: 'Not_Started',
                    maturityLevel: 'Initial',
                    targetMaturityLevel: enablerTemplate.targetMaturityLevel || 'Defined',
                    completionPercentage: 0,
                    milestones: [],
                    riskLevel: 'Moderate',
                    impactOnCATO: enablerTemplate.impactOnCATO,
                    dependencies: [],
                    owner: createdBy,
                    stakeholders: [createdBy],
                    estimatedEffort: 'TBD',
                    targetCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months default
                    evidenceRequired: enablerTemplate.evidenceRequired || [],
                    evidenceProvided: [],
                    validationCriteria: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastAssessedDate: new Date().toISOString(),
                    assessedBy: createdBy
                };
                enablers.push(enabler);
            }
        }
        // Batch create enablers
        try {
            const createdEnablers = [];
            for (const enabler of enablers) {
                const { resource } = await this.container.items.create(enabler);
                createdEnablers.push(resource);
            }
            return createdEnablers;
        }
        catch (error) {
            console.error('Error initializing default enablers:', error);
            throw error;
        }
    }
    /**
     * Get all execution enablers for a tenant
     */
    async getEnablersForTenant(tenantId) {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.category, c.name',
                parameters: [{ name: '@tenantId', value: tenantId }]
            };
            const { resources } = await this.container.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error getting enablers for tenant:', error);
            throw error;
        }
    }
    /**
     * Get enablers grouped by DOTmLPF-P category
     */
    async getEnablersGroupedByCategory(tenantId) {
        const enablers = await this.getEnablersForTenant(tenantId);
        const grouped = {
            Doctrine: [],
            Organization: [],
            Training: [],
            Materiel: [],
            Leadership: [],
            Personnel: [],
            Facilities: [],
            Policy: []
        };
        enablers.forEach(enabler => {
            grouped[enabler.category].push(enabler);
        });
        return grouped;
    }
    /**
     * Get execution enabler by ID
     */
    async getEnabler(enablerId, tenantId) {
        try {
            const { resource } = await this.container.item(enablerId, tenantId).read();
            return resource;
        }
        catch (error) {
            if (error.code === 404) {
                return null;
            }
            console.error('Error getting enabler:', error);
            throw error;
        }
    }
    /**
     * Update enabler status and progress
     */
    async updateEnablerStatus(enablerId, tenantId, status, completionPercentage, updatedBy, notes) {
        const enabler = await this.getEnabler(enablerId, tenantId);
        if (!enabler) {
            throw new Error('Enabler not found');
        }
        const updatedEnabler = {
            ...enabler,
            status,
            completionPercentage: Math.min(100, Math.max(0, completionPercentage)),
            updatedAt: new Date().toISOString(),
            lastAssessedDate: new Date().toISOString(),
            assessedBy: updatedBy
        };
        // Set completion date if fully completed
        if (status === 'Completed' && !enabler.actualCompletionDate) {
            updatedEnabler.actualCompletionDate = new Date().toISOString();
        }
        try {
            const { resource } = await this.container.item(enablerId, tenantId).replace(updatedEnabler);
            return resource;
        }
        catch (error) {
            console.error('Error updating enabler status:', error);
            throw error;
        }
    }
    /**
     * Update enabler maturity level
     */
    async updateMaturityLevel(enablerId, tenantId, maturityLevel, updatedBy, assessmentNotes) {
        const enabler = await this.getEnabler(enablerId, tenantId);
        if (!enabler) {
            throw new Error('Enabler not found');
        }
        const updatedEnabler = {
            ...enabler,
            maturityLevel,
            updatedAt: new Date().toISOString(),
            lastAssessedDate: new Date().toISOString(),
            assessedBy: updatedBy
        };
        try {
            const { resource } = await this.container.item(enablerId, tenantId).replace(updatedEnabler);
            return resource;
        }
        catch (error) {
            console.error('Error updating maturity level:', error);
            throw error;
        }
    }
    /**
     * Add milestone to enabler
     */
    async addMilestone(enablerId, tenantId, milestone, updatedBy) {
        const enabler = await this.getEnabler(enablerId, tenantId);
        if (!enabler) {
            throw new Error('Enabler not found');
        }
        const newMilestone = {
            ...milestone,
            id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        };
        const updatedEnabler = {
            ...enabler,
            milestones: [...enabler.milestones, newMilestone],
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.container.item(enablerId, tenantId).replace(updatedEnabler);
            return resource;
        }
        catch (error) {
            console.error('Error adding milestone:', error);
            throw error;
        }
    }
    /**
     * Update milestone status
     */
    async updateMilestoneStatus(enablerId, tenantId, milestoneId, status, actualDate) {
        const enabler = await this.getEnabler(enablerId, tenantId);
        if (!enabler) {
            throw new Error('Enabler not found');
        }
        const updatedMilestones = enabler.milestones.map(milestone => {
            if (milestone.id === milestoneId) {
                return {
                    ...milestone,
                    status,
                    actualDate: actualDate || milestone.actualDate
                };
            }
            return milestone;
        });
        const updatedEnabler = {
            ...enabler,
            milestones: updatedMilestones,
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.container.item(enablerId, tenantId).replace(updatedEnabler);
            return resource;
        }
        catch (error) {
            console.error('Error updating milestone status:', error);
            throw error;
        }
    }
    /**
     * Add evidence to enabler
     */
    async addEvidence(enablerId, tenantId, evidence, uploadedBy) {
        const enabler = await this.getEnabler(enablerId, tenantId);
        if (!enabler) {
            throw new Error('Enabler not found');
        }
        const newEvidence = {
            ...evidence,
            id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            uploadedBy,
            uploadedDate: new Date().toISOString(),
            verified: false
        };
        const updatedEnabler = {
            ...enabler,
            evidenceProvided: [...enabler.evidenceProvided, newEvidence],
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.container.item(enablerId, tenantId).replace(updatedEnabler);
            return resource;
        }
        catch (error) {
            console.error('Error adding evidence:', error);
            throw error;
        }
    }
    /**
     * Verify evidence
     */
    async verifyEvidence(enablerId, tenantId, evidenceId, verifiedBy) {
        const enabler = await this.getEnabler(enablerId, tenantId);
        if (!enabler) {
            throw new Error('Enabler not found');
        }
        const updatedEvidence = enabler.evidenceProvided.map(evidence => {
            if (evidence.id === evidenceId) {
                return {
                    ...evidence,
                    verified: true,
                    verifiedBy,
                    verifiedDate: new Date().toISOString()
                };
            }
            return evidence;
        });
        const updatedEnabler = {
            ...enabler,
            evidenceProvided: updatedEvidence,
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.container.item(enablerId, tenantId).replace(updatedEnabler);
            return resource;
        }
        catch (error) {
            console.error('Error verifying evidence:', error);
            throw error;
        }
    }
    /**
     * Get enabler statistics for dashboard
     */
    async getEnablerStatistics(tenantId) {
        try {
            const enablers = await this.getEnablersForTenant(tenantId);
            const statistics = {
                total: enablers.length,
                byCategory: {},
                byStatus: {},
                byMaturity: {},
                overallCompletion: 0,
                atRisk: 0,
                overdue: 0
            };
            // Initialize counters
            const categories = ['Doctrine', 'Organization', 'Training', 'Materiel', 'Leadership', 'Personnel', 'Facilities', 'Policy'];
            const statuses = ['Not_Started', 'Planning', 'In_Progress', 'Testing', 'Completed', 'Validated', 'Needs_Attention', 'On_Hold', 'Cancelled'];
            const maturityLevels = ['Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'];
            categories.forEach(category => { statistics.byCategory[category] = 0; });
            statuses.forEach(status => { statistics.byStatus[status] = 0; });
            maturityLevels.forEach(level => { statistics.byMaturity[level] = 0; });
            let totalCompletion = 0;
            const currentDate = new Date();
            enablers.forEach(enabler => {
                // Count by category
                statistics.byCategory[enabler.category]++;
                // Count by status
                statistics.byStatus[enabler.status]++;
                // Count by maturity
                statistics.byMaturity[enabler.maturityLevel]++;
                // Sum completion percentages
                totalCompletion += enabler.completionPercentage;
                // Count at-risk items
                if (['Needs_Attention', 'On_Hold'].includes(enabler.status) || enabler.riskLevel === 'High' || enabler.riskLevel === 'Very_High') {
                    statistics.atRisk++;
                }
                // Count overdue items
                if (enabler.targetCompletionDate && new Date(enabler.targetCompletionDate) < currentDate && enabler.status !== 'Completed') {
                    statistics.overdue++;
                }
            });
            // Calculate overall completion percentage
            if (enablers.length > 0) {
                statistics.overallCompletion = Math.round(totalCompletion / enablers.length);
            }
            return statistics;
        }
        catch (error) {
            console.error('Error getting enabler statistics:', error);
            throw error;
        }
    }
    /**
     * Get maturity assessment for tenant
     */
    async getMaturityAssessment(tenantId) {
        try {
            const enablers = await this.getEnablersForTenant(tenantId);
            const groupedEnablers = await this.getEnablersGroupedByCategory(tenantId);
            const maturityLevelMap = {
                'Initial': 1,
                'Developing': 2,
                'Defined': 3,
                'Managed': 4,
                'Optimizing': 5
            };
            const categoryMaturity = {};
            const maturityGaps = [];
            let totalCurrentMaturity = 0;
            let totalTargetMaturity = 0;
            // Analyze each category
            Object.entries(groupedEnablers).forEach(([category, categoryEnablers]) => {
                const cat = category;
                if (categoryEnablers.length > 0) {
                    const avgCurrent = categoryEnablers.reduce((sum, e) => sum + maturityLevelMap[e.maturityLevel], 0) / categoryEnablers.length;
                    const avgTarget = categoryEnablers.reduce((sum, e) => sum + maturityLevelMap[e.targetMaturityLevel], 0) / categoryEnablers.length;
                    const completedCount = categoryEnablers.filter(e => e.status === 'Completed').length;
                    categoryMaturity[cat] = {
                        currentLevel: Math.round(avgCurrent * 10) / 10,
                        targetLevel: Math.round(avgTarget * 10) / 10,
                        enablerCount: categoryEnablers.length,
                        completedCount
                    };
                    totalCurrentMaturity += avgCurrent;
                    totalTargetMaturity += avgTarget;
                    // Identify maturity gaps
                    categoryEnablers.forEach(enabler => {
                        const currentLevel = maturityLevelMap[enabler.maturityLevel];
                        const targetLevel = maturityLevelMap[enabler.targetMaturityLevel];
                        const gap = targetLevel - currentLevel;
                        if (gap > 0) {
                            maturityGaps.push({
                                category: cat,
                                enabler: enabler.name,
                                currentMaturity: enabler.maturityLevel,
                                targetMaturity: enabler.targetMaturityLevel,
                                gap,
                                impact: enabler.impactOnCATO
                            });
                        }
                    });
                }
            });
            const overallMaturity = Object.keys(groupedEnablers).length > 0
                ? Math.round((totalCurrentMaturity / Object.keys(groupedEnablers).length) * 10) / 10
                : 0;
            // Sort gaps by impact and gap size
            maturityGaps.sort((a, b) => {
                const impactOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Fundamental': 5 };
                const aImpact = impactOrder[a.impact.split(' - ')[0]] || 0;
                const bImpact = impactOrder[b.impact.split(' - ')[0]] || 0;
                if (aImpact !== bImpact)
                    return bImpact - aImpact;
                return b.gap - a.gap;
            });
            return {
                overallMaturity,
                categoryMaturity,
                maturityGaps: maturityGaps.slice(0, 10) // Top 10 gaps
            };
        }
        catch (error) {
            console.error('Error getting maturity assessment:', error);
            throw error;
        }
    }
    /**
     * Create custom enabler
     */
    async createCustomEnabler(enabler, createdBy) {
        const newEnabler = {
            ...enabler,
            id: `enabler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.container.items.create(newEnabler);
            return resource;
        }
        catch (error) {
            console.error('Error creating custom enabler:', error);
            throw error;
        }
    }
    /**
     * Delete enabler
     */
    async deleteEnabler(enablerId, tenantId) {
        try {
            await this.container.item(enablerId, tenantId).delete();
        }
        catch (error) {
            console.error('Error deleting enabler:', error);
            throw error;
        }
    }
}
// Singleton instance
export const executionEnablersService = new ExecutionEnablersService();
export { ExecutionEnablersService };
