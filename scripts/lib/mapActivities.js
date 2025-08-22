/**
 * Map CSV rows to ZTA Activities documents
 */

const { getCSVValue } = require('./csv');
const {
  normalizePillar,
  mapStatus,
  getProgressFromStatus,
  splitControls,
  splitServices,
  splitSteps,
  generateId,
  validateRequired,
  normalize,
  log
} = require('./utils');

/**
 * Map a CSV row to a ZTA Activity document
 */
function mapActivityRow(row, rowIndex) {
  try {
    // Extract fields with flexible header matching
    const idNum = getCSVValue(row, ['ID #', 'ID', 'Activity ID']);
    const activityTitle = getCSVValue(row, ['Activity Title', 'Title']);
    const activityDescription = getCSVValue(row, ['Activity Description', 'Description']);
    const pillar = getCSVValue(row, ['Pillar', 'Activity Pillar']);
    const status = getCSVValue(row, ['Status']);
    const azureServices = getCSVValue(row, ['Azure Services']);
    const nistControls = getCSVValue(row, ['Related NIST Controls', 'NIST Controls']);
    const remediationSteps = getCSVValue(row, ['Remediation Steps']);

    // Validate required fields
    const title = validateRequired(activityTitle, 'Activity Title');
    const description = validateRequired(activityDescription, 'Activity Description');

    // Generate document ID
    const id = generateId(idNum, title);

    // Map and validate structured fields
    const normalizedPillar = normalizePillar(pillar);
    const normalizedStatus = mapStatus(status);
    const progress = getProgressFromStatus(normalizedStatus);

    // Parse delimited fields
    const azureServicesList = splitServices(azureServices);
    const nistMappings = splitControls(nistControls);
    const formattedSteps = splitSteps(remediationSteps);

    // Build the document
    const document = {
      id,
      title,
      description,
      pillar: normalizedPillar,
      status: normalizedStatus,
      progress,
      azureServices: azureServicesList,
      nistMappings,
      remediationSteps: formattedSteps,
      partitionKey: 'zta-activity',
      // Additional metadata for debugging
      sourceIdNumber: normalize(idNum),
      sourcePillar: normalize(pillar),
      sourceStatus: normalize(status)
    };

    return document;

  } catch (error) {
    const errorMsg = `Failed to map activity row ${rowIndex + 1}: ${error.message}`;
    log(errorMsg, 'error');
    throw new Error(errorMsg);
  }
}

/**
 * Map multiple CSV rows to ZTA Activity documents
 */
function mapActivities(csvData) {
  log(`Mapping ${csvData.length} activity rows to documents`);
  
  const documents = [];
  const skippedRows = [];

  csvData.forEach((row, index) => {
    try {
      // Skip rows that don't have essential data
      const activityTitle = getCSVValue(row, ['Activity Title', 'Title']);
      const activityDescription = getCSVValue(row, ['Activity Description', 'Description']);
      
      if (!activityTitle || !activityDescription) {
        skippedRows.push(index + 1);
        return;
      }

      const document = mapActivityRow(row, index);
      documents.push(document);

    } catch (error) {
      log(`Skipping activity row ${index + 1}: ${error.message}`, 'warn');
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
function validateActivity(activity) {
  const required = ['id', 'title', 'description', 'pillar', 'status'];
  
  for (const field of required) {
    if (!activity[field]) {
      log(`Activity ${activity.id} missing required field: ${field}`, 'error');
      return false;
    }
  }

  // Validate pillar value
  const validPillars = ['Identity', 'Device', 'Network', 'Application', 'Data', 'Visibility'];
  if (!validPillars.includes(activity.pillar)) {
    log(`Activity ${activity.id} has invalid pillar: ${activity.pillar}`, 'error');
    return false;
  }

  // Validate status value
  const validStatuses = ['Complete', 'In Progress', 'Planned'];
  if (!validStatuses.includes(activity.status)) {
    log(`Activity ${activity.id} has invalid status: ${activity.status}`, 'error');
    return false;
  }

  return true;
}

/**
 * Show activities summary
 */
function showActivitiesSummary(activities) {
  log('\n=== ZTA Activities Summary ===');
  
  // Count by pillar
  const pillarCounts = {};
  const statusCounts = {};
  
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

  // Show samples with Azure services
  const withAzure = activities.filter(a => a.azureServices.length > 0);
  console.log(`\nActivities with Azure services: ${withAzure.length}`);
  
  if (withAzure.length > 0) {
    const sampleAzure = withAzure.slice(0, 3);
    sampleAzure.forEach(activity => {
      console.log(`  ${activity.id}: ${activity.azureServices.join(', ')}`);
    });
  }

  // Show samples with NIST mappings
  const withNist = activities.filter(a => a.nistMappings.length > 0);
  console.log(`\nActivities with NIST mappings: ${withNist.length}`);
  
  if (withNist.length > 0) {
    const sampleNist = withNist.slice(0, 3);
    sampleNist.forEach(activity => {
      console.log(`  ${activity.id}: ${activity.nistMappings.join(', ')}`);
    });
  }
}

module.exports = {
  mapActivityRow,
  mapActivities,
  validateActivity,
  showActivitiesSummary
};
