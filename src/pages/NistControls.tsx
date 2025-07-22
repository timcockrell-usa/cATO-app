import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Eye, FileText, AlertTriangle } from "lucide-react";

// Mock NIST control families data
const controlFamilies = [
  {
    id: "AC",
    name: "Access Control",
    total: 25,
    compliant: 20,
    partial: 3,
    noncompliant: 2,
      controls: [
        { 
          id: "AC-1", 
          name: "Policy and Procedures", 
          status: "compliant", 
          implementation: "Azure AD policies implemented",
          description: "The organization develops, documents, and disseminates access control policy and procedures.",
          remediation: "1. Review and update access control policies annually\n2. Ensure procedures are documented and communicated\n3. Implement regular policy compliance reviews\n4. Update procedures based on system changes"
        },
        { 
          id: "AC-2", 
          name: "Account Management", 
          status: "compliant", 
          implementation: "Automated via Azure AD",
          description: "The organization manages system accounts, group memberships, and associated privileges.",
          remediation: "1. Implement automated account provisioning\n2. Regular access reviews and certifications\n3. Establish account lifecycle management\n4. Monitor privileged account usage"
        },
        { 
          id: "AC-3", 
          name: "Access Enforcement", 
          status: "partial", 
          implementation: "RBAC partially implemented",
          description: "The system enforces approved authorizations for logical access to information and system resources.",
          remediation: "1. Complete RBAC implementation across all systems\n2. Implement attribute-based access control (ABAC)\n3. Regular authorization reviews\n4. Deploy advanced access analytics"
        },
        { 
          id: "AC-4", 
          name: "Information Flow Enforcement", 
          status: "noncompliant", 
          implementation: "Network segmentation needed",
          description: "The system controls information flows within the system and between interconnected systems.",
          remediation: "1. Implement network micro-segmentation\n2. Deploy data flow monitoring tools\n3. Establish information flow policies\n4. Regular network topology reviews"
        },
        { 
          id: "AC-5", 
          name: "Separation of Duties", 
          status: "compliant", 
          implementation: "Privileged Identity Management",
          description: "The organization separates duties of individuals to prevent malevolent activity.",
          remediation: "1. Regular segregation of duties reviews\n2. Implement dual-person controls for critical operations\n3. Monitor for conflicts of interest\n4. Automate duty separation enforcement"
        }
      ]
  },
  {
    id: "AU",
    name: "Audit and Accountability", 
    total: 16,
    compliant: 14,
    partial: 2,
    noncompliant: 0,
    controls: [
      { id: "AU-1", name: "Policy and Procedures", status: "compliant", implementation: "Audit policies documented" },
      { id: "AU-2", name: "Event Logging", status: "compliant", implementation: "Azure Monitor + Sentinel" },
      { id: "AU-3", name: "Content of Audit Records", status: "partial", implementation: "Some fields missing" },
      { id: "AU-4", name: "Audit Log Storage Capacity", status: "compliant", implementation: "Log Analytics workspace" }
    ]
  },
  {
    id: "CA",
    name: "Assessment, Authorization, and Monitoring",
    total: 9,
    compliant: 7,
    partial: 1,
    noncompliant: 1,
    controls: [
      { id: "CA-1", name: "Policy and Procedures", status: "compliant", implementation: "Assessment policies in place" },
      { id: "CA-2", name: "Control Assessments", status: "compliant", implementation: "Quarterly assessments" },
      { id: "CA-3", name: "Information Exchange", status: "partial", implementation: "ISAs under review" },
      { id: "CA-7", name: "Continuous Monitoring", status: "compliant", implementation: "Azure Security Center" }
    ]
  },
  {
    id: "CM",
    name: "Configuration Management",
    total: 14,
    compliant: 10,
    partial: 3,
    noncompliant: 1,
    controls: [
      { id: "CM-1", name: "Policy and Procedures", status: "compliant", implementation: "CM policies established" },
      { id: "CM-2", name: "Baseline Configuration", status: "compliant", implementation: "Azure Blueprints" },
      { id: "CM-3", name: "Configuration Change Control", status: "partial", implementation: "Change board established" },
      { id: "CM-6", name: "Configuration Settings", status: "compliant", implementation: "Security baselines applied" }
    ]
  },
  {
    id: "CP",
    name: "Contingency Planning",
    total: 13,
    compliant: 9,
    partial: 3, 
    noncompliant: 1,
    controls: [
      { id: "CP-1", name: "Policy and Procedures", status: "compliant", implementation: "Contingency plan documented" },
      { id: "CP-2", name: "Contingency Plan", status: "compliant", implementation: "Business continuity plan" },
      { id: "CP-3", name: "Contingency Training", status: "partial", implementation: "Training program developing" },
      { id: "CP-4", name: "Contingency Plan Testing", status: "compliant", implementation: "Annual DR tests" }
    ]
  },
  {
    id: "IA",
    name: "Identification and Authentication",
    total: 12,
    compliant: 10,
    partial: 2,
    noncompliant: 0,
    controls: [
      { id: "IA-1", name: "Policy and Procedures", status: "compliant", implementation: "Identity management policies" },
      { id: "IA-2", name: "Identification and Authentication", status: "compliant", implementation: "Azure AD with MFA" },
      { id: "IA-3", name: "Device Identification", status: "partial", implementation: "Device registration in progress" },
      { id: "IA-5", name: "Authenticator Management", status: "compliant", implementation: "Password policies enforced" }
    ]
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case "compliant": return { bg: "bg-status-compliant/10", text: "text-status-compliant", border: "border-status-compliant/20" };
    case "partial": return { bg: "bg-status-partial/10", text: "text-status-partial", border: "border-status-partial/20" };
    case "noncompliant": return { bg: "bg-status-noncompliant/10", text: "text-status-noncompliant", border: "border-status-noncompliant/20" };
    default: return { bg: "bg-status-unknown/10", text: "text-status-unknown", border: "border-status-unknown/20" };
  }
}

