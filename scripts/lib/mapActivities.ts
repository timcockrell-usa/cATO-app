/**
 * Map CSV rows to ZTA Activities documents
 */

import {
  CSVRow,
  getCSVValue
} from './csv';
import {
  normalizePillar,
  mapStatus,
  getProgressFromStatus,
  splitControls,
  splitServices,
  splitSteps,
  generateId,
  validateRequired,
  normalize,
  ZTAPillarType,
  ZTAStatusType,
  log
} from './utils';

export interface ZTAActivityDocument {
  id: string;
  title: string;
  description: string;
  pillar: ZTAPillarType;
  maturityLevel: string;
  priority: string;
  status: ZTAStatusType;
  assignedTo: string;
  dueDate: string;
  progress: number;
  azureServices: string[];
  nistMappings: string[];
  remediationSteps: string[];
  azureCommercialRemediation: string;
  azureGovernmentRemediation: string;
  evidence: any[];
  milestones: any[];
  partitionKey: string;
  // Additional fields from CSV
  responsibility?: string;
  activityType?: string;
  duration?: string;
  outcomes?: string;
  endState?: string;
  predecessors?: string;
  successors?: string;
}

/**
 * Map a CSV row to a ZTA Activity document
 */
export function mapActivityRow(row: CSVRow, rowIndex: number): ZTAActivityDocument {
  try {
    // Extract fields with flexible header matching
    const idField = getCSVValue(row, ['ID#', 'ID', 'Activity ID']);
    const activityName = getCSVValue(row, ['Activity Name', 'Name', 'Title']);
    const pillar = getCSVValue(row, ['Pillar']);
    const responsibility = getCSVValue(row, ['Responsibility']);
    const activityType = getCSVValue(row, ['Activity Type', 'Type']);
    const duration = getCSVValue(row, ['Duration']);
    const descriptions = getCSVValue(row, ['Descriptions', 'Description']);
    const outcomes = getCSVValue(row, ['Outcomes', 'Outcome']);
    const endState = getCSVValue(row, ['End State', 'EndState']);
    const predecessors = getCSVValue(row, ['Predecessor(s)', 'Predecessors']);
    const successors = getCSVValue(row, ['Successor(s)', 'Successors']);
    const nistControls = getCSVValue(row, ['Related NIST Controls', 'NIST Controls']);
    const azureCommercial = getCSVValue(row, ['Azure Commercial Remediation']);
    const azureGovernment = getCSVValue(row, ['Azure Government Remediation']);

    // Validate required fields
    const title = validateRequired(activityName, 'Activity Name');
    const description = validateRequired(descriptions, 'Descriptions');

    // Generate document ID
    const id = generateId(idField, title);

    // Map pillar
    const normalizedPillar = normalizePillar(pillar);

    // Map status from end state
    const status = mapStatus(endState);
    const progress = getProgressFromStatus(status);

    // Parse structured fields
    const nistMappings = splitControls(nistControls);
    const azureServices = splitServices(azureCommercial);
    const remediationSteps = splitSteps(azureCommercial);

    // Build the document
    const document: ZTAActivityDocument = {
      id,
      title,
      description,
      pillar: normalizedPillar,
      maturityLevel: 'Initial', // Default as specified
      priority: 'High', // Default as specified
      status,
      assignedTo: responsibility || 'TBD',
      dueDate: '2025-12-31T00:00:00.000Z', // Default as specified
      progress,
      azureServices,
      nistMappings,
      remediationSteps,
      azureCommercialRemediation: azureCommercial,
      azureGovernmentRemediation: azureGovernment,
      evidence: [],
      milestones: [],
      partitionKey: 'zta-activity',
      // Additional fields from CSV
      responsibility: normalize(responsibility),
      activityType: normalize(activityType),
      duration: normalize(duration),
      outcomes: normalize(outcomes),
      endState: normalize(endState),
      predecessors: normalize(predecessors),
      successors: normalize(successors)
    };

    return document;

  } catch (error: any) {
    const errorMsg = `Failed to map activity row ${rowIndex + 1}: ${error.message}`;
    log(errorMsg, 'error');
    throw new Error(errorMsg);
  }
}

/**
 * Map multiple CSV rows to ZTA Activity documents
 */
export function mapActivities(csvData: CSVRow[]): ZTAActivityDocument[] {
  log(`Mapping ${csvData.length} activity rows to documents`);
  
  const documents: ZTAActivityDocument[] = [];
  const skippedRows: number[] = [];

  csvData.forEach((row, index) => {
    try {
      // Skip rows that don't have essential data
      const activityName = getCSVValue(row, ['Activity Name', 'Name', 'Title']);
      const descriptions = getCSVValue(row, ['Descriptions', 'Description']);
      
      if (!activityName || !descriptions) {
        skippedRows.push(index + 1);
        return;
      }

      const document = mapActivityRow(row, index);
      documents.push(document);

    } catch (error: any) {
      log(`Skipping row ${index + 1}: ${error.message}`, 'warn');
      skippedRows.push(index + 1);
    }
  });

  log(`Successfully mapped ${documents.length} activities`);
  if (skippedRows.length > 0) {
    log(`Skipped ${skippedRows.length} rows: ${skippedRows.join(', ')}`, 'warn');
  }

  return documents;
}

/**
 * Validate activity document before upserting
 */
export function validateActivity(activity: ZTAActivityDocument): boolean {
  const required = ['id', 'title', 'description', 'pillar', 'status'];
  
  for (const field of required) {
    if (!activity[field as keyof ZTAActivityDocument]) {
      log(`Activity ${activity.id} missing required field: ${field}`, 'error');
      return false;
    }
  }

  // Validate pillar value
  const validPillars: ZTAPillarType[] = ['Identity', 'Device', 'Network', 'Application', 'Data', 'Visibility'];
  if (!validPillars.includes(activity.pillar)) {
    log(`Activity ${activity.id} has invalid pillar: ${activity.pillar}`, 'error');
    return false;
  }

  // Validate status value
  const validStatuses: ZTAStatusType[] = ['Complete', 'In Progress', 'Planned'];
  if (!validStatuses.includes(activity.status)) {
    log(`Activity ${activity.id} has invalid status: ${activity.status}`, 'error');
    return false;
  }

  return true;
}

/**
 * Show activities summary
 */
export function showActivitiesSummary(activities: ZTAActivityDocument[]): void {
  log('\n=== ZTA Activities Summary ===');
  
  // Count by pillar
  const pillarCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  
  activities.forEach(activity => {
    pillarCounts[activity.pillar] = (pillarCounts[activity.pillar] || 0) + 1;
    statusCounts[activity.status] = (statusCounts[activity.status] || 0) + 1;
  });

  console.log(`Total activities: ${activities.length}`);
  console.log('\nBy Pillar:');
  Object.entries(pillarCounts).forEach(([pillar, count]) => {
    console.log(`  ${pillar}: ${count}`);
  });

  console.log('\nBy Status:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Show sample IDs
  const sampleIds = activities.slice(0, 5).map(a => a.id);
  console.log(`\nSample IDs: ${sampleIds.join(', ')}`);
}
