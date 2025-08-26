/**
 * Azure Shared Responsibility Assessment Logic
 * Automatically assess NIST controls based on Azure coverage and responsibility model
 */

/**
 * Assess control status based on Azure shared responsibility model
 * @param {Object} control - NIST control object
 * @returns {Object} Updated control with proper status
 */
function assessControlWithAzureResponsibility(control) {
    // Create a copy to avoid mutation
    const updatedControl = { ...control };
    
    // If Azure fully inherits the control (providerCoverageType: "Full" && azureInherited: true)
    if (control.providerCovered && 
        control.providerCoverageType === "Full" && 
        control.azureInherited) {
        
        updatedControl.status = 'compliant';
        updatedControl.riskLevel = 'low';
        updatedControl.implementation = `Azure fully implements this control. ${control.azureImplementation || control.description || 'Inherited from Azure infrastructure.'}`;
        updatedControl.assessedBy = 'Azure Shared Responsibility Assessment';
        updatedControl.lastAssessed = new Date().toISOString().split('T')[0];
        
        return updatedControl;
    }
    
    // If Azure provides partial coverage and customer has implemented their part
    if (control.providerCovered && 
        control.providerCoverageType === "Partial" && 
        control.azureSharedResponsibility) {
        
        // Check if customer implementation exists
        const hasCustomerImplementation = control.implementation && 
            control.implementation !== "No Azure implementation provided" &&
            control.implementation.length > 10;
            
        const hasAzureImplementation = control.azureImplementation && 
            control.azureImplementation !== "No Azure implementation provided" &&
            control.azureImplementation.length > 10;
        
        if (hasCustomerImplementation && hasAzureImplementation) {
            updatedControl.status = 'compliant';
            updatedControl.riskLevel = 'low';
        } else if (hasAzureImplementation) {
            updatedControl.status = 'partial';
            updatedControl.riskLevel = 'medium';
            updatedControl.implementation = `Azure provides tools and capabilities. Customer configuration required: ${control.azureImplementation}`;
        } else {
            updatedControl.status = 'partial';
            updatedControl.riskLevel = 'medium';
            updatedControl.implementation = `Shared responsibility - Azure provides infrastructure, customer must configure and implement policies.`;
        }
        
        updatedControl.assessedBy = 'Azure Shared Responsibility Assessment';
        updatedControl.lastAssessed = new Date().toISOString().split('T')[0];
        
        return updatedControl;
    }
    
    // If control is not covered by Azure at all
    if (!control.providerCovered || control.providerCoverageType === "None") {
        // Check if customer has implemented
        const hasImplementation = control.implementation && 
            control.implementation !== "No Azure implementation provided" &&
            control.implementation.length > 10;
            
        if (hasImplementation) {
            // Keep existing status if already assessed
            if (control.status === 'not-assessed') {
                updatedControl.status = 'partial'; // Default to partial for customer-only controls
                updatedControl.riskLevel = 'medium';
            }
        } else {
            updatedControl.status = 'not-assessed';
            updatedControl.riskLevel = 'high';
            updatedControl.implementation = 'Customer responsibility - implementation required.';
        }
        
        return updatedControl;
    }
    
    // Default case - return as is
    return updatedControl;
}

/**
 * Azure Service Mapping for Control Assessment
 * Maps Azure services to NIST control coverage
 */
