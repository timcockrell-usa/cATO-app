# NIST 800-53 Rev 5 Controls Update Guide

## Overview
This guide explains how to update your cATO application with the complete NIST 800-53 Rev 5 control catalog from the official CSV file.

## Prerequisites
- Node.js installed
- The SP 800-53 Rev 5 control catalog CSV file (sp800-53r5-control-catalog.csv)

## Quick Update Process

### Method 1: Using the Batch Script (Windows)
1. Save your SP 800-53 Rev 5 CSV file to a known location
2. Double-click `scripts/update-nist.bat`
3. Drag and drop your CSV file onto the batch file window
4. Wait for processing to complete

### Method 2: Command Line
```powershell
# Navigate to the scripts directory
cd scripts

# Run the update script with your CSV file path
node update-nist-controls.js "C:\path\to\your\sp800-53r5-control-catalog.csv"
```

### Method 3: Drag and Drop
1. Drag your CSV file and drop it onto `scripts/update-nist.bat`
2. The script will automatically process the file

## What the Update Does

### 1. Processes Complete Catalog
- Reads all controls from the official NIST SP 800-53 Rev 5 CSV
- Converts them to the cATO application format
- Preserves existing Azure implementation guidance

### 2. Enhances with Azure Guidance
- Adds specific Azure implementation guidance for common controls
- Maps controls to Azure services and capabilities
- Assigns appropriate compliance status based on typical Azure implementations

### 3. Updates Application Database
- Replaces `src/data/nistControlsEnhanced.ts` with the complete catalog
- Maintains compatibility with existing dashboard and filtering features
- Preserves POA&M integration capabilities

## Expected Results

After running the update, you should see:

### Control Statistics
- **Total Controls**: ~1,200+ (complete catalog)
- **Control Families**: 20 families (AC, AU, CA, CM, CP, IA, IR, MA, MP, PE, PL, PM, PS, PT, RA, SA, SC, SI, SR)
- **Azure-Enhanced Controls**: 20+ controls with specific Azure guidance

### Status Distribution
- **Compliant**: Controls with robust Azure implementations (e.g., IA-2 with MFA)
- **Partial**: Controls with some Azure support that need configuration
- **Not Assessed**: Most controls requiring organizational implementation
- **Non-Compliant**: Controls flagged as needing immediate attention

### Interactive Dashboard Updates
Your dashboard will automatically reflect the new control data:
- Updated compliance percentages
- Complete control family breakdown
- Enhanced filtering capabilities
- Accurate POA&M integration

## Verification Steps

1. **Check File Update**:
   ```powershell
   # Verify the file was updated
   Get-ChildItem src\data\nistControlsEnhanced.ts
   ```

2. **Restart Application**:
   ```powershell
   npm run dev
   ```

3. **Verify in Dashboard**:
   - Navigate to Executive Dashboard
   - Check NIST 800-53 Compliance Status chart
   - Verify higher control count
   - Test clicking on chart segments

4. **Test NIST Controls Page**:
   - Navigate to NIST Controls
   - Verify all 20 control families are present
   - Test search and filtering functionality

## Azure Implementation Highlights

The update includes enhanced Azure implementation guidance for:

### Access Control (AC)
- **AC-2**: Microsoft Entra ID Governance with Lifecycle Workflows
- **AC-3**: Conditional Access policies and Azure RBAC
- **AC-6**: Privileged Identity Management (PIM)

### Audit and Accountability (AU)  
- **AU-2**: Azure Activity Log and Monitor Logs
- **AU-3**: Application Insights telemetry
- **AU-6**: Azure Sentinel SIEM capabilities

### Identification and Authentication (IA)
- **IA-2**: Multi-factor authentication enforcement
- **IA-5**: Password Protection and Key Vault

### System and Communications Protection (SC)
- **SC-7**: Network Security Groups and Azure Firewall
- **SC-8**: TLS enforcement across Azure services
- **SC-13**: Key Vault with HSM-backed keys

## Troubleshooting

### Common Issues

1. **CSV File Not Found**:
   - Ensure the CSV file path is correct
   - Check file permissions
   - Verify the file is not corrupted

2. **Node.js Errors**:
   ```powershell
   # Reinstall dependencies if needed
   npm install
   ```

3. **TypeScript Compilation Errors**:
   ```powershell
   # Check for syntax errors
   npm run build
   ```

4. **Dashboard Not Updating**:
   - Hard refresh the browser (Ctrl+F5)
   - Clear browser cache
   - Restart the development server

### Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your CSV file matches the expected NIST format
3. Ensure all npm dependencies are installed
4. Restart your development server after the update

## Next Steps

After successfully updating:

1. **Review New Controls**: Browse the enhanced control catalog
2. **Update Assessments**: Use the new controls for security assessments
3. **Configure Azure Services**: Implement the Azure guidance provided
4. **Create POA&Ms**: Generate POA&Ms for non-compliant controls
5. **Monitor Compliance**: Use the interactive dashboard for ongoing monitoring

The updated control catalog provides a comprehensive foundation for your Azure-based security compliance program.
