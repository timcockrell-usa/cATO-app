"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlFamilies = void 0;
/* Enhanced NIST control families data with descriptions and remediation steps */
exports.controlFamilies = [
    {
        id: "AC",
        name: "Access Control",
        total: 25,
        compliant: 20,
        partial: 3,
        noncompliant: 2,
        controls: [
            {
                id: "AC-1",
                name: "Policy and Procedures",
                status: "compliant",
                implementation: "Azure AD policies implemented",
                description: "The organization develops, documents, and disseminates access control policy and procedures.",
                remediation: "1. Review and update access control policies annually\n2. Ensure procedures are documented and communicated\n3. Implement regular policy compliance reviews\n4. Update procedures based on system changes"
            },
            {
                id: "AC-2",
                name: "Account Management",
                status: "compliant",
                implementation: "Automated via Azure AD",
                description: "The organization manages system accounts, group memberships, and associated privileges.",
                remediation: "1. Implement automated account provisioning\n2. Regular access reviews and certifications\n3. Establish account lifecycle management\n4. Monitor privileged account usage"
            },
            {
                id: "AC-3",
                name: "Access Enforcement",
                status: "partial",
                implementation: "RBAC partially implemented",
                description: "The system enforces approved authorizations for logical access to information and system resources.",
                remediation: "1. Complete RBAC implementation across all systems\n2. Implement attribute-based access control (ABAC)\n3. Regular authorization reviews\n4. Deploy advanced access analytics"
            },
            {
                id: "AC-4",
                name: "Information Flow Enforcement",
                status: "noncompliant",
                implementation: "Network segmentation needed",
                description: "The system controls information flows within the system and between interconnected systems.",
                remediation: "1. Implement network micro-segmentation\n2. Deploy data flow monitoring tools\n3. Establish information flow policies\n4. Regular network topology reviews"
            },
            {
                id: "AC-5",
                name: "Separation of Duties",
                status: "compliant",
                implementation: "Privileged Identity Management",
                description: "The organization separates duties of individuals to prevent malevolent activity.",
                remediation: "1. Regular segregation of duties reviews\n2. Implement dual-person controls for critical operations\n3. Monitor for conflicts of interest\n4. Automate duty separation enforcement"
            }
        ]
    },
    {
        id: "AU",
        name: "Audit and Accountability",
        total: 16,
        compliant: 14,
        partial: 2,
        noncompliant: 0,
        controls: [
            {
                id: "AU-1",
                name: "Policy and Procedures",
                status: "compliant",
                implementation: "Audit policies documented",
                description: "The organization develops, documents, and disseminates audit and accountability policy and procedures.",
                remediation: "1. Review audit policies annually\n2. Update procedures based on regulatory changes\n3. Ensure staff training on audit procedures\n4. Regular compliance assessments"
            },
            {
                id: "AU-2",
                name: "Event Logging",
                status: "compliant",
                implementation: "Azure Monitor + Sentinel",
                description: "The system provides audit record generation capability for defined auditable events.",
                remediation: "1. Review auditable events quarterly\n2. Ensure comprehensive logging coverage\n3. Implement log correlation and analysis\n4. Regular log review and retention policies"
            },
            {
                id: "AU-3",
                name: "Content of Audit Records",
                status: "partial",
                implementation: "Some fields missing",
                description: "The system generates audit records containing sufficient information to establish what events occurred.",
                remediation: "1. Complete audit record field mapping\n2. Implement standardized audit formats\n3. Ensure timestamp accuracy\n4. Regular audit record quality reviews"
            },
            {
                id: "AU-4",
                name: "Audit Log Storage Capacity",
                status: "compliant",
                implementation: "Log Analytics workspace",
                description: "The organization allocates audit log storage capacity and configures auditing to reduce likelihood of storage capacity being exceeded.",
                remediation: "1. Monitor log storage utilization\n2. Implement automated log archiving\n3. Establish retention policies\n4. Regular capacity planning reviews"
            }
        ]
    },
    {
        id: "CA",
        name: "Assessment, Authorization, and Monitoring",
        total: 9,
        compliant: 7,
        partial: 1,
        noncompliant: 1,
        controls: [
            {
                id: "CA-1",
                name: "Policy and Procedures",
                status: "compliant",
                implementation: "Assessment policies in place",
                description: "The organization develops, documents, and disseminates assessment, authorization, and monitoring policy and procedures.",
                remediation: "1. Annual policy review and updates\n2. Ensure procedures align with current practices\n3. Staff training on assessment procedures\n4. Regular policy compliance monitoring"
            },
            {
                id: "CA-2",
                name: "Control Assessments",
                status: "compliant",
                implementation: "Quarterly assessments",
                description: "The organization assesses the controls in the system and its environment of operation.",
                remediation: "1. Maintain regular assessment schedule\n2. Use automated assessment tools\n3. Document assessment findings\n4. Track remediation activities"
            },
            {
                id: "CA-3",
                name: "Information Exchange",
                status: "partial",
                implementation: "ISAs under review",
                description: "The organization approves, monitors, and controls all connections and information exchanges.",
                remediation: "1. Complete ISA reviews and updates\n2. Implement connection monitoring\n3. Regular review of information flows\n4. Establish information sharing agreements"
            },
            {
                id: "CA-7",
                name: "Continuous Monitoring",
                status: "compliant",
                implementation: "Azure Security Center",
                description: "The organization develops a continuous monitoring strategy and implements a continuous monitoring program.",
                remediation: "1. Enhance monitoring coverage\n2. Implement real-time alerting\n3. Regular monitoring strategy reviews\n4. Automated compliance reporting"
            }
        ]
    }
];
