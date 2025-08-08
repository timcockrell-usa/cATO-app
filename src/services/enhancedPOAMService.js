/**
 * Enhanced POA&M Service with DoD Approval Workflow
 * Implements the complete DoD approval hierarchy for exception requests and POA&M management
 */
import { CosmosClient } from '@azure/cosmos';
import { rbacService } from './enhancedRBACService';
// Cosmos DB configuration
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    key: import.meta.env.VITE_COSMOS_DB_KEY || 'your-cosmos-key',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
class EnhancedPOAMService {
    constructor() {
        this.client = new CosmosClient({
            endpoint: cosmosConfig.endpoint,
            key: cosmosConfig.key,
        });
        this.container = this.client.database(cosmosConfig.databaseId).container('enhanced-poam-items');
    }
    /**
     * Create a new POA&M item
     */
    async createPOAM(poam) {
        const newPOAM = {
            ...poam,
            id: `poam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            approvalStatus: 'Draft',
            approvalLevel: 0,
            approvalHistory: []
        };
        try {
            const { resource } = await this.container.items.create(newPOAM);
            return resource;
        }
        catch (error) {
            console.error('Error creating POA&M:', error);
            throw error;
        }
    }
    /**
     * Get POA&M by ID
     */
    async getPOAM(poamId, tenantId) {
        try {
            const { resource } = await this.container.item(poamId, tenantId).read();
            return resource;
        }
        catch (error) {
            if (error.code === 404) {
                return null;
            }
            console.error('Error getting POA&M:', error);
            throw error;
        }
    }
    /**
     * Get all POA&Ms for a tenant
     */
    async getPOAMsForTenant(tenantId) {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
                parameters: [{ name: '@tenantId', value: tenantId }]
            };
            const { resources } = await this.container.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error getting POA&Ms for tenant:', error);
            throw error;
        }
    }
    /**
     * Get POA&Ms pending approval for a user
     */
    async getPendingApprovals(userId, userRole, tenantId) {
        try {
            const userApprovalLevel = rbacService.getApprovalLevel(userRole);
            const querySpec = {
                query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId 
          AND c.approvalLevel = @approvalLevel 
          AND c.approvalStatus IN (@status1, @status2, @status3, @status4, @status5)
        `,
                parameters: [
                    { name: '@tenantId', value: tenantId },
                    { name: '@approvalLevel', value: userApprovalLevel },
                    { name: '@status1', value: 'ISSE_Review' },
                    { name: '@status2', value: 'ISSO_Review' },
                    { name: '@status3', value: 'ISSM_Review' },
                    { name: '@status4', value: 'RMO_Review' },
                    { name: '@status5', value: 'AO_Review' }
                ]
            };
            const { resources } = await this.container.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error('Error getting pending approvals:', error);
            throw error;
        }
    }
    /**
     * Submit POA&M for approval workflow
     */
    async submitForApproval(poamId, tenantId, submittedBy) {
        const poam = await this.getPOAM(poamId, tenantId);
        if (!poam) {
            throw new Error('POA&M not found');
        }
        if (poam.approvalStatus !== 'Draft') {
            throw new Error('POA&M is not in draft status');
        }
        // Move to first approval level (ISSE Review)
        const updatedPOAM = {
            ...poam,
            approvalStatus: 'ISSE_Review',
            approvalLevel: 1,
            submittedDate: new Date().toISOString(),
            lastActionDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: poam.version + 1,
            approvalHistory: [
                ...poam.approvalHistory,
                {
                    id: `approval-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    actorId: submittedBy,
                    actorRole: 'SecurityEngineer',
                    action: 'approve',
                    fromStatus: 'Draft',
                    toStatus: 'ISSE_Review',
                    comments: 'Submitted for approval workflow'
                }
            ]
        };
        try {
            const { resource } = await this.container.item(poamId, tenantId).replace(updatedPOAM);
            return resource;
        }
        catch (error) {
            console.error('Error submitting POA&M for approval:', error);
            throw error;
        }
    }
    /**
     * Request exception for POA&M
     */
    async requestException(poamId, tenantId, exceptionRequest, requestedBy) {
        const poam = await this.getPOAM(poamId, tenantId);
        if (!poam) {
            throw new Error('POA&M not found');
        }
        const updatedPOAM = {
            ...poam,
            exceptionType: exceptionRequest.exceptionType,
            justification: exceptionRequest.justification,
            riskAcceptanceStatement: exceptionRequest.riskAcceptanceStatement,
            compensatingControls: exceptionRequest.compensatingControls,
            approvalStatus: 'ISSE_Review',
            approvalLevel: 1,
            submittedBy: requestedBy,
            submittedDate: new Date().toISOString(),
            lastActionDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: poam.version + 1,
            approvalHistory: [
                ...poam.approvalHistory,
                {
                    id: `approval-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    actorId: requestedBy,
                    actorRole: 'SecurityEngineer',
                    action: 'approve',
                    fromStatus: poam.approvalStatus,
                    toStatus: 'ISSE_Review',
                    comments: `Exception requested: ${exceptionRequest.exceptionType}`
                }
            ]
        };
        try {
            const { resource } = await this.container.item(poamId, tenantId).replace(updatedPOAM);
            return resource;
        }
        catch (error) {
            console.error('Error requesting exception:', error);
            throw error;
        }
    }
    /**
     * Process approval action (approve, reject, request modification, etc.)
     */
    async processApprovalAction(poamId, tenantId, actionRequest, actorId, actorRole) {
        const poam = await this.getPOAM(poamId, tenantId);
        if (!poam) {
            throw new Error('POA&M not found');
        }
        // Validate user has authority to approve at current level
        const userApprovalLevel = rbacService.getApprovalLevel(actorRole);
        if (userApprovalLevel < poam.approvalLevel) {
            throw new Error('Insufficient approval authority for current level');
        }
        let newStatus;
        let newApprovalLevel = poam.approvalLevel;
        switch (actionRequest.action) {
            case 'approve':
                ({ newStatus, newApprovalLevel } = this.getNextApprovalStatus(poam.approvalLevel));
                break;
            case 'reject':
                newStatus = 'Rejected';
                newApprovalLevel = 0;
                break;
            case 'request_modification':
                newStatus = 'Requires_Modification';
                break;
            case 'escalate':
                const nextLevel = rbacService.getNextApprovalLevel(poam.approvalLevel);
                if (nextLevel) {
                    newApprovalLevel = nextLevel;
                    newStatus = this.getStatusForLevel(nextLevel);
                }
                else {
                    throw new Error('No higher approval level available');
                }
                break;
            case 'delegate':
                if (!actionRequest.delegateToUserId) {
                    throw new Error('Delegate user ID required for delegation');
                }
                newStatus = poam.approvalStatus; // Keep same status, just change approver
                break;
            default:
                throw new Error(`Unknown approval action: ${actionRequest.action}`);
        }
        const historyEntry = {
            id: `approval-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorId,
            actorRole,
            action: actionRequest.action,
            fromStatus: poam.approvalStatus,
            toStatus: newStatus,
            comments: actionRequest.comments
        };
        const updatedPOAM = {
            ...poam,
            approvalStatus: newStatus,
            approvalLevel: newApprovalLevel,
            currentApprover: actionRequest.delegateToUserId || undefined,
            lastActionDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: poam.version + 1,
            approvalHistory: [...poam.approvalHistory, historyEntry]
        };
        // Set approval date if fully approved
        if (newStatus === 'Approved') {
            updatedPOAM.approvedDate = new Date().toISOString();
        }
        try {
            const { resource } = await this.container.item(poamId, tenantId).replace(updatedPOAM);
            return resource;
        }
        catch (error) {
            console.error('Error processing approval action:', error);
            throw error;
        }
    }
    /**
     * Get next approval status and level
     */
    getNextApprovalStatus(currentLevel) {
        switch (currentLevel) {
            case 1:
                return { newStatus: 'ISSO_Review', newApprovalLevel: 2 };
            case 2:
                return { newStatus: 'ISSM_Review', newApprovalLevel: 3 };
            case 3:
                return { newStatus: 'RMO_Review', newApprovalLevel: 4 };
            case 4:
                return { newStatus: 'AO_Review', newApprovalLevel: 5 };
            case 5:
                return { newStatus: 'Approved', newApprovalLevel: 5 };
            default:
                throw new Error(`Invalid approval level: ${currentLevel}`);
        }
    }
    /**
     * Get status for approval level
     */
    getStatusForLevel(level) {
        switch (level) {
            case 1: return 'ISSE_Review';
            case 2: return 'ISSO_Review';
            case 3: return 'ISSM_Review';
            case 4: return 'RMO_Review';
            case 5: return 'AO_Review';
            default: throw new Error(`Invalid approval level: ${level}`);
        }
    }
    /**
     * Get POA&M statistics for dashboard
     */
    async getPOAMStatistics(tenantId) {
        try {
            const poams = await this.getPOAMsForTenant(tenantId);
            const statistics = {
                total: poams.length,
                byStatus: {},
                byRiskLevel: {},
                pendingApproval: 0,
                overdue: 0,
                avgApprovalTime: 0
            };
            // Initialize status counts
            const allStatuses = [
                'Draft', 'Submitted', 'ISSE_Review', 'ISSO_Review', 'ISSM_Review',
                'RMO_Review', 'AO_Review', 'Approved', 'Rejected', 'Requires_Modification', 'Withdrawn'
            ];
            allStatuses.forEach(status => {
                statistics.byStatus[status] = 0;
            });
            const approvalTimes = [];
            const currentDate = new Date();
            poams.forEach(poam => {
                // Count by status
                statistics.byStatus[poam.approvalStatus]++;
                // Count by risk level
                statistics.byRiskLevel[poam.riskLevel] = (statistics.byRiskLevel[poam.riskLevel] || 0) + 1;
                // Count pending approvals
                if (['ISSE_Review', 'ISSO_Review', 'ISSM_Review', 'RMO_Review', 'AO_Review'].includes(poam.approvalStatus)) {
                    statistics.pendingApproval++;
                }
                // Count overdue items
                if (poam.targetApprovalDate && new Date(poam.targetApprovalDate) < currentDate && poam.approvalStatus !== 'Approved') {
                    statistics.overdue++;
                }
                // Calculate approval times
                if (poam.approvedDate && poam.submittedDate) {
                    const approvalTime = new Date(poam.approvedDate).getTime() - new Date(poam.submittedDate).getTime();
                    approvalTimes.push(approvalTime / (1000 * 60 * 60 * 24)); // Convert to days
                }
            });
            // Calculate average approval time
            if (approvalTimes.length > 0) {
                statistics.avgApprovalTime = approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length;
            }
            return statistics;
        }
        catch (error) {
            console.error('Error getting POA&M statistics:', error);
            throw error;
        }
    }
    /**
     * Get approval workflow status for a POA&M
     */
    async getApprovalWorkflowStatus(poamId, tenantId) {
        const poam = await this.getPOAM(poamId, tenantId);
        if (!poam) {
            throw new Error('POA&M not found');
        }
        const hierarchy = rbacService.getApprovalHierarchy();
        const nextApprovers = rbacService.getRolesForApprovalLevel(poam.approvalLevel);
        const workflowProgress = hierarchy.map(level => {
            let status;
            let completedAt;
            let approver;
            if (level.level < poam.approvalLevel) {
                status = 'completed';
                // Find completion info from approval history
                const historyEntry = poam.approvalHistory.find(entry => entry.action === 'approve' && rbacService.getApprovalLevel(entry.actorRole) === level.level);
                completedAt = historyEntry?.timestamp;
                approver = historyEntry?.actorId;
            }
            else if (level.level === poam.approvalLevel) {
                status = 'current';
            }
            else {
                status = 'pending';
            }
            return {
                level: level.level,
                role: level.roles,
                status,
                completedAt,
                approver
            };
        });
        return {
            currentLevel: poam.approvalLevel,
            nextApprovers,
            workflowProgress
        };
    }
    /**
     * Update POA&M
     */
    async updatePOAM(poam) {
        const updatedPOAM = {
            ...poam,
            updatedAt: new Date().toISOString(),
            version: poam.version + 1
        };
        try {
            const { resource } = await this.container.item(poam.id, poam.tenantId).replace(updatedPOAM);
            return resource;
        }
        catch (error) {
            console.error('Error updating POA&M:', error);
            throw error;
        }
    }
    /**
     * Delete POA&M
     */
    async deletePOAM(poamId, tenantId) {
        try {
            await this.container.item(poamId, tenantId).delete();
        }
        catch (error) {
            console.error('Error deleting POA&M:', error);
            throw error;
        }
    }
}
// Singleton instance
export const enhancedPOAMService = new EnhancedPOAMService();
export { EnhancedPOAMService };
