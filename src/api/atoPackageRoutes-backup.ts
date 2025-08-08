/**
 * ATO Package Generation API Endpoints
 * 
 * NOTE: This file contains server-side code that is not compatible with Azure Static Web Apps.
 * For production deployment, this functionality should be moved to Azure Functions.
 * 
 * This file is temporarily disabled to allow frontend build to complete.
 */

// This interface provides the expected structure for when Azure Functions are implemented
export interface ATOPackageService {
  generateSSP: (data: any) => Promise<string>;
  generatePOAM: (data: any) => Promise<string>;
  generateFullPackage: (data: any) => Promise<Blob>;
}

// Placeholder implementation - replace with Azure Functions calls in production
export const atoPackageRoutes: ATOPackageService = {
  generateSSP: async (data: any) => {
    console.warn('ATO Package generation not available - implement in Azure Functions');
    throw new Error('Server-side functionality moved to Azure Functions - see deployment guide');
  },
  
  generatePOAM: async (data: any) => {
    console.warn('POAM generation not available - implement in Azure Functions');
    throw new Error('Server-side functionality moved to Azure Functions - see deployment guide');
  },
  
  generateFullPackage: async (data: any) => {
    console.warn('Package generation not available - implement in Azure Functions');
    throw new Error('Server-side functionality moved to Azure Functions - see deployment guide');
  }
};

export default atoPackageRoutes;

const router = express.Router();
const atoService = new ATOPackageGenerationService();

// Template cache for performance
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Helper function to load and compile Handlebars templates
 */
async function getCompiledTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = path.join(process.cwd(), 'templates', `${templateName}.md`);
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const compiledTemplate = Handlebars.compile(templateContent);
  
  templateCache.set(templateName, compiledTemplate);
  return compiledTemplate;
}

/**
 * Helper function to convert Markdown to PDF
 */
