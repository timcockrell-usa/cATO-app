import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, FileText, AlertTriangle, Filter, X, ArrowLeft, Cloud, CloudSun } from "lucide-react";
import { useNavigationContext, filterUtils } from '@/services/navigationService';
import { useNavigate } from 'react-router-dom';
import { nistControlsEnhanced, NISTControl } from '@/data/nistControlsEnhanced.ts';

// Calculate control families from the actual data
const controlFamilies: { [key: string]: string } = {
  'AC': 'Access Control',
  'AT': 'Awareness and Training',
  'AU': 'Audit and Accountability',
  'CA': 'Assessment, Authorization, and Monitoring',
  'CM': 'Configuration Management',
  'CP': 'Contingency Planning',
  'IA': 'Identification and Authentication',
  'IR': 'Incident Response',
  'MA': 'Maintenance',
  'MP': 'Media Protection',
  'PE': 'Physical and Environmental Protection',
  'PL': 'Planning',
  'PM': 'Program Management',
  'PS': 'Personnel Security',
  'PT': 'PII Processing and Transparency',
  'RA': 'Risk Assessment',
  'SA': 'System and Services Acquisition',
  'SC': 'System and Communications Protection',
  'SI': 'System and Information Integrity',
  'SR': 'Supply Chain Risk Management'
};

// Calculate overall metrics
const overallMetrics = {
  total: nistControlsEnhanced.length,
  compliant: nistControlsEnhanced.filter(c => c.status === 'compliant').length,
  partial: nistControlsEnhanced.filter(c => c.status === 'partial').length,
  noncompliant: nistControlsEnhanced.filter(c => c.status === 'noncompliant').length,
  compliancePercentage: Math.round((nistControlsEnhanced.filter(c => c.status === 'compliant').length / nistControlsEnhanced.length) * 100)
};

