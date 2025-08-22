import fs from 'fs';
import path from 'path';

// NIST 800-53 Rev 5 Control Catalog Data (from sp800-53r5-control-catalog.csv)
const nistCatalogData = [
  {
    "Control Identifier": "AC-1",
    "Control (or Control Enhancement) Name": "Policy and Procedures",
    "Control Text": "a. Develop, document, and disseminate to [Assignment: organization-defined personnel or roles]:\n1. [Selection (one or more): Organization-level; Mission/business process-level; System-level] access control policy that:\n(a) Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and\n(b) Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and\n2. Procedures to facilitate the implementation of the access control policy and the associated access controls;\nb. Designate an [Assignment: organization-defined official] to manage the development, documentation, and dissemination of the access control policy and procedures; and\nc. Review and update the current access control:\n1. Policy [Assignment: organization-defined frequency] and following [Assignment: organization-defined events]; and\n2. Procedures [Assignment: organization-defined frequency] and following [Assignment: organization-defined events].",
    "Discussion": "Access control policy and procedures address the controls in the AC family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of access control policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies reflecting the complex nature of organizations. Procedures can be established for security and privacy programs, for mission or business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to access control policy and procedures include assessment or audit findings, security incidents or breaches, or changes in laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.",
    "Related Controls": "IA-1, PM-9, PM-24, PS-8, SI-12 ."
  },
  {
    "Control Identifier": "AC-2",
    "Control (or Control Enhancement) Name": "Account Management",
    "Control Text": "a. Define and document the types of accounts allowed and specifically prohibited for use within the system;\nb. Assign account managers;\nc. Require [Assignment: organization-defined prerequisites and criteria] for group and role membership;\nd. Specify:\n1. Authorized users of the system;\n2. Group and role membership; and\n3. Access authorizations (i.e., privileges) and [Assignment: organization-defined attributes (as required)] for each account;\ne. Require approvals by [Assignment: organization-defined personnel or roles] for requests to create accounts;\nf. Create, enable, modify, disable, and remove accounts in accordance with [Assignment: organization-defined policy, procedures, prerequisites, and criteria];\ng. Monitor the use of accounts;\nh. Notify account managers and [Assignment: organization-defined personnel or roles] within:\n1. [Assignment: organization-defined time period] when accounts are no longer required;\n2. [Assignment: organization-defined time period] when users are terminated or transferred; and\n3. [Assignment: organization-defined time period] when system usage or need-to-know changes for an individual;\ni. Authorize access to the system based on:\n1. A valid access authorization;\n2. Intended system usage; and\n3. [Assignment: organization-defined attributes (as required)];\nj. Review accounts for compliance with account management requirements [Assignment: organization-defined frequency];\nk. Establish and implement a process for changing shared or group account authenticators (if deployed) when individuals are removed from the group; and\nl. Align account management processes with personnel termination and transfer processes.",
    "Discussion": "Examples of system account types include individual, shared, group, system, guest, anonymous, emergency, developer, temporary, and service. Identification of authorized system users and the specification of access privileges reflect the requirements in other controls in the security plan. Users requiring administrative privileges on system accounts receive additional scrutiny by organizational personnel responsible for approving such accounts and privileged access, including system owner, mission or business owner, senior agency information security officer, or senior agency official for privacy. Types of accounts that organizations may wish to prohibit due to increased risk include shared, group, emergency, anonymous, temporary, and guest accounts.\nWhere access involves personally identifiable information, security programs collaborate with the senior agency official for privacy to establish the specific conditions for group and role membership; specify authorized users, group and role membership, and access authorizations for each account; and create, adjust, or remove system accounts in accordance with organizational policies. Policies can include such information as account expiration dates or other factors that trigger the disabling of accounts. Organizations may choose to define access privileges or other attributes by account, type of account, or a combination of the two. Examples of other attributes required for authorizing access include restrictions on time of day, day of week, and point of origin. In defining other system account attributes, organizations consider system-related requirements and mission/business requirements. Failure to consider these factors could affect system availability.\nTemporary and emergency accounts are intended for short-term use. Organizations establish temporary accounts as part of normal account activation procedures when there is a need for short-term accounts without the demand for immediacy in account activation. Organizations establish emergency accounts in response to crisis situations and with the need for rapid account activation. Therefore, emergency account activation may bypass normal account authorization processes. Emergency and temporary accounts are not to be confused with infrequently used accounts, including local logon accounts used for special tasks or when network resources are unavailable (may also be known as accounts of last resort). Such accounts remain available and are not subject to automatic disabling or removal dates. Conditions for disabling or deactivating accounts include when shared/group, emergency, or temporary accounts are no longer required and when individuals are transferred or terminated. Changing shared/group authenticators when members leave the group is intended to ensure that former group members do not retain access to the shared or group account. Some types of system accounts may require specialized training.",
    "Related Controls": "AC-3, AC-5, AC-6, AC-17, AC-18, AC-20, AC-24, AU-2, AU-12, CM-5, IA-2, IA-4, IA-5, IA-8, MA-3, MA-5, PE-2, PL-4, PS-2, PS-4, PS-5, PS-7, PT-2, PT-3, SC-7, SC-12, SC-13, SC-37."
  },
  {
    "Control Identifier": "AC-2(1)",
    "Control (or Control Enhancement) Name": "Account Management | Automated System Account Management",
    "Control Text": "Support the management of system accounts using [Assignment: organization-defined automated mechanisms].",
    "Discussion": "Automated system account management includes using automated mechanisms to create, enable, modify, disable, and remove accounts; notify account managers when an account is created, enabled, modified, disabled, or removed, or when users are terminated or transferred; monitor system account usage; and report atypical system account usage. Automated mechanisms can include internal system functions and email, telephonic, and text messaging notifications.",
    "Related Controls": "None."
  },
  {
    "Control Identifier": "AC-2(2)",
    "Control (or Control Enhancement) Name": "Account Management | Automated Temporary and Emergency Account Management",
    "Control Text": "Automatically [Selection: remove; disable] temporary and emergency accounts after [Assignment: organization-defined time period for each type of account].",
    "Discussion": "Management of temporary and emergency accounts includes the removal or disabling of such accounts automatically after a predefined time period rather than at the convenience of the system administrator. Automatic removal or disabling of accounts provides a more consistent implementation.",
    "Related Controls": "None."
  },
  {
    "Control Identifier": "AC-2(3)",
    "Control (or Control Enhancement) Name": "Account Management | Disable Accounts",
    "Control Text": "Disable accounts within [Assignment: organization-defined time period] when the accounts: \n(a) Have expired;\n(b) Are no longer associated with a user or individual;\n(c) Are in violation of organizational policy; or\n(d) Have been inactive for [Assignment: organization-defined time period].",
    "Discussion": "Disabling expired, inactive, or otherwise anomalous accounts supports the concepts of least privilege and least functionality which reduce the attack surface of the system.",
    "Related Controls": "None."
  },
  {
    "Control Identifier": "AC-3",
    "Control (or Control Enhancement) Name": "Access Enforcement",
    "Control Text": "Enforce approved authorizations for logical access to information and system resources in accordance with applicable access control policies.",
    "Discussion": "Access control policies control access between active entities or subjects (i.e., users or processes acting on behalf of users) and passive entities or objects (i.e., devices, files, records, domains) in organizational systems. In addition to enforcing authorized access at the system level and recognizing that systems can host many applications and services in support of mission and business functions, access enforcement mechanisms can also be employed at the application and service level to provide increased information security and privacy. In contrast to logical access controls that are implemented within the system, physical access controls are addressed by the controls in the Physical and Environmental Protection (PE) family.",
    "Related Controls": "AC-2, AC-4, AC-5, AC-6, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21, AC-22, AC-24, AC-25, AT-2, AT-3, AU-9, CA-9, CM-5, CM-11, IA-2, IA-5, IA-6, IA-7, IA-11, MA-3, MA-4, MA-5, MP-4, PM-2, PS-3, PT-2, PT-3, SA-17, SC-2, SC-3, SC-4, SC-12, SC-13, SC-28, SC-31, SC-34, SI-4, SI-8."
  }
  // This would continue with the complete catalog...
];

