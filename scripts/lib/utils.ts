/**
 * Utility functions for CSV import and data transformation
 */

export interface ZTAPillar {
  Identity: 'Identity';
  Device: 'Device';
  Network: 'Network';
  Application: 'Application';
  Data: 'Data';
  Visibility: 'Visibility';
}

export type ZTAPillarType = keyof ZTAPillar;

export interface ZTAStatus {
  Complete: 'Complete';
  'In Progress': 'In Progress';
  Planned: 'Planned';
}

export type ZTAStatusType = keyof ZTAStatus;

/**
 * Convert string to kebab-case format
 */
export function kebab(str: string): string {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalize text by trimming and removing extra whitespace
 */
export function normalize(str: string): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Map pillar names to standardized values
 */
export function normalizePillar(pillar: string): ZTAPillarType {
  const normalized = normalize(pillar).toLowerCase();
  
  if (normalized.includes('identity') || normalized.includes('user')) return 'Identity';
  if (normalized.includes('device')) return 'Device';
  if (normalized.includes('network') || normalized.includes('environment')) return 'Network';
  if (normalized.includes('application') || normalized.includes('workload')) return 'Application';
  if (normalized.includes('data')) return 'Data';
  if (normalized.includes('visibility') || normalized.includes('analytics')) return 'Visibility';
  
  // Default fallback
  return 'Identity';
}

/**
 * Map end state descriptions to status values
 */
export function mapStatus(endState: string): ZTAStatusType {
  if (!endState) return 'Planned';
  
  const normalized = normalize(endState).toLowerCase();
  
  if (normalized.includes('complete')) return 'Complete';
  if (normalized.includes('progress')) return 'In Progress';
  
  return 'Planned';
}

/**
 * Get progress percentage based on status
 */
export function getProgressFromStatus(status: ZTAStatusType): number {
  switch (status) {
    case 'Complete': return 100;
    case 'In Progress': return 50;
    case 'Planned': return 0;
    default: return 0;
  }
}

/**
 * Split NIST controls from comma/semicolon delimited string
 */
export function splitControls(controls: string): string[] {
  if (!controls) return [];
  
  return controls
    .split(/[,;]/)
    .map(c => normalize(c))
    .filter(c => c.length > 0)
    .map(c => c.toUpperCase()) // NIST controls are typically uppercase
    .filter(c => /^[A-Z]{2}-\d+/.test(c)); // Basic NIST control format validation
}

/**
 * Split Azure services from comma/semicolon delimited string
 */
export function splitServices(services: string): string[] {
  if (!services) return [];
  
  return services
    .split(/[,;]/)
    .map(s => normalize(s))
    .filter(s => s.length > 0);
}

/**
 * Split remediation steps on periods, semicolons, or newlines
 */
export function splitSteps(steps: string): string[] {
  if (!steps) return [];
  
  return steps
    .split(/[.;\n]/)
    .map(s => normalize(s))
    .filter(s => s.length > 0 && s.length > 5); // Filter out very short fragments
}

/**
 * Generate a unique ID from ID field and title
 */
export function generateId(idField: string, title: string): string {
  // Prefer the CSV ID field if available and meaningful
  if (idField && idField.trim() && !idField.toLowerCase().includes('id')) {
    return normalize(idField).replace(/\s+/g, '-').toLowerCase();
  }
  
  // Fallback to kebab-case title
  return kebab(title);
}

/**
 * Generate a unique ID for a capability
 */
export function generateCapabilityId(idField: string, title: string): string {
  // Prefer the CSV ID field if available and meaningful
  if (idField && idField.trim() && !idField.toLowerCase().includes('id')) {
    return `zta-capability-${normalize(idField).replace(/\s+/g, '-').toLowerCase()}`;
  }
  
  // Fallback to kebab-case title
  return `zta-capability-${kebab(title)}`;
}

/**
 * Create backup filename with timestamp
 */
export function createBackupFilename(containerName: string): string {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `${containerName}-${timestamp}.json`;
}

/**
 * Log with timestamp
 */
export function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * Clean and validate required fields
 */
export function validateRequired(value: string, fieldName: string): string {
  const cleaned = normalize(value);
  if (!cleaned) {
    throw new Error(`Required field '${fieldName}' is missing or empty`);
  }
  return cleaned;
}