export default function NistControls() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedControl, setSelectedControl] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getContext, clearContext } = useNavigationContext();
  const navigate = useNavigate();

  // Get navigation context
  const navigationContext = getContext();

  // Calculate family statistics from real data
  const familyStats = Object.entries(controlFamilies).map(([code, name]) => {
    const familyControls = nistControlsEnhanced.filter(c => c.controlFamily === name);
    return {
      id: code,
      name,
      total: familyControls.length,
      compliant: familyControls.filter(c => c.status === 'compliant').length,
      partial: familyControls.filter(c => c.status === 'partial').length,
      noncompliant: familyControls.filter(c => c.status === 'noncompliant').length,
      controls: familyControls
    };
  });

  const stats = overallMetrics;

  // Filter logic
  const getFilteredFamilies = () => {
    let filtered = familyStats;

    // Apply navigation context filter
    if (navigationContext?.filterType === 'family') {
      filtered = filtered.filter(family => family.id === navigationContext.filterValue);
    } else if (navigationContext?.filterType === 'status') {
      filtered = filtered.map(family => ({
        ...family,
        controls: family.controls.filter(control => control.status === navigationContext.filterValue)
      })).filter(family => family.controls.length > 0);
    }

    // Apply local filters
    if (selectedFamily) {
      filtered = filtered.filter(family => family.id === selectedFamily);
    }

    if (searchTerm) {
      filtered = filtered.map(family => ({
        ...family,
        controls: family.controls.filter(control =>
          control.controlName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.controlIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(family => family.controls.length > 0);
    }

    if (selectedStatus) {
      filtered = filtered.map(family => ({
        ...family,
        controls: family.controls.filter(control => control.status === selectedStatus)
      })).filter(family => family.controls.length > 0);
    }

    return filtered;
  };

  const filteredFamilies = getFilteredFamilies();
  const hasActiveFilters = searchTerm || selectedFamily || selectedStatus || navigationContext;

  const handleBackToDashboard = () => {
    clearContext();
    navigate('/dashboard');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "compliant": return "bg-green-100 text-green-800 border-green-200";
      case "partial": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "noncompliant": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleControlClick = (control) => {
    setSelectedControl(control);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation context alert */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIST 800-53 Controls</h1>
          <p className="text-muted-foreground">
            Comprehensive security control framework ({stats.total} controls total)
          </p>
        </div>
        {navigationContext && (
          <Button
            onClick={handleBackToDashboard}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Navigation context alert */}
      {navigationContext && (
        <Alert className="border-blue-200 bg-blue-50">
          <Filter className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Showing controls filtered by: <strong>{navigationContext.filterType}: {navigationContext.filterValue}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearContext}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
            <p className="text-xs text-muted-foreground">
              {stats.compliancePercentage}% compliance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.partial / stats.total) * 100)}% partial
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.noncompliant}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.noncompliant / stats.total) * 100)}% non-compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Control Family</label>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Families</option>
                {Object.entries(controlFamilies).map(([code, name]) => (
                  <option key={code} value={code}>{code} - {name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="compliant">Compliant</option>
                <option value="partial">Partial</option>
                <option value="noncompliant">Non-Compliant</option>
                <option value="not-assessed">Not Assessed</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFamily("");
                  setSelectedStatus("");
                  clearContext();
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Families */}
      <div className="space-y-6">
        {filteredFamilies.map((family) => (
          <Card key={family.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {family.id} - {family.name}
                  </CardTitle>
                  <CardDescription>
                    {family.controls.length} control{family.controls.length !== 1 ? 's' : ''} in this family
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-50">
                    {family.compliant} Compliant
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50">
                    {family.partial} Partial
                  </Badge>
                  <Badge variant="outline" className="bg-red-50">
                    {family.noncompliant} Non-Compliant
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(family.compliant / family.total) * 100} 
                className="w-full"
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {family.controls.map((control) => (
                  <div
                    key={control.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleControlClick(control)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{control.controlIdentifier}</span>
                        <span className="font-medium">{control.controlName}</span>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(control.status)}
                        >
                          {control.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getRiskColor(control.riskLevel)}
                        >
                          {control.riskLevel} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {control.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5" />
              {selectedControl?.controlIdentifier} - {selectedControl?.controlName}
            </DialogTitle>
            <DialogDescription>
              Control Family: {selectedControl?.controlFamily}
            </DialogDescription>
          </DialogHeader>
          
          {selectedControl && (
            <div className="space-y-6">
              {/* Status and Risk */}
              <div className="flex gap-4">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(selectedControl.status)}
                >
                  Status: {selectedControl.status}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={getRiskColor(selectedControl.riskLevel)}
                >
                  Risk Level: {selectedControl.riskLevel}
                </Badge>
              </div>

              {/* Control Description */}
              <div>
                <h4 className="font-semibold mb-2">Control Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedControl.fullControlText || selectedControl.description}
                </p>
              </div>

              {/* Discussion */}
              {selectedControl.discussion && (
                <div>
                  <h4 className="font-semibold mb-2">Discussion</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedControl.discussion}
                  </p>
                </div>
              )}

              {/* Azure Implementation */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Azure Implementation
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedControl.azureImplementation || selectedControl.implementation}
                </p>
              </div>

              {/* Azure Commercial Remediation */}
              {selectedControl.azureCommercialRemediation && 
               selectedControl.azureCommercialRemediation !== 'No specific remediation provided.' && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CloudSun className="h-4 w-4 text-blue-500" />
                    Azure Commercial Remediation
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line bg-blue-50 p-3 rounded">
                    {selectedControl.azureCommercialRemediation}
                  </p>
                </div>
              )}

              {/* Azure Government Remediation */}
              {selectedControl.azureGovernmentRemediation && 
               selectedControl.azureGovernmentRemediation !== 'Same as Azure Commercial unless specified.' && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Azure Government Remediation
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line bg-green-50 p-3 rounded">
                    {selectedControl.azureGovernmentRemediation}
                  </p>
                </div>
              )}

              {/* Related Controls */}
              {selectedControl.relatedControls && selectedControl.relatedControls.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Related Controls</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedControl.relatedControls.map((relatedId) => (
                      <Badge key={relatedId} variant="outline" className="text-xs">
                        {relatedId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment Information */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold mb-1">Last Assessed</h4>
                  <p className="text-sm text-gray-600">{selectedControl.lastAssessed}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Assessed By</h4>
                  <p className="text-sm text-gray-600">{selectedControl.assessedBy}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}