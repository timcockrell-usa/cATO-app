/**
 * NIST Revision Management API Endpoints
 * Express.js routes for handling NIST 800-53 revision management
 */

import { Router, Request, Response } from 'express';
import enhancedCosmosService from '../services/enhancedCosmosService';
import { NistRevision } from '../types/organization';
import { 
  NISTRevisionMapping,
  RevisionGapAnalysisResponse,
  RevisionUpgradeResponse,
  NISTControlRevisionComparison,
  NISTRevisionUpgradeHistory
} from '../types/nistRevisionManagement';

const router = Router();

// Middleware for tenant validation (would be implemented based on your auth system)
const validateTenant = (req: Request, res: Response, next: any) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: 'Tenant ID is required in x-tenant-id header'
    });
  }
  req.tenantId = tenantId;
  next();
};

// Middleware to add tenant ID to request
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      userId?: string;
    }
  }
}

/**
 * GET /api/nist-revision/current
 * Get current NIST revision for organization
 */
router.get('/current', validateTenant, async (req: Request, res: Response) => {
  try {
    const tenant = await enhancedCosmosService.getTenant(req.tenantId!);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const currentRevision = tenant.nistRevision === '4' ? 'Rev4' : 'Rev5';
    
    res.json({
      success: true,
      data: {
        currentRevision,
        tenantId: req.tenantId,
        lastUpdated: tenant.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting current NIST revision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve current NIST revision'
    });
  }
});

/**
 * PUT /api/nist-revision/set
 * Set NIST revision for organization
 */
router.put('/set', validateTenant, async (req: Request, res: Response) => {
  try {
    const { revision } = req.body;
    
    if (!revision || !['Rev4', 'Rev5'].includes(revision)) {
      return res.status(400).json({
        success: false,
        error: 'Valid revision (Rev4 or Rev5) is required'
      });
    }

    await enhancedCosmosService.setOrganizationNISTRevision(req.tenantId!, revision as NistRevision);
    
    res.json({
      success: true,
      message: `NIST revision updated to ${revision}`,
      data: {
        newRevision: revision,
        tenantId: req.tenantId,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error setting NIST revision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update NIST revision'
    });
  }
});

/**
 * GET /api/nist-revision/controls/:revision
 * Get NIST controls by revision
 */
router.get('/controls/:revision', validateTenant, async (req: Request, res: Response) => {
  try {
    const { revision } = req.params;
    const { environmentIds } = req.query;
    
    if (!revision || !['4', '5'].includes(revision)) {
      return res.status(400).json({
        success: false,
        error: 'Valid revision (4 or 5) is required'
      });
    }

    const envIds = environmentIds ? (environmentIds as string).split(',') : undefined;
    const controls = await enhancedCosmosService.getNISTControlsByRevision(
      req.tenantId!, 
      revision as '4' | '5',
      envIds
    );
    
    res.json({
      success: true,
      data: {
        controls,
        revision: `Rev${revision}`,
        count: controls.length,
        tenantId: req.tenantId
      }
    });
  } catch (error) {
    console.error('Error getting NIST controls by revision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve NIST controls'
    });
  }
});

/**
 * POST /api/nist-revision/gap-analysis
 * Perform gap analysis between current and target revision
 */
router.post('/gap-analysis', validateTenant, async (req: Request, res: Response) => {
  try {
    const { targetRevision } = req.body;
    
    if (!targetRevision || !['Rev4', 'Rev5'].includes(targetRevision)) {
      return res.status(400).json({
        success: false,
        error: 'Valid target revision (Rev4 or Rev5) is required'
      });
    }

    const gapAnalysis: RevisionGapAnalysisResponse = await enhancedCosmosService.performRevisionGapAnalysis(
      req.tenantId!,
      targetRevision
    );
    
    res.json(gapAnalysis);
  } catch (error) {
    console.error('Error performing gap analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform gap analysis'
    });
  }
});

/**
 * POST /api/nist-revision/initiate-upgrade
 * Initiate NIST revision upgrade process
 */
