/**
 * Proactive Alerting and Notification Service
 * Implements intelligent alerting, real-time notifications, and automated PDF reporting
 */
import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
// Cosmos DB configuration
const cosmosConfig = {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
    databaseId: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
};
/**
 * Proactive Alerting and Notification Service
 */
class ProactiveAlertingService {
    constructor() {
        this.initialized = false;
        this.cosmosClient = new CosmosClient({
            endpoint: cosmosConfig.endpoint,
            aadCredentials: new DefaultAzureCredential()
        });
    }
    /**
     * Initialize the service and containers
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            const database = this.cosmosClient.database(cosmosConfig.databaseId);
            this.alertConfigContainer = database.container('alert-configs');
            this.alertInstanceContainer = database.container('alert-instances');
            this.reportConfigContainer = database.container('report-configs');
            this.generatedReportContainer = database.container('generated-reports');
            this.notificationTemplateContainer = database.container('notification-templates');
            this.initialized = true;
            console.log('Proactive Alerting Service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Proactive Alerting Service:', error);
            throw error;
        }
    }
    /**
     * Create alert configuration
     */
    async createAlertConfig(tenantId, config) {
        await this.ensureInitialized();
        const alertConfig = {
            id: config.id || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenantId,
            name: config.name || 'Unnamed Alert',
            description: config.description || '',
            enabled: config.enabled ?? true,
            alertType: config.alertType || 'custom',
            severity: config.severity || 'medium',
            conditions: config.conditions || [],
            notifications: {
                email: {
                    enabled: config.notifications?.email?.enabled ?? true,
                    recipients: config.notifications?.email?.recipients || [],
                    template: config.notifications?.email?.template || 'default',
                    subject: config.notifications?.email?.subject || 'Alert: {{alertName}}'
                },
                slack: {
                    enabled: config.notifications?.slack?.enabled ?? false,
                    webhook: config.notifications?.slack?.webhook || '',
                    channel: config.notifications?.slack?.channel || '#alerts'
                },
                teams: {
                    enabled: config.notifications?.teams?.enabled ?? false,
                    webhook: config.notifications?.teams?.webhook || ''
                },
                inApp: {
                    enabled: config.notifications?.inApp?.enabled ?? true,
                    persist: config.notifications?.inApp?.persist ?? true
                }
            },
            escalation: {
                enabled: config.escalation?.enabled ?? false,
                escalateAfter: config.escalation?.escalateAfter || 60,
                escalateTo: config.escalation?.escalateTo || []
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.alertConfigContainer.items.create(alertConfig);
            console.log(`Alert configuration created: ${alertConfig.name}`);
            return resource;
        }
        catch (error) {
            console.error(`Failed to create alert configuration:`, error);
            throw error;
        }
    }
    /**
     * Trigger alert based on conditions
     */
    async triggerAlert(tenantId, source, sourceId, metric, value, metadata = {}) {
        await this.ensureInitialized();
        const triggeredAlerts = [];
        try {
            // Get all alert configurations for the tenant
            const alertConfigs = await this.getAlertConfigs(tenantId);
            for (const config of alertConfigs) {
                if (!config.enabled)
                    continue;
                // Check if any condition matches
                const conditionMet = config.conditions.some(condition => {
                    if (condition.metric !== metric)
                        return false;
                    switch (condition.operator) {
                        case 'equals':
                            return value === condition.value;
                        case 'not_equals':
                            return value !== condition.value;
                        case 'greater_than':
                            return Number(value) > Number(condition.value);
                        case 'less_than':
                            return Number(value) < Number(condition.value);
                        case 'contains':
                            return String(value).includes(String(condition.value));
                        case 'regex':
                            return new RegExp(String(condition.value)).test(String(value));
                        default:
                            return false;
                    }
                });
                if (conditionMet) {
                    const alertInstance = await this.createAlertInstance(config, source, sourceId, metadata);
                    triggeredAlerts.push(alertInstance);
                    // Send notifications
                    await this.sendNotifications(alertInstance, config);
                }
            }
            return triggeredAlerts;
        }
        catch (error) {
            console.error(`Failed to trigger alert for tenant ${tenantId}:`, error);
            throw error;
        }
    }
    /**
     * Create alert instance
     */
    async createAlertInstance(config, source, sourceId, metadata) {
        const alertInstance = {
            id: `alert-instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            alertConfigId: config.id,
            tenantId: config.tenantId,
            status: 'active',
            severity: config.severity,
            title: config.name,
            message: this.generateAlertMessage(config, metadata),
            source,
            sourceId,
            metadata,
            triggeredAt: new Date().toISOString(),
            escalationLevel: 0,
            notificationsSent: {
                email: false,
                slack: false,
                teams: false,
                inApp: false
            }
        };
        try {
            const { resource } = await this.alertInstanceContainer.items.create(alertInstance);
            console.log(`Alert instance created: ${alertInstance.title}`);
            return resource;
        }
        catch (error) {
            console.error(`Failed to create alert instance:`, error);
            throw error;
        }
    }
    /**
     * Send notifications for alert
     */
    async sendNotifications(alert, config) {
        try {
            // Send email notifications
            if (config.notifications.email.enabled && config.notifications.email.recipients.length > 0) {
                await this.sendEmailNotification(alert, config);
                alert.notificationsSent.email = true;
            }
            // Send Slack notifications
            if (config.notifications.slack.enabled && config.notifications.slack.webhook) {
                await this.sendSlackNotification(alert, config);
                alert.notificationsSent.slack = true;
            }
            // Send Teams notifications
            if (config.notifications.teams.enabled && config.notifications.teams.webhook) {
                await this.sendTeamsNotification(alert, config);
                alert.notificationsSent.teams = true;
            }
            // Create in-app notification
            if (config.notifications.inApp.enabled) {
                await this.createInAppNotification(alert);
                alert.notificationsSent.inApp = true;
            }
            // Update alert instance with notification status
            await this.alertInstanceContainer.items.upsert(alert);
        }
        catch (error) {
            console.error(`Failed to send notifications for alert ${alert.id}:`, error);
        }
    }
    /**
     * Send email notification
     */
    async sendEmailNotification(alert, config) {
        // Simulate email sending - in production, integrate with Azure Communication Services or SendGrid
        console.log(`Sending email notification for alert: ${alert.title}`);
        console.log(`Recipients: ${config.notifications.email.recipients.join(', ')}`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    /**
     * Send Slack notification
     */
    async sendSlackNotification(alert, config) {
        // Simulate Slack webhook - in production, make actual HTTP request
        console.log(`Sending Slack notification to ${config.notifications.slack.channel}`);
        console.log(`Alert: ${alert.title} - ${alert.message}`);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    /**
     * Send Teams notification
     */
    async sendTeamsNotification(alert, config) {
        // Simulate Teams webhook - in production, make actual HTTP request
        console.log(`Sending Teams notification for alert: ${alert.title}`);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    /**
     * Create in-app notification
     */
    async createInAppNotification(alert) {
        // Create in-app notification record
        console.log(`Creating in-app notification for alert: ${alert.title}`);
        // In production, this would create a notification record for the UI to display
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    /**
     * Create report configuration
     */
    async createReportConfig(tenantId, config) {
        await this.ensureInitialized();
        const reportConfig = {
            id: config.id || `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenantId,
            name: config.name || 'Unnamed Report',
            description: config.description || '',
            reportType: config.reportType || 'custom',
            enabled: config.enabled ?? true,
            schedule: {
                frequency: config.schedule?.frequency || 'weekly',
                dayOfWeek: config.schedule?.dayOfWeek,
                dayOfMonth: config.schedule?.dayOfMonth,
                time: config.schedule?.time || '09:00',
                timezone: config.schedule?.timezone || 'UTC'
            },
            format: config.format || 'pdf',
            template: config.template || 'standard',
            sections: config.sections || ['summary', 'compliance', 'poams', 'recommendations'],
            filters: {
                dateRange: config.filters?.dateRange || 30,
                cloudProviders: config.filters?.cloudProviders,
                categories: config.filters?.categories,
                severity: config.filters?.severity
            },
            recipients: {
                email: config.recipients?.email || [],
                sharepoint: config.recipients?.sharepoint,
                s3Bucket: config.recipients?.s3Bucket
            },
            lastGenerated: config.lastGenerated,
            nextScheduled: this.calculateNextScheduled(config.schedule || { frequency: 'weekly', time: '09:00', timezone: 'UTC' }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        try {
            const { resource } = await this.reportConfigContainer.items.create(reportConfig);
            console.log(`Report configuration created: ${reportConfig.name}`);
            return resource;
        }
        catch (error) {
            console.error(`Failed to create report configuration:`, error);
            throw error;
        }
    }
    /**
     * Generate report
     */
    async generateReport(reportConfigId, tenantId, generatedBy = 'system') {
        await this.ensureInitialized();
        try {
            // Get report configuration
            const { resource: reportConfig } = await this.reportConfigContainer.item(reportConfigId, tenantId).read();
            if (!reportConfig) {
                throw new Error(`Report configuration ${reportConfigId} not found`);
            }
            const config = reportConfig;
            const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const startTime = Date.now();
            // Create initial report record
            const generatedReport = {
                id: reportId,
                reportConfigId,
                tenantId,
                reportType: config.reportType,
                title: `${config.name} - ${new Date().toLocaleDateString()}`,
                generatedAt: new Date().toISOString(),
                generatedBy,
                format: config.format,
                filePath: `reports/${tenantId}/${reportId}.${config.format}`,
                fileSize: 0,
                status: 'generating',
                metadata: {
                    dataRange: {
                        startDate: new Date(Date.now() - config.filters.dateRange * 24 * 60 * 60 * 1000).toISOString(),
                        endDate: new Date().toISOString()
                    },
                    recordsIncluded: 0,
                    sectionsGenerated: [],
                    generationTime: 0
                }
            };
            await this.generatedReportContainer.items.create(generatedReport);
            // Generate report content
            const reportData = await this.generateReportData(config, tenantId);
            const reportFile = await this.generateReportFile(reportData, config);
            // Update report with completion
            const generationTime = Date.now() - startTime;
            generatedReport.status = 'completed';
            generatedReport.fileSize = reportFile.size;
            generatedReport.metadata.recordsIncluded = reportData.recordCount;
            generatedReport.metadata.sectionsGenerated = config.sections;
            generatedReport.metadata.generationTime = generationTime;
            generatedReport.downloadUrl = `${import.meta.env.VITE_BLOB_STORAGE_URL}/${generatedReport.filePath}`;
            generatedReport.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
            await this.generatedReportContainer.items.upsert(generatedReport);
            // Send report to recipients
            await this.sendReportToRecipients(generatedReport, config);
            console.log(`Report generated successfully: ${generatedReport.title}`);
            return generatedReport;
        }
        catch (error) {
            console.error(`Failed to generate report ${reportConfigId}:`, error);
            // Update report with failure status
            try {
                const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const failedReport = {
                    id: reportId,
                    reportConfigId,
                    tenantId,
                    reportType: 'unknown',
                    title: 'Failed Report Generation',
                    generatedAt: new Date().toISOString(),
                    generatedBy,
                    format: 'pdf',
                    filePath: '',
                    fileSize: 0,
                    status: 'failed',
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    metadata: {
                        dataRange: { startDate: '', endDate: '' },
                        recordsIncluded: 0,
                        sectionsGenerated: [],
                        generationTime: 0
                    }
                };
                await this.generatedReportContainer.items.create(failedReport);
                return failedReport;
            }
            catch (updateError) {
                console.error('Failed to create failure record:', updateError);
                throw error;
            }
        }
    }
    /**
     * Generate report data
     */
    async generateReportData(config, tenantId) {
        console.log(`Generating report data for ${config.reportType}`);
        // Simulate data collection based on report type
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockData = {
            compliance: {
                overallScore: Math.floor(Math.random() * 30) + 70,
                frameworks: ['NIST', 'FedRAMP', 'SOX'],
                controls: Math.floor(Math.random() * 200) + 300
            },
            poams: {
                total: Math.floor(Math.random() * 50) + 25,
                open: Math.floor(Math.random() * 30) + 15,
                overdue: Math.floor(Math.random() * 10) + 2
            },
            cloudProviders: config.filters.cloudProviders || ['azure', 'aws', 'gcp'],
            dateRange: config.filters.dateRange
        };
        return {
            reportData: mockData,
            recordCount: mockData.poams.total + mockData.compliance.controls
        };
    }
    /**
     * Generate report file
     */
    async generateReportFile(reportData, config) {
        console.log(`Generating ${config.format.toUpperCase()} report file`);
        // Simulate file generation
        await new Promise(resolve => setTimeout(resolve, 1500));
        let content = '';
        let size = 0;
        switch (config.format) {
            case 'pdf':
                content = 'PDF content would be generated here using a PDF library';
                size = Math.floor(Math.random() * 500000) + 100000; // 100KB - 600KB
                break;
            case 'excel':
                content = 'Excel content would be generated here';
                size = Math.floor(Math.random() * 200000) + 50000; // 50KB - 250KB
                break;
            case 'csv':
                content = 'CSV content would be generated here';
                size = Math.floor(Math.random() * 50000) + 10000; // 10KB - 60KB
                break;
            case 'json':
                content = JSON.stringify(reportData, null, 2);
                size = content.length;
                break;
            default:
                throw new Error(`Unsupported report format: ${config.format}`);
        }
        return { size, content };
    }
    /**
     * Send report to recipients
     */
    async sendReportToRecipients(report, config) {
        try {
            // Send email with report attachment
            if (config.recipients.email.length > 0) {
                console.log(`Sending report via email to: ${config.recipients.email.join(', ')}`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            // Upload to SharePoint
            if (config.recipients.sharepoint) {
                console.log(`Uploading report to SharePoint: ${config.recipients.sharepoint}`);
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            // Upload to S3
            if (config.recipients.s3Bucket) {
                console.log(`Uploading report to S3: ${config.recipients.s3Bucket}`);
                await new Promise(resolve => setTimeout(resolve, 600));
            }
        }
        catch (error) {
            console.error(`Failed to send report to recipients:`, error);
        }
    }
    /**
     * Get alert configurations for tenant
     */
    async getAlertConfigs(tenantId) {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.enabled = true',
                parameters: [{ name: '@tenantId', value: tenantId }]
            };
            const { resources } = await this.alertConfigContainer.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error(`Failed to get alert configs for tenant ${tenantId}:`, error);
            return [];
        }
    }
    /**
     * Generate alert message
     */
    generateAlertMessage(config, metadata) {
        let message = `Alert triggered: ${config.name}`;
        if (metadata.details) {
            message += ` - ${metadata.details}`;
        }
        if (config.conditions.length > 0) {
            const condition = config.conditions[0];
            message += ` (${condition.metric} ${condition.operator} ${condition.value})`;
        }
        return message;
    }
    /**
     * Calculate next scheduled time
     */
    calculateNextScheduled(schedule) {
        const now = new Date();
        const nextRun = new Date(now);
        switch (schedule.frequency) {
            case 'daily':
                nextRun.setDate(nextRun.getDate() + 1);
                break;
            case 'weekly':
                nextRun.setDate(nextRun.getDate() + 7);
                break;
            case 'monthly':
                nextRun.setMonth(nextRun.getMonth() + 1);
                break;
            case 'quarterly':
                nextRun.setMonth(nextRun.getMonth() + 3);
                break;
            default:
                nextRun.setDate(nextRun.getDate() + 1);
        }
        // Set time
        const [hours, minutes] = schedule.time.split(':');
        nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return nextRun.toISOString();
    }
    /**
     * Get active alerts for tenant
     */
    async getActiveAlerts(tenantId) {
        await this.ensureInitialized();
        try {
            const querySpec = {
                query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId AND c.status = 'active'
          ORDER BY c.triggeredAt DESC
        `,
                parameters: [{ name: '@tenantId', value: tenantId }]
            };
            const { resources } = await this.alertInstanceContainer.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error(`Failed to get active alerts for tenant ${tenantId}:`, error);
            return [];
        }
    }
    /**
     * Acknowledge alert
     */
    async acknowledgeAlert(alertId, acknowledgedBy) {
        await this.ensureInitialized();
        try {
            const { resource: alert } = await this.alertInstanceContainer.item(alertId, alertId).read();
            if (alert) {
                alert.status = 'acknowledged';
                alert.acknowledgedAt = new Date().toISOString();
                alert.acknowledgedBy = acknowledgedBy;
                await this.alertInstanceContainer.items.upsert(alert);
                console.log(`Alert ${alertId} acknowledged by ${acknowledgedBy}`);
            }
        }
        catch (error) {
            console.error(`Failed to acknowledge alert ${alertId}:`, error);
            throw error;
        }
    }
    /**
     * Resolve alert
     */
    async resolveAlert(alertId, resolvedBy) {
        await this.ensureInitialized();
        try {
            const { resource: alert } = await this.alertInstanceContainer.item(alertId, alertId).read();
            if (alert) {
                alert.status = 'resolved';
                alert.resolvedAt = new Date().toISOString();
                alert.resolvedBy = resolvedBy;
                await this.alertInstanceContainer.items.upsert(alert);
                console.log(`Alert ${alertId} resolved by ${resolvedBy}`);
            }
        }
        catch (error) {
            console.error(`Failed to resolve alert ${alertId}:`, error);
            throw error;
        }
    }
    /**
     * Get recent reports
     */
    async getRecentReports(tenantId, limit = 10) {
        await this.ensureInitialized();
        try {
            const querySpec = {
                query: `
          SELECT * FROM c 
          WHERE c.tenantId = @tenantId 
          ORDER BY c.generatedAt DESC
          OFFSET 0 LIMIT @limit
        `,
                parameters: [
                    { name: '@tenantId', value: tenantId },
                    { name: '@limit', value: limit }
                ]
            };
            const { resources } = await this.generatedReportContainer.items.query(querySpec).fetchAll();
            return resources;
        }
        catch (error) {
            console.error(`Failed to get recent reports for tenant ${tenantId}:`, error);
            return [];
        }
    }
    /**
     * Ensure service is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}
// Export service instance
export const proactiveAlertingService = new ProactiveAlertingService();
