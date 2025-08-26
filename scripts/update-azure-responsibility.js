/**
 * Update NIST Controls with Azure Shared Responsibility Assessment
 * This script reads the current NIST controls and updates them with proper
 * Azure shared responsibility status and compliance assessments
 */

const fs = require('fs');
const path = require('path');

// Import the assessment logic
const { enhancedAzureAssessment, azureServiceMappings } = require('../functions/shared/azureResponsibilityAssessment');

// Define Azure control mappings for comprehensive coverage
const comprehensiveAzureMapping = {
    // Physical and Environmental Controls - Fully Inherited from Azure
    'PE-1': { inherited: true, coverage: 'Full', description: 'Physical access control policies inherited from Azure data centers' },
    'PE-2': { inherited: true, coverage: 'Full', description: 'Physical access authorization inherited from Azure data centers' },
    'PE-3': { inherited: true, coverage: 'Full', description: 'Physical access control inherited from Azure data centers' },
    'PE-4': { inherited: true, coverage: 'Full', description: 'Access control for transmission medium inherited from Azure' },
    'PE-5': { inherited: true, coverage: 'Full', description: 'Access control for output devices inherited from Azure' },
    'PE-6': { inherited: true, coverage: 'Full', description: 'Monitoring physical access inherited from Azure' },
    'PE-7': { inherited: true, coverage: 'Full', description: 'Visitor control inherited from Azure data centers' },
    'PE-8': { inherited: true, coverage: 'Full', description: 'Visitor access records inherited from Azure' },
    'PE-9': { inherited: true, coverage: 'Full', description: 'Power equipment and cabling protection inherited from Azure' },
    'PE-10': { inherited: true, coverage: 'Full', description: 'Emergency shutoff inherited from Azure data centers' },
    'PE-11': { inherited: true, coverage: 'Full', description: 'Emergency power inherited from Azure data centers' },
    'PE-12': { inherited: true, coverage: 'Full', description: 'Emergency lighting inherited from Azure data centers' },
    'PE-13': { inherited: true, coverage: 'Full', description: 'Fire protection inherited from Azure data centers' },
    'PE-14': { inherited: true, coverage: 'Full', description: 'Temperature and humidity controls inherited from Azure' },
    'PE-15': { inherited: true, coverage: 'Full', description: 'Water damage protection inherited from Azure' },
    'PE-16': { inherited: true, coverage: 'Full', description: 'Delivery and removal controls inherited from Azure' },
    'PE-17': { inherited: true, coverage: 'Full', description: 'Alternate work site controls inherited from Azure' },
    'PE-18': { inherited: true, coverage: 'Full', description: 'Location of information system components inherited from Azure' },
    'PE-19': { inherited: true, coverage: 'Full', description: 'Information leakage protection inherited from Azure' },
    'PE-20': { inherited: true, coverage: 'Full', description: 'Asset monitoring and tracking inherited from Azure' },

    // System and Communications Protection - Mixed
    'SC-7': { inherited: false, coverage: 'Partial', description: 'Boundary protection using Azure NSG, Firewall, and customer configuration' },
    'SC-8': { inherited: true, coverage: 'Full', description: 'Transmission confidentiality and integrity using Azure TLS/SSL' },
    'SC-12': { inherited: false, coverage: 'Partial', description: 'Cryptographic key establishment using Azure Key Vault and customer policies' },
    'SC-13': { inherited: false, coverage: 'Partial', description: 'Cryptographic protection using Azure Key Vault, customer key management' },
    'SC-15': { inherited: true, coverage: 'Full', description: 'Collaborative computing devices managed by Azure infrastructure' },
    'SC-17': { inherited: false, coverage: 'Partial', description: 'Public key infrastructure certificates using Azure Key Vault' },
    'SC-20': { inherited: true, coverage: 'Full', description: 'Secure name/address resolution service using Azure DNS' },
    'SC-21': { inherited: true, coverage: 'Full', description: 'Secure name/address resolution service using Azure DNS' },
    'SC-22': { inherited: false, coverage: 'Partial', description: 'Architecture and provisioning for name/address resolution service' },
    'SC-23': { inherited: true, coverage: 'Full', description: 'Session authenticity using Azure platform capabilities' },
    'SC-28': { inherited: true, coverage: 'Full', description: 'Protection of information at rest using Azure Storage Encryption' },

    // Access Control - Shared Responsibility
    'AC-2': { inherited: false, coverage: 'Partial', description: 'Account management using Azure AD, RBAC, and customer policies' },
    'AC-3': { inherited: false, coverage: 'Partial', description: 'Access enforcement using Azure AD, RBAC, and customer configuration' },
    'AC-4': { inherited: false, coverage: 'Partial', description: 'Information flow enforcement using Azure NSG and customer policies' },
    'AC-5': { inherited: false, coverage: 'Partial', description: 'Separation of duties using Azure RBAC and customer role definition' },
    'AC-6': { inherited: false, coverage: 'Partial', description: 'Least privilege using Azure AD PIM and customer role management' },
    'AC-7': { inherited: false, coverage: 'Partial', description: 'Unsuccessful logon attempts using Azure AD and customer policies' },
    'AC-8': { inherited: false, coverage: 'Partial', description: 'System use notification using Azure AD and customer configuration' },
    'AC-10': { inherited: false, coverage: 'Partial', description: 'Concurrent session control using Azure AD and customer policies' },
    'AC-11': { inherited: false, coverage: 'Partial', description: 'Session lock using Azure AD and customer device policies' },
    'AC-12': { inherited: false, coverage: 'Partial', description: 'Session termination using Azure AD and customer configuration' },
    'AC-14': { inherited: false, coverage: 'Partial', description: 'Permitted actions without identification using Azure services' },
    'AC-17': { inherited: false, coverage: 'Partial', description: 'Remote access using Azure AD, VPN Gateway, and customer policies' },
    'AC-18': { inherited: false, coverage: 'Partial', description: 'Wireless access using Azure networking and customer configuration' },
    'AC-19': { inherited: false, coverage: 'Partial', description: 'Access control for mobile devices using Azure AD and Intune' },
    'AC-20': { inherited: false, coverage: 'Partial', description: 'Use of external information systems using Azure AD B2B' },

    // Audit and Accountability - Shared Responsibility
    'AU-2': { inherited: false, coverage: 'Partial', description: 'Event logging using Azure Monitor, Activity Logs, and customer configuration' },
    'AU-3': { inherited: false, coverage: 'Partial', description: 'Content of audit records using Azure Monitor and customer policies' },
    'AU-4': { inherited: false, coverage: 'Partial', description: 'Audit storage capacity using Azure Monitor and customer planning' },
    'AU-5': { inherited: false, coverage: 'Partial', description: 'Response to audit processing failures using Azure Monitor alerts' },
    'AU-6': { inherited: false, coverage: 'Partial', description: 'Audit review, analysis, and reporting using Azure Monitor and Sentinel' },
    'AU-7': { inherited: false, coverage: 'Partial', description: 'Audit reduction and report generation using Azure Monitor' },
    'AU-8': { inherited: true, coverage: 'Full', description: 'Time stamps provided by Azure platform' },
    'AU-9': { inherited: false, coverage: 'Partial', description: 'Protection of audit information using Azure Monitor and customer access controls' },
    'AU-10': { inherited: true, coverage: 'Full', description: 'Non-repudiation using Azure platform capabilities' },
    'AU-11': { inherited: false, coverage: 'Partial', description: 'Audit record retention using Azure Monitor and customer policies' },
    'AU-12': { inherited: false, coverage: 'Partial', description: 'Audit generation using Azure Monitor and customer configuration' },

    // System and Information Integrity - Shared Responsibility
    'SI-2': { inherited: false, coverage: 'Partial', description: 'Flaw remediation using Azure Update Management and customer processes' },
    'SI-3': { inherited: false, coverage: 'Partial', description: 'Malicious code protection using Microsoft Defender and customer configuration' },
    'SI-4': { inherited: false, coverage: 'Partial', description: 'Information system monitoring using Microsoft Defender for Cloud and Sentinel' },
    'SI-5': { inherited: false, coverage: 'Partial', description: 'Security alerts using Microsoft Defender for Cloud and customer response' },
    'SI-6': { inherited: false, coverage: 'Partial', description: 'Security function verification using Azure Security Center' },
    'SI-7': { inherited: false, coverage: 'Partial', description: 'Software, firmware, and information integrity using Microsoft Defender' },
    'SI-8': { inherited: false, coverage: 'Partial', description: 'Spam protection using Exchange Online Protection and customer policies' },
    'SI-10': { inherited: false, coverage: 'Partial', description: 'Information input validation using Azure services and customer implementation' },
    'SI-11': { inherited: false, coverage: 'Partial', description: 'Error handling using Azure services and customer implementation' },
    'SI-12': { inherited: false, coverage: 'Partial', description: 'Information handling and retention using Azure services and customer policies' },

    // Configuration Management - Shared Responsibility
    'CM-2': { inherited: false, coverage: 'Partial', description: 'Baseline configuration using Azure Policy, Blueprints, and customer management' },
    'CM-3': { inherited: false, coverage: 'Partial', description: 'Configuration change control using Azure Resource Manager and customer processes' },
    'CM-4': { inherited: false, coverage: 'Partial', description: 'Security impact analysis using Azure Policy and customer assessment' },
    'CM-5': { inherited: false, coverage: 'Partial', description: 'Access restrictions for change using Azure RBAC and customer policies' },
    'CM-6': { inherited: false, coverage: 'Partial', description: 'Configuration settings using Azure Policy and Security Center' },
    'CM-7': { inherited: false, coverage: 'Partial', description: 'Least functionality using Azure Policy and customer configuration' },
    'CM-8': { inherited: false, coverage: 'Partial', description: 'Information system component inventory using Azure Resource Graph' },
    'CM-9': { inherited: false, coverage: 'Partial', description: 'Configuration management plan using Azure governance and customer documentation' },
    'CM-10': { inherited: false, coverage: 'Partial', description: 'Software usage restrictions using Azure Policy and customer controls' },
    'CM-11': { inherited: false, coverage: 'Partial', description: 'User-installed software using Azure Policy and customer controls' },

    // Identification and Authentication - Shared Responsibility
    'IA-2': { inherited: false, coverage: 'Partial', description: 'Identification and authentication using Azure AD and customer policies' },
    'IA-3': { inherited: false, coverage: 'Partial', description: 'Device identification and authentication using Azure AD and customer management' },
    'IA-4': { inherited: false, coverage: 'Partial', description: 'Identifier management using Azure AD and customer processes' },
    'IA-5': { inherited: false, coverage: 'Partial', description: 'Authenticator management using Azure AD and customer policies' },
    'IA-6': { inherited: false, coverage: 'Partial', description: 'Authenticator feedback using Azure AD and customer configuration' },
    'IA-7': { inherited: false, coverage: 'Partial', description: 'Cryptographic module authentication using Azure Key Vault' },
    'IA-8': { inherited: false, coverage: 'Partial', description: 'Identification and authentication using Azure AD B2B and customer processes' },

    // Incident Response - Customer Responsibility (with Azure tools)
    'IR-1': { inherited: false, coverage: 'Partial', description: 'Incident response policy using Azure Sentinel and customer procedures' },
    'IR-2': { inherited: false, coverage: 'Partial', description: 'Incident response training using Azure documentation and customer training' },
    'IR-3': { inherited: false, coverage: 'Partial', description: 'Incident response testing using Azure Sentinel and customer exercises' },
    'IR-4': { inherited: false, coverage: 'Partial', description: 'Incident handling using Azure Sentinel and customer procedures' },
    'IR-5': { inherited: false, coverage: 'Partial', description: 'Incident monitoring using Azure Sentinel and customer analysis' },
    'IR-6': { inherited: false, coverage: 'Partial', description: 'Incident reporting using Azure Service Health and customer processes' },
    'IR-7': { inherited: false, coverage: 'Partial', description: 'Incident response assistance using Azure Support and customer coordination' },
    'IR-8': { inherited: false, coverage: 'Partial', description: 'Incident response plan using Azure guidance and customer documentation' }
};