router.post('/initiate-upgrade', validateTenant, async (req: Request, res: Response) => {
  try {
    const { targetRevision } = req.body;
    const userId = req.userId || 'system'; // Would be extracted from auth token
    
    if (!targetRevision || !['Rev4', 'Rev5'].includes(targetRevision)) {
      return res.status(400).json({
        success: false,
        error: 'Valid target revision (Rev4 or Rev5) is required'
      });
    }

    const upgradeResponse: RevisionUpgradeResponse = await enhancedCosmosService.initiateRevisionUpgrade(
      req.tenantId!,
      targetRevision,
      userId
    );
    
    res.json(upgradeResponse);
  } catch (error) {
    console.error('Error initiating revision upgrade:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate revision upgrade'
    });
  }
});

/**
 * GET /api/nist-revision/control-comparison/:controlId
 * Get comparison of control between revisions
 */
router.get('/control-comparison/:controlId', validateTenant, async (req: Request, res: Response) => {
  try {
    const { controlId } = req.params;
    
    if (!controlId) {
      return res.status(400).json({
        success: false,
        error: 'Control ID is required'
      });
    }

    const comparison: NISTControlRevisionComparison = await enhancedCosmosService.getControlRevisionComparison(
      controlId,
      req.tenantId!
    );
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error getting control revision comparison:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve control comparison'
    });
  }
});

/**
 * GET /api/nist-revision/upgrade-history
 * Get revision upgrade history for organization
 */
router.get('/upgrade-history', validateTenant, async (req: Request, res: Response) => {
  try {
    const history: NISTRevisionUpgradeHistory[] = await enhancedCosmosService.getUpgradeHistory(req.tenantId!);
    
    res.json({
      success: true,
      data: {
        history,
        count: history.length,
        tenantId: req.tenantId
      }
    });
  } catch (error) {
    console.error('Error getting upgrade history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve upgrade history'
    });
  }
});

/**
 * GET /api/nist-revision/mappings
 * Get revision mappings for organization
 */
router.get('/mappings', validateTenant, async (req: Request, res: Response) => {
  try {
    const mappings: NISTRevisionMapping[] = await enhancedCosmosService.getRevisionMappings(req.tenantId!);
    
    res.json({
      success: true,
      data: {
        mappings,
        count: mappings.length,
        tenantId: req.tenantId
      }
    });
  } catch (error) {
    console.error('Error getting revision mappings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve revision mappings'
    });
  }
});

/**
 * POST /api/nist-revision/mappings
 * Create or update revision mapping (admin only)
 */
router.post('/mappings', validateTenant, async (req: Request, res: Response) => {
  try {
    const mapping: NISTRevisionMapping = req.body;
    
    // Validate required fields
    if (!mapping.mappingId || !mapping.tenantId || !mapping.changeType) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: mappingId, tenantId, changeType'
      });
    }

    // Ensure tenant ID matches
    if (mapping.tenantId !== req.tenantId && mapping.tenantId !== 'global') {
      return res.status(403).json({
        success: false,
        error: 'Cannot create mappings for other tenants'
      });
    }

    const createdMapping = await enhancedCosmosService.createOrUpdateRevisionMapping(mapping);
    
    res.json({
      success: true,
      message: 'Revision mapping created successfully',
      data: createdMapping
    });
  } catch (error) {
    console.error('Error creating revision mapping:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create revision mapping'
    });
  }
});

/**
 * GET /api/nist-revision/compliance-summary
 * Get compliance summary by revision
 */
router.get('/compliance-summary', validateTenant, async (req: Request, res: Response) => {
  try {
    const tenant = await enhancedCosmosService.getTenant(req.tenantId!);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const currentRevision = tenant.nistRevision;
    const controls = await enhancedCosmosService.getNISTControlsByRevision(req.tenantId!, currentRevision);
    
    const summary = {
      currentRevision: currentRevision === '4' ? 'Rev4' : 'Rev5',
      totalControls: controls.length,
      compliant: controls.filter(c => c.overallStatus === 'compliant').length,
      partial: controls.filter(c => c.overallStatus === 'partial').length,
      noncompliant: controls.filter(c => c.overallStatus === 'noncompliant').length,
      notAssessed: controls.filter(c => c.overallStatus === 'not-assessed').length
    };

    summary['compliancePercentage'] = summary.totalControls > 0 
      ? Math.round((summary.compliant / summary.totalControls) * 100)
      : 0;
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting compliance summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve compliance summary'
    });
  }
});

export default router;
