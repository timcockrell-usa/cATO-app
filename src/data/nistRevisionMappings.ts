/**
 * NIST Revision Mapping Data
 * Sample mapping data for NIST 800-53 Rev 4 to Rev 5 transitions
 * Based on official NIST SP 800-53B transition guidance
 */

import { NISTRevisionMapping } from '../types/nistRevisionManagement';

export const nistRevisionMappings: NISTRevisionMapping[] = [
  // Access Control Family (AC)
  {
    id: 'mapping-ac-1',
    mappingId: 'GLOBAL-AC-1',
    tenantId: 'global',
    rev4ControlId: 'AC-1',
    rev5ControlId: 'AC-1',
    changeType: 'Modified',
    changeSummary: 'Enhanced requirements for policy documentation and dissemination procedures',
    implementationImpact: 'low',
    automatedMapping: true,
    migrationGuidance: 'Review and update access control policy documentation to include enhanced dissemination requirements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-ac-2',
    mappingId: 'GLOBAL-AC-2',
    tenantId: 'global',
    rev4ControlId: 'AC-2',
    rev5ControlId: 'AC-2',
    changeType: 'Modified',
    changeSummary: 'Added requirements for automated account management and enhanced monitoring',
    implementationImpact: 'medium',
    automatedMapping: true,
    migrationGuidance: 'Implement automated account management processes and enhanced monitoring capabilities',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-ac-3',
    mappingId: 'GLOBAL-AC-3',
    tenantId: 'global',
    rev4ControlId: 'AC-3',
    rev5ControlId: 'AC-3',
    changeType: 'Modified',
    changeSummary: 'Enhanced access enforcement requirements with additional control enhancements',
    implementationImpact: 'low',
    automatedMapping: true,
    migrationGuidance: 'Review access enforcement mechanisms for compliance with enhanced requirements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-ac-20',
    mappingId: 'GLOBAL-AC-20',
    tenantId: 'global',
    rev4ControlId: 'AC-20',
    rev5ControlId: 'AC-20',
    changeType: 'Modified',
    changeSummary: 'Significantly enhanced requirements for use of external systems including cloud services',
    implementationImpact: 'high',
    automatedMapping: true,
    migrationGuidance: 'Comprehensive review of external system usage policies, especially cloud service agreements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // System and Information Integrity Family (SI) - New Controls
  {
    id: 'mapping-si-22',
    mappingId: 'GLOBAL-SI-22',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'SI-22',
    changeType: 'New Control',
    changeSummary: 'New control for information diversity to protect against common-mode failures',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Implement information diversity mechanisms to protect against common-mode failures',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-si-23',
    mappingId: 'GLOBAL-SI-23',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'SI-23',
    changeType: 'New Control',
    changeSummary: 'New control for information fragmentation to enhance security through dispersion',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Implement information fragmentation techniques for sensitive data protection',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Program Management Family (PM) - New Control
  {
    id: 'mapping-pm-32',
    mappingId: 'GLOBAL-PM-32',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PM-32',
    changeType: 'New Control',
    changeSummary: 'New control for purposing - ensuring systems are used only for intended purposes',
    implementationImpact: 'medium',
    automatedMapping: false,
    migrationGuidance: 'Establish purposing controls to ensure systems are used only for authorized purposes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Personally Identifiable Information Processing and Transparency Family (PT) - New Family
  {
    id: 'mapping-pt-1',
    mappingId: 'GLOBAL-PT-1',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-1',
    changeType: 'New Control',
    changeSummary: 'New control family for PII processing - Policy and procedures',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Develop comprehensive PII processing policies and procedures',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-pt-2',
    mappingId: 'GLOBAL-PT-2',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-2',
    changeType: 'New Control',
    changeSummary: 'Authority to process personally identifiable information',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Establish clear authority and legal basis for PII processing activities',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-pt-3',
    mappingId: 'GLOBAL-PT-3',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-3',
    changeType: 'New Control',
    changeSummary: 'Personally identifiable information processing purposes',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Document and limit PII processing to specific, legitimate purposes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-pt-4',
    mappingId: 'GLOBAL-PT-4',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-4',
    changeType: 'New Control',
    changeSummary: 'Consent mechanisms for PII processing',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Implement appropriate consent mechanisms for PII collection and processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-pt-5',
    mappingId: 'GLOBAL-PT-5',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-5',
    changeType: 'New Control',
    changeSummary: 'Privacy notice requirements',
    implementationImpact: 'medium',
    automatedMapping: false,
    migrationGuidance: 'Develop and maintain comprehensive privacy notices for PII processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-pt-6',
    mappingId: 'GLOBAL-PT-6',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-6',
    changeType: 'New Control',
    changeSummary: 'System of records notice and Privacy Act statements',
    implementationImpact: 'medium',
    automatedMapping: false,
    migrationGuidance: 'Ensure compliance with Privacy Act requirements for system of records',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-pt-7',
    mappingId: 'GLOBAL-PT-7',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-7',
    changeType: 'New Control',
    changeSummary: 'Specific categories of personally identifiable information',
    implementationImpact: 'medium',
    automatedMapping: false,
    migrationGuidance: 'Identify and categorize specific types of PII processed by the system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-pt-8',
    mappingId: 'GLOBAL-PT-8',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'PT-8',
    changeType: 'New Control',
    changeSummary: 'Computer matching requirements',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Implement controls for computer matching activities if applicable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Supply Chain Risk Management Family (SR) - Enhanced from SA controls
  {
    id: 'mapping-sr-1',
    mappingId: 'GLOBAL-SR-1',
    tenantId: 'global',
    rev4ControlId: 'SA-12',
    rev5ControlId: 'SR-1',
    changeType: 'Modified',
    changeSummary: 'Enhanced supply chain risk management policy and procedures',
    implementationImpact: 'medium',
    automatedMapping: true,
    migrationGuidance: 'Update supply chain risk management policies with enhanced requirements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-sr-2',
    mappingId: 'GLOBAL-SR-2',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'SR-2',
    changeType: 'New Control',
    changeSummary: 'Supply chain risk management plan',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Develop comprehensive supply chain risk management plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-sr-3',
    mappingId: 'GLOBAL-SR-3',
    tenantId: 'global',
    rev4ControlId: null,
    rev5ControlId: 'SR-3',
    changeType: 'New Control',
    changeSummary: 'Supply chain controls and processes',
    implementationImpact: 'high',
    automatedMapping: false,
    migrationGuidance: 'Implement supply chain controls and processes for vendor management',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Identification and Authentication Family (IA) - Modified Controls
  {
    id: 'mapping-ia-1',
    mappingId: 'GLOBAL-IA-1',
    tenantId: 'global',
    rev4ControlId: 'IA-1',
    rev5ControlId: 'IA-1',
    changeType: 'Modified',
    changeSummary: 'Enhanced identification and authentication policy requirements',
    implementationImpact: 'low',
    automatedMapping: true,
    migrationGuidance: 'Review and update identification and authentication policies',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-ia-5',
    mappingId: 'GLOBAL-IA-5',
    tenantId: 'global',
    rev4ControlId: 'IA-5',
    rev5ControlId: 'IA-5',
    changeType: 'Modified',
    changeSummary: 'Enhanced authenticator management with additional requirements for authentication technologies',
    implementationImpact: 'medium',
    automatedMapping: true,
    migrationGuidance: 'Update authenticator management procedures for enhanced security requirements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Risk Assessment Family (RA) - Modified Controls
  {
    id: 'mapping-ra-3',
    mappingId: 'GLOBAL-RA-3',
    tenantId: 'global',
    rev4ControlId: 'RA-3',
    rev5ControlId: 'RA-3',
    changeType: 'Modified',
    changeSummary: 'Enhanced risk assessment requirements including supply chain considerations',
    implementationImpact: 'medium',
    automatedMapping: true,
    migrationGuidance: 'Update risk assessment procedures to include supply chain risk considerations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mapping-ra-7',
    mappingId: 'GLOBAL-RA-7',
    tenantId: 'global',
    rev4ControlId: 'RA-7',
    rev5ControlId: 'RA-7',
    changeType: 'Modified',
    changeSummary: 'Enhanced risk response requirements with additional response strategies',
    implementationImpact: 'low',
    automatedMapping: true,
    migrationGuidance: 'Review risk response procedures for enhanced response strategy requirements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Example of withdrawn control (some Rev 4 controls were consolidated or removed)
  {
    id: 'mapping-withdrawn-example',
    mappingId: 'GLOBAL-WITHDRAWN-1',
    tenantId: 'global',
    rev4ControlId: 'AC-23',
    rev5ControlId: null,
    changeType: 'Withdrawn',
    changeSummary: 'Control consolidated into other access control requirements',
    implementationImpact: 'low',
    automatedMapping: true,
    migrationGuidance: 'Review if control functionality is covered by other implemented controls',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Example of merged controls
  {
    id: 'mapping-merged-example',
    mappingId: 'GLOBAL-MERGED-1',
    tenantId: 'global',
    rev4ControlId: 'SI-4',
    rev5ControlId: 'SI-4',
    changeType: 'Merged',
    changeSummary: 'Information system monitoring merged with network monitoring capabilities',
    implementationImpact: 'medium',
    automatedMapping: true,
    migrationGuidance: 'Consolidate monitoring capabilities into integrated system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to seed the revision mappings
export const seedRevisionMappings = async (cosmosService: any) => {
  try {
    console.log('Seeding NIST revision mappings...');
    
    for (const mapping of nistRevisionMappings) {
      await cosmosService.createOrUpdateRevisionMapping(mapping);
    }
    
    console.log(`Successfully seeded ${nistRevisionMappings.length} revision mappings`);
  } catch (error) {
    console.error('Error seeding revision mappings:', error);
    throw error;
  }
};

export default nistRevisionMappings;
