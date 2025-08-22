/**
 * Map CSV rows to ZTA Capabilities documents
 */

const { getCSVValue } = require('./csv.cjs');
const {
  normalizePillar,
  splitControls,
  generateCapabilityId,
  validateRequired,
  normalize,
  log
} = require('./utils.cjs');

/**
 * Map a CSV row to a ZTA Capability document
 */
function mapCapabilityRow(row, rowIndex) {
  try {
    // Extract fields with flexible header matching
    const idNum = getCSVValue(row, ['ID #', 'ID', 'Capability ID']);
    const capabilityPillar = getCSVValue(row, ['Capability Pillar', 'Pillar']);
    const capabilityDescription = getCSVValue(row, ['Capability Description', 'Description']);
    const capabilityOutcome = getCSVValue(row, ['Capability Outcome', 'Outcome']);
    const impactToZT = getCSVValue(row, ['Impact to ZT', 'Impact']);
    const associatedActivities = getCSVValue(row, ['Associated Activities', 'Activities']);
    const nistControls = getCSVValue(row, ['Related NIST Controls', 'NIST Controls']);
    const azureCommercial = getCSVValue(row, ['Azure Commercial Remediation']);
    const azureGovernment = getCSVValue(row, ['Azure Government Remediation']);

    // Validate required fields
    const description = validateRequired(capabilityDescription, 'Capability Description');
    const outcome = validateRequired(capabilityOutcome, 'Capability Outcome');

    // Generate title from capability pillar or description
    let title = normalize(capabilityPillar);
    if (!title || title.length < 3) {
      // Extract a meaningful title from the description
      const words = description.split(' ').slice(0, 4);
      title = words.join(' ');
    }

    // Generate document ID
    const id = generateCapabilityId(idNum, title);

    // Map pillar from capability pillar field
    const normalizedPillar = normalizePillar(capabilityPillar);

    // Parse structured fields
    const nistMappings = splitControls(nistControls);

    // Build the document
    const document = {
      id,
      title,
      description,
      outcome,
      impactToZT: normalize(impactToZT),
      pillar: normalizedPillar,
      associatedActivities: normalize(associatedActivities),
      nistMappings,
      azureCommercialRemediation: azureCommercial,
      azureGovernmentRemediation: azureGovernment,
      partitionKey: 'zta-capability',
      // Additional metadata
      idNumber: normalize(idNum),
      capabilityPillar: normalize(capabilityPillar)
    };

    return document;

  } catch (error) {
    const errorMsg = `Failed to map capability row ${rowIndex + 1}: ${error.message}`;
    log(errorMsg, 'error');
    throw new Error(errorMsg);
  }
}

/**
 * Map multiple CSV rows to ZTA Capability documents
 */
function mapCapabilities(csvData) {
  log(`Mapping ${csvData.length} capability rows to documents`);
  
  const documents = [];
  const skippedRows = [];

  csvData.forEach((row, index) => {
    try {
      // Skip rows that don't have essential data
      const capabilityDescription = getCSVValue(row, ['Capability Description', 'Description']);
      const capabilityOutcome = getCSVValue(row, ['Capability Outcome', 'Outcome']);
      
      if (!capabilityDescription || !capabilityOutcome) {
        skippedRows.push(index + 1);
        return;
      }

      const document = mapCapabilityRow(row, index);
      documents.push(document);

    } catch (error) {
      log(`Skipping capability row ${index + 1}: ${error.message}`, 'warn');
      skippedRows.push(index + 1);
    }
  });

  log(`Successfully mapped ${documents.length} capabilities`);
  if (skippedRows.length > 0) {
    log(`Skipped ${skippedRows.length} rows: ${skippedRows.join(', ')}`, 'warn');
  }

  return documents;
}

/**
 * Validate capability document before upserting
 */
function validateCapability(capability) {
  const required = ['id', 'title', 'description', 'outcome', 'pillar'];
  
  for (const field of required) {
    if (!capability[field]) {
      log(`Capability ${capability.id} missing required field: ${field}`, 'error');
      return false;
    }
  }

  // Validate pillar value
  const validPillars = ['Identity', 'Device', 'Network', 'Application', 'Data', 'Visibility'];
  if (!validPillars.includes(capability.pillar)) {
    log(`Capability ${capability.id} has invalid pillar: ${capability.pillar}`, 'error');
    return false;
  }

  return true;
}

/**
 * Show capabilities summary
 */
function showCapabilitiesSummary(capabilities) {
  log('\n=== ZTA Capabilities Summary ===');
  
  // Count by pillar
  const pillarCounts = {};
  
  capabilities.forEach(capability => {
    pillarCounts[capability.pillar] = (pillarCounts[capability.pillar] || 0) + 1;
  });

  console.log(`Total capabilities: ${capabilities.length}`);
  console.log('\nBy Pillar:');
  Object.entries(pillarCounts).forEach(([pillar, count]) => {
    console.log(`  ${pillar}: ${count}`);
  });

  // Show sample IDs
  const sampleIds = capabilities.slice(0, 5).map(c => c.id);
  console.log(`\nSample IDs: ${sampleIds.join(', ')}`);

  // Show samples with NIST mappings
  const withNist = capabilities.filter(c => c.nistMappings.length > 0);
  console.log(`\nCapabilities with NIST mappings: ${withNist.length}`);
  
  if (withNist.length > 0) {
    const sampleNist = withNist.slice(0, 3);
    sampleNist.forEach(cap => {
      console.log(`  ${cap.id}: ${cap.nistMappings.join(', ')}`);
    });
  }
}

module.exports = {
  mapCapabilityRow,
  mapCapabilities,
  validateCapability,
  showCapabilitiesSummary
};
