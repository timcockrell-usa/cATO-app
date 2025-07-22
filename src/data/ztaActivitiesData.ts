// Enhanced ZTA activities data with descriptions and remediation steps
export const ztaPillars = [
  {
    id: "identity",
    name: "Identity",
    description: "User and entity identity verification",
    maturity: 75,
    activities: {
      traditional: [
        { 
          id: "ID-T1", 
          name: "Identity Governance Framework", 
          status: "complete", 
          mappedControls: ["AC-2", "IA-2"],
          description: "Establish comprehensive identity governance framework with automated provisioning and lifecycle management.",
          remediation: "1. Implement automated identity provisioning\n2. Establish identity lifecycle management\n3. Deploy identity governance tools\n4. Regular identity audits and reviews"
        },
        { 
          id: "ID-T2", 
          name: "Multi-Factor Authentication", 
          status: "complete", 
          mappedControls: ["IA-2", "IA-5"],
          description: "Deploy multi-factor authentication across all systems and applications.",
          remediation: "1. Ensure MFA coverage for all users\n2. Implement adaptive authentication\n3. Regular MFA policy reviews\n4. User training on MFA usage"
        },
        { 
          id: "ID-T3", 
          name: "Privileged Access Management", 
          status: "in-progress", 
          mappedControls: ["AC-2", "AC-6"],
          description: "Implement privileged access management with just-in-time access controls.",
          remediation: "1. Complete PAM tool deployment\n2. Implement just-in-time access\n3. Regular privileged access reviews\n4. Automated privilege escalation controls"
        }
      ],
      advanced: [
        { 
          id: "ID-A1", 
          name: "Risk-Based Authentication", 
          status: "in-progress", 
          mappedControls: ["IA-8", "IA-9"],
          description: "Implement risk-based authentication using behavioral analytics and contextual factors.",
          remediation: "1. Deploy risk assessment algorithms\n2. Implement behavioral analytics\n3. Establish risk thresholds\n4. Regular risk model tuning"
        },
        { 
          id: "ID-A2", 
          name: "Behavioral Analytics", 
          status: "planned", 
          mappedControls: ["AU-6", "SI-4"],
          description: "Deploy user and entity behavioral analytics to detect anomalous activities.",
          remediation: "1. Implement UEBA solution\n2. Establish behavioral baselines\n3. Configure anomaly detection\n4. Regular model updates"
        },
        { 
          id: "ID-A3", 
          name: "Zero Trust Identity Fabric", 
          status: "planned", 
          mappedControls: ["AC-3", "IA-2"],
          description: "Establish zero trust identity fabric with continuous verification and dynamic access controls.",
          remediation: "1. Design identity fabric architecture\n2. Implement continuous verification\n3. Deploy dynamic access controls\n4. Regular trust score evaluations"
        }
      ]
    }
  },
  {
    id: "device",
    name: "Device",
    description: "Device trust and compliance verification",
    maturity: 68,
    activities: {
      traditional: [
        { 
          id: "DV-T1", 
          name: "Device Registration", 
          status: "complete", 
          mappedControls: ["IA-3", "CM-8"],
          description: "Implement comprehensive device registration and inventory management.",
          remediation: "1. Complete device inventory\n2. Implement device certificates\n3. Regular device audits\n4. Automated device discovery"
        },
        { 
          id: "DV-T2", 
          name: "Mobile Device Management", 
          status: "complete", 
          mappedControls: ["SC-7", "AC-19"],
          description: "Deploy mobile device management with policy enforcement and remote wipe capabilities.",
          remediation: "1. Ensure MDM coverage\n2. Implement device compliance policies\n3. Regular policy updates\n4. User training on device security"
        },
        { 
          id: "DV-T3", 
          name: "Device Compliance Policies", 
          status: "complete", 
          mappedControls: ["CM-6", "SI-3"],
          description: "Establish and enforce device compliance policies with automated remediation.",
          remediation: "1. Regular policy reviews\n2. Implement automated compliance checks\n3. Establish remediation workflows\n4. Compliance reporting"
        }
      ],
      advanced: [
        { 
          id: "DV-A1", 
          name: "Device Risk Assessment", 
          status: "in-progress", 
          mappedControls: ["RA-3", "RA-5"],
          description: "Implement continuous device risk assessment with automated threat detection.",
          remediation: "1. Deploy device risk assessment tools\n2. Establish risk scoring models\n3. Implement automated responses\n4. Regular risk model updates"
        },
        { 
          id: "DV-A2", 
          name: "Hardware-based Attestation", 
          status: "planned", 
          mappedControls: ["SI-7", "IA-3"],
          description: "Implement hardware-based device attestation using TPM and secure boot.",
          remediation: "1. Deploy TPM-based attestation\n2. Implement secure boot verification\n3. Establish attestation policies\n4. Regular attestation reviews"
        },
        { 
          id: "DV-A3", 
          name: "Device Behavioral Analysis", 
          status: "not-started", 
          mappedControls: ["SI-4", "AU-6"],
          description: "Deploy device behavioral analysis to detect compromised or malicious devices.",
          remediation: "1. Implement device behavioral analytics\n2. Establish device baselines\n3. Configure anomaly detection\n4. Automated response workflows"
        }
      ]
    }
  }
  // ... additional pillars would follow the same pattern
];