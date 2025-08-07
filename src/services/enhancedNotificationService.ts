/**
 * Enhanced Notification and Alerting Service
 * Implements proactive monitoring, intelligent notifications, and multi-channel alerts
 * Supports email, Teams, ServiceNow, and dashboard notifications
 */

import { DefaultAzureCredential } from '@azure/identity';
import { CosmosClient, Container } from '@azure/cosmos';

// Configuration for notification service
const notificationConfig = {
  cosmosEndpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://your-cosmos-account.documents.azure.com:443/',
  cosmosDatabase: import.meta.env.VITE_COSMOS_DB_NAME || 'cato-dashboard',
  
  // Email configuration
  emailSettings: {
    fromAddress: import.meta.env.VITE_NOTIFICATION_FROM_EMAIL || 'noreply@cato-system.mil',
    smtpServer: import.meta.env.VITE_SMTP_SERVER || 'smtp.disa.mil',
    smtpPort: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
    useTLS: true
  },

  // Teams configuration
  teamsSettings: {
    webhookUrl: import.meta.env.VITE_TEAMS_WEBHOOK_URL,
    channelId: import.meta.env.VITE_TEAMS_CHANNEL_ID
  },

  // ServiceNow configuration
  serviceNowSettings: {
    instanceUrl: import.meta.env.VITE_SERVICENOW_INSTANCE_URL,
    apiUser: import.meta.env.VITE_SERVICENOW_API_USER,
    apiPassword: import.meta.env.VITE_SERVICENOW_API_PASSWORD,
    assignmentGroup: import.meta.env.VITE_SERVICENOW_ASSIGNMENT_GROUP || 'IT Security'
  }
};

// Initialize Cosmos client
const credential = new DefaultAzureCredential();
const cosmosClient = new CosmosClient({
  endpoint: notificationConfig.cosmosEndpoint,
  aadCredentials: credential
});

// Enhanced notification data models
export interface NotificationRule {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Trigger conditions
  triggers: {
    type: 'threshold' | 'anomaly' | 'schedule' | 'event' | 'trend';
    source: 'poam' | 'security_scan' | 'compliance' | 'performance' | 'system_health' | 'all';
    conditions: {
      metric: string;
      operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains' | 'percentage_change';
      value: any;
      timeWindow?: string; // e.g., '1h', '24h', '7d'
    }[];
  }[];

  // Notification channels and recipients
  channels: {
    email?: {
      enabled: boolean;
      recipients: string[];
      template: string;
      escalationMinutes?: number;
    };
    teams?: {
      enabled: boolean;
      webhookUrl: string;
      channelId?: string;
      mentionUsers?: string[];
    };
    serviceNow?: {
      enabled: boolean;
      severity: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      assignmentGroup: string;
      autoResolve: boolean;
    };
    dashboard?: {
      enabled: boolean;
      displayDuration: number; // minutes
      alertStyle: 'banner' | 'modal' | 'toast';
    };
    webhook?: {
      enabled: boolean;
      url: string;
      method: 'POST' | 'PUT';
      headers?: Record<string, string>;
    };
  };

  // Suppression and rate limiting
  suppression: {
    enabled: boolean;
    duration: number; // minutes
    maxAlerts: number;
    similarAlertWindow: number; // minutes
  };

  // Escalation rules
  escalation?: {
    enabled: boolean;
    levels: {
      level: number;
      delayMinutes: number;
      recipients: string[];
      channels: string[];
    }[];
  };