async function convertMarkdownToPDF(markdownContent: string, outputPath: string): Promise<void> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Convert markdown to HTML
  const htmlContent = marked(markdownContent);
  
  // Create full HTML document with styling
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>ATO Document</title>
        <style>
            body { 
                font-family: 'Times New Roman', serif; 
                line-height: 1.6; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                color: #333;
            }
            h1 { 
                color: #1e3a8a; 
                border-bottom: 2px solid #1e3a8a; 
                padding-bottom: 10px;
                page-break-before: always;
            }
            h1:first-child { page-break-before: auto; }
            h2 { 
                color: #1e40af; 
                border-bottom: 1px solid #e5e7eb; 
                padding-bottom: 5px;
                margin-top: 30px;
            }
            h3 { color: #2563eb; margin-top: 25px; }
            h4 { color: #3b82f6; margin-top: 20px; }
            table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 15px 0;
            }
            th, td { 
                border: 1px solid #d1d5db; 
                padding: 8px; 
                text-align: left;
            }
            th { 
                background-color: #f3f4f6; 
                font-weight: bold;
            }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
            @media print {
                body { margin: 0; }
                h1, h2, h3 { page-break-after: avoid; }
            }
        </style>
    </head>
    <body>
        ${htmlContent}
    </body>
    </html>
  `;
  
  await page.setContent(fullHtml);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '1in',
      right: '1in',
      bottom: '1in',
      left: '1in'
    }
  });
  
  await browser.close();
}

/**
 * Helper function to convert POA&M data to eMASS-compatible CSV
 */
async function generateeMASS_CSV(poamData: any[], outputPath: string): Promise<void> {
  const csvHeaders = [
    'POA&M Item ID',
    'Controls',
    'Weakness Description',
    'Weakness Detection Source',
    'Weakness Detection Date',
    'Weakness Resolution Target Date',
    'Status',
    'Risk',
    'Threat Statement',
    'Countermeasures',
    'Resources Required',
    'Scheduled Completion Date',
    'Milestones with Completion Dates',
    'Changes to Milestones',
    'Source of Discovery',
    'Remediation Plan'
  ];

  const csvRows = [csvHeaders.join(',')];

  poamData.forEach(item => {
    const row = [
      `"${item.poamId}"`,
      `"${item.relatedControlId}"`,
      `"${item.weaknessDescription.replace(/"/g, '""')}"`,
      `"${item.findingSource}"`,
      `"${item.originalDetectionDate}"`,
      `"${item.scheduledCompletionDate}"`,
      `"${item.status}"`,
      `"${item.riskLevel}"`,
      `"${item.threatStatement.replace(/"/g, '""')}"`,
      `"${item.recommendedCorrectiveAction.replace(/"/g, '""')}"`,
      `"${item.resourcesRequired.replace(/"/g, '""')}"`,
      `"${item.scheduledCompletionDate}"`,
      `"${item.milestones.map((m: any) => `${m.milestoneDescription}: ${m.targetDate}`).join('; ').replace(/"/g, '""')}"`,
      `""`,
      `"${item.findingSource}"`,
      `"${item.remediationPlan.replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });

  await fs.writeFile(outputPath, csvRows.join('\n'), 'utf-8');
}

/**
 * GET /api/ato-package/generate
 * Generate complete ATO package with all components
 */
router.post('/generate', async (req, res) => {
  try {
    const { tenantId, systemName, nistRevision = '5' } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Generate complete ATO package data
    const atoPackage = await atoService.generateATOPackage(tenantId, nistRevision);
    
    res.json({
      success: true,
      data: atoPackage,
      message: 'ATO package data generated successfully'
    });

  } catch (error) {
    console.error('Error generating ATO package:', error);
    res.status(500).json({ 
      error: 'Failed to generate ATO package',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ato-package/export/ssp
 * Export System Security Plan as PDF
 */
router.post('/export/ssp', async (req, res) => {
  try {
    const { tenantId, nistRevision = '5' } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Generate SSP data
    const sspData = await atoService.generateSystemSecurityPlan(tenantId, nistRevision);
    
    // Load and compile template
    const template = await getCompiledTemplate('ssp_template');
    const markdownContent = template({
      ...sspData,
      generatedDate: new Date().toISOString().split('T')[0],
      documentVersion: '1.0',
      version: '1.0'
    });

    // Generate unique filename
    const filename = `SSP_${sspData.systemInformation.systemName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Convert to PDF
    await convertMarkdownToPDF(markdownContent, outputPath);

    // Send file
    res.download(outputPath, filename, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp file
      try {
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Error exporting SSP:', error);
    res.status(500).json({ 
      error: 'Failed to export SSP',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ato-package/export/poam-pdf
 * Export POA&M as PDF
 */
router.post('/export/poam-pdf', async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Generate POA&M data
    const poamData = await atoService.generatePOAMData(tenantId);
    
    // Load and compile template
    const template = await getCompiledTemplate('poam_template');
    const markdownContent = template({
      ...poamData,
      generatedDate: new Date().toISOString().split('T')[0],
      documentVersion: '1.0',
      version: '1.0'
    });

    // Generate unique filename
    const filename = `POAM_${poamData.systemName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Convert to PDF
    await convertMarkdownToPDF(markdownContent, outputPath);

    // Send file
    res.download(outputPath, filename, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp file
      try {
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Error exporting POA&M PDF:', error);
    res.status(500).json({ 
      error: 'Failed to export POA&M PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ato-package/export/poam-csv
 * Export POA&M as eMASS-compatible CSV
 */
router.post('/export/poam-csv', async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Generate POA&M data
    const poamData = await atoService.generatePOAMData(tenantId);
    
    // Generate unique filename
    const filename = `POAM_eMASS_${poamData.systemName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    const outputPath = path.join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Generate eMASS CSV
    await generateeMASS_CSV(poamData.poamItems, outputPath);

    // Send file
    res.download(outputPath, filename, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temp file
      try {
        await fs.unlink(outputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Error exporting POA&M CSV:', error);
    res.status(500).json({ 
      error: 'Failed to export POA&M CSV',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ato-package/export/complete
 * Export complete ATO package as ZIP file
 */
router.post('/export/complete', async (req, res) => {
  try {
    const { tenantId, nistRevision = '5' } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Generate complete ATO package
    const atoPackage = await atoService.generateATOPackage(tenantId, nistRevision);
    
    // Create unique directory for this package
    const packageId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp', packageId);
    await fs.mkdir(tempDir, { recursive: true });

    const systemName = atoPackage.systemInformation.systemName.replace(/\s+/g, '_');
    
    // Generate SSP PDF
    const sspTemplate = await getCompiledTemplate('ssp_template');
    const sspMarkdown = sspTemplate({
      ...atoPackage,
      generatedDate: new Date().toISOString().split('T')[0],
      documentVersion: '1.0',
      version: '1.0'
    });
    const sspPath = path.join(tempDir, `SSP_${systemName}.pdf`);
    await convertMarkdownToPDF(sspMarkdown, sspPath);

    // Generate POA&M PDF
    const poamData = await atoService.generatePOAMData(tenantId);
    const poamTemplate = await getCompiledTemplate('poam_template');
    const poamMarkdown = poamTemplate({
      ...poamData,
      generatedDate: new Date().toISOString().split('T')[0],
      documentVersion: '1.0',
      version: '1.0'
    });
    const poamPdfPath = path.join(tempDir, `POAM_${systemName}.pdf`);
    await convertMarkdownToPDF(poamMarkdown, poamPdfPath);

    // Generate POA&M CSV
    const poamCsvPath = path.join(tempDir, `POAM_eMASS_${systemName}.csv`);
    await generateeMASS_CSV(poamData.poamItems, poamCsvPath);

    // Generate JSON data file
    const jsonPath = path.join(tempDir, `ATO_Package_Data_${systemName}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(atoPackage, null, 2), 'utf-8');

    // Create ZIP archive
    const zipFilename = `ATO_Package_${systemName}_${Date.now()}.zip`;
    const zipPath = path.join(process.cwd(), 'temp', zipFilename);
    
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    
    // Add files to archive
    archive.file(sspPath, { name: `SSP_${systemName}.pdf` });
    archive.file(poamPdfPath, { name: `POAM_${systemName}.pdf` });
    archive.file(poamCsvPath, { name: `POAM_eMASS_${systemName}.csv` });
    archive.file(jsonPath, { name: `ATO_Package_Data_${systemName}.json` });
    
    // Add README
    const readmeContent = `# ATO Package for ${atoPackage.systemInformation.systemName}

Generated: ${new Date().toISOString().split('T')[0]}
NIST Revision: ${nistRevision}

## Contents:
- SSP_${systemName}.pdf - System Security Plan
- POAM_${systemName}.pdf - Plan of Action and Milestones (Human Readable)
- POAM_eMASS_${systemName}.csv - POA&M in eMASS Import Format
- ATO_Package_Data_${systemName}.json - Complete package data in JSON format

## Compliance Summary:
- Total Controls Assessed: ${atoPackage.complianceMetrics.totalControlsAssessed}
- Compliant Controls: ${atoPackage.complianceMetrics.compliantControlsCount}
- Overall Compliance: ${atoPackage.complianceMetrics.overallCompliancePercentage}%
- Zero Trust Maturity: ${atoPackage.zeroTrustAssessment.maturityLevel} (${atoPackage.zeroTrustAssessment.overallScore}%)

Generated by cATO Command Center v1.0
`;
    archive.append(readmeContent, { name: 'README.md' });
    
    await archive.finalize();

    // Wait for archive to complete
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });

    // Send ZIP file
    res.download(zipPath, zipFilename, async (err) => {
      if (err) {
        console.error('Error sending ZIP file:', err);
      }
      // Clean up temp files
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        await fs.unlink(zipPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Error exporting complete ATO package:', error);
    res.status(500).json({ 
      error: 'Failed to export complete ATO package',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ato-package/status/:tenantId
 * Get ATO package generation status and metrics
 */
router.get('/status/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Generate compliance metrics
    const metrics = await atoService.generateComplianceMetrics(tenantId);
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting ATO package status:', error);
    res.status(500).json({ 
      error: 'Failed to get ATO package status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
