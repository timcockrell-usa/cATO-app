/**
 * Onboarding Service
 * Manages first-time organization setup including eMASS integration and cloud connections
 */
import enhancedCosmosService from './enhancedCosmosService';
import { EmassIntegrationService } from './emassService';
class OnboardingService {
    constructor() {
        this.cosmosService = enhancedCosmosService;
        // cosmosService is already instantiated from import
        this.emassService = new EmassIntegrationService('default-config'); // Add required parameter
    }
    /**
     * Initialize onboarding for a new user/organization
     */
    async initializeOnboarding(userId, userEmail) {
        const steps = [
            {
                id: 'welcome',
                title: 'Welcome to cATO Dashboard',
                description: 'Learn about the platform and get started',
                completed: false,
                required: true
            },
            {
                id: 'organization-setup',
                title: 'Organization Information',
                description: 'Configure your organization profile and contact information',
                completed: false,
                required: true
            },
            {
                id: 'security-configuration',
                title: 'Security & Compliance Settings',
                description: 'Set NIST revision, security classification, and compliance requirements',
                completed: false,
                required: true
            },
            {
                id: 'emass-integration',
                title: 'eMASS Integration',
                description: 'Connect to eMASS and import existing compliance data (optional)',
                completed: false,
                required: false
            },
            {
                id: 'cloud-environments',
                title: 'Cloud Environment Setup',
                description: 'Connect your Azure, AWS, or other cloud environments',
                completed: false,
                required: true
            },
            {
                id: 'user-management',
                title: 'User Management',
                description: 'Set up additional users and role assignments',
                completed: false,
                required: false
            },
            {
                id: 'review-complete',
                title: 'Review & Complete Setup',
                description: 'Review your configuration and complete the onboarding process',
                completed: false,
                required: true
            }
        ];
        const progress = {
            currentStep: 0,
            totalSteps: steps.length,
            steps,
            isComplete: false
        };
        // Store onboarding state in user's session or local storage
        this.saveOnboardingProgress(userId, progress);
        return progress;
    }
    /**
     * Check if user needs onboarding
     */
    async checkOnboardingStatus(userId, userEmail) {
        try {
            // Check if user has an existing organization
            const existingOrg = await this.findUserOrganization(userId, userEmail);
            if (existingOrg) {
                return { needsOnboarding: false, isFirstOrgUser: false };
            }
            // Check if there's an in-progress onboarding
            const existingProgress = this.getOnboardingProgress(userId);
            if (existingProgress && !existingProgress.isComplete) {
                return {
                    needsOnboarding: true,
                    isFirstOrgUser: true,
                    progress: existingProgress
                };
            }
            return { needsOnboarding: true, isFirstOrgUser: true };
        }
        catch (error) {
            console.error('Error checking onboarding status:', error);
            // Default to requiring onboarding for safety
            return { needsOnboarding: true, isFirstOrgUser: true };
        }
    }
    /**
     * Create organization from setup data
     */
    async createOrganization(setupData, userId) {
        try {
            const organizationId = `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const organization = {
                id: organizationId,
                tenantId: organizationId, // Use org ID as tenant ID for simplicity
                legalName: setupData.legalName,
                displayName: setupData.commonName,
                tier: setupData.tier,
                status: 'PendingActivation',
                createdAt: new Date(),
                updatedAt: new Date(),
                configuration: {
                    nistRevision: setupData.nistRevision,
                    securityClassification: setupData.securityClassification,
                    complianceFrameworks: ['NIST-800-53'],
                    dataRetentionPeriod: 2555, // 7 years in days
                    enableAuditTrail: true,
                    enableContinuousMonitoring: true,
                    enableAutomatedReporting: true,
                    customBranding: {
                        primaryColor: '#1e40af',
                        secondaryColor: '#3b82f6',
                        logoUrl: '',
                        organizationName: setupData.commonName
                    }
                },
                contactInfo: {
                    primaryEmail: setupData.aoEmail,
                    primaryPhone: setupData.primaryPhone,
                    address: setupData.primaryAddress,
                    emergencyContact: setupData.emergencyContact || setupData.primaryPhone,
                    mailingAddress: setupData.mailingAddress || setupData.primaryAddress
                },
                authorizingOfficial: {
                    name: setupData.aoName,
                    title: setupData.aoTitle,
                    email: setupData.aoEmail,
                    phone: setupData.aoPhone,
                    securityClearance: setupData.aoSecurityClearance
                },
                issm: {
                    name: setupData.issmName,
                    title: setupData.issmTitle,
                    email: setupData.issmEmail,
                    phone: setupData.issmPhone
                },
                subscription: {
                    plan: setupData.tier,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                    maxUsers: this.getMaxUsersForTier(setupData.tier),
                    features: this.getFeaturesForTier(setupData.tier)
                },
                members: [{
                        id: `member-${userId}`,
                        userId: userId,
                        organizationId: organizationId,
                        roles: ['SystemAdmin'], // First user gets admin role
                        status: 'Active',
                        joinedAt: new Date(),
                        lastActiveAt: new Date(),
                        invitedBy: userId,
                        invitationStatus: 'Accepted'
                    }],
                cloudEnvironments: [],
                complianceScore: 0,
                lastAssessment: new Date(),
                nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            };
            // Create organization in database
            const tenant = {
                id: organizationId,
                organizationName: setupData.legalName,
                organizationType: 'government',
                nistRevision: setupData.nistRevision === 'Rev4' ? '4' : '5',
                databaseEndpoint: '', // Will be set during provisioning
                keyVaultUri: '', // Will be set during provisioning
                roles: [],
                cloudEnvironments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            };
            await this.cosmosService.createTenant(tenant);
            return organization;
        }
        catch (error) {
            console.error('Error creating organization:', error);
            throw new Error('Failed to create organization. Please try again.');
        }
    }
    /**
     * Setup eMASS integration (simplified for build)
     */
    async setupEmassIntegration(organizationId, emassData) {
        try {
            // Simplified eMASS setup - just validate data for now
            console.log('Setting up eMASS integration for:', organizationId);
            if (!emassData.systemId || !emassData.packageId) {
                throw new Error('Required eMASS configuration missing');
            }
            // For now, just return success
            // TODO: Implement actual eMASS integration when service methods are available
            return true;
        }
        catch (error) {
            console.error('Error setting up eMASS integration:', error);
            throw error;
        }
    }
    /**
     * Setup cloud environment
     */
    async setupCloudEnvironment(organizationId, cloudData) {
        try {
            const environmentId = `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const cloudEnvironment = {
                id: environmentId,
                organizationId: organizationId,
                name: cloudData.environmentName,
                displayName: cloudData.displayName,
                provider: cloudData.provider,
                environment: 'Production', // Default to production
                status: 'Configuring',
                configuration: {
                    region: cloudData.region,
                    subscriptionId: cloudData.subscriptionId,
                    tenantId: cloudData.tenantId,
                    credentials: cloudData.credentials,
                    // Add provider-specific configuration
                    ...(cloudData.provider === 'Azure' && {
                        resourceGroups: [],
                        subscriptions: cloudData.subscriptionId ? [cloudData.subscriptionId] : [],
                        managementGroups: []
                    }),
                    ...(cloudData.provider === 'AWS' && {
                        accountId: cloudData.subscriptionId, // Reuse for AWS account ID
                        regions: [cloudData.region],
                        iamRoles: []
                    })
                },
                syncStatus: 'Pending',
                resourceCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Create cloud environment in database
            const createdEnvironment = await this.cosmosService.createCloudEnvironment(cloudEnvironment);
            // Start initial sync (async)
            this.initializeCloudSync(organizationId, environmentId).catch(error => {
                console.error('Initial cloud sync failed:', error);
            });
            return createdEnvironment;
        }
        catch (error) {
            console.error('Error setting up cloud environment:', error);
            throw new Error('Failed to setup cloud environment. Please check your configuration and try again.');
        }
    }
    /**
     * Complete onboarding process
     */
    async completeOnboarding(userId, organizationId) {
        try {
            // Update organization status to Active
            const organization = await this.cosmosService.getTenant(organizationId);
            if (!organization) {
                throw new Error('Organization not found');
            }
            organization.status = 'Active';
            organization.updatedAt = new Date();
            const updatedOrg = await this.cosmosService.updateTenant(organization);
            // Mark onboarding as complete
            const progress = this.getOnboardingProgress(userId);
            if (progress) {
                progress.isComplete = true;
                progress.steps.forEach(step => step.completed = true);
                this.saveOnboardingProgress(userId, progress);
            }
            // Create audit log entry
            await this.createOnboardingAuditLog(organizationId, userId, 'Onboarding completed successfully');
            // Clear onboarding state
            this.clearOnboardingProgress(userId);
            return {
                success: true,
                organization: updatedOrg // Type conversion for Organization interface
            };
        }
        catch (error) {
            console.error('Error completing onboarding:', error);
            throw new Error('Failed to complete onboarding. Please try again.');
        }
    }
    /**
     * Update onboarding step
     */
    updateOnboardingStep(userId, stepId, completed, data) {
        const progress = this.getOnboardingProgress(userId);
        if (!progress) {
            throw new Error('No onboarding progress found');
        }
        const step = progress.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = completed;
            if (data) {
                step.data = data;
            }
        }
        // Update current step to next incomplete step
        const nextIncompleteIndex = progress.steps.findIndex(s => !s.completed);
        progress.currentStep = nextIncompleteIndex >= 0 ? nextIncompleteIndex : progress.steps.length - 1;
        this.saveOnboardingProgress(userId, progress);
        return progress;
    }
    // Private helper methods
    async findUserOrganization(userId, userEmail) {
        // This would typically query the database for user's organization
        // For now, return null to trigger onboarding
        return null;
    }
    getOnboardingProgress(userId) {
        const stored = localStorage.getItem(`onboarding-${userId}`);
        return stored ? JSON.parse(stored) : null;
    }
    saveOnboardingProgress(userId, progress) {
        localStorage.setItem(`onboarding-${userId}`, JSON.stringify(progress));
    }
    clearOnboardingProgress(userId) {
        localStorage.removeItem(`onboarding-${userId}`);
    }
    getMaxUsersForTier(tier) {
        switch (tier) {
            case 'Basic': return 10;
            case 'Standard': return 50;
            case 'Enterprise': return 500;
            case 'Government': return 1000;
            default: return 10;
        }
    }
    getFeaturesForTier(tier) {
        const baseFeatures = ['AuditTrail'];
        switch (tier) {
            case 'Basic':
                return [...baseFeatures];
            case 'Standard':
                return [...baseFeatures, 'CustomReporting', 'ComplianceAlerts'];
            case 'Enterprise':
                return [...baseFeatures, 'CustomReporting', 'ComplianceAlerts', 'ApiAccess', 'RiskAssessment'];
            case 'Government':
                return [...baseFeatures, 'CustomReporting', 'ComplianceAlerts', 'ApiAccess', 'RiskAssessment',
                    'EmassIntegration', 'MultiCloudSupport', 'AutomatedRemediation', 'CustomControls'];
            default:
                return baseFeatures;
        }
    }
    async initializeCloudSync(organizationId, environmentId) {
        // This would start the initial cloud resource discovery and sync
        // Implementation would depend on the cloud provider and available APIs
        console.log(`Starting cloud sync for organization ${organizationId}, environment ${environmentId}`);
    }
    async createOnboardingAuditLog(organizationId, userId, action) {
        // Create audit log entry for onboarding completion
        // This would use the audit logging system
        console.log(`Audit log: ${action} for organization ${organizationId} by user ${userId}`);
    }
}
export const onboardingService = new OnboardingService();
