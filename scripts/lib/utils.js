/**
 * Utility functions for data transformation and validation
 */

/**
 * Normalize string by trimming whitespace and handling empty values
 */
function normalize(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}

/**
 * Convert string to kebab-case
 */
function kebab(str) {
  if (!str) return '';
  return normalize(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Map various pillar representations to standard ZTA pillar types
 */
function normalizePillar(pillar) {
  if (!pillar) return 'Identity'; // Default fallback
  
  const normalized = normalize(pillar).toLowerCase();
  
  // Map common variations to standard pillars
  const pillarMap = {
    'identity': 'Identity',
    'device': 'Device', 
    'devices': 'Device',
    'network': 'Network',
    'networking': 'Network',
    'application': 'Application',
    'applications': 'Application',
    'app': 'Application',
    'apps': 'Application',
    'data': 'Data',
    'visibility': 'Visibility',
    'analytics': 'Visibility',
    'monitoring': 'Visibility'
  };
  
  return pillarMap[normalized] || 'Identity';
}

/**
 * Map various status representations to standard status types
 */
function mapStatus(status) {
  if (!status) return 'Planned'; // Default fallback
  
  const normalized = normalize(status).toLowerCase();
  
  // Map common status variations
  const statusMap = {
    'complete': 'Complete',
    'completed': 'Complete',
    'done': 'Complete',
    'finished': 'Complete',
    'in progress': 'In Progress',
    'in-progress': 'In Progress',
    'inprogress': 'In Progress',
    'progress': 'In Progress',
    'ongoing': 'In Progress',
    'started': 'In Progress',
    'planned': 'Planned',
    'planning': 'Planned',
    'future': 'Planned',
    'upcoming': 'Planned',
    'not started': 'Planned',
    'not-started': 'Planned'
  };
  
  return statusMap[normalized] || 'Planned';
}

/**
 * Get progress percentage from status
 */
function getProgressFromStatus(status) {
  const statusProgress = {
    'Complete': 100,
    'In Progress': 50,
    'Planned': 0
  };
  
  return statusProgress[status] || 0;
}

/**
 * Split NIST controls from comma/semicolon delimited string
 */
function splitControls(controlsStr) {
  if (!controlsStr) return [];
  
  const controls = normalize(controlsStr);
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
function splitServices(servicesStr) {
  if (!servicesStr) return [];
  
  const services = normalize(servicesStr);
  if (!services) return [];
  
  return services
    .split(/[,;]/)
    .map(s => normalize(s))
    .filter(s => s.length > 0);
}

/**
 * Split remediation steps from delimited string
 */
function splitSteps(stepsStr) {
  if (!stepsStr) return '';
  
  const steps = normalize(stepsStr);
  if (!steps) return '';
  
  // If it looks like a list (contains numbers or bullets), keep as-is
  if (/^\s*[\d\.\-\*]/.test(steps)) {
    return steps;
  }
  
  // Otherwise, split on periods and rejoin as numbered list
  const sentences = steps
    .split(/\.\s+/)
    .map(s => normalize(s))
    .filter(s => s.length > 0);
    
  if (sentences.length <= 1) {
    return steps;
  }
  
  return sentences
    .map((s, i) => `${i + 1}. ${s}${s.endsWith('.') ? '' : '.'}`)
    .join('\n');
}

/**
 * Generate a unique ID from ID field and title
 */
function generateId(idField, title) {
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
function generateCapabilityId(idField, title) {
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
function createBackupFilename(containerName) {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `${containerName}-${timestamp}.json`;
}

/**
 * Log with timestamp
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * Validate required field is present and not empty
 */
function validateRequired(value, fieldName) {
  const normalized = normalize(value);
  if (!normalized) {
    throw new Error(`Required field missing: ${fieldName}`);
  }
  return normalized;
}

module.exports = {
  normalize,
  kebab,
  normalizePillar,
  mapStatus,
  getProgressFromStatus,
  splitControls,
  splitServices,
  splitSteps,
  generateId,
  generateCapabilityId,
  createBackupFilename,
  log,
  validateRequired
};
