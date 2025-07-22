import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

// ZTA Pillars with activities
const ztaPillars = [
  {
    id: "identity",
    name: "Identity",
    description: "User and entity identity verification",
    maturity: 75,
    activities: {
      traditional: [
        { 
          id: "ID-T1", 
          name: "Identity Governance Framework", 
          status: "complete", 
          mappedControls: ["AC-2", "IA-2"],
          description: "Establish comprehensive identity governance framework with automated provisioning and lifecycle management.",
          remediation: "1. Implement automated identity provisioning\n2. Establish identity lifecycle management\n3. Deploy identity governance tools\n4. Regular identity audits and reviews"
        },
        { id: "ID-T2", name: "Multi-Factor Authentication", status: "complete", mappedControls: ["IA-2", "IA-5"] },
        { id: "ID-T3", name: "Privileged Access Management", status: "in-progress", mappedControls: ["AC-2", "AC-6"] }
      ],
      advanced: [
        { id: "ID-A1", name: "Risk-Based Authentication", status: "in-progress", mappedControls: ["IA-8", "IA-9"] },
        { id: "ID-A2", name: "Behavioral Analytics", status: "planned", mappedControls: ["AU-6", "SI-4"] },
        { id: "ID-A3", name: "Zero Trust Identity Fabric", status: "planned", mappedControls: ["AC-3", "IA-2"] }
      ]
    }
  },
  {
    id: "device",
    name: "Device",
    description: "Device trust and compliance verification",
    maturity: 68,
    activities: {
      traditional: [
        { id: "DV-T1", name: "Device Registration", status: "complete", mappedControls: ["IA-3", "CM-8"] },
        { id: "DV-T2", name: "Mobile Device Management", status: "complete", mappedControls: ["SC-7", "AC-19"] },
        { id: "DV-T3", name: "Device Compliance Policies", status: "complete", mappedControls: ["CM-6", "SI-3"] }
      ],
      advanced: [
        { id: "DV-A1", name: "Device Risk Assessment", status: "in-progress", mappedControls: ["RA-3", "RA-5"] },
        { id: "DV-A2", name: "Hardware-based Attestation", status: "planned", mappedControls: ["SI-7", "IA-3"] },
        { id: "DV-A3", name: "Device Behavioral Analysis", status: "not-started", mappedControls: ["SI-4", "AU-6"] }
      ]
    }
  },
  {
    id: "network",
    name: "Network/Environment",
    description: "Network segmentation and micro-perimeters",
    maturity: 82,
    activities: {
      traditional: [
        { id: "NW-T1", name: "Network Segmentation", status: "complete", mappedControls: ["SC-7", "AC-4"] },
        { id: "NW-T2", name: "Firewall Rules Management", status: "complete", mappedControls: ["SC-7", "CM-3"] },
        { id: "NW-T3", name: "VPN Access Controls", status: "complete", mappedControls: ["AC-3", "SC-8"] }
      ],
      advanced: [
        { id: "NW-A1", name: "Software-Defined Perimeter", status: "complete", mappedControls: ["SC-7", "AC-3"] },
        { id: "NW-A2", name: "Micro-segmentation", status: "in-progress", mappedControls: ["SC-7", "AC-4"] },
        { id: "NW-A3", name: "Network Behavioral Analytics", status: "in-progress", mappedControls: ["SI-4", "AU-6"] }
      ]
    }
  },
  {
    id: "application",
    name: "Application/Workload",
    description: "Application security and workload protection",
    maturity: 71,
    activities: {
      traditional: [
        { id: "AP-T1", name: "Application Access Controls", status: "complete", mappedControls: ["AC-3", "AC-6"] },
        { id: "AP-T2", name: "Secure Development Lifecycle", status: "complete", mappedControls: ["SA-3", "SA-15"] },
        { id: "AP-T3", name: "Application Security Testing", status: "in-progress", mappedControls: ["SA-11", "CA-2"] }
      ],
      advanced: [
        { id: "AP-A1", name: "Runtime Application Protection", status: "in-progress", mappedControls: ["SI-3", "SI-4"] },
        { id: "AP-A2", name: "Container Security", status: "planned", mappedControls: ["SC-39", "SI-7"] },
        { id: "AP-A3", name: "Serverless Security", status: "not-started", mappedControls: ["SA-4", "SC-7"] }
      ]
    }
  },
  {
    id: "data",
    name: "Data",
    description: "Data classification, protection, and governance",
    maturity: 79,
    activities: {
      traditional: [
        { id: "DT-T1", name: "Data Classification", status: "complete", mappedControls: ["SC-16", "MP-3"] },
        { id: "DT-T2", name: "Data Loss Prevention", status: "complete", mappedControls: ["SC-28", "MP-6"] },
        { id: "DT-T3", name: "Encryption at Rest", status: "complete", mappedControls: ["SC-28", "SC-13"] }
      ],
      advanced: [
        { id: "DT-A1", name: "Dynamic Data Masking", status: "complete", mappedControls: ["SC-28", "AC-3"] },
        { id: "DT-A2", name: "Data Rights Management", status: "in-progress", mappedControls: ["AC-3", "MP-3"] },
        { id: "DT-A3", name: "Data Activity Monitoring", status: "in-progress", mappedControls: ["AU-2", "SI-4"] }
      ]
    }
  },
  {
    id: "visibility",
    name: "Visibility & Analytics",
    description: "Security monitoring and threat detection",
    maturity: 85,
    activities: {
      traditional: [
        { id: "VA-T1", name: "Security Information Event Management", status: "complete", mappedControls: ["AU-6", "SI-4"] },
        { id: "VA-T2", name: "Log Aggregation", status: "complete", mappedControls: ["AU-3", "AU-9"] },
        { id: "VA-T3", name: "Incident Response", status: "complete", mappedControls: ["IR-4", "IR-6"] }
      ],
      advanced: [
        { id: "VA-A1", name: "User Entity Behavior Analytics", status: "complete", mappedControls: ["AU-6", "SI-4"] },
        { id: "VA-A2", name: "Advanced Threat Detection", status: "complete", mappedControls: ["SI-4", "AU-6"] },
        { id: "VA-A3", name: "Automated Response", status: "in-progress", mappedControls: ["IR-4", "SI-4"] }
      ]
    }
  },
  {
    id: "automation",
    name: "Automation & Orchestration",
    description: "Security automation and response orchestration",
    maturity: 63,
    activities: {
      traditional: [
        { id: "AO-T1", name: "Automated Patch Management", status: "complete", mappedControls: ["SI-2", "CM-3"] },
        { id: "AO-T2", name: "Configuration Management", status: "complete", mappedControls: ["CM-2", "CM-6"] },
        { id: "AO-T3", name: "Vulnerability Scanning", status: "complete", mappedControls: ["RA-5", "SI-2"] }
      ],
      advanced: [
        { id: "AO-A1", name: "Security Orchestration", status: "in-progress", mappedControls: ["IR-4", "SI-4"] },
        { id: "AO-A2", name: "Automated Threat Response", status: "planned", mappedControls: ["IR-4", "IR-7"] },
        { id: "AO-A3", name: "Self-Healing Infrastructure", status: "not-started", mappedControls: ["CP-2", "SI-7"] }
      ]
    }
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case "complete": return { bg: "bg-status-compliant/10", text: "text-status-compliant", border: "border-status-compliant/20", icon: CheckCircle };
    case "in-progress": return { bg: "bg-status-partial/10", text: "text-status-partial", border: "border-status-partial/20", icon: Clock };
    case "planned": return { bg: "bg-status-unknown/10", text: "text-status-unknown", border: "border-status-unknown/20", icon: Clock };
    case "not-started": return { bg: "bg-status-noncompliant/10", text: "text-status-noncompliant", border: "border-status-noncompliant/20", icon: XCircle };
    default: return { bg: "bg-status-unknown/10", text: "text-status-unknown", border: "border-status-unknown/20", icon: Clock };
  }
}

