const fs = require('fs');
const path = require('path');

// Function to parse CSV manually
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    // Handle quoted fields that might contain commas
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim()); // Don't forget the last field
    
    const result = {};
    headers.forEach((header, index) => {
      result[header] = fields[index] || '';
    });
    return result;
  });
}

// Function to determine control family from control ID
function getControlFamily(controlId) {
  const familyMap = {
    'AC': 'Access Control',
    'AT': 'Awareness and Training',
    'AU': 'Audit and Accountability',
    'CA': 'Assessment, Authorization, and Monitoring',
    'CM': 'Configuration Management',
    'CP': 'Contingency Planning',
    'IA': 'Identification and Authentication',
    'IR': 'Incident Response',
    'MA': 'Maintenance',
    'MP': 'Media Protection',
    'PE': 'Physical and Environmental Protection',
    'PL': 'Planning',
    'PM': 'Program Management',
    'PS': 'Personnel Security',
    'PT': 'PII Processing and Transparency',
    'RA': 'Risk Assessment',
    'SA': 'System and Services Acquisition',
    'SC': 'System and Communications Protection',
    'SI': 'System and Information Integrity',
    'SR': 'Supply Chain Risk Management'
  };
  
  const prefix = controlId.split('-')[0];
  return familyMap[prefix] || 'Unknown';
}

// Function to load NIST controls from CSV file
function loadNistControlsFromCSV() {
  const csvPath = path.join(__dirname, '..', 'data', 'nist.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`NIST CSV file not found at: ${csvPath}`);
  }

  console.log(`📂 Reading NIST controls from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvData = parseCSV(csvContent);
  
  console.log(`📊 Found ${csvData.length} NIST controls in CSV`);

  // Convert CSV data to the format expected by the application
  const nistControls = csvData.map((row, index) => {
    const controlId = row['Control Identifier'] || `UNKNOWN-${index}`;
    const title = row['Control (or Control Enhancement) Name'] || 'No Title';
    const description = row['Control Text'] || 'No Description';
    const discussion = row['Discussion'] || '';
    const implementation = row['Azure Commercial Remediation'] || 'No Azure implementation provided';
    const relatedControls = row['Related NIST Controls'] || '';
    
    // Determine status and risk level based on implementation content
    let status = 'partial';
    let riskLevel = 'medium';
    
    if (implementation.toLowerCase().includes('not applicable') || 
        implementation.toLowerCase().includes('manual') ||
        implementation.toLowerCase().includes('outside azure') ||
        implementation.toLowerCase().includes('no azure') ||
        implementation === 'No Azure implementation provided') {
      status = 'not-assessed';
      riskLevel = 'low';
    } else if (implementation.toLowerCase().includes('azure') && 
               implementation.length > 50) {
      status = 'compliant';
      riskLevel = 'low';
    } else if (implementation.toLowerCase().includes('noncompliant') ||
               implementation.toLowerCase().includes('high risk')) {
      status = 'noncompliant';
      riskLevel = 'high';
    }

    return {
      id: controlId,
      controlFamily: getControlFamily(controlId),
      controlIdentifier: controlId,
      controlName: title,
      description: description,
      fullControlText: description,
      discussion: discussion,
      relatedControls: relatedControls ? relatedControls.split(',').map(c => c.trim()) : [],
      azureImplementation: implementation,
      azureCommercialRemediation: implementation,
      azureGovernmentRemediation: row['Azure Government Remediation'] || implementation,
      status: status,
      implementation: implementation,
      lastAssessed: new Date().toISOString().split('T')[0],
      assessedBy: 'CSV Import',
      evidence: [],
      riskLevel: riskLevel,
      poamItems: []
    };
  });

  return nistControls;
}

// Generate the TypeScript file
function generateNISTControlsFile() {
  const controls = loadNistControlsFromCSV();
  
  const fileContent = `// NIST 800-53 Rev 5 Controls with Azure Implementation Guidance
// Generated from official NIST catalog: ${new Date().toISOString()}
// Total controls: ${controls.length}

export interface NISTControl {
  id: string;
  controlFamily: string;
  controlIdentifier: string;
  controlName: string;
  description: string;
  fullControlText: string;
  discussion: string;
  relatedControls: string[];
  azureImplementation: string;
  azureCommercialRemediation: string;
  azureGovernmentRemediation: string;
  status: 'compliant' | 'partial' | 'noncompliant' | 'not-assessed';
  implementation: string;
  lastAssessed: string;
  assessedBy: string;
  evidence: any[];
  riskLevel: 'low' | 'medium' | 'high';
  poamItems: any[];
}

export const nistControlsEnhanced: NISTControl[] = ${JSON.stringify(controls, null, 2)};

// Helper functions
export function getControlsByFamily(family: string): NISTControl[] {
  return nistControlsEnhanced.filter(control => control.controlFamily === family);
}

export function getControlById(controlId: string): NISTControl | undefined {
  return nistControlsEnhanced.find(control => control.id === controlId);
}

export function getControlsByStatus(status: string): NISTControl[] {
  return nistControlsEnhanced.filter(control => control.status === status);
}

export function getControlsByRiskLevel(riskLevel: string): NISTControl[] {
  return nistControlsEnhanced.filter(control => control.riskLevel === riskLevel);
}

export function getComplianceStatistics() {
  const total = nistControlsEnhanced.length;
  const compliant = nistControlsEnhanced.filter(c => c.status === 'compliant').length;
  const partial = nistControlsEnhanced.filter(c => c.status === 'partial').length;
  const nonCompliant = nistControlsEnhanced.filter(c => c.status === 'noncompliant').length;
  const notAssessed = nistControlsEnhanced.filter(c => c.status === 'not-assessed').length;
  
  return {
    total,
    compliant,
    partial,
    nonCompliant,
    notAssessed,
    compliancePercentage: Math.round((compliant / total) * 100)
  };
}

export default nistControlsEnhanced;
`;

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'nistControlsEnhanced.ts');
  fs.writeFileSync(outputPath, fileContent);
  
  console.log(`✅ Generated NIST controls file: ${outputPath}`);
  console.log(`📊 Total controls: ${controls.length}`);
}

// Run the script
try {
  generateNISTControlsFile();
  console.log('🎉 NIST controls data generation completed!');
} catch (error) {
  console.error('❌ Error generating NIST controls:', error);
  process.exit(1);
}
