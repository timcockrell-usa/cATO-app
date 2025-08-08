/**
 * Tenant Management Service
 * Handles multi-tenant operations, onboarding, and RBAC management
 */
import enhancedCosmosService from './enhancedCosmosService';
import enhancedNISTControlsMultiCloud from '../data/nistControlsMultiCloud';
import enhancedZTAActivitiesMultiCloud from '../data/ztaActivitiesMultiCloud';
export class TenantManagementService {
    // Tenant Onboarding
    async createTenant(tenantData) {
        try {
            const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const tenant = {
                id: tenantId,
                organizationName: tenantData.organizationName,
                organizationType: tenantData.organizationType,
                nistRevision: tenantData.nistRevision,
                fedRampLevel: tenantData.fedRampLevel,
                databaseEndpoint: process.env.COSMOS_DB_ENDPOINT || '',
                keyVaultUri: `https://${tenantId}-kv.vault.azure.net/`,
                roles: [{
                        userId: tenantData.adminUser.userId,
                        email: tenantData.adminUser.email,
                        role: 'authorizing-officer',
                        permissions: this.getPermissionsForRole('authorizing-officer'),
                        assignedAt: new Date().toISOString(),
                        assignedBy: 'system'
                    }],
                cloudEnvironments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            };
            // Create tenant in database
            const createdTenant = await enhancedCosmosService.createTenant(tenant);
            // Initialize default NIST controls for the tenant
            await this.initializeTenantControls(tenantId, tenantData.nistRevision);
            // Initialize default ZTA activities for the tenant
            await this.initializeTenantZTAActivities(tenantId);
            // Create dedicated Key Vault for tenant (would be implemented with Azure SDK)
            await this.createTenantKeyVault(tenantId);
            return createdTenant;
        }
        catch (error) {
            console.error('Error creating tenant:', error);
            throw error;
        }
    }
    // Initialize NIST controls for new tenant
    async initializeTenantControls(tenantId, nistRevision) {
        try {
            const controlsToCreate = enhancedNISTControlsMultiCloud
                .filter(control => control.nistRevision === nistRevision)
                .map(control => ({
                ...control,
                id: `${tenantId}-${control.controlIdentifier}`,
                tenantId,
                environmentStatus: {},
                overallStatus: 'not-assessed',
                overallRiskLevel: 'medium'
            }));
            // Create controls in batches to avoid overwhelming the database
            const batchSize = 10;
            for (let i = 0; i < controlsToCreate.length; i += batchSize) {
                const batch = controlsToCreate.slice(i, i + batchSize);
                await Promise.all(batch.map(control => enhancedCosmosService.createOrUpdateNISTControl(control)));
            }
            console.log(`Initialized ${controlsToCreate.length} NIST controls for tenant ${tenantId}`);
        }
        catch (error) {
            console.error('Error initializing tenant controls:', error);
            throw error;
        }
    }
    // Initialize ZTA activities for new tenant
    async initializeTenantZTAActivities(tenantId) {
        try {
            const activitiesToCreate = enhancedZTAActivitiesMultiCloud.map(activity => ({
                ...activity,
                id: `${tenantId}-${activity.activityId}`,
                tenantId,
                environmentStatus: {},
                overallStatus: 'not-started',
                overallMaturity: 0
            }));
            // Create activities in batches
            const batchSize = 10;
            for (let i = 0; i < activitiesToCreate.length; i += batchSize) {
                const batch = activitiesToCreate.slice(i, i + batchSize);
                await Promise.all(batch.map(activity => enhancedCosmosService.createOrUpdateZTAActivity(activity)));
            }
            console.log(`Initialized ${activitiesToCreate.length} ZTA activities for tenant ${tenantId}`);
        }
        catch (error) {
            console.error('Error initializing tenant ZTA activities:', error);
            throw error;
        }
    }
    // Create dedicated Key Vault for tenant
    async createTenantKeyVault(tenantId) {
        // This would use Azure SDK to create a dedicated Key Vault
        // For now, just log the operation
        console.log(`Creating Key Vault for tenant ${tenantId}`);
        // In production, this would:
        // 1. Create Azure Key Vault with tenant-specific name
        // 2. Configure access policies for the tenant
        // 3. Set up managed identity access
        // 4. Create initial secrets structure
    }
    // RBAC Management
    async assignRole(tenantId, userId, email, role, assignedBy) {
        try {
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            // Check if user already has a role
            const existingRoleIndex = tenant.roles.findIndex(r => r.userId === userId);
            const newRole = {
                userId,
                email,
                role,
                permissions: this.getPermissionsForRole(role),
                assignedAt: new Date().toISOString(),
                assignedBy
            };
            if (existingRoleIndex >= 0) {
                // Update existing role
                tenant.roles[existingRoleIndex] = newRole;
            }
            else {
                // Add new role
                tenant.roles.push(newRole);
            }
            tenant.updatedAt = new Date().toISOString();
            return await enhancedCosmosService.updateTenant(tenant);
        }
        catch (error) {
            console.error('Error assigning role:', error);
            throw error;
        }
    }
    async removeRole(tenantId, userId) {
        try {
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            tenant.roles = tenant.roles.filter(role => role.userId !== userId);
            tenant.updatedAt = new Date().toISOString();
            return await enhancedCosmosService.updateTenant(tenant);
        }
        catch (error) {
            console.error('Error removing role:', error);
            throw error;
        }
    }
    // Get permissions for DoD AO roles
    getPermissionsForRole(role) {
        const rolePermissions = {
            'basic-viewer': [
                'view_dashboard',
                'view_controls',
                'view_zta_activities',
                'view_compliance_reports'
            ],
            'engineer': [
                'view_dashboard',
                'view_controls',
                'view_zta_activities',
                'view_compliance_reports',
                'update_implementation_notes',
                'view_technical_details'
            ],
            'security-engineer-isse': [
                'view_dashboard',
                'view_controls',
                'view_zta_activities',
                'view_compliance_reports',
                'update_implementation_notes',
                'view_technical_details',
                'assess_controls',
                'create_security_documentation',
                'manage_security_tools'
            ],
            'isso': [
                'view_dashboard',
                'view_controls',
                'view_zta_activities',
                'view_compliance_reports',
                'update_implementation_notes',
                'view_technical_details',
                'assess_controls',
                'create_security_documentation',
                'manage_security_tools',
                'create_poam',
                'update_poam',
                'approve_low_risk_exceptions'
            ],
            'issm': [
                'view_dashboard',
                'view_controls',
                'view_zta_activities',
                'view_compliance_reports',
                'update_implementation_notes',
                'view_technical_details',
                'assess_controls',
                'create_security_documentation',
                'manage_security_tools',
                'create_poam',
                'update_poam',
                'approve_low_risk_exceptions',
                'approve_medium_risk_exceptions',
                'manage_security_policies',
                'conduct_security_reviews'
            ],
            'risk-management-officer': [
                'view_dashboard',
                'view_controls',
                'view_zta_activities',
                'view_compliance_reports',
                'view_technical_details',
                'assess_controls',
                'create_poam',
                'update_poam',
                'approve_low_risk_exceptions',
                'approve_medium_risk_exceptions',
                'approve_high_risk_exceptions',
                'manage_risk_assessments',
                'create_risk_reports'
            ],
            'authorizing-officer': [
                'view_dashboard',
                'view_controls',
                'view_zta_activities',
                'view_compliance_reports',
                'update_implementation_notes',
                'view_technical_details',
                'assess_controls',
                'create_security_documentation',
                'manage_security_tools',
                'create_poam',
                'update_poam',
                'approve_low_risk_exceptions',
                'approve_medium_risk_exceptions',
                'approve_high_risk_exceptions',
                'manage_risk_assessments',
                'create_risk_reports',
                'grant_ato',
                'revoke_ato',
                'manage_tenant_settings',
                'manage_user_roles',
                'approve_all_exceptions'
            ]
        };
        return rolePermissions[role] || [];
    }
    // Check if user has permission
    async hasPermission(tenantId, userId, permission) {
        try {
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (!tenant) {
                return false;
            }
            const userRole = tenant.roles.find(role => role.userId === userId);
            if (!userRole) {
                return false;
            }
            return userRole.permissions.includes(permission);
        }
        catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }
    // Cloud Environment Management
    async addCloudEnvironment(tenantId, environment) {
        try {
            const environmentId = `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const cloudEnvironment = {
                ...environment,
                id: environmentId,
                tenantId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const createdEnvironment = await enhancedCosmosService.createCloudEnvironment(cloudEnvironment);
            // Update tenant with new environment
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (tenant) {
                tenant.cloudEnvironments.push(environmentId);
                tenant.updatedAt = new Date().toISOString();
                await enhancedCosmosService.updateTenant(tenant);
            }
            return createdEnvironment;
        }
        catch (error) {
            console.error('Error adding cloud environment:', error);
            throw error;
        }
    }
    // NIST Revision Upgrade
    async upgradeNISTRevision(tenantId, newRevision) {
        try {
            const tenant = await enhancedCosmosService.getTenant(tenantId);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            if (tenant.nistRevision === newRevision) {
                throw new Error(`Tenant is already on NIST revision ${newRevision}`);
            }
            // Prevent downgrading
            if (tenant.nistRevision === '5' && newRevision === '4') {
                throw new Error('Downgrading from NIST Rev 5 to Rev 4 is not allowed');
            }
            // Get current controls
            const currentControls = await enhancedCosmosService.getNISTControls(tenantId);
            const currentControlIds = new Set(currentControls.map(c => c.controlIdentifier));
            // Get new revision controls
            const newRevisionControls = enhancedNISTControlsMultiCloud
                .filter(control => control.nistRevision === newRevision);
            const newRevisionControlIds = new Set(newRevisionControls.map(c => c.controlIdentifier));
            // Perform gap analysis
            const gapAnalysis = {
                newControls: newRevisionControls
                    .filter(c => !currentControlIds.has(c.controlIdentifier))
                    .map(c => c.controlIdentifier),
                modifiedControls: newRevisionControls
                    .filter(c => currentControlIds.has(c.controlIdentifier))
                    .map(c => c.controlIdentifier),
                deprecatedControls: currentControls
                    .filter(c => !newRevisionControlIds.has(c.controlIdentifier))
                    .map(c => c.controlIdentifier)
            };
            // Create new controls
            const controlsToCreate = newRevisionControls
                .filter(control => !currentControlIds.has(control.controlIdentifier))
                .map(control => ({
                ...control,
                id: `${tenantId}-${control.controlIdentifier}`,
                tenantId,
                environmentStatus: {},
                overallStatus: 'not-assessed',
                overallRiskLevel: 'medium'
            }));
            // Create new controls in batches
            const batchSize = 10;
            for (let i = 0; i < controlsToCreate.length; i += batchSize) {
                const batch = controlsToCreate.slice(i, i + batchSize);
                await Promise.all(batch.map(control => enhancedCosmosService.createOrUpdateNISTControl(control)));
            }
            // Update tenant revision
            tenant.nistRevision = newRevision;
            tenant.updatedAt = new Date().toISOString();
            await enhancedCosmosService.updateTenant(tenant);
            return {
                gapAnalysis,
                success: true
            };
        }
        catch (error) {
            console.error('Error upgrading NIST revision:', error);
            throw error;
        }
    }
    // Tenant Statistics
    async getTenantStatistics(tenantId) {
        try {
            const [tenant, controls, ztaActivities, cloudEnvironments] = await Promise.all([
                enhancedCosmosService.getTenant(tenantId),
                enhancedCosmosService.getNISTControls(tenantId),
                enhancedCosmosService.getZTAActivities(tenantId),
                enhancedCosmosService.getCloudEnvironments(tenantId)
            ]);
            if (!tenant) {
                throw new Error(`Tenant ${tenantId} not found`);
            }
            const compliantControls = controls.filter(c => c.overallStatus === 'compliant').length;
            const compliancePercentage = controls.length > 0
                ? Math.round((compliantControls / controls.length) * 100)
                : 0;
            const ztaMaturityAverage = ztaActivities.length > 0
                ? Math.round(ztaActivities.reduce((sum, activity) => sum + activity.overallMaturity, 0) / ztaActivities.length)
                : 0;
            const lastAssessmentTimes = controls
                .map(control => {
                const envStatuses = Object.values(control.environmentStatus);
                return envStatuses.length > 0
                    ? Math.max(...envStatuses.map(status => new Date(status.lastAssessed).getTime()))
                    : 0;
            })
                .filter(time => time > 0);
            const lastAssessment = lastAssessmentTimes.length > 0
                ? new Date(Math.max(...lastAssessmentTimes)).toISOString()
                : null;
            return {
                totalControls: controls.length,
                compliancePercentage,
                totalZTAActivities: ztaActivities.length,
                ztaMaturityAverage,
                cloudEnvironments: cloudEnvironments.length,
                activeUsers: tenant.roles.length,
                lastAssessment
            };
        }
        catch (error) {
            console.error('Error getting tenant statistics:', error);
            throw error;
        }
    }
}
export default new TenantManagementService();
