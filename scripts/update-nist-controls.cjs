const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Azure implementation mappings for common controls
const azureImplementationMappings = {
  'AC-1': {
    implementation: 'This is a procedural control. The organization must develop a formal Access Control Policy. This policy should be stored in a version-controlled repository like Azure Repos, and its existence can be attested to using manual Azure Policy definitions (e.g., CMA_0144).',
    status: 'partial',
    riskLevel: 'medium'
  },
  'AC-2': {
    implementation: 'Implement Microsoft Entra ID Governance. Use Lifecycle Workflows to automate Joiner-Mover-Leaver (JML) processes based on an HR system of record. Use Microsoft Entra Access Reviews to periodically recertify access to critical applications and privileged groups.',
    status: 'compliant',
    riskLevel: 'low'
  },
  'AC-3': {
    implementation: 'Implement Microsoft Entra Conditional Access policies to enforce access controls based on user, device, location, and risk signals. Use Azure Role-Based Access Control (RBAC) with the principle of least privilege for managing Azure resources.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'AC-4': {
    implementation: 'Implement a hub-spoke network topology with Azure Firewall in the hub for centralized traffic inspection. Use Network Security Groups (NSGs) for micro-segmentation between subnets. Secure PaaS services with Azure Private Link to prevent data exfiltration over the public internet.',
    status: 'noncompliant',
    riskLevel: 'high'
  },
  'AC-5': {
    implementation: 'Use custom Azure RBAC roles to separate conflicting duties (e.g., a "Developer" role cannot approve its own deployments). Use Azure Policy to audit for potential violations, such as a single user having both "Contributor" and "Security Admin" roles.',
    status: 'compliant',
    riskLevel: 'low'
  },
  'AC-6': {
    implementation: 'Implement Microsoft Entra Privileged Identity Management (PIM) to provide just-in-time (JIT) access to privileged roles. Convert all standing privileged access to "eligible" assignments that require activation with MFA and justification.',
    status: 'compliant',
    riskLevel: 'low'
  },
  'AC-7': {
    implementation: 'Leverage the built-in Microsoft Entra ID Smart Lockout feature, which uses risk-based intelligence to lock out attackers while avoiding locking out legitimate users. For IaaS VMs, configure account lockout policies via Group Policy (Windows) or PAM (Linux).',
    status: 'compliant',
    riskLevel: 'low'
  },
  'AU-2': {
    implementation: 'Enable Azure Activity Log for management plane events. Use Azure Monitor Logs to collect and analyze platform and application logs. Configure Azure Security Center to collect security-related events from VMs.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'AU-3': {
    implementation: 'Azure platform logs include timestamp, source, event type, and user information. For applications, use Azure Application Insights to capture detailed telemetry with custom properties for security-relevant events.',
    status: 'compliant',
    riskLevel: 'low'
  },
  'AU-6': {
    implementation: 'Use Azure Sentinel for SIEM capabilities to correlate logs across Azure services. Implement custom KQL queries to detect suspicious activities. Use Azure Monitor Workbooks for audit log dashboards.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'CA-2': {
    implementation: 'Use Azure Policy to implement continuous compliance monitoring. Create custom policy definitions to assess control implementation. Use Azure Security Center recommendations for security assessments.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'CA-7': {
    implementation: 'Deploy Azure Sentinel for continuous monitoring. Use Azure Monitor to track performance and availability metrics. Implement custom KQL queries and workbooks for real-time security monitoring.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'CM-2': {
    implementation: 'Use Azure Resource Manager templates or Bicep for infrastructure as code. Implement Azure Policy to enforce configuration baselines. Use Azure Automation State Configuration for VM configuration management.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'CM-6': {
    implementation: 'Define security configuration baselines using Azure Security Benchmark. Use Azure Policy to enforce configuration settings. Implement Azure Automation for configuration management at scale.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'CP-10': {
    implementation: 'Implement Azure Site Recovery for automated failover of VMs. Use Azure Traffic Manager for DNS-level failover. Design applications with Azure availability zones for automatic failover.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'IA-2': {
    implementation: 'Enforce multi-factor authentication (MFA) for all users through Microsoft Entra ID. Use Conditional Access policies to require MFA based on risk signals, location, and device compliance status.',
    status: 'compliant',
    riskLevel: 'low'
  },
  'IA-5': {
    implementation: 'Implement Microsoft Entra Password Protection to prevent use of weak passwords. Use Azure Key Vault for application secrets management. For VMs, use Azure VM extensions to enforce password complexity.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'IR-4': {
    implementation: 'Use Azure Sentinel for incident response orchestration. Implement Logic Apps for automated incident response workflows. Use Azure Monitor alerts for incident detection and notification.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'RA-5': {
    implementation: 'Use Microsoft Defender for Cloud for vulnerability assessments. Implement Azure Security Center recommendations for remediation. Use third-party vulnerability scanners integrated with Azure Security Center.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'SC-7': {
    implementation: 'Implement network security groups (NSGs) and application security groups (ASGs) for micro-segmentation. Use Azure Firewall or third-party NVAs for inspection of north-south traffic. Deploy Azure Private Link for secure access to PaaS services.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'SC-8': {
    implementation: 'Azure enforces TLS 1.2+ for all HTTPS communications. Use Azure Front Door or Application Gateway to terminate TLS at the edge. For internal communications, configure services to use TLS/SSL.',
    status: 'compliant',
    riskLevel: 'low'
  },
  'SC-13': {
    implementation: 'Use Azure Key Vault with HSM-backed keys for cryptographic operations. Implement Azure Storage Service Encryption with customer-managed keys. Use Azure Disk Encryption for VM disk encryption.',
    status: 'partial',
    riskLevel: 'medium'
  },
  'SI-4': {
    implementation: 'Deploy Microsoft Defender for Cloud for security monitoring. Use Azure Network Watcher for network traffic analysis. Implement Azure Sentinel for advanced threat detection and response.',
    status: 'partial',
    riskLevel: 'medium'
  }
};

