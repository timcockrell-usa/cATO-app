/**
 * Welcome Step Component
 * Introduction to the cATO Dashboard onboarding process
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  Users, 
  Cloud, 
  FileText,
  ArrowRight,
  BookOpen,
  Target
} from 'lucide-react';
import { OnboardingStepProps } from './types';

export const WelcomeStep: React.FC<OnboardingStepProps> = ({ 
  onComplete, 
  onNext, 
  stepData,
  isProcessing 
}) => {
  const handleGetStarted = () => {
    onComplete(stepData.id);
    onNext();
  };

  const features = [
    {
      icon: Shield,
      title: 'NIST 800-53 Compliance',
      description: 'Automated compliance monitoring and reporting for NIST frameworks'
    },
    {
      icon: Cloud,
      title: 'Multi-Cloud Support',
      description: 'Connect and monitor Azure, AWS, and other cloud environments'
    },
    {
      icon: FileText,
      title: 'eMASS Integration',
      description: 'Seamless integration with existing eMASS compliance workflows'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Granular permissions for different organizational roles'
    }
  ];

  const timelineItems = [
    {
      step: '1',
      title: 'Organization Setup',
      description: 'Configure your organization profile and contact information',
      time: '5 min',
      required: true
    },
    {
      step: '2',
      title: 'Security Configuration',
      description: 'Set NIST revision and security classification',
      time: '3 min',
      required: true
    },
    {
      step: '3',
      title: 'eMASS Integration',
      description: 'Connect to eMASS and import existing data',
      time: '10 min',
      required: false
    },
    {
      step: '4',
      title: 'Cloud Environments',
      description: 'Connect your cloud infrastructure',
      time: '15 min',
      required: true
    },
    {
      step: '5',
      title: 'User Management',
      description: 'Invite team members and assign roles',
      time: '5 min',
      required: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome to cATO Dashboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive platform for continuous Authority to Operate (ATO) management. 
              Let's get your organization set up for automated compliance monitoring and reporting.
            </p>
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>~30 minutes setup</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>FedRAMP Ready</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Platform Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Setup Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Setup Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <Badge 
                      variant={item.required ? "default" : "outline"} 
                      className="text-xs"
                    >
                      {item.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Estimated time: {item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-800 mb-3">Before You Begin</h3>
          <div className="space-y-2 text-sm text-amber-700">
            <p>• Have your organization's official information ready (legal name, CAGE code, etc.)</p>
            <p>• Ensure you have Authorizing Official (AO) and ISSM contact information</p>
            <p>• For eMASS integration, have your system ID and API credentials available</p>
            <p>• For cloud setup, ensure you have administrative access to your cloud environments</p>
          </div>
        </CardContent>
      </Card>

      {/* Get Started Button */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
            <p className="text-muted-foreground">
              This setup wizard will guide you through configuring your organization for continuous compliance monitoring.
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="px-8"
              disabled={isProcessing}
            >
              Start Organization Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