  // Metadata
  createdBy: string;
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationAlert {
  id: string;
  tenantId: string;
  ruleId: string;
  ruleName: string;
  
  // Alert details
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  source: string;
  sourceId?: string; // ID of the triggering entity (e.g., POAM ID)
  
  // Status and lifecycle
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  suppressedUntil?: Date;
  
  // Delivery tracking
  deliveryStatus: {
    email?: {
      sent: boolean;
      sentAt?: Date;
      delivered: boolean;
      deliveredAt?: Date;
      error?: string;
    };
    teams?: {
      sent: boolean;
      sentAt?: Date;
      messageId?: string;
      error?: string;
    };
    serviceNow?: {
      sent: boolean;
      sentAt?: Date;
      ticketNumber?: string;
      ticketUrl?: string;
      error?: string;
    };
    dashboard?: {
      displayed: boolean;
      displayedAt?: Date;
      viewedBy?: string[];
      dismissed?: boolean;
      dismissedAt?: Date;
    };
    webhook?: {
      sent: boolean;
      sentAt?: Date;
      responseStatus?: number;
      error?: string;
    };
  };

  // Escalation tracking
  escalationLevel: number;
  nextEscalation?: Date;
  escalationHistory: {
    level: number;
    escalatedAt: Date;
    recipients: string[];
    channels: string[];
  }[];

  // Rich data and context
  metadata: {
    triggerData: any;
    context?: any;
    relatedAlerts?: string[];
    dashboardLinks?: string[];
    remediationSteps?: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface AlertDashboard {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  
  // Dashboard configuration
  configuration: {
    refreshInterval: number; // seconds
    autoResolveMinutes: number;
    maxDisplayedAlerts: number;
    groupBy: 'severity' | 'category' | 'source';
    sortBy: 'created' | 'severity' | 'status';
    filters: {
      severities: string[];
      categories: string[];
      sources: string[];
      timeRange: string; // e.g., '1h', '24h', '7d'
    };
  };

  // Widget settings
  widgets: {
    alertCount: boolean;
    severityBreakdown: boolean;
    trendChart: boolean;
    topAlerts: boolean;
    recentActivity: boolean;
    healthIndicators: boolean;
  };

  // Access control
  viewers: string[];
  editors: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  tenantId: string;
  name: string;
  type: 'email' | 'teams' | 'webhook' | 'serviceNow';
  
  // Template content
  subject?: string;
  body: string;
  htmlBody?: string;
  variables: string[]; // Available variables for substitution
  
  // Formatting options
  formatting: {
    markdown: boolean;
    html: boolean;
    color?: string;
    icon?: string;
    urgency?: 'normal' | 'urgent';
  };
  
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class EnhancedNotificationService {
  private database: any;
  private notificationRulesContainer: Container;
  private alertsContainer: Container;
  private dashboardsContainer: Container;
  private templatesContainer: Container;
  private deliveryLogContainer: Container;
  private isInitialized = false;

  constructor() {
    this.initializeContainers();
  }

  /**
   * Initialize Cosmos DB containers
   */
  private async initializeContainers() {
    try {
      this.database = cosmosClient.database(notificationConfig.cosmosDatabase);
      
      const containerConfigs = [
        { id: 'notification-rules', partitionKey: '/tenantId' },
        { id: 'notification-alerts', partitionKey: '/tenantId' },
        { id: 'alert-dashboards', partitionKey: '/tenantId' },
        { id: 'notification-templates', partitionKey: '/tenantId' },
        { id: 'delivery-logs', partitionKey: '/tenantId' }
      ];

      for (const config of containerConfigs) {
        await this.database.containers.createIfNotExists({
          id: config.id,
          partitionKey: { paths: [config.partitionKey] },
          defaultTtl: -1,
          indexingPolicy: {
            automatic: true,
            indexingMode: 'consistent',
            includedPaths: [{ path: '/*' }]
          }
        });
      }

      this.notificationRulesContainer = this.database.container('notification-rules');
      this.alertsContainer = this.database.container('notification-alerts');
      this.dashboardsContainer = this.database.container('alert-dashboards');
      this.templatesContainer = this.database.container('notification-templates');
      this.deliveryLogContainer = this.database.container('delivery-logs');

      this.isInitialized = true;
      console.log('Enhanced notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw new Error(`Initialization failed: ${error}`);
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeContainers();
    }
  }

  /**
   * Create notification rule with intelligent trigger conditions
   */
  async createNotificationRule(rule: Omit<NotificationRule, 'id' | 'triggerCount' | 'createdAt' | 'updatedAt'>): Promise<NotificationRule> {
    await this.ensureInitialized();

    const notificationRule: NotificationRule = {
      id: `notification-rule-${rule.tenantId}-${Date.now()}`,
      ...rule,
      triggerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const { resource } = await this.notificationRulesContainer.items.create(notificationRule);
      return resource as unknown as NotificationRule;
    } catch (error) {
      console.error('Failed to create notification rule:', error);
      throw new Error(`Rule creation failed: ${error}`);
    }
  }

  /**
   * Process trigger data and evaluate notification rules
   */
  async processTriggerData(tenantId: string, triggerData: {
    type: string;
    source: string;
    data: any;
    timestamp: Date;
  }): Promise<NotificationAlert[]> {
    await this.ensureInitialized();

    try {
      const rules = await this.getNotificationRules(tenantId, true);
      const triggeredAlerts: NotificationAlert[] = [];

      for (const rule of rules) {
        if (await this.shouldTriggerRule(rule, triggerData)) {
          // Check if suppression rules apply
          if (await this.isAlertSuppressed(rule, triggerData)) {
            console.log(`Alert suppressed for rule ${rule.name}`);
            continue;
          }

          const alert = await this.createAlert(rule, triggerData);
          triggeredAlerts.push(alert);

          // Send notifications through configured channels
          await this.deliverAlert(alert, rule);

          // Update rule statistics
          await this.updateRuleStatistics(rule.id);
        }
      }

      return triggeredAlerts;
    } catch (error) {
      console.error('Failed to process trigger data:', error);
      return [];
    }
  }

  /**
   * Evaluate if a rule should be triggered
   */
  private async shouldTriggerRule(rule: NotificationRule, triggerData: any): Promise<boolean> {
    for (const trigger of rule.triggers) {
      if (trigger.source === triggerData.source || trigger.source === 'all') {
        const allConditionsMet = trigger.conditions.every(condition => {
          const value = this.extractMetricValue(triggerData.data, condition.metric);
          return this.evaluateCondition(value, condition.operator, condition.value);
        });

        if (allConditionsMet) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Extract metric value from trigger data
   */
  private extractMetricValue(data: any, metricPath: string): any {
    return metricPath.split('.').reduce((obj, key) => obj?.[key], data);
  }

  /**
   * Evaluate condition logic
   */
  private evaluateCondition(value: any, operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'greater_than':
        return Number(value) > Number(targetValue);
      case 'less_than':
        return Number(value) < Number(targetValue);
      case 'equals':
        return value === targetValue;
      case 'not_equals':
        return value !== targetValue;
      case 'contains':
        return String(value).includes(String(targetValue));
      case 'percentage_change':
        // Simplified percentage change calculation
        return Math.abs((Number(value) - Number(targetValue)) / Number(targetValue) * 100) > 10;
      default:
        return false;
    }
  }

  /**
   * Check if alert should be suppressed
   */
  private async isAlertSuppressed(rule: NotificationRule, triggerData: any): Promise<boolean> {
    if (!rule.suppression.enabled) {
      return false;
    }

    try {
      const suppressionWindow = new Date(Date.now() - rule.suppression.duration * 60 * 1000);
      
      const querySpec = {
        query: `
          SELECT COUNT(1) as count 
          FROM c 
          WHERE c.tenantId = @tenantId 
            AND c.ruleId = @ruleId 
            AND c.createdAt > @suppressionWindow
            AND c.status != 'resolved'
        `,
        parameters: [
          { name: '@tenantId', value: rule.tenantId },
          { name: '@ruleId', value: rule.id },
          { name: '@suppressionWindow', value: suppressionWindow.toISOString() }
        ]
      };

      const { resources } = await this.alertsContainer.items.query(querySpec).fetchAll();
      const alertCount = resources[0]?.count || 0;

      return alertCount >= rule.suppression.maxAlerts;
    } catch (error) {
      console.error('Error checking suppression:', error);
      return false;
    }
  }

  /**
   * Create new alert from triggered rule
   */
  private async createAlert(rule: NotificationRule, triggerData: any): Promise<NotificationAlert> {
    const alert: NotificationAlert = {
      id: `alert-${rule.tenantId}-${Date.now()}`,
      tenantId: rule.tenantId,
      ruleId: rule.id,
      ruleName: rule.name,
      title: this.generateAlertTitle(rule, triggerData),
      message: this.generateAlertMessage(rule, triggerData),
      severity: this.mapPriorityToSeverity(rule.priority),
      category: triggerData.source,
      source: triggerData.source,
      sourceId: triggerData.data?.id,
      status: 'active',
      deliveryStatus: {},
      escalationLevel: 0,
      escalationHistory: [],
      metadata: {
        triggerData: triggerData.data,
        context: triggerData,
        relatedAlerts: [],
        dashboardLinks: [],
        remediationSteps: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { resource } = await this.alertsContainer.items.create(alert);
    return resource as unknown as NotificationAlert;
  }

  /**
   * Generate alert title from rule and trigger data
   */
  private generateAlertTitle(rule: NotificationRule, triggerData: any): string {
    const severity = this.mapPriorityToSeverity(rule.priority).toUpperCase();
    const source = triggerData.source.toUpperCase();
    return `[${severity}] ${source} Alert: ${rule.name}`;
  }

  /**
   * Generate alert message with context
   */
  private generateAlertMessage(rule: NotificationRule, triggerData: any): string {
    const timestamp = new Date().toLocaleString();
    const source = triggerData.source;
    
    let message = `Alert triggered for rule "${rule.name}" at ${timestamp}.\n\n`;
    message += `Source: ${source}\n`;
    message += `Description: ${rule.description}\n\n`;
    
    if (triggerData.data) {
      message += 'Trigger Data:\n';
      message += JSON.stringify(triggerData.data, null, 2);
    }

    return message;
  }

  /**
   * Map rule priority to alert severity
   */
  private mapPriorityToSeverity(priority: string): 'info' | 'warning' | 'error' | 'critical' {
    switch (priority) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'critical';
      default: return 'info';
    }
  }

  /**
   * Deliver alert through configured channels
   */
  async deliverAlert(alert: NotificationAlert, rule: NotificationRule): Promise<void> {
    const deliveryPromises: Promise<void>[] = [];

    // Email delivery
    if (rule.channels.email?.enabled) {
      deliveryPromises.push(this.deliverEmailAlert(alert, rule.channels.email));
    }

    // Teams delivery
    if (rule.channels.teams?.enabled) {
      deliveryPromises.push(this.deliverTeamsAlert(alert, rule.channels.teams));
    }

    // ServiceNow delivery
    if (rule.channels.serviceNow?.enabled) {
      deliveryPromises.push(this.deliverServiceNowAlert(alert, rule.channels.serviceNow));
    }

    // Dashboard delivery
    if (rule.channels.dashboard?.enabled) {
      deliveryPromises.push(this.deliverDashboardAlert(alert, rule.channels.dashboard));
    }

    // Webhook delivery
    if (rule.channels.webhook?.enabled) {
      deliveryPromises.push(this.deliverWebhookAlert(alert, rule.channels.webhook));
    }

    // Execute all deliveries in parallel
    await Promise.allSettled(deliveryPromises);

    // Update alert with delivery status
    await this.alertsContainer.items.upsert(alert);
  }

  /**
   * Deliver alert via email
   */
  private async deliverEmailAlert(alert: NotificationAlert, emailConfig: NonNullable<NotificationRule['channels']['email']>): Promise<void> {
    try {
      alert.deliveryStatus.email = { sent: false, delivered: false };

      // Simulate email sending (in production, use actual email service)
      console.log(`Sending email alert to: ${emailConfig.recipients.join(', ')}`);
      console.log(`Subject: ${alert.title}`);
      console.log(`Body: ${alert.message}`);

      // Simulate successful delivery
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert.deliveryStatus.email = {
        sent: true,
        sentAt: new Date(),
        delivered: true,
        deliveredAt: new Date()
      };
    } catch (error) {
      alert.deliveryStatus.email = {
        sent: false,
        delivered: false,
        error: error instanceof Error ? error.message : 'Email delivery failed'
      };
    }
  }

  /**
   * Deliver alert via Microsoft Teams
   */
  private async deliverTeamsAlert(alert: NotificationAlert, teamsConfig: NonNullable<NotificationRule['channels']['teams']>): Promise<void> {
    try {
      alert.deliveryStatus.teams = { sent: false };

      const teamsMessage = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        summary: alert.title,
        themeColor: this.getSeverityColor(alert.severity),
        sections: [{
          activityTitle: alert.title,
          activitySubtitle: `Source: ${alert.source}`,
          text: alert.message,
          facts: [
            { name: 'Severity', value: alert.severity.toUpperCase() },
            { name: 'Category', value: alert.category },
            { name: 'Time', value: alert.createdAt.toLocaleString() }
          ]
        }],
        potentialAction: [{
          '@type': 'OpenUri',
          name: 'View in Dashboard',
          targets: [{
            os: 'default',
            uri: `${window.location.origin}/alerts/${alert.id}`
          }]
        }]
      };

      // Simulate Teams webhook call
      console.log(`Sending Teams message to: ${teamsConfig.webhookUrl}`);
      console.log(`Message:`, teamsMessage);

      await new Promise(resolve => setTimeout(resolve, 300));
      
      alert.deliveryStatus.teams = {
        sent: true,
        sentAt: new Date(),
        messageId: `teams-msg-${Date.now()}`
      };
    } catch (error) {
      alert.deliveryStatus.teams = {
        sent: false,
        error: error instanceof Error ? error.message : 'Teams delivery failed'
      };
    }
  }

  /**
   * Deliver alert via ServiceNow
   */
  private async deliverServiceNowAlert(alert: NotificationAlert, serviceNowConfig: NonNullable<NotificationRule['channels']['serviceNow']>): Promise<void> {
    try {
      alert.deliveryStatus.serviceNow = { sent: false };

      const incident = {
        short_description: alert.title,
        description: alert.message,
        severity: serviceNowConfig.severity,
        category: serviceNowConfig.category,
        assignment_group: serviceNowConfig.assignmentGroup,
        caller_id: 'cato-system',
        source: 'cATO Command Center'
      };

      // Simulate ServiceNow API call
      console.log(`Creating ServiceNow incident:`, incident);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const ticketNumber = `INC${String(Date.now()).slice(-6)}`;
      
      alert.deliveryStatus.serviceNow = {
        sent: true,
        sentAt: new Date(),
        ticketNumber,
        ticketUrl: `${notificationConfig.serviceNowSettings.instanceUrl}/nav_to.do?uri=incident.do?sys_id=${ticketNumber}`
      };
    } catch (error) {
      alert.deliveryStatus.serviceNow = {
        sent: false,
        error: error instanceof Error ? error.message : 'ServiceNow delivery failed'
      };
    }
  }

  /**
   * Deliver alert to dashboard
   */
  private async deliverDashboardAlert(alert: NotificationAlert, dashboardConfig: NonNullable<NotificationRule['channels']['dashboard']>): Promise<void> {
    try {
      alert.deliveryStatus.dashboard = {
        displayed: true,
        displayedAt: new Date(),
        viewedBy: [],
        dismissed: false
      };

      // In a real implementation, this would integrate with the dashboard's real-time update system
      console.log(`Displaying dashboard alert: ${alert.title}`);
    } catch (error) {
      alert.deliveryStatus.dashboard = {
        displayed: false
      };
    }
  }

  /**
   * Deliver alert via webhook
   */
  private async deliverWebhookAlert(alert: NotificationAlert, webhookConfig: NonNullable<NotificationRule['channels']['webhook']>): Promise<void> {
    try {
      alert.deliveryStatus.webhook = { sent: false };

      const payload = {
        alert,
        timestamp: new Date().toISOString(),
        source: 'cato-command-center'
      };

      // Simulate webhook call
      console.log(`Sending webhook to: ${webhookConfig.url}`);
      console.log(`Payload:`, payload);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      alert.deliveryStatus.webhook = {
        sent: true,
        sentAt: new Date(),
        responseStatus: 200
      };
    } catch (error) {
      alert.deliveryStatus.webhook = {
        sent: false,
        error: error instanceof Error ? error.message : 'Webhook delivery failed'
      };
    }
  }

  /**
   * Get severity color for UI elements
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#FF0000';
      case 'error': return '#FF6600';
      case 'warning': return '#FFB84D';
      case 'info': return '#0078D4';
      default: return '#6B7280';
    }
  }

  /**
   * Update rule statistics
   */
  private async updateRuleStatistics(ruleId: string): Promise<void> {
    try {
      // In production, use Cosmos DB patch operation or stored procedure
      console.log(`Updating statistics for rule ${ruleId}`);
    } catch (error) {
      console.error('Failed to update rule statistics:', error);
    }
  }

  /**
   * Get notification rules for tenant
   */
  async getNotificationRules(tenantId: string, enabledOnly: boolean = false): Promise<NotificationRule[]> {
    await this.ensureInitialized();

    try {
      const query = enabledOnly 
        ? 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.enabled = true ORDER BY c.priority DESC'
        : 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.priority DESC';

      const querySpec = {
        query,
        parameters: [{ name: '@tenantId', value: tenantId }]
      };

      const { resources } = await this.notificationRulesContainer.items.query(querySpec).fetchAll();
      return resources as NotificationRule[];
    } catch (error) {
      console.error('Failed to get notification rules:', error);
      return [];
    }
  }

  /**
   * Get active alerts with filtering
   */
  async getActiveAlerts(tenantId: string, filters?: {
    severities?: string[];
    categories?: string[];
    status?: string[];
    timeRange?: string;
    limit?: number;
  }): Promise<NotificationAlert[]> {
    await this.ensureInitialized();

    try {
      let query = 'SELECT * FROM c WHERE c.tenantId = @tenantId';
      const parameters = [{ name: '@tenantId', value: tenantId }];

      if (filters?.severities?.length) {
        query += ' AND ARRAY_CONTAINS(@severities, c.severity)';
        parameters.push({ name: '@severities', value: filters.severities as any });
      }

      if (filters?.categories?.length) {
        query += ' AND ARRAY_CONTAINS(@categories, c.category)';
        parameters.push({ name: '@categories', value: filters.categories as any });
      }

      if (filters?.status?.length) {
        query += ' AND ARRAY_CONTAINS(@statuses, c.status)';
        parameters.push({ name: '@statuses', value: filters.status as any });
      }

      if (filters?.timeRange) {
        const timeWindow = this.parseTimeRange(filters.timeRange);
        query += ' AND c.createdAt > @timeWindow';
        parameters.push({ name: '@timeWindow', value: timeWindow.toISOString() });
      }

      query += ' ORDER BY c.createdAt DESC';
      
      if (filters?.limit) {
        query = `SELECT TOP ${filters.limit} * FROM (${query.replace('SELECT *', 'SELECT c.*')}) as c`;
      }

      const querySpec = { query, parameters };
      const { resources } = await this.alertsContainer.items.query(querySpec).fetchAll();
      
      return resources as NotificationAlert[];
    } catch (error) {
      console.error('Failed to get active alerts:', error);
      return [];
    }
  }

  /**
   * Parse time range string to Date
   */
  private parseTimeRange(timeRange: string): Date {
    const now = new Date();
    const value = parseInt(timeRange.slice(0, -1));
    const unit = timeRange.slice(-1);

    switch (unit) {
      case 'h':
        return new Date(now.getTime() - value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
      case 'w':
        return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24 hours
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(tenantId: string, alertId: string, acknowledgedBy: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const alert = await this.getAlertById(tenantId, alertId);
      if (alert) {
        alert.status = 'acknowledged';
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        alert.updatedAt = new Date();

        await this.alertsContainer.items.upsert(alert);
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(tenantId: string, alertId: string, resolvedBy: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const alert = await this.getAlertById(tenantId, alertId);
      if (alert) {
        alert.status = 'resolved';
        alert.resolvedBy = resolvedBy;
        alert.resolvedAt = new Date();
        alert.updatedAt = new Date();

        await this.alertsContainer.items.upsert(alert);
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  private async getAlertById(tenantId: string, alertId: string): Promise<NotificationAlert | null> {
    try {
      const { resource } = await this.alertsContainer.item(alertId, tenantId).read();
      return resource as unknown as NotificationAlert;
    } catch (error) {
      if (error.code === 404) return null;
      throw error;
    }
  }

  /**
   * Get alert summary statistics
   */
  async getAlertSummary(tenantId: string): Promise<{
    totalActive: number;
    totalAcknowledged: number;
    totalResolved: number;
    criticalAlerts: number;
    averageResolutionTime: number;
    topCategories: { category: string; count: number }[];
    recentTrends: { date: string; count: number }[];
  }> {
    await this.ensureInitialized();

    try {
      const alerts = await this.getActiveAlerts(tenantId, { timeRange: '7d' });
      
      const totalActive = alerts.filter(a => a.status === 'active').length;
      const totalAcknowledged = alerts.filter(a => a.status === 'acknowledged').length;
      const totalResolved = alerts.filter(a => a.status === 'resolved').length;
      const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

      // Calculate average resolution time
      const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolvedAt);
      const averageResolutionTime = resolvedAlerts.length > 0
        ? resolvedAlerts.reduce((sum, alert) => {
            const resolutionTime = alert.resolvedAt!.getTime() - alert.createdAt.getTime();
            return sum + resolutionTime;
          }, 0) / resolvedAlerts.length / (1000 * 60) // Convert to minutes
        : 0;

      // Get top categories
      const categoryCount = new Map<string, number>();
      alerts.forEach(alert => {
        const count = categoryCount.get(alert.category) || 0;
        categoryCount.set(alert.category, count + 1);
      });
      
      const topCategories = Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get recent trends (simplified - last 7 days)
      const recentTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const count = alerts.filter(alert => 
          alert.createdAt >= dayStart && alert.createdAt < dayEnd
        ).length;

        return {
          date: dayStart.toISOString().split('T')[0],
          count
        };
      }).reverse();

      return {
        totalActive,
        totalAcknowledged,
        totalResolved,
        criticalAlerts,
        averageResolutionTime,
        topCategories,
        recentTrends
      };
    } catch (error) {
      console.error('Failed to get alert summary:', error);
      return {
        totalActive: 0,
        totalAcknowledged: 0,
        totalResolved: 0,
        criticalAlerts: 0,
        averageResolutionTime: 0,
        topCategories: [],
        recentTrends: []
      };
    }
  }
}

// Export singleton instance
export const enhancedNotificationService = new EnhancedNotificationService();

// Export types and class
export { EnhancedNotificationService };