// Control family mappings
const controlFamilies = {
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

function getControlFamily(controlId) {
  const familyCode = controlId.split('-')[0];
  return controlFamilies[familyCode] || 'Unknown';
}

function getDefaultStatus(controlId) {
  // Enhancements are typically not assessed initially
  if (controlId.includes('(')) return 'not-assessed';
  
  // Common base controls that are typically partially implemented
  const commonControls = ['AC-2', 'AC-3', 'AC-5', 'AC-6', 'IA-2', 'IA-5', 'AU-2', 'AU-3', 'SC-7', 'SC-8'];
  if (commonControls.includes(controlId)) return 'partial';
  
  return 'not-assessed';
}

function getRiskLevel(status) {
  switch (status) {
    case 'compliant': return 'low';
    case 'partial': return 'medium';
    case 'noncompliant': return 'high';
    default: return 'medium';
  }
}

function convertToNISTControl(csvRow) {
  const controlId = csvRow['Control Identifier'];
  const family = getControlFamily(controlId);
  const azureImpl = azureImplementationMappings[controlId];
  const defaultStatus = getDefaultStatus(controlId);
  
  // Use CSV remediation if available, fallback to existing mappings
  const azureCommercialRemediation = csvRow['Azure Commercial Remediation'] || '';
  const azureGovRemediation = csvRow['Azure Government Remediation'] || '';
  
  // Determine implementation guidance - prefer CSV data
  let implementationGuidance = '';
  let implementationStatus = defaultStatus;
  let riskLevel = 'medium';
  
  if (azureCommercialRemediation && azureCommercialRemediation.trim() !== '') {
    implementationGuidance = azureCommercialRemediation;
    // If there's Azure remediation, likely partial implementation
    implementationStatus = 'partial';
    riskLevel = 'medium';
  } else if (azureImpl?.implementation) {
    implementationGuidance = azureImpl.implementation;
    implementationStatus = azureImpl.status;
    riskLevel = azureImpl.riskLevel;
  } else {
    implementationGuidance = 'Implementation guidance to be developed based on organizational requirements and Azure capabilities.';
  }
  
  // Truncate description for display, keep full text separate
  const fullText = csvRow['Control Text'] || '';
  const description = fullText.length > 500 ? fullText.substring(0, 500) + '...' : fullText;
  
  // Parse related controls
  const relatedControlsText = csvRow['Related Controls'] || '';
  const relatedControls = relatedControlsText
    .split(',')
    .map(c => c.trim())
    .filter(c => c && c !== 'None.' && c !== 'None')
    .map(c => c.replace(/\.$/, '')); // Remove trailing periods
  
  return {
    id: controlId,
    controlFamily: family,
    controlIdentifier: controlId,
    controlName: csvRow['Control (or Control Enhancement) Name'] || '',
    description,
    fullControlText: fullText,
    discussion: csvRow['Discussion'] || '',
    relatedControls,
    azureImplementation: implementationGuidance,
    azureCommercialRemediation: azureCommercialRemediation || 'No specific remediation provided.',
    azureGovernmentRemediation: azureGovRemediation || 'Same as Azure Commercial unless specified.',
    status: implementationStatus,
    implementation: implementationGuidance,
    lastAssessed: '2024-12-01',
    assessedBy: 'System Administrator',
    evidence: [],
    riskLevel: riskLevel,
    poamItems: []
  };
}

function generateNISTControlsFile(controls, outputPath) {
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

export const controlFamilies = ${JSON.stringify(controlFamilies, null, 2)};

// Helper functions for control management
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

export function getComplianceStats() {
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
    compliancePercentage: Math.round((compliant / total) * 100),
    partialCompliancePercentage: Math.round(((compliant + partial) / total) * 100)
  };
}

export default nistControlsEnhanced;
`;

  fs.writeFileSync(outputPath, fileContent);
  console.log(`Generated NIST controls file: ${outputPath}`);
}

async function processCSVFile(csvFilePath) {
  return new Promise((resolve, reject) => {
    const controls = [];
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const control = convertToNISTControl(row);
          controls.push(control);
        } catch (error) {
          console.warn(`Error processing control ${row['Control Identifier']}:`, error);
        }
      })
      .on('end', () => {
        console.log(`Successfully processed ${controls.length} NIST controls`);
        resolve(controls);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function main() {
  try {
    console.log('Starting NIST 800-53 Rev 5 catalog processing...');
    
    // Check if CSV file is provided as argument
    const csvFilePath = process.argv[2];
    if (!csvFilePath) {
      console.error('Please provide the CSV file path as an argument');
      console.log('Usage: node update-nist-controls.js <path-to-csv-file>');
      process.exit(1);
    }
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    // Process the CSV file
    const controls = await processCSVFile(csvFilePath);
    
    // Generate the updated controls file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'nistControlsEnhanced.ts');
    generateNISTControlsFile(controls, outputPath);
    
    // Generate statistics
    const stats = {
      total: controls.length,
      families: Object.keys(controlFamilies).length,
      compliant: controls.filter(c => c.status === 'compliant').length,
      partial: controls.filter(c => c.status === 'partial').length,
      nonCompliant: controls.filter(c => c.status === 'noncompliant').length,
      notAssessed: controls.filter(c => c.status === 'not-assessed').length
    };
    
    console.log('\\n=== NIST Controls Update Complete ===');
    console.log(`Total controls processed: ${stats.total}`);
    console.log(`Control families: ${stats.families}`);
    console.log(`Compliant: ${stats.compliant}`);
    console.log(`Partial: ${stats.partial}`);
    console.log(`Non-compliant: ${stats.nonCompliant}`);
    console.log(`Not assessed: ${stats.notAssessed}`);
    console.log(`Compliance rate: ${Math.round((stats.compliant / stats.total) * 100)}%`);
    
    // Show family breakdown
    console.log('\\n=== Control Family Breakdown ===');
    Object.entries(controlFamilies).forEach(([code, name]) => {
      const familyControls = controls.filter(c => c.controlFamily === name);
      console.log(`${code} (${name}): ${familyControls.length} controls`);
    });
    
  } catch (error) {
    console.error('Error updating NIST controls:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  processCSVFile,
  generateNISTControlsFile,
  convertToNISTControl,
  controlFamilies
};
