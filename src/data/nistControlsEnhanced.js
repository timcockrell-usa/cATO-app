/* Enhanced NIST control data based on comprehensive CSV with descriptions and Azure implementations */

export const nistControlsFromCSV = [
  {
    id: 'AC-1',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-1',
    controlName: 'Policy and Procedures',
    description: 'Develop, document, and disseminate access control policies and procedures.',
    implementation: 'Azure Policy, Azure AD Access Reviews',
    riskLevel: 'Medium',
    complianceStatus: 'Implemented',
    lastAssessed: '2024-01-15',
    responsibleParty: 'Security Team',
    implementationGuidance: 'Establish formal access control policies using Azure Policy templates and Azure AD governance features.'
  },
  {
    id: 'AC-2',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-2',
    controlName: 'Account Management',
    description: 'Manage system accounts, group memberships, privileges, and access authorizations.',
    implementation: 'Azure AD, Privileged Identity Management',
    riskLevel: 'High',
    complianceStatus: 'Partially Implemented',
    lastAssessed: '2024-01-10',
    responsibleParty: 'Identity Team',
    implementationGuidance: 'Use Azure AD PIM for privileged account management and automated account lifecycle management.'
  },
  {
    id: 'AC-3',
    controlFamily: 'Access Control',
    controlIdentifier: 'AC-3',
    controlName: 'Access Enforcement',
    description: 'Enforce approved authorizations for logical access to information and system resources.',
    implementation: 'Azure RBAC, Conditional Access',
    riskLevel: 'High',
    complianceStatus: 'Implemented',
    lastAssessed: '2024-01-20',
    responsibleParty: 'Security Team',
    implementationGuidance: 'Implement fine-grained access controls using Azure RBAC and Conditional Access policies.'
  },
  {
    id: 'AU-1',
    controlFamily: 'Audit and Accountability',
    controlIdentifier: 'AU-1',
    controlName: 'Policy and Procedures',
    description: 'Develop, document, and disseminate audit and accountability policies and procedures.',
    implementation: 'Azure Monitor, Log Analytics',
    riskLevel: 'Medium',
    complianceStatus: 'Implemented',
    lastAssessed: '2024-01-12',
    responsibleParty: 'Compliance Team',
    implementationGuidance: 'Establish comprehensive audit policies using Azure Monitor and centralized logging.'
  },
  {
    id: 'AU-2',
    controlFamily: 'Audit and Accountability',
    controlIdentifier: 'AU-2',
    controlName: 'Event Logging',
    description: 'Determine and document what events are to be logged within the system.',
    implementation: 'Azure Activity Log, Diagnostic Settings',
    riskLevel: 'High',
    complianceStatus: 'Implemented',
    lastAssessed: '2024-01-18',
    responsibleParty: 'Operations Team',
    implementationGuidance: 'Configure comprehensive event logging using Azure Activity Log and resource diagnostic settings.'
  }
];
