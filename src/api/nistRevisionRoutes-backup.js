"use strict";
/**
 * NIST Revision Management API Endpoints
 * Express.js routes for handling NIST 800-53 revision management
 */
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
var express_1 = require("express");
var enhancedCosmosService_1 = require("../services/enhancedCosmosService");
var router = (0, express_1.Router)();
// Middleware for tenant validation (would be implemented based on your auth system)
var validateTenant = function (req, res, next) {
    var tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        return res.status(400).json({
            success: false,
            error: 'Tenant ID is required in x-tenant-id header'
        });
    }
    req.tenantId = tenantId;
    next();
};
/**
 * GET /api/nist-revision/current
 * Get current NIST revision for organization
 */
router.get('/current', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tenant, currentRevision, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, enhancedCosmosService_1.default.getTenant(req.tenantId)];
            case 1:
                tenant = _a.sent();
                if (!tenant) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Organization not found'
                        })];
                }
                currentRevision = tenant.nistRevision === '4' ? 'Rev4' : 'Rev5';
                res.json({
                    success: true,
                    data: {
                        currentRevision: currentRevision,
                        tenantId: req.tenantId,
                        lastUpdated: tenant.updatedAt
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error getting current NIST revision:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve current NIST revision'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * PUT /api/nist-revision/set
 * Set NIST revision for organization
 */
router.put('/set', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var revision, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                revision = req.body.revision;
                if (!revision || !['Rev4', 'Rev5'].includes(revision)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Valid revision (Rev4 or Rev5) is required'
                        })];
                }
                return [4 /*yield*/, enhancedCosmosService_1.default.setOrganizationNISTRevision(req.tenantId, revision)];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: "NIST revision updated to ".concat(revision),
                    data: {
                        newRevision: revision,
                        tenantId: req.tenantId,
                        updatedAt: new Date().toISOString()
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error setting NIST revision:', error_2);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update NIST revision'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/nist-revision/controls/:revision
 * Get NIST controls by revision
 */
router.get('/controls/:revision', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var revision, environmentIds, envIds, controls, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                revision = req.params.revision;
                environmentIds = req.query.environmentIds;
                if (!revision || !['4', '5'].includes(revision)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Valid revision (4 or 5) is required'
                        })];
                }
                envIds = environmentIds ? environmentIds.split(',') : undefined;
                return [4 /*yield*/, enhancedCosmosService_1.default.getNISTControlsByRevision(req.tenantId, revision, envIds)];
            case 1:
                controls = _a.sent();
                res.json({
                    success: true,
                    data: {
                        controls: controls,
                        revision: "Rev".concat(revision),
                        count: controls.length,
                        tenantId: req.tenantId
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error getting NIST controls by revision:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve NIST controls'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/nist-revision/gap-analysis
 * Perform gap analysis between current and target revision
 */
router.post('/gap-analysis', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var targetRevision, gapAnalysis, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                targetRevision = req.body.targetRevision;
                if (!targetRevision || !['Rev4', 'Rev5'].includes(targetRevision)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Valid target revision (Rev4 or Rev5) is required'
                        })];
                }
                return [4 /*yield*/, enhancedCosmosService_1.default.performRevisionGapAnalysis(req.tenantId, targetRevision)];
            case 1:
                gapAnalysis = _a.sent();
                res.json(gapAnalysis);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error performing gap analysis:', error_4);
                res.status(500).json({
                    success: false,
                    error: error_4 instanceof Error ? error_4.message : 'Failed to perform gap analysis'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/nist-revision/initiate-upgrade
 * Initiate NIST revision upgrade process
 */
router.post('/initiate-upgrade', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var targetRevision, userId, upgradeResponse, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                targetRevision = req.body.targetRevision;
                userId = req.userId || 'system';
                if (!targetRevision || !['Rev4', 'Rev5'].includes(targetRevision)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Valid target revision (Rev4 or Rev5) is required'
                        })];
                }
                return [4 /*yield*/, enhancedCosmosService_1.default.initiateRevisionUpgrade(req.tenantId, targetRevision, userId)];
            case 1:
                upgradeResponse = _a.sent();
                res.json(upgradeResponse);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error initiating revision upgrade:', error_5);
                res.status(500).json({
                    success: false,
                    error: error_5 instanceof Error ? error_5.message : 'Failed to initiate revision upgrade'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/nist-revision/control-comparison/:controlId
 * Get comparison of control between revisions
 */
router.get('/control-comparison/:controlId', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var controlId, comparison, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                controlId = req.params.controlId;
                if (!controlId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Control ID is required'
                        })];
                }
                return [4 /*yield*/, enhancedCosmosService_1.default.getControlRevisionComparison(controlId, req.tenantId)];
            case 1:
                comparison = _a.sent();
                res.json({
                    success: true,
                    data: comparison
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error getting control revision comparison:', error_6);
                res.status(500).json({
                    success: false,
                    error: error_6 instanceof Error ? error_6.message : 'Failed to retrieve control comparison'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/nist-revision/upgrade-history
 * Get revision upgrade history for organization
 */
router.get('/upgrade-history', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var history_1, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, enhancedCosmosService_1.default.getUpgradeHistory(req.tenantId)];
            case 1:
                history_1 = _a.sent();
                res.json({
                    success: true,
                    data: {
                        history: history_1,
                        count: history_1.length,
                        tenantId: req.tenantId
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error getting upgrade history:', error_7);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve upgrade history'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/nist-revision/mappings
 * Get revision mappings for organization
 */
router.get('/mappings', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var mappings, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, enhancedCosmosService_1.default.getRevisionMappings(req.tenantId)];
            case 1:
                mappings = _a.sent();
                res.json({
                    success: true,
                    data: {
                        mappings: mappings,
                        count: mappings.length,
                        tenantId: req.tenantId
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Error getting revision mappings:', error_8);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve revision mappings'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/nist-revision/mappings
 * Create or update revision mapping (admin only)
 */
router.post('/mappings', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var mapping, createdMapping, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                mapping = req.body;
                // Validate required fields
                if (!mapping.mappingId || !mapping.tenantId || !mapping.changeType) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Required fields: mappingId, tenantId, changeType'
                        })];
                }
                // Ensure tenant ID matches
                if (mapping.tenantId !== req.tenantId && mapping.tenantId !== 'global') {
                    return [2 /*return*/, res.status(403).json({
                            success: false,
                            error: 'Cannot create mappings for other tenants'
                        })];
                }
                return [4 /*yield*/, enhancedCosmosService_1.default.createOrUpdateRevisionMapping(mapping)];
            case 1:
                createdMapping = _a.sent();
                res.json({
                    success: true,
                    message: 'Revision mapping created successfully',
                    data: createdMapping
                });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error creating revision mapping:', error_9);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create revision mapping'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/nist-revision/compliance-summary
 * Get compliance summary by revision
 */
router.get('/compliance-summary', validateTenant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tenant, currentRevision, controls, summary, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, enhancedCosmosService_1.default.getTenant(req.tenantId)];
            case 1:
                tenant = _a.sent();
                if (!tenant) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Organization not found'
                        })];
                }
                currentRevision = tenant.nistRevision;
                return [4 /*yield*/, enhancedCosmosService_1.default.getNISTControlsByRevision(req.tenantId, currentRevision)];
            case 2:
                controls = _a.sent();
                summary = {
                    currentRevision: currentRevision === '4' ? 'Rev4' : 'Rev5',
                    totalControls: controls.length,
                    compliant: controls.filter(function (c) { return c.overallStatus === 'compliant'; }).length,
                    partial: controls.filter(function (c) { return c.overallStatus === 'partial'; }).length,
                    noncompliant: controls.filter(function (c) { return c.overallStatus === 'noncompliant'; }).length,
                    notAssessed: controls.filter(function (c) { return c.overallStatus === 'not-assessed'; }).length
                };
                summary['compliancePercentage'] = summary.totalControls > 0
                    ? Math.round((summary.compliant / summary.totalControls) * 100)
                    : 0;
                res.json({
                    success: true,
                    data: summary
                });
                return [3 /*break*/, 4];
            case 3:
                error_10 = _a.sent();
                console.error('Error getting compliance summary:', error_10);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve compliance summary'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
