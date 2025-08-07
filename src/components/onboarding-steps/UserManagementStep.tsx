/**
 * User Management Step Component
 * Optional step to invite additional users and configure roles
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Shield, 
  Plus, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  SkipForward,
  UserPlus
} from 'lucide-react';
import { OnboardingStepProps } from './types';
import { UserRole } from '@/config/authConfig';

interface UserInvitation {
  email: string;
  roles: UserRole[];
  department?: string;
  title?: string;
}

export const UserManagementStep: React.FC<OnboardingStepProps> = ({ 
  onComplete, 
  onNext,
  onSkip,
  stepData,
  isProcessing 
}) => {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [currentInvitation, setCurrentInvitation] = useState<UserInvitation>({
    email: '',
    roles: [],
    department: '',
    title: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const availableRoles: { value: UserRole; label: string; description: string; level: 'admin' | 'operational' | 'analytical' }[] = [
    {
      value: 'SystemAdmin',
      label: 'System Administrator',
      description: 'Full system access and configuration management',
      level: 'admin'
    },
    {
      value: 'SecurityAnalyst',
      label: 'Security Analyst',
      description: 'Security monitoring, analysis, and incident response',
      level: 'operational'
    },
    {
      value: 'ComplianceOfficer',
      label: 'Compliance Officer',
      description: 'Compliance monitoring, reporting, and audit coordination',
      level: 'operational'
    },
    {
      value: 'AuthorizingOfficial',
      label: 'Authorizing Official (AO)',
      description: 'Authority to make risk-based security decisions',
      level: 'admin'
    },
    {
      value: 'Auditor',
      label: 'Security Auditor',
      description: 'Read-only audit access and compliance verification',
      level: 'analytical'
    },
    {
      value: 'Viewer',
      label: 'Report Viewer',
      description: 'Basic read-only access to dashboards and reports',
      level: 'analytical'
    }
  ];

  const commonDepartments = [
    'Information Technology',
    'Information Security',
    'Compliance',
    'Risk Management',
    'Operations',
    'Audit',
    'Legal',
    'Executive',
    'Other'
  ];

  const handleInputChange = (field: keyof UserInvitation, value: string | UserRole[]) => {
    setCurrentInvitation(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleToggle = (role: UserRole, checked: boolean) => {
    if (checked) {
      setCurrentInvitation(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    } else {
      setCurrentInvitation(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== role)
      }));
    }
  };

  const validateInvitation = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentInvitation.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentInvitation.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (invitations.some(inv => inv.email.toLowerCase() === currentInvitation.email.toLowerCase())) {
      newErrors.email = 'This email address has already been invited';
    }

    if (currentInvitation.roles.length === 0) {
      newErrors.roles = 'At least one role must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInvitation = () => {
    if (!validateInvitation()) {
      return;
    }

    setInvitations(prev => [...prev, { ...currentInvitation }]);
    
    // Reset form
    setCurrentInvitation({
      email: '',
      roles: [],
      department: '',
      title: ''
    });
    
    setErrors({});
  };

  const handleRemoveInvitation = (index: number) => {
    setInvitations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndContinue = async () => {
    // Add current invitation if valid
    if (currentInvitation.email && validateInvitation()) {
      handleAddInvitation();
    }

    try {
      setIsSaving(true);
      
      // Save user invitations data
      const allInvitations = [...invitations];
      if (currentInvitation.email && currentInvitation.roles.length > 0) {
        allInvitations.push(currentInvitation);
      }
      
      onComplete(stepData.id, allInvitations);
      onNext();
    } catch (error) {
      console.error('Error saving user invitations:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStep = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const getRoleBadgeColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'analytical': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>User Management & Invitations</span>
            <Badge variant="outline">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Invite team members to your organization and assign appropriate roles. 
            You can invite users now or skip this step and add them later from the settings page.
          </p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              As the first user, you automatically have System Administrator privileges. 
              You can invite additional administrators and assign specific roles based on job functions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Role Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Available Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRoles.map((role) => (
              <div key={role.value} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-blue-900">{role.label}</h4>
                    <Badge className={getRoleBadgeColor(role.level)}>
                      {role.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Invitations ({invitations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {invitation.roles.map((role) => {
                          const roleInfo = availableRoles.find(r => r.value === role);
                          return (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {roleInfo?.label || role}
                            </Badge>
                          );
                        })}
                      </div>
                      {invitation.department && (
                        <p className="text-sm text-muted-foreground">
                          {invitation.title && `${invitation.title}, `}{invitation.department}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInvitation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>Invite New User</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={currentInvitation.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@organization.gov"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={currentInvitation.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Senior Security Analyst"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={currentInvitation.department} 
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {commonDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Assign Roles *</Label>
              {errors.roles && (
                <p className="text-sm text-red-600">{errors.roles}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableRoles.map((role) => (
                <div key={role.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id={`role-${role.value}`}
                    checked={currentInvitation.roles.includes(role.value)}
                    onChange={(e) => handleRoleToggle(role.value, e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`role-${role.value}`} className="font-medium cursor-pointer">
                        {role.label}
                      </Label>
                      <Badge className={getRoleBadgeColor(role.level)}>
                        {role.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAddInvitation}
              disabled={!currentInvitation.email || currentInvitation.roles.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Invitation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">User Management Best Practices</h3>
              <div className="space-y-2 text-sm text-amber-700">
                <p>• Follow the principle of least privilege - assign only necessary roles</p>
                <p>• Regularly review user access and remove inactive users</p>
                <p>• Use department-specific roles when possible for better organization</p>
                <p>• Consider role inheritance for users with multiple responsibilities</p>
                <p>• Maintain an audit trail of role assignments and changes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={handleSkipStep}
              disabled={isSaving || isProcessing}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip User Setup
            </Button>

            <div className="space-x-4">
              <Button 
                variant="outline" 
                onClick={() => onComplete(stepData.id, invitations)}
                disabled={isSaving || isProcessing}
              >
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
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