function getCompliancePercentage(family: any) {
  return Math.round((family.compliant / family.total) * 100);
}

export default function NistControls() {
  const [selectedFamily, setSelectedFamily] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">NIST 800-53 Rev 5 Controls</h1>
          <p className="text-muted-foreground">Security and privacy control implementation status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-compliant">
              {controlFamilies.reduce((sum, family) => sum + family.compliant, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Compliant Controls</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-partial">
              {controlFamilies.reduce((sum, family) => sum + family.partial, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Partially Implemented</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-noncompliant">
              {controlFamilies.reduce((sum, family) => sum + family.noncompliant, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Non-Compliant</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {controlFamilies.reduce((sum, family) => sum + family.total, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Controls</p>
          </CardContent>
        </Card>
      </div>

      {/* Control Families Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {controlFamilies.map((family) => (
          <Card key={family.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  {family.id}
                </CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {getCompliancePercentage(family)}%
                </Badge>
              </div>
              <CardDescription className="text-sm font-medium">
                {family.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={getCompliancePercentage(family)} className="h-2" />
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-status-compliant">{family.compliant}</div>
                  <div className="text-xs text-muted-foreground">Compliant</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-status-partial">{family.partial}</div>
                  <div className="text-xs text-muted-foreground">Partial</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-status-noncompliant">{family.noncompliant}</div>
                  <div className="text-xs text-muted-foreground">Non-Compliant</div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedFamily(family)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Controls
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-primary" />
                      {family.id} - {family.name}
                    </DialogTitle>
                    <DialogDescription>
                      Detailed control implementation status and evidence
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {family.controls.map((control) => {
                      const statusStyle = getStatusColor(control.status);
                      return (
                        <Card key={control.id} className="shadow-card">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                    {control.id}
                                  </code>
                                  <Badge 
                                    variant="outline" 
                                    className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                  >
                                    {control.status.charAt(0).toUpperCase() + control.status.slice(1)}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-foreground mb-1">{control.name}</h4>
                                <p className="text-sm text-muted-foreground">{control.implementation}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <FileText className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>{control.id} - {control.name}</DialogTitle>
                                      <DialogDescription>Control description and remediation steps</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground">{control.description}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Current Implementation</h4>
                                        <p className="text-sm text-muted-foreground">{control.implementation}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Remediation Steps</h4>
                                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{control.remediation}</pre>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                {control.status === "noncompliant" && (
                                  <Button variant="outline" size="sm">
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    Request Exception
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}