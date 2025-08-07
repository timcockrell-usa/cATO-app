# System Security Plan (SSP)
**NIST 800-53 Rev 5 Implementation**

---

## Document Information
- **Document Title**: {{systemInformation.systemName}} System Security Plan
- **Version**: {{documentVersion}}
- **Date**: {{generatedDate}}
- **Classification**: {{systemInformation.securityCategorization}}

---

## 1. Executive Summary

The {{systemInformation.systemName}} system is designed to support {{systemInformation.systemPurpose}}. This System Security Plan (SSP) documents the implementation of NIST 800-53 Rev 5 security controls to ensure the confidentiality, integrity, and availability of system resources and data.

### System Overview
- **System Name**: {{systemInformation.systemName}}
- **System Type**: {{systemInformation.systemType}}
- **Security Categorization**: {{systemInformation.securityCategorization}}
- **Authorization Boundary**: {{systemInformation.authorizationBoundary}}

---

## 2. System Categorization

### 2.1 Information Types
{{#each systemInformation.informationTypes}}
- **{{name}}**: {{description}}
  - Confidentiality Impact: {{confidentialityImpact}}
  - Integrity Impact: {{integrityImpact}}
  - Availability Impact: {{availabilityImpact}}
{{/each}}

### 2.2 System Security Categorization
Based on the analysis of information types, the overall system security categorization is **{{systemInformation.securityCategorization}}**.

---

## 3. System Environment

### 3.1 General System Environment
{{systemInformation.systemDescription}}

### 3.2 System Boundaries
{{systemInformation.authorizationBoundary}}

### 3.3 Network Architecture
{{#each systemInformation.networkConnections}}
- **Connection Type**: {{connectionType}}
- **Connected System**: {{connectedSystem}}
- **Data Flow**: {{dataFlow}}
- **Security Controls**: {{securityControls}}
{{/each}}

### 3.4 Cloud Services
{{#each systemInformation.cloudServices}}
- **Service Name**: {{serviceName}}
- **Provider**: {{provider}}
- **Service Type**: {{serviceType}}
- **FedRAMP Status**: {{fedRampStatus}}
- **Security Categorization**: {{securityCategorization}}
{{/each}}

---

## 4. Control Implementation Summary

### 4.1 Implementation Status Overview
{{#each complianceMetrics.controlFamilyCompliance}}
- **{{familyName}}**: {{compliantControls}}/{{totalControls}} ({{compliancePercentage}}%)
{{/each}}

### 4.2 Overall Compliance
- **Total Controls**: {{complianceMetrics.totalControlsAssessed}}
- **Implemented Controls**: {{complianceMetrics.compliantControlsCount}}
- **Overall Compliance Rate**: {{complianceMetrics.overallCompliancePercentage}}%

---

## 5. Security Control Implementation

{{#each controlImplementations}}
### {{controlId}} - {{controlName}}

**Control Family**: {{controlFamily}}  
**Implementation Status**: {{implementationStatus}}  
**Inheritance**: {{inheritanceStatus}}

#### Implementation Statement
{{implementationStatement}}

#### Responsible Role
{{responsibleRole}}

#### Implementation Guidance
{{implementationGuidance}}

#### Assessment Procedures
{{assessmentProcedures}}

#### Compliance Evidence
{{#each complianceEvidence}}
- {{this}}
{{/each}}

#### Assessment Details
- **Last Assessment**: {{lastAssessmentDate}}
- **Next Assessment**: {{nextAssessmentDate}}
- **Risk Level**: {{riskLevel}}

{{#if remediation}}
#### Remediation Required
- **Priority**: {{remediation.priority}}
- **Estimated Effort**: {{remediation.estimatedEffort}}
- **Target Date**: {{remediation.targetDate}}
{{/if}}

---
{{/each}}

## 6. Zero Trust Architecture Assessment

### 6.1 ZTA Maturity Overview
**Overall Maturity Level**: {{zeroTrustAssessment.maturityLevel}}  
**Overall Score**: {{zeroTrustAssessment.overallScore}}%

### 6.2 Pillar Readiness Assessment
{{#each zeroTrustAssessment.pillarReadiness}}
#### {{pillar}}
- **Maturity Level**: {{maturityLevel}}
- **Score**: {{score}}%

##### Capabilities Assessment
{{#each capabilities}}
- **{{name}}**: {{status}} (Level {{maturityLevel}})
{{/each}}
{{/each}}

---

## 7. Risk Assessment

### 7.1 Risk Profile
- **Overall Risk Level**: {{riskProfile.overallRiskLevel}}
- **High Risk Controls**: {{riskProfile.highRiskControlsCount}}
- **Medium Risk Controls**: {{riskProfile.mediumRiskControlsCount}}
- **Low Risk Controls**: {{riskProfile.lowRiskControlsCount}}
- **Accepted Risks**: {{riskProfile.acceptedRisksCount}}

---

## 8. Continuous Monitoring

### 8.1 Monitoring Strategy
{{#if continuousMonitoring.isActive}}
Continuous monitoring is **ACTIVE** for this system.

- **Last Assessment**: {{continuousMonitoring.lastAssessmentDate}}
- **Next Assessment**: {{continuousMonitoring.nextAssessmentDate}}
- **Monitoring Frequency**: {{continuousMonitoring.monitoringFrequency}}

#### Automated Tools
{{#each continuousMonitoring.automatedToolsUsed}}
- {{this}}
{{/each}}
{{else}}
Continuous monitoring is **NOT ACTIVE** for this system. Implementation required.
{{/if}}

---

## 9. System Interconnections

{{#each systemInformation.networkConnections}}
### {{connectedSystem}}
- **Connection Type**: {{connectionType}}
- **Data Classification**: {{dataFlow}}
- **Security Controls**: {{securityControls}}
{{/each}}

---

## 10. Plan of Action and Milestones (POA&M)

{{#if poamSummary.totalItems}}
**Total POA&M Items**: {{poamSummary.totalItems}}
- **Open**: {{poamSummary.openItems}}
- **In Progress**: {{poamSummary.inProgressItems}}
- **High Risk**: {{poamSummary.highRiskItems}}

Detailed POA&M information is available in the separate POA&M document.
{{else}}
No open POA&M items at this time.
{{/if}}

---

## Appendices

### Appendix A: Acronyms and Abbreviations
- **ATO**: Authority to Operate
- **NIST**: National Institute of Standards and Technology
- **SSP**: System Security Plan
- **ZTA**: Zero Trust Architecture
- **POA&M**: Plan of Action and Milestones

### Appendix B: References
- NIST Special Publication 800-53, Revision 5
- NIST Special Publication 800-37, Revision 2
- FedRAMP Security Assessment Framework
- DoD Zero Trust Reference Architecture

---
**Document Generated**: {{generatedDate}}  
**Generated By**: cATO Command Center v{{version}}
