/**
 * Execution Enablers Dashboard Component
 * Implements DOTmLPF-P (Doctrine, Organization, Training, Materiel, Leadership, Personnel, Facilities, Policy) tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Settings
} from 'lucide-react';
import { 
  ExecutionEnabler, 
  DOTmLPFPCategory, 
  ExecutionEnablerStatus, 
  MaturityLevel 
} from '@/types/dodCATOTypes';
import { executionEnablersService } from '@/services/executionEnablersService';
import { useAuth } from '@/contexts/SimpleAuthContext';

// Category descriptions and icons
const CATEGORY_INFO: Record<DOTmLPFPCategory, {
  description: string;
  icon: string;
  color: string;
}> = {
  Doctrine: {
    description: 'Fundamental principles, policies, and procedures that guide cATO implementation',
    icon: '📋',
    color: 'bg-blue-100 text-blue-800'
  },
  Organization: {
    description: 'Organizational structure, roles, and responsibilities for cATO operations',
    icon: '🏢',
    color: 'bg-green-100 text-green-800'
  },
  Training: {
    description: 'Education and skill development programs for cATO personnel',
    icon: '🎓',
    color: 'bg-purple-100 text-purple-800'
  },
  Materiel: {
    description: 'Technology, tools, and equipment required for cATO implementation',
    icon: '⚙️',
    color: 'bg-orange-100 text-orange-800'
  },
  Leadership: {
    description: 'Executive support and change management for cATO transformation',
    icon: '👑',
    color: 'bg-red-100 text-red-800'
  },
  Personnel: {
    description: 'Staffing, recruitment, and human resource management for cATO',
    icon: '👥',
    color: 'bg-cyan-100 text-cyan-800'
  },
  Facilities: {
    description: 'Physical and virtual infrastructure supporting cATO operations',
    icon: '🏭',
    color: 'bg-pink-100 text-pink-800'
  },
  Policy: {
    description: 'Regulatory framework and governance policies for cATO compliance',
    icon: '📜',
    color: 'bg-yellow-100 text-yellow-800'
  }
};

// Status styling
const getStatusBadgeProps = (status: ExecutionEnablerStatus) => {
  switch (status) {
    case 'Completed':
      return { variant: 'default' as const, className: 'bg-green-100 text-green-800' };
    case 'Validated':
      return { variant: 'default' as const, className: 'bg-green-200 text-green-900' };
    case 'In_Progress':
      return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800' };
    case 'Testing':
      return { variant: 'default' as const, className: 'bg-purple-100 text-purple-800' };
    case 'Planning':
      return { variant: 'default' as const, className: 'bg-gray-100 text-gray-800' };
    case 'Needs_Attention':
      return { variant: 'destructive' as const };
    case 'On_Hold':
      return { variant: 'secondary' as const };
    case 'Cancelled':
      return { variant: 'outline' as const };
    default:
      return { variant: 'outline' as const };
  }
};

// Maturity level colors
const getMaturityColor = (level: MaturityLevel): string => {
  switch (level) {
    case 'Initial':
      return 'bg-red-500';
    case 'Developing':
      return 'bg-orange-500';
    case 'Defined':
      return 'bg-yellow-500';
    case 'Managed':
      return 'bg-blue-500';
    case 'Optimizing':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export default function ExecutionEnablers() {
  const { user } = useAuth();
  const [enablers, setEnablers] = useState<Record<DOTmLPFPCategory, ExecutionEnabler[]>>({} as any);
  const [statistics, setStatistics] = useState<any>(null);
  const [maturityAssessment, setMaturityAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnabler, setSelectedEnabler] = useState<ExecutionEnabler | null>(null);
  const [statusFilter, setStatusFilter] = useState<ExecutionEnablerStatus | 'all'>('all');
  const [showOnlyAtRisk, setShowOnlyAtRisk] = useState(false);

  // Derive tenant ID from user's email domain or use default
  const getTenantId = () => {
    if (user?.email) {
      // Extract organization from email domain (e.g., user@company.mil -> company.mil)
      const domain = user.email.split('@')[1];
      return domain || 'default-tenant';
    }
    return 'default-tenant';
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      const [enablersData, statsData, maturityData] = await Promise.all([
        executionEnablersService.getEnablersGroupedByCategory(tenantId),
        executionEnablersService.getEnablerStatistics(tenantId),
        executionEnablersService.getMaturityAssessment(tenantId)
      ]);

      setEnablers(enablersData);
      setStatistics(statsData);
      setMaturityAssessment(maturityData);
    } catch (error) {
      console.error('Error loading execution enablers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultEnablers = async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      await executionEnablersService.initializeDefaultEnablers(tenantId, user!.id);
      await loadData();
    } catch (error) {
      console.error('Error initializing default enablers:', error);
    }
  };

  const updateEnablerStatus = async (enabler: ExecutionEnabler, status: ExecutionEnablerStatus, progress: number) => {
    try {
      await executionEnablersService.updateEnablerStatus(
        enabler.id,
        enabler.tenantId,
        status,
        progress,
        user!.id
      );
      await loadData();
    } catch (error) {
      console.error('Error updating enabler status:', error);
    }
  };

  const filterEnablers = (categoryEnablers: ExecutionEnabler[]): ExecutionEnabler[] => {
    let filtered = categoryEnablers;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (showOnlyAtRisk) {
      filtered = filtered.filter(e => 
        ['Needs_Attention', 'On_Hold'].includes(e.status) || 
        e.riskLevel === 'High' || 
        e.riskLevel === 'Very_High' ||
        (e.targetCompletionDate && new Date(e.targetCompletionDate) < new Date() && e.status !== 'Completed')
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading execution enablers...</div>
      </div>
    );
  }

  if (!statistics || statistics.total === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Execution Enablers Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by initializing the default DOTmLPF-P execution enablers for your organization.
          </p>
          <Button onClick={initializeDefaultEnablers} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Initialize Default Enablers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Execution Enablers (DOTmLPF-P)</h1>
          <p className="text-gray-600 mt-1">
            Track organizational readiness across Doctrine, Organization, Training, Materiel, Leadership, Personnel, Facilities, and Policy
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Execution Enablers Settings</DialogTitle>
                <DialogDescription>
                  Configure filters and display options for execution enablers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status Filter</label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Not_Started">Not Started</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In_Progress">In Progress</SelectItem>
                      <SelectItem value="Testing">Testing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Validated">Validated</SelectItem>
                      <SelectItem value="Needs_Attention">Needs Attention</SelectItem>
                      <SelectItem value="On_Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="atRisk"
                    checked={showOnlyAtRisk}
                    onChange={(e) => setShowOnlyAtRisk(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="atRisk" className="text-sm font-medium">
                    Show only at-risk enablers
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.overallCompletion}%</div>
            <Progress value={statistics.overallCompletion} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {statistics.total} total enablers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maturity Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maturityAssessment?.overallMaturity || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Average across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.atRisk}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Enablers needing attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.overdue}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Past target completion date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DOTmLPF-P Categories */}
      <Accordion type="multiple" className="space-y-4">
        {Object.entries(CATEGORY_INFO).map(([category, info]) => {
          const categoryEnablers = enablers[category as DOTmLPFPCategory] || [];
          const filteredEnablers = filterEnablers(categoryEnablers);
          const categoryStats = statistics.byCategory[category as DOTmLPFPCategory] || 0;
          const categoryMaturity = maturityAssessment?.categoryMaturity[category as DOTmLPFPCategory];
          const avgCompletion = categoryEnablers.length > 0 
            ? Math.round(categoryEnablers.reduce((sum, e) => sum + e.completionPercentage, 0) / categoryEnablers.length)
            : 0;

          return (
            <AccordionItem key={category} value={category} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${info.color}`}>
                      <span className="text-2xl">{info.icon}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">{category}</h3>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 mr-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{categoryStats} Enablers</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{avgCompletion}%</div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                    {categoryMaturity && (
                      <div className="text-center">
                        <div className="text-sm font-medium">{categoryMaturity.currentLevel.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Maturity</div>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3">
                  {filteredEnablers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No enablers match the current filters
                    </div>
                  ) : (
                    filteredEnablers.map((enabler) => (
                      <Card key={enabler.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold">{enabler.name}</h4>
                                <Badge {...getStatusBadgeProps(enabler.status)}>
                                  {enabler.status.replace('_', ' ')}
                                </Badge>
                                <div className={`w-3 h-3 rounded-full ${getMaturityColor(enabler.maturityLevel)}`} 
                                     title={`Maturity: ${enabler.maturityLevel}`} />
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{enabler.description}</p>
                              
                              <div className="flex items-center space-x-4 mb-2">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium">Progress</span>
                                    <span className="text-xs text-gray-500">{enabler.completionPercentage}%</span>
                                  </div>
                                  <Progress value={enabler.completionPercentage} className="h-2" />
                                </div>
                                <div className="text-xs text-gray-500">
                                  Due: {new Date(enabler.targetCompletionDate).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>Owner: {enabler.owner}</span>
                                <span>•</span>
                                <span>Impact: {enabler.impactOnCATO.split(' - ')[0]}</span>
                                <span>•</span>
                                <span>Risk: {enabler.riskLevel.replace('_', ' ')}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 ml-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedEnabler(enabler)}
                                  >
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{enabler.name}</DialogTitle>
                                    <DialogDescription>{enabler.description}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {/* Enabler details would go here */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <p className="text-sm">{enabler.status.replace('_', ' ')}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Maturity Level</label>
                                        <p className="text-sm">{enabler.maturityLevel}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Progress</label>
                                        <p className="text-sm">{enabler.completionPercentage}%</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Risk Level</label>
                                        <p className="text-sm">{enabler.riskLevel.replace('_', ' ')}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Impact on cATO</label>
                                      <p className="text-sm">{enabler.impactOnCATO}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Evidence Required</label>
                                      <ul className="text-sm list-disc list-inside space-y-1">
                                        {enabler.evidenceRequired.map((evidence, idx) => (
                                          <li key={idx}>{evidence}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Select
                                value={enabler.status}
                                onValueChange={(value: ExecutionEnablerStatus) => 
                                  updateEnablerStatus(enabler, value, enabler.completionPercentage)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Not_Started">Not Started</SelectItem>
                                  <SelectItem value="Planning">Planning</SelectItem>
                                  <SelectItem value="In_Progress">In Progress</SelectItem>
                                  <SelectItem value="Testing">Testing</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Validated">Validated</SelectItem>
                                  <SelectItem value="Needs_Attention">Needs Attention</SelectItem>
                                  <SelectItem value="On_Hold">On Hold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}