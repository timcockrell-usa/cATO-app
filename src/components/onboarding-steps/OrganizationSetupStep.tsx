/**
 * Organization Setup Step Component
 * Collects basic organization information and contact details
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Shield,
  AlertTriangle,
  Save,
  ArrowRight
} from 'lucide-react';
import { OnboardingStepProps } from './types';
import { OrganizationSetupData, OrganizationTier } from '@/services/onboardingService';

export const OrganizationSetupStep: React.FC<OnboardingStepProps> = ({ 
  onComplete, 
  onNext,
  stepData,
  isProcessing 
}) => {
  const [formData, setFormData] = useState<OrganizationSetupData>({
    // Basic Organization Info
    legalName: '',
    commonName: '',
    organizationType: '',
    cageCode: '',
    dunsNumber: '',
    
    // Contact Information
    primaryAddress: '',
    mailingAddress: '',
    primaryPhone: '',
    emergencyContact: '',
    
    // Authorizing Official
    aoName: '',
    aoTitle: '',
    aoEmail: '',
    aoPhone: '',
    aoSecurityClearance: '',
    
    // ISSM Information
    issmName: '',
    issmTitle: '',
    issmEmail: '',
    issmPhone: '',
    
    // Technical Configuration
    tier: 'Standard',
    nistRevision: 'Rev5',
    securityClassification: 'CUI',
    impactLevel: 'Moderate'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof OrganizationSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.legalName.trim()) newErrors.legalName = 'Legal name is required';
    if (!formData.commonName.trim()) newErrors.commonName = 'Common name is required';
    if (!formData.organizationType.trim()) newErrors.organizationType = 'Organization type is required';
    if (!formData.primaryAddress.trim()) newErrors.primaryAddress = 'Primary address is required';
    if (!formData.primaryPhone.trim()) newErrors.primaryPhone = 'Primary phone is required';
    
    // AO Information
    if (!formData.aoName.trim()) newErrors.aoName = 'Authorizing Official name is required';
    if (!formData.aoTitle.trim()) newErrors.aoTitle = 'AO title is required';
    if (!formData.aoEmail.trim()) newErrors.aoEmail = 'AO email is required';
    if (!formData.aoPhone.trim()) newErrors.aoPhone = 'AO phone is required';
    
    // ISSM Information
    if (!formData.issmName.trim()) newErrors.issmName = 'ISSM name is required';
    if (!formData.issmTitle.trim()) newErrors.issmTitle = 'ISSM title is required';
    if (!formData.issmEmail.trim()) newErrors.issmEmail = 'ISSM email is required';
    if (!formData.issmPhone.trim()) newErrors.issmPhone = 'ISSM phone is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.aoEmail && !emailRegex.test(formData.aoEmail)) {
      newErrors.aoEmail = 'Please enter a valid email address';
    }
    if (formData.issmEmail && !emailRegex.test(formData.issmEmail)) {
      newErrors.issmEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      
      // Save the form data
      onComplete(stepData.id, formData);
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error('Error saving organization data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const organizationTypes = [
    'Federal Agency - Department',
    'Federal Agency - Independent',
    'Military Service',
    'Defense Agency',
    'Intelligence Community',
    'State Government',
    'Local Government',
    'Private Contractor',
    'Educational Institution',
    'Non-Profit Organization',
    'Other'
  ];

  const securityClearances = [
    'None',
    'Public Trust',
    'Confidential',
    'Secret',
    'Top Secret',
    'Top Secret/SCI'
  ];

  const organizationTiers: { value: OrganizationTier; label: string; description: string }[] = [
    {
      value: 'Basic',
      label: 'Basic',
      description: 'Up to 10 users, basic compliance features'
    },
    {
      value: 'Standard',
      label: 'Standard',
      description: 'Up to 50 users, advanced reporting, compliance alerts'
    },
    {
      value: 'Enterprise',
      label: 'Enterprise',
      description: 'Up to 500 users, API access, risk assessment'
    },
    {
      value: 'Government',
      label: 'Government',
      description: 'Unlimited users, full feature set, eMASS integration'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Organization Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please provide your organization's official information. This will be used for compliance reporting and system identification.
          </p>
        </CardContent>
      </Card>

      {/* Basic Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Organization Name *</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="e.g., Department of Defense"
                className={errors.legalName ? 'border-red-500' : ''}
              />
              {errors.legalName && (
                <p className="text-sm text-red-600">{errors.legalName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commonName">Common Name *</Label>
              <Input
                id="commonName"
                value={formData.commonName}
                onChange={(e) => handleInputChange('commonName', e.target.value)}
                placeholder="e.g., DoD"
                className={errors.commonName ? 'border-red-500' : ''}
              />
              {errors.commonName && (
                <p className="text-sm text-red-600">{errors.commonName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType">Organization Type *</Label>
              <Select 
                value={formData.organizationType} 
                onValueChange={(value) => handleInputChange('organizationType', value)}
              >
                <SelectTrigger className={errors.organizationType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationType && (
                <p className="text-sm text-red-600">{errors.organizationType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Service Tier *</Label>
              <Select 
                value={formData.tier} 
                onValueChange={(value) => handleInputChange('tier', value as OrganizationTier)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service tier" />
                </SelectTrigger>
                <SelectContent>
                  {organizationTiers.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      <div>
                        <div className="font-medium">{tier.label}</div>
                        <div className="text-sm text-muted-foreground">{tier.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cageCode">CAGE Code</Label>
              <Input
                id="cageCode"
                value={formData.cageCode}
                onChange={(e) => handleInputChange('cageCode', e.target.value)}
                placeholder="e.g., 1XYZ9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dunsNumber">DUNS Number</Label>
              <Input
                id="dunsNumber"
                value={formData.dunsNumber}
                onChange={(e) => handleInputChange('dunsNumber', e.target.value)}
                placeholder="e.g., 123456789"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryAddress">Primary Address *</Label>
            <Textarea
              id="primaryAddress"
              value={formData.primaryAddress}
              onChange={(e) => handleInputChange('primaryAddress', e.target.value)}
              placeholder="Enter full address including city, state, and ZIP code"
              className={errors.primaryAddress ? 'border-red-500' : ''}
            />
            {errors.primaryAddress && (
              <p className="text-sm text-red-600">{errors.primaryAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mailingAddress">Mailing Address (if different)</Label>
            <Textarea
              id="mailingAddress"
              value={formData.mailingAddress}
              onChange={(e) => handleInputChange('mailingAddress', e.target.value)}
              placeholder="Enter mailing address if different from primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone *</Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                placeholder="+1-555-123-4567"
                className={errors.primaryPhone ? 'border-red-500' : ''}
              />
              {errors.primaryPhone && (
                <p className="text-sm text-red-600">{errors.primaryPhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="+1-555-987-6543"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authorizing Official */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Authorizing Official (AO)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The Authorizing Official has the authority to make risk-based decisions and formally accept security risks for the organization.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aoName">Full Name *</Label>
              <Input
                id="aoName"
                value={formData.aoName}
                onChange={(e) => handleInputChange('aoName', e.target.value)}
                placeholder="Jane Smith"
                className={errors.aoName ? 'border-red-500' : ''}
              />
              {errors.aoName && (
                <p className="text-sm text-red-600">{errors.aoName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aoTitle">Title *</Label>
              <Input
                id="aoTitle"
                value={formData.aoTitle}
                onChange={(e) => handleInputChange('aoTitle', e.target.value)}
                placeholder="Chief Information Officer"
                className={errors.aoTitle ? 'border-red-500' : ''}
              />
              {errors.aoTitle && (
                <p className="text-sm text-red-600">{errors.aoTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aoEmail">Email Address *</Label>
              <Input
                id="aoEmail"
                type="email"
                value={formData.aoEmail}
                onChange={(e) => handleInputChange('aoEmail', e.target.value)}
                placeholder="jane.smith@organization.gov"
                className={errors.aoEmail ? 'border-red-500' : ''}
              />
              {errors.aoEmail && (
                <p className="text-sm text-red-600">{errors.aoEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aoPhone">Phone Number *</Label>
              <Input
                id="aoPhone"
                type="tel"
                value={formData.aoPhone}
                onChange={(e) => handleInputChange('aoPhone', e.target.value)}
                placeholder="+1-555-123-4567"
                className={errors.aoPhone ? 'border-red-500' : ''}
              />
              {errors.aoPhone && (
                <p className="text-sm text-red-600">{errors.aoPhone}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="aoSecurityClearance">Security Clearance</Label>
              <Select 
                value={formData.aoSecurityClearance} 
                onValueChange={(value) => handleInputChange('aoSecurityClearance', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select security clearance level" />
                </SelectTrigger>
                <SelectContent>
                  {securityClearances.map((clearance) => (
                    <SelectItem key={clearance} value={clearance}>
                      {clearance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ISSM Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Information System Security Manager (ISSM)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The ISSM is responsible for the day-to-day security operations and technical oversight of the information system.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issmName">Full Name *</Label>
              <Input
                id="issmName"
                value={formData.issmName}
                onChange={(e) => handleInputChange('issmName', e.target.value)}
                placeholder="John Doe"
                className={errors.issmName ? 'border-red-500' : ''}
              />
              {errors.issmName && (
                <p className="text-sm text-red-600">{errors.issmName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issmTitle">Title *</Label>
              <Input
                id="issmTitle"
                value={formData.issmTitle}
                onChange={(e) => handleInputChange('issmTitle', e.target.value)}
                placeholder="Senior Security Engineer"
                className={errors.issmTitle ? 'border-red-500' : ''}
              />
              {errors.issmTitle && (
                <p className="text-sm text-red-600">{errors.issmTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issmEmail">Email Address *</Label>
              <Input
                id="issmEmail"
                type="email"
                value={formData.issmEmail}
                onChange={(e) => handleInputChange('issmEmail', e.target.value)}
                placeholder="john.doe@organization.gov"
                className={errors.issmEmail ? 'border-red-500' : ''}
              />
              {errors.issmEmail && (
                <p className="text-sm text-red-600">{errors.issmEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issmPhone">Phone Number *</Label>
              <Input
                id="issmPhone"
                type="tel"
                value={formData.issmPhone}
                onChange={(e) => handleInputChange('issmPhone', e.target.value)}
                placeholder="+1-555-987-6543"
                className={errors.issmPhone ? 'border-red-500' : ''}
              />
              {errors.issmPhone && (
                <p className="text-sm text-red-600">{errors.issmPhone}</p>
              )}
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
              onClick={() => onComplete(stepData.id, formData)}
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
