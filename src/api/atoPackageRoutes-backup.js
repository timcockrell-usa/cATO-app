"use strict";
/**
 * ATO Package Generation API Endpoints
 *
 * NOTE: This file contains server-side code that is not compatible with Azure Static Web Apps.
 * For production deployment, this functionality should be moved to Azure Functions.
 *
 * This file is temporarily disabled to allow frontend build to complete.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atoPackageRoutes = void 0;
// Placeholder implementation - replace with Azure Functions calls in production
exports.atoPackageRoutes = {
    generateSSP: function (data) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.warn('ATO Package generation not available - implement in Azure Functions');
            throw new Error('Server-side functionality moved to Azure Functions - see deployment guide');
        });
    }); },
    generatePOAM: function (data) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.warn('POAM generation not available - implement in Azure Functions');
            throw new Error('Server-side functionality moved to Azure Functions - see deployment guide');
        });
    }); },
    generateFullPackage: function (data) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.warn('Package generation not available - implement in Azure Functions');
            throw new Error('Server-side functionality moved to Azure Functions - see deployment guide');
        });
    }); }
};
exports.default = exports.atoPackageRoutes;
var router = express.Router();
var atoService = new ATOPackageGenerationService();
// Template cache for performance
var templateCache = new Map();
/**
 * Helper function to load and compile Handlebars templates
 */
function getCompiledTemplate(templateName) {
    return __awaiter(this, void 0, void 0, function () {
        var templatePath, templateContent, compiledTemplate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (templateCache.has(templateName)) {
                        return [2 /*return*/, templateCache.get(templateName)];
                    }
                    templatePath = path.join(process.cwd(), 'templates', "".concat(templateName, ".md"));
                    return [4 /*yield*/, fs.readFile(templatePath, 'utf-8')];
                case 1:
                    templateContent = _a.sent();
                    compiledTemplate = Handlebars.compile(templateContent);
                    templateCache.set(templateName, compiledTemplate);
                    return [2 /*return*/, compiledTemplate];
            }
        });
    });
}
/**
 * Helper function to convert Markdown to PDF
 */
