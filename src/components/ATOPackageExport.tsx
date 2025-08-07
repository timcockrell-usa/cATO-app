/**
 * ATO Package Generation Frontend Component
 * Provides UI for generating and downloading ATO documentation packages
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Info,
  Settings,
  BarChart3
} from 'lucide-react';
import { ATOPackageGenerationService } from '@/services/atoPackageGenerationService';

interface ATOPackageExportProps {
  tenantId: string;
  systemName: string;
}

export const ATOPackageExport: React.FC<ATOPackageExportProps> = ({ 
  tenantId, 
  systemName = "Demo System" 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [packageData, setPackageData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const atoService = new ATOPackageGenerationService();

  // Simulate progress updates for demo
  const simulateProgress = (targetProgress: number, message: string) => {
    setGenerationStatus(message);
    const step = (targetProgress - generationProgress) / 10;
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const next = prev + step;
        if (next >= targetProgress) {
          clearInterval(interval);
          return targetProgress;
        }
        return next;
      });
    }, 100);
  };

  const generateATOPackage = async () => {
    try {
      setIsGenerating(true);
      setError('');
      setGenerationProgress(0);
      
      simulateProgress(20, 'Collecting NIST control implementations...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      simulateProgress(40, 'Analyzing Zero Trust Architecture maturity...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      simulateProgress(60, 'Generating POA&M items...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      simulateProgress(80, 'Compiling compliance metrics...');
      const atoPackage = await atoService.generateATOPackage(tenantId);
      
      simulateProgress(100, 'ATO package generated successfully!');
      setPackageData(atoPackage);
      
    } catch (err) {
      console.error('Error generating ATO package:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate ATO package');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSSP = () => {
    if (!packageData) return;
    
    try {
      // Generate SSP content as JSON for demo (in production, this would be PDF)
      const sspContent = {
        title: `System Security Plan - ${systemName}`,
        generated: new Date().toISOString(),
        systemInformation: packageData.systemInformation,
        controlImplementations: packageData.controlImplementations,
        complianceMetrics: packageData.complianceMetrics,
        zeroTrustAssessment: packageData.zeroTrustAssessment
      };

      const blob = new Blob([JSON.stringify(sspContent, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SSP_${systemName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download SSP');
    }
  };

  const downloadPOAM = async () => {
    if (!packageData) return;
    
    try {
      const poamData = await atoService.generatePOAMData(tenantId);
      
      const blob = new Blob([JSON.stringify(poamData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `POAM_${systemName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download POA&M');
    }
  };

  const downloadeMASS_CSV = async () => {
    if (!packageData) return;
    
    try {
      const poamData = await atoService.generatePOAMData(tenantId);
      
      // Convert to eMASS-compatible CSV format
      const csvHeaders = [
        'POA&M Item ID',
        'Controls',
        'Weakness Description',
        'Status',
        'Risk',
        'Scheduled Completion Date',
        'Resources Required'
      ];

      const csvRows = [csvHeaders.join(',')];
      
      poamData.forEach((item: any) => {
        const row = [
          `"${item.poamId}"`,
          `"${item.relatedControlId}"`,
          `"${item.weaknessDescription.replace(/"/g, '""')}"`,
          `"${item.status}"`,
          `"${item.riskLevel}"`,
          `"${item.scheduledCompletionDate}"`,
          `"${item.resourcesRequired.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `POAM_eMASS_${systemName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download eMASS CSV');
    }
  };

  const downloadCompletePackage = () => {
    if (!packageData) return;
    
    try {
      const blob = new Blob([JSON.stringify(packageData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATO_Package_${systemName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download complete package');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ATO Package Generation</h2>
          <p className="text-muted-foreground">
            Generate comprehensive Authority to Operate documentation packages
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Package className="w-3 h-3 mr-1" />
          NIST 800-53 Rev 5
        </Badge>
      </div>

      {/* Main Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Generate ATO Package
          </CardTitle>
          <CardDescription>
            Create complete ATO documentation package for {systemName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!packageData && (
            <Button 
              onClick={generateATOPackage} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Generating Package...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Generate Complete ATO Package
                </>
              )}
            </Button>
          )}

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {generationStatus}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {packageData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ATO package generated successfully! You can now download individual components or the complete package.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Package Components */}
      {packageData && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Package Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {packageData.complianceMetrics?.overallCompliancePercentage || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Compliance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {packageData.complianceMetrics?.totalControlsAssessed || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Controls Assessed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {packageData.zeroTrustAssessment?.overallScore || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">ZTA Maturity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Security Plan</CardTitle>
                  <CardDescription>
                    Complete NIST 800-53 control implementation documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadSSP} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Download SSP
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plan of Action & Milestones</CardTitle>
                  <CardDescription>
                    Security findings and remediation tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadPOAM} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Download POA&M
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packageData.complianceMetrics?.controlFamilyCompliance?.map((family: any) => (
                    <div key={family.family} className="flex items-center justify-between">
                      <span className="font-medium">{family.familyName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {family.compliantControls}/{family.totalControls}
                        </span>
                        <Badge variant={family.compliancePercentage >= 80 ? "default" : "secondary"}>
                          {family.compliancePercentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="download" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Download Options</CardTitle>
                <CardDescription>
                  Choose the format and components you need for your ATO submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={downloadSSP} variant="outline" className="justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    System Security Plan (JSON)
                  </Button>
                  
                  <Button onClick={downloadPOAM} variant="outline" className="justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    POA&M Document (JSON)
                  </Button>
                  
                  <Button onClick={downloadeMASS_CSV} variant="outline" className="justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    POA&M eMASS CSV
                  </Button>
                  
                  <Button onClick={downloadCompletePackage} className="justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Complete Package (JSON)
                  </Button>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> In production, documents would be generated as PDF files. 
                    This demo exports JSON format for easy review of the data structure.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ATOPackageExport;