export default function ZeroTrust() {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const overallMaturity = Math.round(ztaPillars.reduce((sum, pillar) => sum + pillar.maturity, 0) / ztaPillars.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Zero Trust Architecture</h1>
          <p className="text-muted-foreground">DoD ZTA maturity assessment across seven pillars</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-zta-advanced/10 text-zta-advanced border-zta-advanced/20">
            <Target className="w-3 h-3 mr-1" />
            {overallMaturity}% Maturity
          </Badge>
        </div>
      </div>

      {/* Maturity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">{overallMaturity}%</div>
            <Progress value={overallMaturity} className="mb-2" />
            <p className="text-xs text-muted-foreground">Advanced Level</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pillar Maturity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {ztaPillars.map((pillar) => (
                <div key={pillar.id} className="text-center">
                  <div className="text-lg font-bold text-foreground">{pillar.maturity}%</div>
                  <div className="text-xs text-muted-foreground">{pillar.name}</div>
                  <Progress value={pillar.maturity} className="h-2 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ZTA Pillars Tabs */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Zero Trust Pillar Details</CardTitle>
          <CardDescription>Implementation activities organized by maturity phase</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {ztaPillars.map((pillar) => (
                <TabsTrigger key={pillar.id} value={pillar.id} className="text-xs">
                  {pillar.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {ztaPillars.map((pillar) => (
              <TabsContent key={pillar.id} value={pillar.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{pillar.name}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-zta-advanced/10 text-zta-advanced border-zta-advanced/20">
                    {pillar.maturity}% Mature
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Traditional Phase */}
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <div className="w-3 h-3 rounded-full bg-zta-traditional mr-2"></div>
                        Traditional Phase
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pillar.activities.traditional.map((activity) => {
                        const statusStyle = getStatusColor(activity.status);
                        const StatusIcon = statusStyle.icon;
                        return (
                          <Card key={activity.id} className="p-3 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                                    {activity.id}
                                  </code>
                                  <Badge 
                                    variant="outline" 
                                    className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {activity.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-medium text-foreground">{activity.name}</h4>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedActivity(activity)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center">
                                      <Target className="w-5 h-5 mr-2 text-primary" />
                                      {activity.id} - {activity.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Mapped NIST 800-53 controls and implementation details
                                    </DialogDescription>
                                  </DialogHeader>
                                   <div className="space-y-4">
                                     <div>
                                       <h4 className="font-semibold text-foreground mb-2">Status</h4>
                                       <Badge 
                                         variant="outline" 
                                         className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                       >
                                         <StatusIcon className="w-3 h-3 mr-1" />
                                         {activity.status.replace('-', ' ')}
                                       </Badge>
                                     </div>
                                     <div>
                                       <h4 className="font-semibold text-foreground mb-2">Description</h4>
                                       <p className="text-sm text-muted-foreground">{activity.description}</p>
                                     </div>
                                     <div>
                                       <h4 className="font-semibold text-foreground mb-2">Remediation Steps</h4>
                                       <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{activity.remediation}</pre>
                                     </div>
                                     <div>
                                       <h4 className="font-semibold text-foreground mb-2">Mapped NIST Controls</h4>
                                       <div className="flex flex-wrap gap-2">
                                         {activity.mappedControls.map((control) => (
                                           <Badge key={control} variant="secondary">
                                             {control}
                                           </Badge>
                                         ))}
                                       </div>
                                     </div>
                                   </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Advanced Phase */}
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <div className="w-3 h-3 rounded-full bg-zta-advanced mr-2"></div>
                        Advanced Phase
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pillar.activities.advanced.map((activity) => {
                        const statusStyle = getStatusColor(activity.status);
                        const StatusIcon = statusStyle.icon;
                        return (
                          <Card key={activity.id} className="p-3 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                                    {activity.id}
                                  </code>
                                  <Badge 
                                    variant="outline" 
                                    className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {activity.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-medium text-foreground">{activity.name}</h4>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedActivity(activity)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center">
                                      <Target className="w-5 h-5 mr-2 text-primary" />
                                      {activity.id} - {activity.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Mapped NIST 800-53 controls and implementation details
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold text-foreground mb-2">Status</h4>
                                      <Badge 
                                        variant="outline" 
                                        className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                      >
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {activity.status.replace('-', ' ')}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-foreground mb-2">Mapped NIST Controls</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {activity.mappedControls.map((control) => (
                                          <Badge key={control} variant="secondary">
                                            {control}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}