function convertMarkdownToPDF(markdownContent, outputPath) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, htmlContent, fullHtml;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer.launch()];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    htmlContent = marked(markdownContent);
                    fullHtml = "\n    <!DOCTYPE html>\n    <html>\n    <head>\n        <meta charset=\"utf-8\">\n        <title>ATO Document</title>\n        <style>\n            body { \n                font-family: 'Times New Roman', serif; \n                line-height: 1.6; \n                max-width: 800px; \n                margin: 0 auto; \n                padding: 20px;\n                color: #333;\n            }\n            h1 { \n                color: #1e3a8a; \n                border-bottom: 2px solid #1e3a8a; \n                padding-bottom: 10px;\n                page-break-before: always;\n            }\n            h1:first-child { page-break-before: auto; }\n            h2 { \n                color: #1e40af; \n                border-bottom: 1px solid #e5e7eb; \n                padding-bottom: 5px;\n                margin-top: 30px;\n            }\n            h3 { color: #2563eb; margin-top: 25px; }\n            h4 { color: #3b82f6; margin-top: 20px; }\n            table { \n                border-collapse: collapse; \n                width: 100%; \n                margin: 15px 0;\n            }\n            th, td { \n                border: 1px solid #d1d5db; \n                padding: 8px; \n                text-align: left;\n            }\n            th { \n                background-color: #f3f4f6; \n                font-weight: bold;\n            }\n            .page-break { page-break-before: always; }\n            .no-break { page-break-inside: avoid; }\n            @media print {\n                body { margin: 0; }\n                h1, h2, h3 { page-break-after: avoid; }\n            }\n        </style>\n    </head>\n    <body>\n        ".concat(htmlContent, "\n    </body>\n    </html>\n  ");
                    return [4 /*yield*/, page.setContent(fullHtml)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.pdf({
                            path: outputPath,
                            format: 'A4',
                            printBackground: true,
                            margin: {
                                top: '1in',
                                right: '1in',
                                bottom: '1in',
                                left: '1in'
                            }
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, browser.close()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper function to convert POA&M data to eMASS-compatible CSV
 */
function generateeMASS_CSV(poamData, outputPath) {
    return __awaiter(this, void 0, void 0, function () {
        var csvHeaders, csvRows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    csvHeaders = [
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
                    csvRows = [csvHeaders.join(',')];
                    poamData.forEach(function (item) {
                        var row = [
                            "\"".concat(item.poamId, "\""),
                            "\"".concat(item.relatedControlId, "\""),
                            "\"".concat(item.weaknessDescription.replace(/"/g, '""'), "\""),
                            "\"".concat(item.findingSource, "\""),
                            "\"".concat(item.originalDetectionDate, "\""),
                            "\"".concat(item.scheduledCompletionDate, "\""),
                            "\"".concat(item.status, "\""),
                            "\"".concat(item.riskLevel, "\""),
                            "\"".concat(item.threatStatement.replace(/"/g, '""'), "\""),
                            "\"".concat(item.recommendedCorrectiveAction.replace(/"/g, '""'), "\""),
                            "\"".concat(item.resourcesRequired.replace(/"/g, '""'), "\""),
                            "\"".concat(item.scheduledCompletionDate, "\""),
                            "\"".concat(item.milestones.map(function (m) { return "".concat(m.milestoneDescription, ": ").concat(m.targetDate); }).join('; ').replace(/"/g, '""'), "\""),
                            "\"\"",
                            "\"".concat(item.findingSource, "\""),
                            "\"".concat(item.remediationPlan.replace(/"/g, '""'), "\"")
                        ];
                        csvRows.push(row.join(','));
                    });
                    return [4 /*yield*/, fs.writeFile(outputPath, csvRows.join('\n'), 'utf-8')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/ato-package/generate
 * Generate complete ATO package with all components
 */
router.post('/generate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tenantId, systemName, _b, nistRevision, atoPackage, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, tenantId = _a.tenantId, systemName = _a.systemName, _b = _a.nistRevision, nistRevision = _b === void 0 ? '5' : _b;
                if (!tenantId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Tenant ID is required' })];
                }
                return [4 /*yield*/, atoService.generateATOPackage(tenantId, nistRevision)];
            case 1:
                atoPackage = _c.sent();
                res.json({
                    success: true,
                    data: atoPackage,
                    message: 'ATO package data generated successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                console.error('Error generating ATO package:', error_1);
                res.status(500).json({
                    error: 'Failed to generate ATO package',
                    details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ato-package/export/ssp
 * Export System Security Plan as PDF
 */
router.post('/export/ssp', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tenantId, _b, nistRevision, sspData, template, markdownContent, filename, outputPath_1, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                _a = req.body, tenantId = _a.tenantId, _b = _a.nistRevision, nistRevision = _b === void 0 ? '5' : _b;
                if (!tenantId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Tenant ID is required' })];
                }
                return [4 /*yield*/, atoService.generateSystemSecurityPlan(tenantId, nistRevision)];
            case 1:
                sspData = _c.sent();
                return [4 /*yield*/, getCompiledTemplate('ssp_template')];
            case 2:
                template = _c.sent();
                markdownContent = template(__assign(__assign({}, sspData), { generatedDate: new Date().toISOString().split('T')[0], documentVersion: '1.0', version: '1.0' }));
                filename = "SSP_".concat(sspData.systemInformation.systemName.replace(/\s+/g, '_'), "_").concat(Date.now(), ".pdf");
                outputPath_1 = path.join(process.cwd(), 'temp', filename);
                // Ensure temp directory exists
                return [4 /*yield*/, fs.mkdir(path.dirname(outputPath_1), { recursive: true })];
            case 3:
                // Ensure temp directory exists
                _c.sent();
                // Convert to PDF
                return [4 /*yield*/, convertMarkdownToPDF(markdownContent, outputPath_1)];
            case 4:
                // Convert to PDF
                _c.sent();
                // Send file
                res.download(outputPath_1, filename, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var cleanupError_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    console.error('Error sending file:', err);
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, fs.unlink(outputPath_1)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                cleanupError_1 = _a.sent();
                                console.error('Error cleaning up temp file:', cleanupError_1);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _c.sent();
                console.error('Error exporting SSP:', error_2);
                res.status(500).json({
                    error: 'Failed to export SSP',
                    details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ato-package/export/poam-pdf
 * Export POA&M as PDF
 */
router.post('/export/poam-pdf', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tenantId, poamData, template, markdownContent, filename, outputPath_2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                tenantId = req.body.tenantId;
                if (!tenantId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Tenant ID is required' })];
                }
                return [4 /*yield*/, atoService.generatePOAMData(tenantId)];
            case 1:
                poamData = _a.sent();
                return [4 /*yield*/, getCompiledTemplate('poam_template')];
            case 2:
                template = _a.sent();
                markdownContent = template(__assign(__assign({}, poamData), { generatedDate: new Date().toISOString().split('T')[0], documentVersion: '1.0', version: '1.0' }));
                filename = "POAM_".concat(poamData.systemName.replace(/\s+/g, '_'), "_").concat(Date.now(), ".pdf");
                outputPath_2 = path.join(process.cwd(), 'temp', filename);
                // Ensure temp directory exists
                return [4 /*yield*/, fs.mkdir(path.dirname(outputPath_2), { recursive: true })];
            case 3:
                // Ensure temp directory exists
                _a.sent();
                // Convert to PDF
                return [4 /*yield*/, convertMarkdownToPDF(markdownContent, outputPath_2)];
            case 4:
                // Convert to PDF
                _a.sent();
                // Send file
                res.download(outputPath_2, filename, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var cleanupError_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    console.error('Error sending file:', err);
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, fs.unlink(outputPath_2)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                cleanupError_2 = _a.sent();
                                console.error('Error cleaning up temp file:', cleanupError_2);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                console.error('Error exporting POA&M PDF:', error_3);
                res.status(500).json({
                    error: 'Failed to export POA&M PDF',
                    details: error_3 instanceof Error ? error_3.message : 'Unknown error'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ato-package/export/poam-csv
 * Export POA&M as eMASS-compatible CSV
 */
router.post('/export/poam-csv', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tenantId, poamData, filename, outputPath_3, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                tenantId = req.body.tenantId;
                if (!tenantId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Tenant ID is required' })];
                }
                return [4 /*yield*/, atoService.generatePOAMData(tenantId)];
            case 1:
                poamData = _a.sent();
                filename = "POAM_eMASS_".concat(poamData.systemName.replace(/\s+/g, '_'), "_").concat(Date.now(), ".csv");
                outputPath_3 = path.join(process.cwd(), 'temp', filename);
                // Ensure temp directory exists
                return [4 /*yield*/, fs.mkdir(path.dirname(outputPath_3), { recursive: true })];
            case 2:
                // Ensure temp directory exists
                _a.sent();
                // Generate eMASS CSV
                return [4 /*yield*/, generateeMASS_CSV(poamData.poamItems, outputPath_3)];
            case 3:
                // Generate eMASS CSV
                _a.sent();
                // Send file
                res.download(outputPath_3, filename, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var cleanupError_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    console.error('Error sending file:', err);
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, fs.unlink(outputPath_3)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                cleanupError_3 = _a.sent();
                                console.error('Error cleaning up temp file:', cleanupError_3);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error('Error exporting POA&M CSV:', error_4);
                res.status(500).json({
                    error: 'Failed to export POA&M CSV',
                    details: error_4 instanceof Error ? error_4.message : 'Unknown error'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ato-package/export/complete
 * Export complete ATO package as ZIP file
 */
router.post('/export/complete', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tenantId, _b, nistRevision, atoPackage, packageId, tempDir_1, systemName, sspTemplate, sspMarkdown, sspPath, poamData, poamTemplate, poamMarkdown, poamPdfPath, poamCsvPath, jsonPath, zipFilename, zipPath_1, output_1, archive, readmeContent, error_5;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 12, , 13]);
                _a = req.body, tenantId = _a.tenantId, _b = _a.nistRevision, nistRevision = _b === void 0 ? '5' : _b;
                if (!tenantId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Tenant ID is required' })];
                }
                return [4 /*yield*/, atoService.generateATOPackage(tenantId, nistRevision)];
            case 1:
                atoPackage = _c.sent();
                packageId = uuidv4();
                tempDir_1 = path.join(process.cwd(), 'temp', packageId);
                return [4 /*yield*/, fs.mkdir(tempDir_1, { recursive: true })];
            case 2:
                _c.sent();
                systemName = atoPackage.systemInformation.systemName.replace(/\s+/g, '_');
                return [4 /*yield*/, getCompiledTemplate('ssp_template')];
            case 3:
                sspTemplate = _c.sent();
                sspMarkdown = sspTemplate(__assign(__assign({}, atoPackage), { generatedDate: new Date().toISOString().split('T')[0], documentVersion: '1.0', version: '1.0' }));
                sspPath = path.join(tempDir_1, "SSP_".concat(systemName, ".pdf"));
                return [4 /*yield*/, convertMarkdownToPDF(sspMarkdown, sspPath)];
            case 4:
                _c.sent();
                return [4 /*yield*/, atoService.generatePOAMData(tenantId)];
            case 5:
                poamData = _c.sent();
                return [4 /*yield*/, getCompiledTemplate('poam_template')];
            case 6:
                poamTemplate = _c.sent();
                poamMarkdown = poamTemplate(__assign(__assign({}, poamData), { generatedDate: new Date().toISOString().split('T')[0], documentVersion: '1.0', version: '1.0' }));
                poamPdfPath = path.join(tempDir_1, "POAM_".concat(systemName, ".pdf"));
                return [4 /*yield*/, convertMarkdownToPDF(poamMarkdown, poamPdfPath)];
            case 7:
                _c.sent();
                poamCsvPath = path.join(tempDir_1, "POAM_eMASS_".concat(systemName, ".csv"));
                return [4 /*yield*/, generateeMASS_CSV(poamData.poamItems, poamCsvPath)];
            case 8:
                _c.sent();
                jsonPath = path.join(tempDir_1, "ATO_Package_Data_".concat(systemName, ".json"));
                return [4 /*yield*/, fs.writeFile(jsonPath, JSON.stringify(atoPackage, null, 2), 'utf-8')];
            case 9:
                _c.sent();
                zipFilename = "ATO_Package_".concat(systemName, "_").concat(Date.now(), ".zip");
                zipPath_1 = path.join(process.cwd(), 'temp', zipFilename);
                output_1 = createWriteStream(zipPath_1);
                archive = archiver('zip', { zlib: { level: 9 } });
                archive.pipe(output_1);
                // Add files to archive
                archive.file(sspPath, { name: "SSP_".concat(systemName, ".pdf") });
                archive.file(poamPdfPath, { name: "POAM_".concat(systemName, ".pdf") });
                archive.file(poamCsvPath, { name: "POAM_eMASS_".concat(systemName, ".csv") });
                archive.file(jsonPath, { name: "ATO_Package_Data_".concat(systemName, ".json") });
                readmeContent = "# ATO Package for ".concat(atoPackage.systemInformation.systemName, "\n\nGenerated: ").concat(new Date().toISOString().split('T')[0], "\nNIST Revision: ").concat(nistRevision, "\n\n## Contents:\n- SSP_").concat(systemName, ".pdf - System Security Plan\n- POAM_").concat(systemName, ".pdf - Plan of Action and Milestones (Human Readable)\n- POAM_eMASS_").concat(systemName, ".csv - POA&M in eMASS Import Format\n- ATO_Package_Data_").concat(systemName, ".json - Complete package data in JSON format\n\n## Compliance Summary:\n- Total Controls Assessed: ").concat(atoPackage.complianceMetrics.totalControlsAssessed, "\n- Compliant Controls: ").concat(atoPackage.complianceMetrics.compliantControlsCount, "\n- Overall Compliance: ").concat(atoPackage.complianceMetrics.overallCompliancePercentage, "%\n- Zero Trust Maturity: ").concat(atoPackage.zeroTrustAssessment.maturityLevel, " (").concat(atoPackage.zeroTrustAssessment.overallScore, "%)\n\nGenerated by cATO Command Center v1.0\n");
                archive.append(readmeContent, { name: 'README.md' });
                return [4 /*yield*/, archive.finalize()];
            case 10:
                _c.sent();
                // Wait for archive to complete
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        output_1.on('close', resolve);
                        output_1.on('error', reject);
                    })];
            case 11:
                // Wait for archive to complete
                _c.sent();
                // Send ZIP file
                res.download(zipPath_1, zipFilename, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var cleanupError_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    console.error('Error sending ZIP file:', err);
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 4, , 5]);
                                return [4 /*yield*/, fs.rm(tempDir_1, { recursive: true, force: true })];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, fs.unlink(zipPath_1)];
                            case 3:
                                _a.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                cleanupError_4 = _a.sent();
                                console.error('Error cleaning up temp files:', cleanupError_4);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 13];
            case 12:
                error_5 = _c.sent();
                console.error('Error exporting complete ATO package:', error_5);
                res.status(500).json({
                    error: 'Failed to export complete ATO package',
                    details: error_5 instanceof Error ? error_5.message : 'Unknown error'
                });
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ato-package/status/:tenantId
 * Get ATO package generation status and metrics
 */
router.get('/status/:tenantId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tenantId, metrics, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tenantId = req.params.tenantId;
                return [4 /*yield*/, atoService.generateComplianceMetrics(tenantId)];
            case 1:
                metrics = _a.sent();
                res.json({
                    success: true,
                    data: metrics,
                    timestamp: new Date().toISOString()
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error getting ATO package status:', error_6);
                res.status(500).json({
                    error: 'Failed to get ATO package status',
                    details: error_6 instanceof Error ? error_6.message : 'Unknown error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
