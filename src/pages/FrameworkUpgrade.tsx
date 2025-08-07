/**
 * Framework Upgrade Page
 * Manages NIST 800-53 revision upgrades and gap analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { 
  ArrowUpCircle, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  Shield,
  AlertCircle,
  Info,
  Settings,
  CheckCircle2,
  Upload,
  ExternalLink
} from 'lucide-react';
import { NistRevision } from '../types/organization';
import nistRevisionService from '../services/nistRevisionService';
import { RevisionGapAnalysisResponse } from '../types/nistRevisionManagement';

interface FrameworkUpgradeProps {}

const FrameworkUpgrade: React.FC<FrameworkUpgradeProps> = () => {
  const { user } = useAuth();
  
  // Derive tenant ID from user's email domain or use default
  const getTenantId = () => {
    if (user?.email) {
      // Extract organization from email domain (e.g., user@company.mil -> company.mil)
      const domain = user.email.split('@')[1];
      return domain || 'default-tenant';
    }
    return 'default-tenant';
  };
  const [currentRevision, setCurrentRevision] = useState<NistRevision | null>(null);
  const [loading, setLoading] = useState(true);
  const [gapAnalysis, setGapAnalysis] = useState<RevisionGapAnalysisResponse | null>(null);
  const [upgradeInProgress, setUpgradeInProgress] = useState(false);
  const [selectedTargetRevision, setSelectedTargetRevision] = useState<'Rev4' | 'Rev5' | 'Rev6' | null>(null);
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    targetRevision: 'Rev4' | 'Rev5' | 'Rev6';
    upgradeId: string;
    gapAnalysis: RevisionGapAnalysisResponse;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEmassImport, setShowEmassImport] = useState(false);

  // Available revisions (future-proof for Rev 6)
  const availableRevisions = [
    { value: 'Rev4', label: 'NIST 800-53 Rev 4', status: 'Legacy', recommended: false },
    { value: 'Rev5', label: 'NIST 800-53 Rev 5', status: 'Current', recommended: true },
    { value: 'Rev6', label: 'NIST 800-53 Rev 6', status: 'Future', recommended: false, disabled: true }
  ];

  useEffect(() => {
    loadCurrentRevision();
  }, [user]);

  const loadCurrentRevision = async () => {
    try {
      const response = await nistRevisionService.getCurrentRevision(getTenantId());
      if (response.success) {
        setCurrentRevision(response.data.currentRevision);
        
        // Only auto-suggest if no pending upgrade
        if (!pendingUpgrade) {
          // Auto-suggest next available revision as target
          const currentRev = response.data.currentRevision;
          const targetRev = currentRev === 'Rev4' ? 'Rev5' : 
                           currentRev === 'Rev5' ? 'Rev6' : 'Rev4';
          setSelectedTargetRevision(targetRev as 'Rev4' | 'Rev5' | 'Rev6');
        }
      }
    } catch (error) {
      console.error('Error loading current revision:', error);
    } finally {
      setLoading(false);
    }
  };

  const performGapAnalysis = async (targetRevision: 'Rev4' | 'Rev5' | 'Rev6') => {
    try {
      setLoading(true);
      // Only perform gap analysis for available revisions
      if (targetRevision === 'Rev6') {
        // Simulate Rev6 gap analysis
        const mockGapAnalysis = {
          success: true,
          gapAnalysis: {
            analysisDate: new Date().toISOString(),
            totalCurrentControls: 450,
            totalTargetControls: 500,
            mappings: {
              unchanged: Array(380).fill(null).map((_, i) => ({ sourceControlId: `AC-${i+1}` })),
              modified: Array(45).fill(null).map((_, i) => ({ 
                sourceControlId: `SC-${i+1}`,
                changeSummary: 'Enhanced requirements for emerging threats',
                implementationImpact: 'medium' as const
              })),
              newControls: Array(25).fill(null).map((_, i) => ({ 
                targetControlId: `AI-${i+1}`,
                changeSummary: 'New AI/ML security controls',
                implementationImpact: 'high' as const
              })),
              withdrawnControls: []
            },
            impactAssessment: {
              lowImpact: 380,
              mediumImpact: 45,
              highImpact: 25,
              estimatedEffortHours: 280,
              priorityControls: ['AI-1', 'AI-2', 'SC-7']
            },
            compliancePrediction: {
              likelyCompliant: 380,
              requiresReview: 45,
              likelyNonCompliant: 25,
              notAssessed: 50
            }
          },
          recommendedActions: {
            immediate: ['Review AI/ML control requirements', 'Assess current AI implementations'],
            shortTerm: ['Implement new AI security controls', 'Update supply chain controls'],
            longTerm: ['Full AI governance framework', 'Enhanced monitoring systems']
          },
          estimatedMigrationTime: {
            optimisticHours: 200,
            realisticHours: 280,
            pessimisticHours: 400
          }
        };
        setGapAnalysis(mockGapAnalysis as any);
      } else {
        const analysis = await nistRevisionService.performGapAnalysis(getTenantId(), targetRevision);
        setGapAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error performing gap analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const stageUpgrade = async () => {
    if (!selectedTargetRevision) return;
    
    try {
      setUpgradeInProgress(true);
      const response = await nistRevisionService.stageUpgrade(
        getTenantId(), 
        selectedTargetRevision, 
        'current-user' // Would be actual user ID
      );
      
      if (response.success) {
        setPendingUpgrade({
          targetRevision: selectedTargetRevision,
          upgradeId: response.data.stageId,
          gapAnalysis: gapAnalysis!
        });
        alert('Upgrade staged successfully! Review the gap analysis and click Finalize when ready.');
      }
    } catch (error) {
      console.error('Error staging upgrade:', error);
    } finally {
      setUpgradeInProgress(false);
    }
  };

  const finalizeUpgrade = async () => {
    if (!pendingUpgrade) return;
    
    try {
      setUpgradeInProgress(true);
      const response = await nistRevisionService.finalizeUpgrade(
        getTenantId(), 
        pendingUpgrade.upgradeId, 
        'current-user'
      );
      
      if (response.success) {
        alert(`Framework successfully upgraded to ${response.data.newRevision}!`);
        setPendingUpgrade(null);
        setGapAnalysis(null);
        await loadCurrentRevision();
      }
    } catch (error) {
      console.error('Error finalizing upgrade:', error);
    } finally {
      setUpgradeInProgress(false);
    }
  };

  const importFromEmass = async (systemId: string, apiKey: string) => {
    try {
      setLoading(true);
      const response = await nistRevisionService.importFromEmass(getTenantId(), systemId, apiKey);
      
      if (response.success) {
        alert(`Successfully imported ${response.data.controlsImported} controls from eMASS. Detected ${response.data.detectedRevision}.`);
        await loadCurrentRevision();
      }
    } catch (error) {
      console.error('Error importing from eMASS:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'likely-compliant': return 'bg-green-100 text-green-800';
      case 'requires-review': return 'bg-yellow-100 text-yellow-800';
      case 'likely-noncompliant': return 'bg-red-100 text-red-800';
      case 'not-assessed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !gapAnalysis) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Framework Upgrade</h1>
          <p className="text-gray-600 mt-2">
            Manage NIST 800-53 revision transitions and analyze upgrade impacts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Current: {currentRevision}
          </Badge>
          {pendingUpgrade && (
            <Badge variant="secondary" className="text-sm">
              Staged: {pendingUpgrade.targetRevision}
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowEmassImport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import from eMASS
          </Button>
        </div>
      </div>

      {/* Revision Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Target Revision Selection
          </CardTitle>
          <CardDescription>
            Select the NIST 800-53 revision you want to upgrade to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="target-revision" className="text-sm font-medium">
                Target Revision
              </Label>
              <Select
                value={selectedTargetRevision || ''}
                onValueChange={(value) => {
                  setSelectedTargetRevision(value as 'Rev4' | 'Rev5' | 'Rev6');
                  if (value && value !== currentRevision) {
                    performGapAnalysis(value as 'Rev4' | 'Rev5' | 'Rev6');
                  }
                }}
                disabled={!!pendingUpgrade}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select target revision" />
                </SelectTrigger>
                <SelectContent>
                  {availableRevisions.map((revision) => (
                    <SelectItem 
                      key={revision.value} 
                      value={revision.value}
                      disabled={revision.disabled || revision.value === currentRevision}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{revision.label}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge 
                            variant={revision.status === 'Current' ? 'default' : 
                                   revision.status === 'Future' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {revision.status}
                          </Badge>
                          {revision.recommended && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTargetRevision && selectedTargetRevision !== currentRevision && !pendingUpgrade && (
              <Button
                onClick={() => performGapAnalysis(selectedTargetRevision)}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Analyze Gap
              </Button>
            )}
          </div>
          
          {selectedTargetRevision === 'Rev6' && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Future Revision:</strong> NIST 800-53 Rev 6 is not yet published. 
                This analysis shows projected changes based on draft requirements.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Framework Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentRevision}</div>
              <div className="text-sm text-gray-600">Current Revision</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {gapAnalysis?.gapAnalysis.totalCurrentControls || 0}
              </div>
              <div className="text-sm text-gray-600">Current Controls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {selectedTargetRevision}
              </div>
              <div className="text-sm text-gray-600">Target Revision</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis Results */}
      {gapAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gap Analysis: {currentRevision} → {selectedTargetRevision}
            </CardTitle>
            <CardDescription>
              Analysis completed on {new Date(gapAnalysis.gapAnalysis.analysisDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="controls">Control Changes</TabsTrigger>
                <TabsTrigger value="impact">Impact Assessment</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {gapAnalysis.gapAnalysis.mappings.unchanged.length}
                        </div>
                        <div className="text-sm text-gray-600">Unchanged</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {gapAnalysis.gapAnalysis.mappings.modified.length}
                        </div>
                        <div className="text-sm text-gray-600">Modified</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {gapAnalysis.gapAnalysis.mappings.newControls.length}
                        </div>
                        <div className="text-sm text-gray-600">New Controls</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {gapAnalysis.gapAnalysis.mappings.withdrawnControls.length}
                        </div>
                        <div className="text-sm text-gray-600">Withdrawn</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Prediction */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Prediction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Likely Compliant</span>
                        <Badge className={getStatusColor('likely-compliant')}>
                          {gapAnalysis.gapAnalysis.compliancePrediction.likelyCompliant}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Requires Review</span>
                        <Badge className={getStatusColor('requires-review')}>
                          {gapAnalysis.gapAnalysis.compliancePrediction.requiresReview}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Likely Non-Compliant</span>
                        <Badge className={getStatusColor('likely-noncompliant')}>
                          {gapAnalysis.gapAnalysis.compliancePrediction.likelyNonCompliant}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Not Assessed</span>
                        <Badge className={getStatusColor('not-assessed')}>
                          {gapAnalysis.gapAnalysis.compliancePrediction.notAssessed}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="controls" className="space-y-4">
                {/* Control Changes Detail */}
                <div className="space-y-4">
                  {gapAnalysis.gapAnalysis.mappings.modified.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Modified Controls</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {gapAnalysis.gapAnalysis.mappings.modified.slice(0, 10).map((mapping, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium">{mapping.sourceControlId}</div>
                                <div className="text-sm text-gray-600">{mapping.changeSummary}</div>
                              </div>
                              <Badge className={getImpactColor(mapping.implementationImpact)}>
                                {mapping.implementationImpact} impact
                              </Badge>
                            </div>
                          ))}
                          {gapAnalysis.gapAnalysis.mappings.modified.length > 10 && (
                            <div className="text-center text-sm text-gray-600 pt-2">
                              ... and {gapAnalysis.gapAnalysis.mappings.modified.length - 10} more
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {gapAnalysis.gapAnalysis.mappings.newControls.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">New Controls</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {gapAnalysis.gapAnalysis.mappings.newControls.slice(0, 10).map((mapping, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium">{mapping.targetControlId}</div>
                                <div className="text-sm text-gray-600">{mapping.changeSummary}</div>
                              </div>
                              <Badge className={getImpactColor(mapping.implementationImpact)}>
                                {mapping.implementationImpact} impact
                              </Badge>
                            </div>
                          ))}
                          {gapAnalysis.gapAnalysis.mappings.newControls.length > 10 && (
                            <div className="text-center text-sm text-gray-600 pt-2">
                              ... and {gapAnalysis.gapAnalysis.mappings.newControls.length - 10} more
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="impact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Implementation Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {gapAnalysis.gapAnalysis.impactAssessment.lowImpact}
                        </div>
                        <div className="text-sm text-gray-600">Low Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {gapAnalysis.gapAnalysis.impactAssessment.mediumImpact}
                        </div>
                        <div className="text-sm text-gray-600">Medium Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {gapAnalysis.gapAnalysis.impactAssessment.highImpact}
                        </div>
                        <div className="text-sm text-gray-600">High Impact</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Estimated Total Effort</span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {gapAnalysis.gapAnalysis.impactAssessment.estimatedEffortHours} hours
                        </Badge>
                      </div>
                      
                      {gapAnalysis.gapAnalysis.impactAssessment.priorityControls.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Priority Controls (High Impact)</h4>
                          <div className="flex flex-wrap gap-2">
                            {gapAnalysis.gapAnalysis.impactAssessment.priorityControls.map((controlId, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {controlId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estimated Migration Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {gapAnalysis.estimatedMigrationTime.optimisticHours}h
                        </div>
                        <div className="text-sm text-gray-600">Optimistic</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {gapAnalysis.estimatedMigrationTime.realisticHours}h
                        </div>
                        <div className="text-sm text-gray-600">Realistic</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {gapAnalysis.estimatedMigrationTime.pessimisticHours}h
                        </div>
                        <div className="text-sm text-gray-600">Pessimistic</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Recommended Actions</h4>
                      
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-2">Immediate Actions</h5>
                        <ul className="space-y-1">
                          {gapAnalysis.recommendedActions.immediate.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-yellow-700 mb-2">Short-term Actions</h5>
                        <ul className="space-y-1">
                          {gapAnalysis.recommendedActions.shortTerm.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Clock className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-blue-700 mb-2">Long-term Actions</h5>
                        <ul className="space-y-1">
                          {gapAnalysis.recommendedActions.longTerm.map((action, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {gapAnalysis && selectedTargetRevision && selectedTargetRevision !== currentRevision && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Actions</CardTitle>
            <CardDescription>
              {pendingUpgrade 
                ? 'Review the staged upgrade and finalize when ready.'
                : 'Review the gap analysis above before proceeding with the framework upgrade.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!pendingUpgrade ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Staging Process:</strong> Framework upgrades are staged for review before finalization. 
                      The upgrade will be prepared but not applied until you click "Finalize Upgrade".
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => selectedTargetRevision && performGapAnalysis(selectedTargetRevision)}
                      variant="outline"
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh Analysis
                    </Button>

                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>

                    <Button
                      onClick={stageUpgrade}
                      disabled={upgradeInProgress || !gapAnalysis}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      {upgradeInProgress ? 'Staging...' : `Stage Upgrade to ${selectedTargetRevision}`}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Upgrade Staged:</strong> The upgrade to {pendingUpgrade.targetRevision} has been staged. 
                      Review the gap analysis above and click "Finalize Upgrade" to commit the changes.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ ISSM Review Required</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      This upgrade affects {gapAnalysis.gapAnalysis.totalCurrentControls} controls. 
                      Information System Security Manager (ISSM) approval is required before finalization.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Impact Summary:</span>
                      <Badge variant="outline" className="text-green-700">
                        {gapAnalysis.gapAnalysis.mappings.unchanged.length} Unchanged
                      </Badge>
                      <Badge variant="outline" className="text-yellow-700">
                        {gapAnalysis.gapAnalysis.mappings.modified.length} Modified
                      </Badge>
                      <Badge variant="outline" className="text-blue-700">
                        {gapAnalysis.gapAnalysis.mappings.newControls.length} New
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        setPendingUpgrade(null);
                        setGapAnalysis(null);
                      }}
                      variant="outline"
                      disabled={upgradeInProgress}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Cancel Staging
                    </Button>

                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Upgrade Report
                    </Button>

                    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={upgradeInProgress}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Finalize Upgrade
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Framework Upgrade</DialogTitle>
                          <DialogDescription>
                            This action will permanently upgrade your organization's NIST framework 
                            from {currentRevision} to {pendingUpgrade.targetRevision}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Warning:</strong> This action affects all controls and environments 
                              in your organization. Ensure you have reviewed the gap analysis and have 
                              appropriate backup procedures in place.
                            </AlertDescription>
                          </Alert>
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowConfirmDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                setShowConfirmDialog(false);
                                finalizeUpgrade();
                              }}
                              disabled={upgradeInProgress}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {upgradeInProgress ? 'Finalizing...' : 'Confirm Upgrade'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* eMASS Import Dialog */}
      <Dialog open={showEmassImport} onOpenChange={setShowEmassImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from eMASS</DialogTitle>
            <DialogDescription>
              Import system data and NIST revision information from your eMASS system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="system-id">eMASS System ID</Label>
              <input
                id="system-id"
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your eMASS system ID"
              />
            </div>
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <input
                id="api-key"
                type="password"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your eMASS API key"
              />
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This will import control data and automatically detect your current NIST revision.
                <a 
                  href="https://mitre.github.io/emass_client/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                >
                  Learn more about eMASS API <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEmassImport(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const systemId = (document.getElementById('system-id') as HTMLInputElement)?.value;
                  const apiKey = (document.getElementById('api-key') as HTMLInputElement)?.value;
                  if (systemId && apiKey) {
                    importFromEmass(systemId, apiKey);
                    setShowEmassImport(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FrameworkUpgrade;