// Azure implementation mappings for common controls
const azureImplementations = {
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

// Function to extract control family from control identifier
function getControlFamily(controlId) {
  const familyCode = controlId.split('-')[0];
  return controlFamilies[familyCode] || 'Unknown';
}

// Function to determine status based on control type
function getDefaultStatus(controlId) {
  // Base controls are more likely to be implemented
  if (controlId.includes('(')) return 'not-assessed'; // Enhancements
  
  // Common base controls that are typically implemented
  const commonControls = ['AC-2', 'AC-3', 'AC-5', 'AC-6', 'IA-2', 'IA-5', 'AU-2', 'AU-3'];
  if (commonControls.includes(controlId)) return 'partial';
  
  return 'not-assessed';
}

// Function to determine risk level
function getRiskLevel(controlId, status) {
  if (status === 'compliant') return 'low';
  if (status === 'partial') return 'medium';
  if (status === 'noncompliant') return 'high';
  return 'medium';
}

// Function to convert catalog data to NIST control format
function convertToNISTControl(catalogItem) {
  const controlId = catalogItem['Control Identifier'];
  const family = getControlFamily(controlId);
  const azureImpl = azureImplementations[controlId];
  const defaultStatus = getDefaultStatus(controlId);
  
  return {
    id: controlId,
    controlFamily: family,
    controlIdentifier: controlId,
    controlName: catalogItem['Control (or Control Enhancement) Name'],
    description: catalogItem['Control Text']?.substring(0, 500) + (catalogItem['Control Text']?.length > 500 ? '...' : ''),
    fullControlText: catalogItem['Control Text'],
    discussion: catalogItem['Discussion'],
    relatedControls: catalogItem['Related Controls']?.split(',').map(c => c.trim()).filter(c => c && c !== 'None.') || [],
    azureImplementation: azureImpl?.implementation || 'Implementation guidance to be developed based on organizational requirements and Azure capabilities.',
    status: azureImpl?.status || defaultStatus,
    implementation: azureImpl?.implementation || 'To be implemented',
    lastAssessed: '2024-12-01',
    assessedBy: 'System Administrator',
    evidence: [],
    riskLevel: azureImpl?.riskLevel || getRiskLevel(controlId, azureImpl?.status || defaultStatus),
    poamItems: []
  };
}

console.log('Processing NIST 800-53 Rev 5 Control Catalog...');

// Note: In a real implementation, you would process the complete CSV here
// For now, this shows the structure for the first few controls
const processedControls = nistCatalogData.map(convertToNISTControl);

console.log(`Processed ${processedControls.length} controls`);
console.log('Sample processed control:', JSON.stringify(processedControls[0], null, 2));

export { processedControls, controlFamilies };