/**
 * Read and parse the current NIST controls file
 */
function readNISTControls() {
    const filePath = path.join(__dirname, '..', 'src', 'data', 'nistControlsEnhanced.ts');
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`NIST controls file not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the export array (this is a simplified parser)
    const startIndex = content.indexOf('export const nistControlsEnhanced');
    if (startIndex === -1) {
        throw new Error('Could not find nistControlsEnhanced export in file');
    }
    
    return content;
}

/**
 * Update control status based on Azure shared responsibility
 */
function updateControlWithResponsibility(controlText, controlId) {
    const baseControlId = controlId.split('(')[0]; // Remove enhancement numbers
    const mapping = comprehensiveAzureMapping[baseControlId] || comprehensiveAzureMapping[controlId];
    
    if (!mapping) {
        return controlText; // No mapping, return unchanged
    }
    
    let updatedText = controlText;
    
    // Update providerCovered
    updatedText = updatedText.replace(
        /"providerCovered":\s*(true|false)/,
        '"providerCovered": true'
    );
    
    // Update providerCoverageType
    updatedText = updatedText.replace(
        /"providerCoverageType":\s*"[^"]*"/,
        `"providerCoverageType": "${mapping.coverage}"`
    );
    
    // Update azureInherited
    updatedText = updatedText.replace(
        /"azureInherited":\s*(true|false)/,
        `"azureInherited": ${mapping.inherited}`
    );
    
    // Update azureSharedResponsibility
    updatedText = updatedText.replace(
        /"azureSharedResponsibility":\s*(true|false)/,
        `"azureSharedResponsibility": ${!mapping.inherited}`
    );
    
    // Update status based on mapping
    let newStatus = 'not-assessed';
    if (mapping.inherited && mapping.coverage === 'Full') {
        newStatus = 'compliant';
    } else if (mapping.coverage === 'Partial') {
        newStatus = 'partial';
    }
    
    updatedText = updatedText.replace(
        /"status":\s*"[^"]*"/,
        `"status": "${newStatus}"`
    );
    
    // Update riskLevel based on status
    let newRiskLevel = 'medium';
    if (newStatus === 'compliant') {
        newRiskLevel = 'low';
    } else if (newStatus === 'not-assessed') {
        newRiskLevel = 'high';
    }
    
    updatedText = updatedText.replace(
        /"riskLevel":\s*"[^"]*"/,
        `"riskLevel": "${newRiskLevel}"`
    );
    
    // Update implementation description
    if (mapping.description) {
        updatedText = updatedText.replace(
            /"implementation":\s*"[^"]*"/,
            `"implementation": "${mapping.description}"`
        );
    }
    
    // Update assessedBy and lastAssessed
    const today = new Date().toISOString().split('T')[0];
    updatedText = updatedText.replace(
        /"assessedBy":\s*"[^"]*"/,
        '"assessedBy": "Azure Shared Responsibility Assessment"'
    );
    
    updatedText = updatedText.replace(
        /"lastAssessed":\s*"[^"]*"/,
        `"lastAssessed": "${today}"`
    );
    
    return updatedText;
}

/**
 * Process the entire NIST controls file
 */
function processNISTControlsFile() {
    console.log('🔍 Reading NIST controls file...');
    const content = readNISTControls();
    
    console.log('🔄 Processing Azure shared responsibility mappings...');
    
    let updatedContent = content;
    let updatedCount = 0;
    
    // Process each control mapping
    for (const [controlId, mapping] of Object.entries(comprehensiveAzureMapping)) {
        // Find the control in the file
        const controlPattern = new RegExp(`("id":\\s*"${controlId}",[\\s\\S]*?}),?(?=\\s*{|\\s*];)`, 'g');
        const matches = updatedContent.match(controlPattern);
        
        if (matches) {
            for (const match of matches) {
                const updatedMatch = updateControlWithResponsibility(match, controlId);
                if (updatedMatch !== match) {
                    updatedContent = updatedContent.replace(match, updatedMatch);
                    updatedCount++;
                    console.log(`✅ Updated control ${controlId} - ${mapping.inherited ? 'Inherited' : 'Shared'} (${mapping.coverage})`);
                }
            }
        }
    }
    
    console.log(`🎯 Updated ${updatedCount} controls with Azure shared responsibility assessment`);
    
    // Write the updated file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'nistControlsEnhanced.ts');
    fs.writeFileSync(outputPath, updatedContent, 'utf8');
    
    console.log(`💾 Updated NIST controls file: ${outputPath}`);
    
    // Generate summary report
    const inheritedCount = Object.values(comprehensiveAzureMapping).filter(m => m.inherited).length;
    const sharedCount = Object.values(comprehensiveAzureMapping).filter(m => !m.inherited).length;
    
    console.log('\n📊 Azure Shared Responsibility Summary:');
    console.log(`• Azure Inherited Controls: ${inheritedCount}`);
    console.log(`• Shared Responsibility Controls: ${sharedCount}`);
    console.log(`• Total Azure-Mapped Controls: ${Object.keys(comprehensiveAzureMapping).length}`);
    
    return {
        totalProcessed: updatedCount,
        inheritedControls: inheritedCount,
        sharedControls: sharedCount,
        totalMapped: Object.keys(comprehensiveAzureMapping).length
    };
}

// Run the update if this script is called directly
if (require.main === module) {
    try {
        const results = processNISTControlsFile();
        console.log('\n🎉 Azure Shared Responsibility Assessment completed successfully!');
        console.log('📈 Results:', results);
    } catch (error) {
        console.error('❌ Error updating NIST controls:', error.message);
        process.exit(1);
    }
}

module.exports = {
    processNISTControlsFile,
    comprehensiveAzureMapping,
    updateControlWithResponsibility
};
