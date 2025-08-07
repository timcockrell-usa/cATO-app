/**
 * Security Configuration Step Component
 * Configures NIST revision, security classification, and compliance settings
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Save
} from 'lucide-react';
import { OnboardingStepProps } from './types';
import { NistRevision } from '@/types/organization';

interface SecurityConfigurationData {
  nistRevision: NistRevision;
  securityClassification: string;
  impactLevel: string;
  complianceFrameworks: string[];
  dataRetentionPeriod: number;
  enableAuditTrail: boolean;
  enableContinuousMonitoring: boolean;
  enableAutomatedReporting: boolean;
}

export const SecurityConfigurationStep: React.FC<OnboardingStepProps> = ({ 
  onComplete, 
  onNext,
  stepData,
  isProcessing 
}) => {
  const [configData, setConfigData] = useState<SecurityConfigurationData>({
    nistRevision: 'Rev5',
    securityClassification: 'CUI',
    impactLevel: 'Moderate',
    complianceFrameworks: ['NIST-800-53'],
    dataRetentionPeriod: 2555, // 7 years in days
    enableAuditTrail: true,
    enableContinuousMonitoring: true,
    enableAutomatedReporting: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleConfigChange = (field: keyof SecurityConfigurationData, value: any) => {
    setConfigData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrameworkToggle = (framework: string, enabled: boolean) => {
    if (enabled) {
      setConfigData(prev => ({
        ...prev,
        complianceFrameworks: [...prev.complianceFrameworks, framework]
      }));
    } else {
      setConfigData(prev => ({
        ...prev,
        complianceFrameworks: prev.complianceFrameworks.filter(f => f !== framework)
      }));
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      setIsSaving(true);
      
      // Save the configuration data
      onComplete(stepData.id, configData);
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error('Error saving security configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const nistRevisions = [
    {
      value: 'Rev4' as NistRevision,
      label: 'NIST 800-53 Revision 4',
      description: 'Legacy revision, maintenance mode',
      status: 'legacy'
    },
    {
      value: 'Rev5' as NistRevision,
      label: 'NIST 800-53 Revision 5',
      description: 'Current standard, recommended for most organizations',
      status: 'current'
    },
    {
      value: 'Rev6' as NistRevision,
      label: 'NIST 800-53 Revision 6',
      description: 'Latest revision with enhanced controls',
      status: 'latest'
    }
  ];

  const securityClassifications = [
    {
      value: 'Unclassified',
      label: 'Unclassified',
      description: 'Information that does not require protection',
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'CUI',
      label: 'Controlled Unclassified Information (CUI)',
      description: 'Sensitive but unclassified information requiring protection',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      value: 'Confidential',
      label: 'Confidential',
      description: 'Information that could cause damage to national security',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      value: 'Secret',
      label: 'Secret',
      description: 'Information that could cause serious damage to national security',
      color: 'bg-red-100 text-red-800'
    }
  ];

  const impactLevels = [
    {
      value: 'Low',
      label: 'Low Impact',
      description: 'Limited adverse effect on operations, assets, or individuals',
      cia: { confidentiality: 'Low', integrity: 'Low', availability: 'Low' }
    },
    {
      value: 'Moderate',
      label: 'Moderate Impact',
      description: 'Serious adverse effect on operations, assets, or individuals',
      cia: { confidentiality: 'Moderate', integrity: 'Moderate', availability: 'Moderate' }
    },
    {
      value: 'High',
      label: 'High Impact',
      description: 'Severe or catastrophic adverse effect',
      cia: { confidentiality: 'High', integrity: 'High', availability: 'High' }
    }
  ];

  const complianceFrameworks = [
    {
      id: 'NIST-800-53',
      name: 'NIST 800-53',
      description: 'Security and Privacy Controls for Federal Information Systems',
      required: true
    },
    {
      id: 'FedRAMP',
      name: 'FedRAMP',
      description: 'Federal Risk and Authorization Management Program',
      required: false
    },
    {
      id: 'DISA-STIG',
      name: 'DISA STIGs',
      description: 'Defense Information Systems Agency Security Technical Implementation Guides',
      required: false
    },
    {
      id: 'SOC2',
      name: 'SOC 2',
      description: 'Service Organization Control 2',
      required: false
    },
    {
      id: 'ISO-27001',
      name: 'ISO 27001',
      description: 'Information Security Management Systems',
      required: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Security & Compliance Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure your organization's security classification, compliance frameworks, and monitoring settings.
          </p>
        </CardContent>
      </Card>

      {/* NIST Revision Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>NIST 800-53 Revision</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the NIST 800-53 revision your organization will follow for security controls.
          </p>
          
          <RadioGroup 
            value={configData.nistRevision} 
            onValueChange={(value) => handleConfigChange('nistRevision', value as NistRevision)}
            className="space-y-4"
          >
            {nistRevisions.map((revision) => (
              <div key={revision.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value={revision.value} id={revision.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={revision.value} className="font-medium cursor-pointer">
                      {revision.label}
                    </Label>
                    <Badge 
                      variant={revision.status === 'current' ? 'default' : 
                               revision.status === 'latest' ? 'secondary' : 'outline'}
                    >
                      {revision.status === 'current' ? 'Recommended' :
                       revision.status === 'latest' ? 'Latest' : 'Legacy'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{revision.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>

          {configData.nistRevision === 'Rev6' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                NIST 800-53 Rev 6 includes enhanced privacy controls and updated security controls. 
                Consider Rev 5 if your organization requires more mature tooling support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <span>Security Classification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the highest level of information classification your organization will handle.
          </p>

          <RadioGroup 
            value={configData.securityClassification} 
            onValueChange={(value) => handleConfigChange('securityClassification', value)}
            className="space-y-4"
          >
            {securityClassifications.map((classification) => (
              <div key={classification.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value={classification.value} id={classification.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={classification.value} className="font-medium cursor-pointer">
                      {classification.label}
                    </Label>
                    <Badge className={classification.color}>
                      {classification.value}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{classification.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Impact Level */}
      <Card>
        <CardHeader>
          <CardTitle>FISMA Impact Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Determine the potential impact of a security breach on your organization's operations.
          </p>

          <RadioGroup 
            value={configData.impactLevel} 
            onValueChange={(value) => handleConfigChange('impactLevel', value)}
            className="space-y-4"
          >
            {impactLevels.map((level) => (
              <div key={level.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={level.value} className="font-medium cursor-pointer">
                      {level.label}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                  <div className="flex space-x-4 text-xs">
                    <span>Confidentiality: <strong>{level.cia.confidentiality}</strong></span>
                    <span>Integrity: <strong>{level.cia.integrity}</strong></span>
                    <span>Availability: <strong>{level.cia.availability}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Compliance Frameworks */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Frameworks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select additional compliance frameworks your organization must adhere to.
          </p>

          <div className="space-y-3">
            {complianceFrameworks.map((framework) => (
              <div key={framework.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id={framework.id}
                  checked={configData.complianceFrameworks.includes(framework.id)}
                  onChange={(e) => handleFrameworkToggle(framework.id, e.target.checked)}
                  disabled={framework.required}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={framework.id} className="font-medium cursor-pointer">
                      {framework.name}
                    </Label>
                    {framework.required && (
                      <Badge variant="secondary">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{framework.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring & Reporting Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Audit Trail</h4>
                <p className="text-sm text-muted-foreground">Track all user actions and system changes</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configData.enableAuditTrail}
                  onChange={(e) => handleConfigChange('enableAuditTrail', e.target.checked)}
                />
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Continuous Monitoring</h4>
                <p className="text-sm text-muted-foreground">Real-time security control monitoring</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configData.enableContinuousMonitoring}
                  onChange={(e) => handleConfigChange('enableContinuousMonitoring', e.target.checked)}
                />
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Automated Reporting</h4>
                <p className="text-sm text-muted-foreground">Generate compliance reports automatically</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configData.enableAutomatedReporting}
                  onChange={(e) => handleConfigChange('enableAutomatedReporting', e.target.checked)}
                />
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataRetention">Data Retention Period</Label>
            <Select 
              value={configData.dataRetentionPeriod.toString()} 
              onValueChange={(value) => handleConfigChange('dataRetentionPeriod', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1095">3 years (1,095 days)</SelectItem>
                <SelectItem value="1826">5 years (1,826 days)</SelectItem>
                <SelectItem value="2555">7 years (2,555 days) - Recommended</SelectItem>
                <SelectItem value="3653">10 years (3,653 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">NIST Revision:</span>
              <p className="text-sm text-muted-foreground">{configData.nistRevision}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Security Classification:</span>
              <p className="text-sm text-muted-foreground">{configData.securityClassification}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Impact Level:</span>
              <p className="text-sm text-muted-foreground">{configData.impactLevel}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Frameworks:</span>
              <p className="text-sm text-muted-foreground">{configData.complianceFrameworks.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => onComplete(stepData.id, configData)}
              disabled={isSaving || isProcessing}
            >
              <Save className="h-4 w-4 mr-2" />
              Save for Later
            </Button>
            <Button 
              onClick={handleSaveAndContinue}
              disabled={isSaving || isProcessing}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Save & Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
