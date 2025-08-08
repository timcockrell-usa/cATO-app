/**
 * DOTmLPF-P (Execution Enablers) Service Implementation
 *
 * Provides comprehensive management of non-technical enablers critical for
 * achieving and maintaining Continuous ATO. Integrates with NIST controls
 * and provides real-time tracking of organizational maturity.
 */
/**
 * Service for managing DOTmLPF-P execution enablers and organizational maturity
 */
export class DOTmLPFPService {
    constructor(cosmosClient) {
        this.containerName = 'execution-enablers';
        this.assessmentContainerName = 'enabler-assessments';
        this.planContainerName = 'improvement-plans';
        this.configContainerName = 'dotmlpfp-configurations';
        this.cosmosClient = cosmosClient;
    }
    // Enabler management
    async getEnablers(organizationId, category) {
        try {
            const container = this.cosmosClient.container(this.containerName);
            let query = 'SELECT * FROM c WHERE c.organizationId = @organizationId';
            const parameters = [{ name: '@organizationId', value: organizationId }];
            if (category) {
                query += ' AND c.category = @category';
                parameters.push({ name: '@category', value: category });
            }
            const { resources } = await container.items
                .query({ query, parameters })
                .fetchAll();
            return resources.map(this.mapToExecutionEnabler);
        }
        catch (error) {
            console.error('Error retrieving execution enablers:', error);
            throw new Error(`Failed to retrieve execution enablers: ${error}`);
        }
    }
    async getEnabler(enablerId) {
        try {
            const container = this.cosmosClient.container(this.containerName);
            const { resource } = await container.item(enablerId, enablerId).read();
            if (!resource) {
                throw new Error(`Execution enabler with ID ${enablerId} not found`);
            }
            return this.mapToExecutionEnabler(resource);
        }
        catch (error) {
            console.error('Error retrieving execution enabler:', error);
            throw error;
        }
    }
    async createEnabler(enabler) {
        try {
            const container = this.cosmosClient.container(this.containerName);
            const id = this.generateId();
            const now = new Date();
            const newEnabler = {
                ...enabler,
                id,
                createdAt: now,
                updatedAt: now
            };
            const { resource } = await container.items.create(newEnabler);
            // Log the creation event
            await this.logEvent({
                eventId: this.generateId(),
                organizationId: enabler.organizationId,
                eventType: 'Assessment_Due', // Will be updated based on context
                entityId: id,
                entityType: 'Enabler',
                title: `New execution enabler created: ${enabler.name}`,
                description: `Execution enabler for ${enabler.category} category has been created`,
                severity: 'Info',
                occurredAt: now,
                recipients: [enabler.createdBy],
                metadata: { category: enabler.category, maturityLevel: enabler.maturityLevel }
            });
            return this.mapToExecutionEnabler(resource);
        }
        catch (error) {
            console.error('Error creating execution enabler:', error);
            throw new Error(`Failed to create execution enabler: ${error}`);
        }
    }
    async updateEnabler(enablerId, updates) {
        try {
            const container = this.cosmosClient.container(this.containerName);
            const { resource: existing } = await container.item(enablerId, enablerId).read();
            if (!existing) {
                throw new Error(`Execution enabler with ID ${enablerId} not found`);
            }
            const updatedEnabler = {
                ...existing,
                ...updates,
                updatedAt: new Date()
            };
            const { resource } = await container.item(enablerId, enablerId).replace(updatedEnabler);
            // Check for significant changes that require notifications
            await this.checkForSignificantChanges(existing, updatedEnabler);
            return this.mapToExecutionEnabler(resource);
        }
        catch (error) {
            console.error('Error updating execution enabler:', error);
            throw new Error(`Failed to update execution enabler: ${error}`);
        }
    }
    async deleteEnabler(enablerId) {
        try {
            const container = this.cosmosClient.container(this.containerName);
            await container.item(enablerId, enablerId).delete();
        }
        catch (error) {
            console.error('Error deleting execution enabler:', error);
            throw new Error(`Failed to delete execution enabler: ${error}`);
        }
    }
    // Assessment management
    async createAssessment(assessment) {
        try {
            const container = this.cosmosClient.container(this.assessmentContainerName);
            const id = this.generateId();
            const now = new Date();
            const newAssessment = {
                ...assessment,
                id,
                createdAt: now,
                updatedAt: now
            };
            const { resource } = await container.items.create(newAssessment);
            // Update the enabler's last assessment date
            await this.updateEnablerAssessmentDate(assessment.enablerId, now);
            return this.mapToEnablerAssessment(resource);
        }
        catch (error) {
            console.error('Error creating enabler assessment:', error);
            throw new Error(`Failed to create enabler assessment: ${error}`);
        }
    }
    async getAssessments(organizationId, enablerId) {
        try {
            const container = this.cosmosClient.container(this.assessmentContainerName);
            let query = 'SELECT * FROM c WHERE c.organizationId = @organizationId';
            const parameters = [{ name: '@organizationId', value: organizationId }];
            if (enablerId) {
                query += ' AND c.enablerId = @enablerId';
                parameters.push({ name: '@enablerId', value: enablerId });
            }
            query += ' ORDER BY c.assessmentDate DESC';
            const { resources } = await container.items
                .query({ query, parameters })
                .fetchAll();
            return resources.map(this.mapToEnablerAssessment);
        }
        catch (error) {
            console.error('Error retrieving enabler assessments:', error);
            throw new Error(`Failed to retrieve enabler assessments: ${error}`);
        }
    }
    async updateAssessment(assessmentId, updates) {
        try {
            const container = this.cosmosClient.container(this.assessmentContainerName);
            const { resource: existing } = await container.item(assessmentId, assessmentId).read();
            if (!existing) {
                throw new Error(`Assessment with ID ${assessmentId} not found`);
            }
            const updatedAssessment = {
                ...existing,
                ...updates,
                updatedAt: new Date()
            };
            const { resource } = await container.item(assessmentId, assessmentId).replace(updatedAssessment);
            return this.mapToEnablerAssessment(resource);
        }
        catch (error) {
            console.error('Error updating enabler assessment:', error);
            throw new Error(`Failed to update enabler assessment: ${error}`);
        }
    }
    async approveAssessment(assessmentId, approver) {
        try {
            const updates = {
                status: 'Approved',
                reviewedBy: approver,
                reviewedDate: new Date()
            };
            const approvedAssessment = await this.updateAssessment(assessmentId, updates);
            // Update the enabler's maturity level if assessment is approved
            if (approvedAssessment.currentMaturityLevel) {
                await this.updateEnabler(approvedAssessment.enablerId, {
                    maturityLevel: approvedAssessment.currentMaturityLevel,
                    lastAssessedDate: approvedAssessment.assessmentDate
                });
            }
            return approvedAssessment;
        }
        catch (error) {
            console.error('Error approving assessment:', error);
            throw new Error(`Failed to approve assessment: ${error}`);
        }
    }
    // Improvement planning
    async createImprovementPlan(plan) {
        try {
            const container = this.cosmosClient.container(this.planContainerName);
            const id = this.generateId();
            const now = new Date();
            const newPlan = {
                ...plan,
                id,
                createdAt: now,
                updatedAt: now
            };
            const { resource } = await container.items.create(newPlan);
            // Create notifications for team members
            await this.notifyPlanCreation(newPlan);
            return this.mapToImprovementPlan(resource);
        }
        catch (error) {
            console.error('Error creating improvement plan:', error);
            throw new Error(`Failed to create improvement plan: ${error}`);
        }
    }
    async getImprovementPlans(organizationId) {
        try {
            const container = this.cosmosClient.container(this.planContainerName);
            const { resources } = await container.items
                .query({
                query: 'SELECT * FROM c WHERE c.organizationId = @organizationId ORDER BY c.createdAt DESC',
                parameters: [{ name: '@organizationId', value: organizationId }]
            })
                .fetchAll();
            return resources.map(this.mapToImprovementPlan);
        }
        catch (error) {
            console.error('Error retrieving improvement plans:', error);
            throw new Error(`Failed to retrieve improvement plans: ${error}`);
        }
    }
    async updateImprovementPlan(planId, updates) {
        try {
            const container = this.cosmosClient.container(this.planContainerName);
            const { resource: existing } = await container.item(planId, planId).read();
            if (!existing) {
                throw new Error(`Improvement plan with ID ${planId} not found`);
            }
            const updatedPlan = {
                ...existing,
                ...updates,
                updatedAt: new Date()
            };
            const { resource } = await container.item(planId, planId).replace(updatedPlan);
            return this.mapToImprovementPlan(resource);
        }
        catch (error) {
            console.error('Error updating improvement plan:', error);
            throw new Error(`Failed to update improvement plan: ${error}`);
        }
    }
    // Dashboard and reporting
    async getDashboardData(organizationId, timeframe) {
        try {
            const enablers = await this.getEnablers(organizationId);
            const assessments = await this.getAssessments(organizationId);
            const plans = await this.getImprovementPlans(organizationId);
            return await this.buildDashboardData(organizationId, enablers, assessments, plans, timeframe);
        }
        catch (error) {
            console.error('Error generating dashboard data:', error);
            throw new Error(`Failed to generate dashboard data: ${error}`);
        }
    }
    async generateMaturityReport(organizationId, category) {
        try {
            const enablers = await this.getEnablers(organizationId, category);
            const assessments = await this.getAssessments(organizationId);
            const plans = await this.getImprovementPlans(organizationId);
            return await this.buildMaturityReport(organizationId, enablers, assessments, plans, category);
        }
        catch (error) {
            console.error('Error generating maturity report:', error);
            throw new Error(`Failed to generate maturity report: ${error}`);
        }
    }
    // NIST control integration
    async getNistControlCoverage(organizationId) {
        try {
            const enablers = await this.getEnablers(organizationId);
            const config = await this.getConfiguration(organizationId);
            return await this.calculateNistControlCoverage(enablers, config.customControlMappings);
        }
        catch (error) {
            console.error('Error getting NIST control coverage:', error);
            throw new Error(`Failed to get NIST control coverage: ${error}`);
        }
    }
    async updateControlMappings(organizationId, mappings) {
        try {
            const config = await this.getConfiguration(organizationId);
            const updatedConfig = {
                ...config,
                customControlMappings: mappings,
                updatedAt: new Date()
            };
            await this.updateConfiguration(organizationId, updatedConfig);
        }
        catch (error) {
            console.error('Error updating control mappings:', error);
            throw new Error(`Failed to update control mappings: ${error}`);
        }
    }
    // Configuration
    async getConfiguration(organizationId) {
        try {
            const container = this.cosmosClient.container(this.configContainerName);
            const { resource } = await container.item(organizationId, organizationId).read();
            if (!resource) {
                // Return default configuration
                return this.getDefaultConfiguration(organizationId);
            }
            return this.mapToConfiguration(resource);
        }
        catch (error) {
            console.error('Error retrieving configuration:', error);
            throw new Error(`Failed to retrieve configuration: ${error}`);
        }
    }
    async updateConfiguration(organizationId, config) {
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
            return this.mapToConfiguration(resource);
        }
        catch (error) {
            console.error('Error updating configuration:', error);
            throw new Error(`Failed to update configuration: ${error}`);
        }
    }
    // Private helper methods
    async updateEnablerAssessmentDate(enablerId, assessmentDate) {
        try {
            await this.updateEnabler(enablerId, {
                lastAssessedDate: assessmentDate
            });
        }
        catch (error) {
            console.error('Error updating enabler assessment date:', error);
            // Don't throw - this is a secondary operation
        }
    }
    async checkForSignificantChanges(existing, updated) {
        // Check for maturity level changes
        if (existing.maturityLevel !== updated.maturityLevel) {
            await this.logEvent({
                eventId: this.generateId(),
                organizationId: updated.organizationId,
                eventType: 'Maturity_Changed',
                entityId: updated.id,
                entityType: 'Enabler',
                title: `Maturity level changed for ${updated.name}`,
                description: `Maturity level changed from ${existing.maturityLevel} to ${updated.maturityLevel}`,
                severity: 'Info',
                occurredAt: new Date(),
                recipients: updated.stakeholders,
                metadata: {
                    previousLevel: existing.maturityLevel,
                    newLevel: updated.maturityLevel,
                    category: updated.category
                }
            });
        }
        // Check for risk level changes
        if (existing.riskLevel !== updated.riskLevel && updated.riskLevel === 'Very_High') {
            await this.logEvent({
                eventId: this.generateId(),
                organizationId: updated.organizationId,
                eventType: 'Risk_Identified',
                entityId: updated.id,
                entityType: 'Enabler',
                title: `High risk identified in ${updated.name}`,
                description: `Risk level escalated to ${updated.riskLevel}`,
                severity: 'Error',
                occurredAt: new Date(),
                recipients: [updated.ownerRole, ...updated.stakeholders],
                metadata: {
                    previousRiskLevel: existing.riskLevel,
                    newRiskLevel: updated.riskLevel,
                    riskDescription: updated.riskDescription
                }
            });
        }
    }
    async notifyPlanCreation(plan) {
        const recipients = [
            plan.sponsor,
            ...plan.resourcesAssigned.map(r => r.userId)
        ];
        await this.logEvent({
            eventId: this.generateId(),
            organizationId: plan.organizationId,
            eventType: 'Initiative_Completed', // Will be updated based on context
            entityId: plan.id,
            entityType: 'Plan',
            title: `New improvement plan created: ${plan.name}`,
            description: `Improvement plan targeting ${plan.targetState.length} categories has been created`,
            severity: 'Info',
            occurredAt: new Date(),
            recipients,
            metadata: {
                targetCategories: plan.targetState.map(t => t.category),
                startDate: plan.startDate,
                targetCompletion: plan.targetCompletionDate
            }
        });
    }
    async buildDashboardData(organizationId, enablers, assessments, plans, timeframe) {
        const now = new Date();
        const reportingPeriod = timeframe || {
            startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            endDate: now
        };
        // Calculate overall maturity score
        const overallMaturityScore = this.calculateOverallMaturityScore(enablers);
        // Group by category
        const maturityByCategory = this.calculateMaturityByCategory(enablers);
        // Calculate maturity trend (simplified - would need historical data)
        const maturityTrend = this.calculateMaturityTrend(assessments);
        // Risk analysis
        const risksByLevel = this.calculateRisksByLevel(enablers);
        const risksByCategory = this.calculateRisksByCategory(enablers);
        // Implementation progress
        const enablersByStatus = this.calculateEnablersByStatus(enablers);
        // Assessment tracking
        const upcomingAssessments = this.getUpcomingAssessments(enablers);
        const overdueAssessments = this.getOverdueAssessments(enablers, assessments);
        // Initiative tracking
        const activeInitiatives = plans.filter(p => p.status === 'In_Progress').length;
        const completedInitiatives = plans.filter(p => p.status === 'Completed').length;
        const initiativeProgress = this.calculateInitiativeProgress(plans);
        // KPIs
        const kpis = this.calculateKPIs(enablers, assessments, plans);
        // NIST control coverage
        const nistControlCoverage = await this.getNistControlCoverage(organizationId);
        // Normalize reportingPeriod format
        const normalizedReportingPeriod = timeframe ? {
            startDate: timeframe.start,
            endDate: timeframe.end
        } : reportingPeriod;
        return {
            organizationId,
            generatedAt: now,
            reportingPeriod: normalizedReportingPeriod,
            overallMaturityScore,
            maturityByCategory,
            maturityTrend,
            totalRisks: Object.values(risksByLevel).reduce((sum, count) => sum + count, 0),
            risksByLevel,
            risksByCategory,
            enablersByStatus,
            upcomingAssessments,
            overdueAssessments,
            activeInitiatives,
            completedInitiatives,
            initiativeProgress,
            kpis,
            nistControlCoverage
        };
    }
    async buildMaturityReport(organizationId, enablers, assessments, plans, category) {
        const reportId = this.generateId();
        const now = new Date();
        // Build report content based on enablers, assessments, and plans
        const executiveSummary = this.generateExecutiveSummary(enablers, category);
        const findings = this.generateReportFindings(enablers, assessments);
        const recommendations = this.generateReportRecommendations(enablers, plans);
        // Data analysis
        const maturityScores = this.calculateMaturityByCategory(enablers);
        const riskSummary = this.calculateRisksByCategory(enablers);
        const improvementProgress = this.calculateInitiativeProgress(plans);
        // Charts and visualizations
        const charts = this.generateReportCharts(enablers, assessments, plans);
        return {
            reportId,
            organizationId,
            generatedAt: now,
            reportType: category ? 'Detailed' : 'Summary',
            executiveSummary,
            findings,
            recommendations,
            maturityScores,
            riskSummary,
            improvementProgress,
            charts,
            attachments: [], // Would be populated with actual artifacts
            generatedBy: 'system', // Would be passed as parameter
            distributionList: [], // Would be configured
            classification: 'Unclassified' // Would be configured
        };
    }
    calculateOverallMaturityScore(enablers) {
        if (enablers.length === 0)
            return 0;
        const maturityValues = {
            'Initial': 1,
            'Developing': 2,
            'Defined': 3,
            'Managed': 4,
            'Optimizing': 5
        };
        const totalScore = enablers.reduce((sum, enabler) => {
            return sum + maturityValues[enabler.maturityLevel];
        }, 0);
        return Math.round((totalScore / (enablers.length * 5)) * 100);
    }
    calculateMaturityByCategory(enablers) {
        const categories = ['Doctrine', 'Organization', 'Training', 'Materiel', 'Leadership', 'Personnel', 'Facilities', 'Policy'];
        return categories.map(category => {
            const categoryEnablers = enablers.filter(e => e.category === category);
            if (categoryEnablers.length === 0) {
                return {
                    category,
                    currentLevel: 'Initial',
                    targetLevel: 'Defined',
                    enablerCount: 0,
                    averageScore: 0,
                    trendDirection: 'Stable',
                    lastAssessmentDate: new Date(),
                    nextAssessmentDue: new Date()
                };
            }
            const averageScore = this.calculateCategoryAverageScore(categoryEnablers);
            const currentLevel = this.scoreToMaturityLevel(averageScore);
            return {
                category,
                currentLevel,
                targetLevel: this.calculateTargetLevel(categoryEnablers),
                enablerCount: categoryEnablers.length,
                averageScore,
                trendDirection: 'Stable', // Would calculate from historical data
                lastAssessmentDate: this.getLatestAssessmentDate(categoryEnablers),
                nextAssessmentDue: this.getNextAssessmentDue(categoryEnablers)
            };
        });
    }
    calculateCategoryAverageScore(enablers) {
        const maturityValues = {
            'Initial': 1,
            'Developing': 2,
            'Defined': 3,
            'Managed': 4,
            'Optimizing': 5
        };
        const totalScore = enablers.reduce((sum, enabler) => {
            return sum + maturityValues[enabler.maturityLevel];
        }, 0);
        return Math.round((totalScore / enablers.length) * 20); // Convert to 0-100 scale
    }
    scoreToMaturityLevel(score) {
        if (score >= 80)
            return 'Optimizing';
        if (score >= 60)
            return 'Managed';
        if (score >= 40)
            return 'Defined';
        if (score >= 20)
            return 'Developing';
        return 'Initial';
    }
    calculateTargetLevel(enablers) {
        // Find the most common target level
        const targets = enablers.map(e => e.targetMaturityLevel);
        const targetCounts = targets.reduce((acc, target) => {
            acc[target] = (acc[target] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(targetCounts).reduce((a, b) => targetCounts[a] > targetCounts[b] ? a : b);
    }
    getLatestAssessmentDate(enablers) {
        const dates = enablers
            .map(e => e.lastAssessedDate)
            .filter(date => date)
            .sort((a, b) => b.getTime() - a.getTime());
        return dates[0] || new Date();
    }
    getNextAssessmentDue(enablers) {
        const dates = enablers
            .map(e => e.nextAssessmentDue)
            .filter(date => date)
            .sort((a, b) => a.getTime() - b.getTime());
        return dates[0] || new Date();
    }
    calculateMaturityTrend(assessments) {
        // Simplified trend calculation - would need proper time series analysis
        return [{
                date: new Date(),
                overallScore: 65,
                categoryScores: {
                    'Doctrine': 70,
                    'Organization': 65,
                    'Training': 60,
                    'Materiel': 75,
                    'Leadership': 80,
                    'Personnel': 55,
                    'Facilities': 70,
                    'Policy': 60
                }
            }];
    }
    calculateRisksByLevel(enablers) {
        return enablers.reduce((acc, enabler) => {
            acc[enabler.riskLevel] = (acc[enabler.riskLevel] || 0) + 1;
            return acc;
        }, {});
    }
    calculateRisksByCategory(enablers) {
        const categories = ['Doctrine', 'Organization', 'Training', 'Materiel', 'Leadership', 'Personnel', 'Facilities', 'Policy'];
        return categories.map(category => {
            const categoryEnablers = enablers.filter(e => e.category === category);
            const risks = categoryEnablers.filter(e => e.riskLevel === 'High' || e.riskLevel === 'Very_High');
            return {
                category,
                totalRisks: categoryEnablers.length,
                highRisks: risks.length,
                averageRiskScore: this.calculateAverageRiskScore(categoryEnablers),
                trendDirection: 'Stable'
            };
        });
    }
    calculateAverageRiskScore(enablers) {
        const riskValues = {
            'Very_Low': 1,
            'Low': 2,
            'Moderate': 3,
            'High': 4,
            'Very_High': 5
        };
        if (enablers.length === 0)
            return 0;
        const totalScore = enablers.reduce((sum, enabler) => {
            return sum + riskValues[enabler.riskLevel];
        }, 0);
        return Math.round((totalScore / enablers.length) * 20); // Convert to 0-100 scale
    }
    calculateEnablersByStatus(enablers) {
        return enablers.reduce((acc, enabler) => {
            acc[enabler.status] = (acc[enabler.status] || 0) + 1;
            return acc;
        }, {});
    }
    getUpcomingAssessments(enablers) {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return enablers
            .filter(e => e.nextAssessmentDue <= thirtyDaysFromNow)
            .map(e => ({
            id: 'upcoming-' + e.id,
            enablerId: e.id,
            organizationId: e.organizationId,
            assessmentType: 'Continuous_Monitoring',
            assessmentDate: e.nextAssessmentDue,
            assessor: 'TBD',
            currentMaturityLevel: e.maturityLevel,
            findings: [],
            recommendations: [],
            overallScore: 0,
            evidenceCollected: [],
            assessmentNotes: 'Upcoming assessment',
            status: 'Draft',
            createdAt: now,
            updatedAt: now
        }));
    }
    getOverdueAssessments(enablers, assessments) {
        const now = new Date();
        return enablers
            .filter(e => e.nextAssessmentDue < now)
            .map(e => {
            const latestAssessment = assessments
                .filter(a => a.enablerId === e.id)
                .sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())[0];
            return latestAssessment || {
                id: 'overdue-' + e.id,
                enablerId: e.id,
                organizationId: e.organizationId,
                assessmentType: 'Continuous_Monitoring',
                assessmentDate: e.nextAssessmentDue,
                assessor: 'TBD',
                currentMaturityLevel: e.maturityLevel,
                findings: [],
                recommendations: [],
                overallScore: 0,
                evidenceCollected: [],
                assessmentNotes: 'Overdue assessment',
                status: 'Draft',
                createdAt: now,
                updatedAt: now
            };
        });
    }
    calculateInitiativeProgress(plans) {
        return plans
            .filter(p => p.status === 'In_Progress')
            .map(plan => ({
            initiativeId: plan.id,
            name: plan.name,
            category: plan.initiatives[0]?.category || 'Organization',
            progress: plan.overallProgress,
            status: plan.status,
            dueDate: plan.targetCompletionDate,
            isOnTrack: this.isInitiativeOnTrack(plan)
        }));
    }
    isInitiativeOnTrack(plan) {
        const now = new Date();
        const totalDuration = plan.targetCompletionDate.getTime() - plan.startDate.getTime();
        const elapsedDuration = now.getTime() - plan.startDate.getTime();
        const expectedProgress = (elapsedDuration / totalDuration) * 100;
        return plan.overallProgress >= (expectedProgress - 10); // 10% tolerance
    }
    calculateKPIs(enablers, assessments, plans) {
        return [
            {
                name: 'Overall Maturity Score',
                description: 'Average maturity score across all DOTmLPF-P categories',
                value: this.calculateOverallMaturityScore(enablers),
                unit: '%',
                target: 80,
                status: 'On_Target',
                trendDirection: 'Improving',
                lastUpdated: new Date()
            },
            {
                name: 'Assessment Compliance',
                description: 'Percentage of enablers with up-to-date assessments',
                value: this.calculateAssessmentCompliance(enablers),
                unit: '%',
                target: 95,
                status: 'At_Risk',
                trendDirection: 'Stable',
                lastUpdated: new Date()
            },
            {
                name: 'Risk Mitigation Rate',
                description: 'Percentage of high risks with mitigation plans',
                value: this.calculateRiskMitigationRate(enablers, plans),
                unit: '%',
                target: 90,
                status: 'On_Target',
                trendDirection: 'Improving',
                lastUpdated: new Date()
            }
        ];
    }
    calculateAssessmentCompliance(enablers) {
        const now = new Date();
        const upToDateCount = enablers.filter(e => e.nextAssessmentDue > now).length;
        return enablers.length > 0 ? Math.round((upToDateCount / enablers.length) * 100) : 0;
    }
    calculateRiskMitigationRate(enablers, plans) {
        const highRiskEnablers = enablers.filter(e => e.riskLevel === 'High' || e.riskLevel === 'Very_High');
        if (highRiskEnablers.length === 0)
            return 100;
        const mitigatedCount = highRiskEnablers.filter(enabler => {
            return plans.some(plan => plan.initiatives.some(initiative => initiative.description.includes(enabler.id) ||
                initiative.name.includes(enabler.name)));
        }).length;
        return Math.round((mitigatedCount / highRiskEnablers.length) * 100);
    }
    async calculateNistControlCoverage(enablers, customMappings) {
        // This would integrate with NIST control framework data
        // For now, return a simplified example
        return enablers.flatMap(enabler => enabler.mappedNistControls.map(controlId => ({
            controlId,
            controlName: `NIST Control ${controlId}`,
            category: enabler.category,
            coverageLevel: this.determineCoverageLevel(enabler),
            mappedEnablers: [enabler.id],
            gaps: this.identifyGaps(enabler),
            recommendations: this.generateCoverageRecommendations(enabler)
        })));
    }
    determineCoverageLevel(enabler) {
        if (enabler.status === 'Completed' && enabler.maturityLevel === 'Optimizing') {
            return 'Full';
        }
        else if (enabler.status === 'Completed' || enabler.maturityLevel === 'Managed') {
            return 'Partial';
        }
        else if (enabler.status === 'In_Progress') {
            return 'Minimal';
        }
        return 'None';
    }
    identifyGaps(enabler) {
        const gaps = [];
        if (enabler.status !== 'Completed') {
            gaps.push('Implementation not complete');
        }
        if (enabler.evidenceArtifacts.length === 0) {
            gaps.push('No evidence artifacts collected');
        }
        if (enabler.riskLevel === 'High' || enabler.riskLevel === 'Very_High') {
            gaps.push('High risk level requires attention');
        }
        return gaps;
    }
    generateCoverageRecommendations(enabler) {
        const recommendations = [];
        if (enabler.status !== 'Completed') {
            recommendations.push('Complete enabler implementation');
        }
        if (enabler.maturityLevel !== enabler.targetMaturityLevel) {
            recommendations.push(`Improve maturity from ${enabler.maturityLevel} to ${enabler.targetMaturityLevel}`);
        }
        return recommendations;
    }
    generateExecutiveSummary(enablers, category) {
        const scope = category ? `${category} category` : 'all DOTmLPF-P categories';
        const overallScore = this.calculateOverallMaturityScore(enablers);
        const highRiskCount = enablers.filter(e => e.riskLevel === 'High' || e.riskLevel === 'Very_High').length;
        return `This maturity assessment covers ${scope} with ${enablers.length} execution enablers. The overall maturity score is ${overallScore}%, indicating ${overallScore >= 80 ? 'optimized' : overallScore >= 60 ? 'managed' : 'developing'} organizational capabilities. ${highRiskCount} high-risk areas require immediate attention to maintain cATO compliance.`;
    }
    generateReportFindings(enablers, assessments) {
        // Generate findings based on enablers and assessments
        return assessments.flatMap(assessment => assessment.findings.map(finding => ({
            category: finding.category,
            finding: finding.finding,
            severity: finding.severity,
            impact: finding.impact,
            evidence: [finding.evidence]
        })));
    }
    generateReportRecommendations(enablers, plans) {
        // Generate recommendations based on enablers and plans
        return plans.flatMap(plan => plan.initiatives.map(initiative => ({
            category: initiative.category,
            recommendation: initiative.description,
            priority: this.mapStatusToPriority(initiative.status),
            estimatedEffort: `${initiative.estimatedHours} hours`,
            expectedBenefits: initiative.expectedBenefits
        })));
    }
    mapStatusToPriority(status) {
        switch (status) {
            case 'Blocked': return 'Immediate';
            case 'In_Progress': return 'Short_Term';
            default: return 'Long_Term';
        }
    }
    generateReportCharts(enablers, assessments, plans) {
        return [
            {
                chartType: 'Radar',
                title: 'Maturity by Category',
                data: this.calculateMaturityByCategory(enablers),
                metadata: {
                    xAxisLabel: 'Category',
                    yAxisLabel: 'Maturity Score'
                }
            },
            {
                chartType: 'Bar',
                title: 'Risk Distribution',
                data: this.calculateRisksByLevel(enablers),
                metadata: {
                    xAxisLabel: 'Risk Level',
                    yAxisLabel: 'Count'
                }
            }
        ];
    }
    getDefaultConfiguration(organizationId) {
        const now = new Date();
        return {
            organizationId,
            maturityModel: {
                levels: [
                    {
                        level: 'Initial',
                        name: 'Initial',
                        description: 'Ad hoc, chaotic processes',
                        criteria: ['No documented processes', 'Reactive approach'],
                        scoreRange: { min: 0, max: 20 }
                    },
                    {
                        level: 'Developing',
                        name: 'Developing',
                        description: 'Some processes defined',
                        criteria: ['Basic documentation', 'Some repeatability'],
                        scoreRange: { min: 21, max: 40 }
                    },
                    {
                        level: 'Defined',
                        name: 'Defined',
                        description: 'Processes documented and standardized',
                        criteria: ['Well-documented processes', 'Standardized approach'],
                        scoreRange: { min: 41, max: 60 }
                    },
                    {
                        level: 'Managed',
                        name: 'Managed',
                        description: 'Processes measured and controlled',
                        criteria: ['Metrics collection', 'Process control'],
                        scoreRange: { min: 61, max: 80 }
                    },
                    {
                        level: 'Optimizing',
                        name: 'Optimizing',
                        description: 'Focus on continuous improvement',
                        criteria: ['Continuous improvement', 'Innovation'],
                        scoreRange: { min: 81, max: 100 }
                    }
                ],
                scoringWeights: {
                    'Doctrine': 1.0,
                    'Organization': 1.2,
                    'Training': 1.1,
                    'Materiel': 1.0,
                    'Leadership': 1.3,
                    'Personnel': 1.1,
                    'Facilities': 0.9,
                    'Policy': 1.2
                },
                customCriteria: []
            },
            assessmentFrequency: {
                'Doctrine': 180, // 6 months
                'Organization': 90, // 3 months
                'Training': 120, // 4 months
                'Materiel': 180, // 6 months
                'Leadership': 60, // 2 months
                'Personnel': 90, // 3 months
                'Facilities': 365, // 1 year
                'Policy': 120 // 4 months
            },
            mandatoryAssessors: {
                'Doctrine': ['ISSO', 'ISSM'],
                'Organization': ['AO', 'RMO'],
                'Training': ['Training_Officer'],
                'Materiel': ['System_Admin'],
                'Leadership': ['AO'],
                'Personnel': ['HR_Lead', 'Security_Officer'],
                'Facilities': ['Facilities_Manager'],
                'Policy': ['ISSO', 'Compliance_Officer']
            },
            notificationSettings: {
                assessmentReminders: {
                    enabled: true,
                    daysBefore: [30, 14, 7, 1],
                    recipients: ['enabler.ownerRole']
                },
                riskAlerts: {
                    enabled: true,
                    riskThreshold: 'High',
                    recipients: ['AO', 'ISSO', 'RMO']
                },
                improvementUpdates: {
                    enabled: true,
                    frequency: 'Weekly',
                    recipients: ['plan.sponsor']
                }
            },
            nistFrameworkVersion: 'SP800-53 Rev5',
            customControlMappings: [],
            approvalWorkflow: {
                assessmentApproval: [
                    {
                        stepOrder: 1,
                        stepName: 'Technical Review',
                        requiredRoles: ['ISSO'],
                        requiredApprovals: 1,
                        timeoutDays: 5,
                        escalationRoles: ['ISSM']
                    },
                    {
                        stepOrder: 2,
                        stepName: 'Management Approval',
                        requiredRoles: ['AO'],
                        requiredApprovals: 1,
                        timeoutDays: 3,
                        escalationRoles: ['Senior_Leadership']
                    }
                ],
                improvementPlanApproval: [
                    {
                        stepOrder: 1,
                        stepName: 'Resource Review',
                        requiredRoles: ['RMO'],
                        requiredApprovals: 1,
                        timeoutDays: 7,
                        escalationRoles: ['Senior_Leadership']
                    },
                    {
                        stepOrder: 2,
                        stepName: 'Executive Approval',
                        requiredRoles: ['AO'],
                        requiredApprovals: 1,
                        timeoutDays: 5
                    }
                ],
                riskAcceptanceApproval: [
                    {
                        stepOrder: 1,
                        stepName: 'Risk Assessment',
                        requiredRoles: ['ISSO', 'ISSM'],
                        requiredApprovals: 2,
                        timeoutDays: 5
                    },
                    {
                        stepOrder: 2,
                        stepName: 'Authorization',
                        requiredRoles: ['AO'],
                        requiredApprovals: 1,
                        timeoutDays: 3
                    }
                ]
            },
            createdAt: now,
            updatedAt: now
        };
    }
    async logEvent(event) {
        try {
            // In a real implementation, this would write to an events/notifications system
            console.log('DOTmLPF-P Event:', event);
            // Create notifications for recipients
            for (const recipientId of event.recipients) {
                const notification = {
                    notificationId: this.generateId(),
                    eventId: event.eventId,
                    recipientId,
                    subject: event.title,
                    message: event.description,
                    actionRequired: event.eventType === 'Risk_Identified' || event.eventType === 'Assessment_Due',
                    deliveryMethod: 'Email',
                    sentAt: new Date(),
                    retryCount: 0,
                    deliveryStatus: 'Pending'
                };
                // Queue notification for delivery
                console.log('Queuing notification:', notification);
            }
        }
        catch (error) {
            console.error('Error logging event:', error);
            // Don't throw - logging should not break the main operation
        }
    }
    generateId() {
        return `dotmlpfp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    mapToExecutionEnabler(resource) {
        return {
            ...resource,
            createdAt: new Date(resource.createdAt),
            updatedAt: new Date(resource.updatedAt),
            lastAssessedDate: resource.lastAssessedDate ? new Date(resource.lastAssessedDate) : new Date(),
            nextAssessmentDue: resource.nextAssessmentDue ? new Date(resource.nextAssessmentDue) : new Date(),
            evidenceArtifacts: resource.evidenceArtifacts || [],
            metrics: resource.metrics || []
        };
    }
    mapToEnablerAssessment(resource) {
        return {
            ...resource,
            assessmentDate: new Date(resource.assessmentDate),
            reviewedDate: resource.reviewedDate ? new Date(resource.reviewedDate) : undefined,
            createdAt: new Date(resource.createdAt),
            updatedAt: new Date(resource.updatedAt),
            findings: resource.findings || [],
            recommendations: resource.recommendations || [],
            evidenceCollected: resource.evidenceCollected || []
        };
    }
    mapToImprovementPlan(resource) {
        return {
            ...resource,
            startDate: new Date(resource.startDate),
            targetCompletionDate: new Date(resource.targetCompletionDate),
            approvedDate: new Date(resource.approvedDate),
            createdAt: new Date(resource.createdAt),
            updatedAt: new Date(resource.updatedAt),
            targetState: resource.targetState || [],
            initiatives: resource.initiatives || [],
            resourcesAssigned: resource.resourcesAssigned || []
        };
    }
    mapToConfiguration(resource) {
        return {
            ...resource,
            createdAt: new Date(resource.createdAt),
            updatedAt: new Date(resource.updatedAt)
        };
    }
}
