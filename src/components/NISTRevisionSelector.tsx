/**
 * NIST Revision Selection Component
 * Allows customers to select NIST 800-53 revision during onboarding
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { NistRevision } from '../types/organization';

interface NISTRevisionSelectorProps {
  selectedRevision: NistRevision | null;
  onRevisionChange: (revision: NistRevision) => void;
  organizationType?: 'government' | 'contractor' | 'commercial';
  disabled?: boolean;
  showDetails?: boolean;
}

const NISTRevisionSelector: React.FC<NISTRevisionSelectorProps> = ({
  selectedRevision,
  onRevisionChange,
  organizationType = 'commercial',
  disabled = false,
  showDetails = true
}) => {
  const [showComparison, setShowComparison] = useState(false);

  const revisionInfo = {
    Rev4: {
      title: 'NIST 800-53 Revision 4',
      status: 'Legacy',
      controlCount: '421 controls',
      description: 'Established framework with proven track record',
      pros: [
        'Mature and well-documented',
        'Extensive implementation guidance available',
        'Widely adopted across federal agencies',
        'Lower migration complexity for existing systems'
      ],
      cons: [
        'No longer updated with new security requirements',
        'Missing modern privacy and supply chain controls',
        'Limited coverage of emerging threats',
        'May not meet future compliance requirements'
      ],
      recommended: false,
      badgeColor: 'yellow' as const
    },
    Rev5: {
      title: 'NIST 800-53 Revision 5',
      status: 'Current',
      controlCount: '450+ controls',
      description: 'Latest framework with enhanced security and privacy controls',
      pros: [
        'Current standard with latest security requirements',
        'Enhanced privacy controls (PT family)',
        'Supply chain security controls (SR family)',
        'Future-proof for emerging compliance requirements'
      ],
      cons: [
        'Newer framework with evolving guidance',
        'Higher initial implementation complexity',
        'May require more extensive documentation',
        'Some control mappings still being refined'
      ],
      recommended: true,
      badgeColor: 'green' as const
    },
    Rev6: {
      title: 'NIST 800-53 Revision 6',
      status: 'Future',
      controlCount: '500+ controls (projected)',
      description: 'Next-generation framework with AI/ML and emerging technology controls',
      pros: [
        'Addresses AI/ML security requirements',
        'Enhanced cloud-native controls',
        'Zero-trust architecture integration',
        'Emerging technology security guidance'
      ],
      cons: [
        'Not yet published or finalized',
        'Implementation guidance not available',
        'Subject to change during development',
        'Higher complexity and resource requirements'
      ],
      recommended: false,
      badgeColor: 'blue' as const
    }
  };

  const getRecommendation = () => {
    if (organizationType === 'government') {
      return {
        revision: 'Rev5' as NistRevision,
        reason: 'Federal agencies are required to transition to NIST 800-53 Rev 5 for new systems and during major updates.'
      };
    } else if (organizationType === 'contractor') {
      return {
        revision: 'Rev5' as NistRevision,
        reason: 'Government contractors should align with federal requirements and adopt Rev 5 for future contract compliance.'
      };
    } else {
      return {
        revision: 'Rev5' as NistRevision,
        reason: 'Rev 5 provides the most comprehensive and up-to-date security framework for commercial organizations.'
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Select NIST 800-53 Revision
          </CardTitle>
          <CardDescription>
            Choose the NIST framework revision that best fits your organization's compliance requirements.
            This selection affects which security controls are available in your cATO dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recommendation Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended for {organizationType} organizations:</strong> {recommendation.revision}
              <br />
              {recommendation.reason}
            </AlertDescription>
          </Alert>

          {/* Revision Selection */}
          <RadioGroup
            value={selectedRevision || ''}
            onValueChange={(value) => onRevisionChange(value as NistRevision)}
            disabled={disabled}
            className="space-y-4"
          >
            {(Object.keys(revisionInfo) as Array<keyof typeof revisionInfo>).map((revision) => {
              const info = revisionInfo[revision];
              const isRecommended = revision === recommendation.revision;
              
              return (
                <div key={revision} className="relative">
                  <div className={`border rounded-lg p-4 transition-colors ${
                    selectedRevision === revision 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={revision} id={revision} className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={revision} className="flex items-center gap-2 text-base font-medium cursor-pointer">
                          {info.title}
                          <Badge variant={info.badgeColor === 'green' ? 'default' : 'secondary'}>
                            {info.status}
                          </Badge>
                          {isRecommended && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Recommended
                            </Badge>
                          )}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {info.description} • {info.controlCount}
                        </p>
                        
                        {showDetails && (
                          <div className="mt-3 space-y-2">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h5 className="font-medium text-green-700 mb-1">Benefits</h5>
                                <ul className="space-y-1">
                                  {info.pros.slice(0, 2).map((pro, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-orange-700 mb-1">Considerations</h5>
                                <ul className="space-y-1">
                                  {info.cons.slice(0, 2).map((con, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {/* Detailed Comparison Toggle */}
          {showDetails && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm"
              >
                {showComparison ? 'Hide' : 'Show'} Detailed Comparison
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}

          {/* Detailed Comparison Table */}
          {showComparison && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Feature</th>
                        <th className="text-left py-2 font-medium">Rev 4</th>
                        <th className="text-left py-2 font-medium">Rev 5</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2 font-medium">Control Count</td>
                        <td className="py-2">421 controls</td>
                        <td className="py-2">450+ controls</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Privacy Controls</td>
                        <td className="py-2">Limited (AR family)</td>
                        <td className="py-2">Comprehensive (PT family)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Supply Chain</td>
                        <td className="py-2">Basic (SA controls)</td>
                        <td className="py-2">Enhanced (SR family)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Federal Requirement</td>
                        <td className="py-2">Legacy systems only</td>
                        <td className="py-2">Required for new systems</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Implementation Status</td>
                        <td className="py-2">Mature, stable</td>
                        <td className="py-2">Current, evolving</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Future Support</td>
                        <td className="py-2">Maintenance mode</td>
                        <td className="py-2">Active development</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Migration Notice */}
          {selectedRevision && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> You can change your NIST revision selection later through the Framework Upgrade 
                feature in your dashboard. A gap analysis will be provided to help with the transition.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NISTRevisionSelector;