const azureServiceMappings = {
    // Physical and Environmental Controls - Fully Inherited
    'PE-1': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-2': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-3': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-6': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-8': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-9': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-10': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-11': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-12': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-13': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-14': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-15': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-16': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-17': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-18': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-19': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    'PE-20': { inherited: true, coverage: 'Full', services: ['Azure Infrastructure'] },
    
    // System and Communications Protection - Shared/Inherited
    'SC-7': { inherited: false, coverage: 'Partial', services: ['Network Security Groups', 'Azure Firewall', 'Virtual Network'] },
    'SC-8': { inherited: true, coverage: 'Full', services: ['Azure TLS/SSL', 'Azure Storage Encryption'] },
    'SC-12': { inherited: false, coverage: 'Partial', services: ['Azure Key Vault', 'Azure HSM'] },
    'SC-13': { inherited: false, coverage: 'Partial', services: ['Azure Key Vault', 'Storage Service Encryption'] },
    'SC-28': { inherited: true, coverage: 'Full', services: ['Azure Storage Encryption', 'Azure Disk Encryption'] },
    
    // Access Control - Shared
    'AC-2': { inherited: false, coverage: 'Partial', services: ['Azure AD', 'RBAC', 'Privileged Identity Management'] },
    'AC-3': { inherited: false, coverage: 'Partial', services: ['Azure AD', 'RBAC'] },
    'AC-6': { inherited: false, coverage: 'Partial', services: ['Azure AD', 'RBAC', 'PIM'] },
    'AC-17': { inherited: false, coverage: 'Partial', services: ['Azure AD', 'Conditional Access', 'VPN Gateway'] },
    
    // Audit and Accountability - Shared
    'AU-2': { inherited: false, coverage: 'Partial', services: ['Azure Monitor', 'Activity Logs', 'Diagnostic Settings'] },
    'AU-3': { inherited: false, coverage: 'Partial', services: ['Azure Monitor', 'Log Analytics'] },
    'AU-6': { inherited: false, coverage: 'Partial', services: ['Azure Monitor', 'Microsoft Sentinel'] },
    'AU-12': { inherited: false, coverage: 'Partial', services: ['Azure Monitor', 'Activity Logs'] },
    
    // System and Information Integrity - Shared
    'SI-4': { inherited: false, coverage: 'Partial', services: ['Microsoft Defender for Cloud', 'Network Watcher', 'Microsoft Sentinel'] },
    'SI-7': { inherited: false, coverage: 'Partial', services: ['Microsoft Defender for Cloud', 'File Integrity Monitoring'] },
    
    // Configuration Management - Shared
    'CM-2': { inherited: false, coverage: 'Partial', services: ['Azure Policy', 'Azure Blueprints', 'Azure Resource Manager'] },
    'CM-6': { inherited: false, coverage: 'Partial', services: ['Azure Policy', 'Azure Security Center'] },
    'CM-7': { inherited: false, coverage: 'Partial', services: ['Azure Policy', 'Just-in-Time VM Access'] },
    'CM-8': { inherited: false, coverage: 'Partial', services: ['Azure Resource Graph', 'Azure Inventory'] }
};

/**
 * Enhanced assessment function with Azure service mappings
 * @param {Object} control - NIST control object
 * @returns {Object} Enhanced control with Azure assessment
 */
function enhancedAzureAssessment(control) {
    const controlId = control.controlIdentifier;
    const baseControlId = controlId.split('(')[0]; // Remove enhancement numbers
    
    // Check if we have specific Azure mapping
    const azureMapping = azureServiceMappings[baseControlId] || azureServiceMappings[controlId];
    
    if (azureMapping) {
        const updatedControl = { ...control };
        
        // Update Azure-specific fields
        updatedControl.providerCovered = true;
        updatedControl.providerCoverageType = azureMapping.coverage;
        updatedControl.azureInherited = azureMapping.inherited;
        updatedControl.azureSharedResponsibility = !azureMapping.inherited;
        
        // Enhanced Azure implementation description
        const serviceList = azureMapping.services.join(', ');
        updatedControl.azureImplementation = `Implemented using: ${serviceList}. ${control.azureImplementation || control.description || ''}`;
        
        // Set status based on mapping
        if (azureMapping.inherited && azureMapping.coverage === 'Full') {
            updatedControl.status = 'compliant';
            updatedControl.riskLevel = 'low';
            updatedControl.implementation = `Fully inherited from Azure: ${serviceList}`;
        } else if (azureMapping.coverage === 'Partial') {
            updatedControl.status = 'partial';
            updatedControl.riskLevel = 'medium';
            updatedControl.implementation = `Azure provides ${serviceList}. Customer configuration and policies required.`;
        }
        
        updatedControl.assessedBy = 'Enhanced Azure Shared Responsibility Assessment';
        updatedControl.lastAssessed = new Date().toISOString().split('T')[0];
        
        return updatedControl;
    }
    
    // Fall back to standard assessment
    return assessControlWithAzureResponsibility(control);
}

module.exports = {
    assessControlWithAzureResponsibility,
    enhancedAzureAssessment,
    azureServiceMappings
};
