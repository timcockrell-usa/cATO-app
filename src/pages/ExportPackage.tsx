import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Calendar
} from "lucide-react";

// Mock export data
const exportPackages = [
  {
    id: "ato-package",
    name: "ATO Package",
    description: "Complete Authority to Operate package for eMASS submission",
    files: [
      "System Security Plan (SSP)",
      "Security Assessment Report (SAR)",
      "Plan of Action & Milestones (POA&M)",
      "Contingency Plan (CP)",
      "Control Implementation Summary",
      "Risk Assessment Report"
    ],
    lastExported: "2024-01-15 14:30:00",
    status: "ready",
    size: "125 MB",
    format: "PDF/Excel Package"
  },
  {
    id: "poam-export",
    name: "POA&M Export",
    description: "Current POA&M status and milestones in eMASS format",
    files: [
      "POA&M Status Report",
      "Milestone Tracking Sheet",
      "Resource Requirements",
      "Risk Mitigation Status"
    ],
    lastExported: "2024-01-20 09:15:00",
    status: "ready",
    size: "8.5 MB",
    format: "Excel (.xlsx)"
  },
  {
    id: "compliance-report",
    name: "Compliance Report",
    description: "NIST 800-53 compliance status and evidence package",
    files: [
      "Control Compliance Matrix",
      "Evidence Repository",
      "Assessment Results",
      "Remediation Status",
      "Executive Summary"
    ],
    lastExported: "2024-01-18 16:45:00",
    status: "updating",
    size: "67 MB",
    format: "PDF Package"
  }
];

const systemMetrics = {
  totalControls: 200,
  implementedControls: 170,
  compliancePercentage: 85,
  activePoams: 23,
  criticalFindings: 3,
  lastAssessment: "2024-01-10",
  nextAssessment: "2024-04-10"
};

function getStatusColor(status: string) {
  switch (status) {
    case "ready": return { bg: "bg-status-compliant/10", text: "text-status-compliant", border: "border-status-compliant/20", icon: CheckCircle };
    case "updating": return { bg: "bg-status-partial/10", text: "text-status-partial", border: "border-status-partial/20", icon: Clock };
    case "error": return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", icon: AlertTriangle };
    default: return { bg: "bg-status-unknown/10", text: "text-status-unknown", border: "border-status-unknown/20", icon: Clock };
  }
}

export default function ExportPackage() {
  const handleExport = (packageId: string) => {
    // Simulate export process
    console.log(`Exporting package: ${packageId}`);
    // In real implementation, this would trigger the export API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export Package</h1>
          <p className="text-muted-foreground">Generate and download ATO documentation packages</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-status-compliant/10 text-status-compliant border-status-compliant/20">
            <Shield className="w-3 h-3 mr-1" />
            IL5 Compliant
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary" />
            System Overview
          </CardTitle>
          <CardDescription>Current compliance status and assessment metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">{systemMetrics.compliancePercentage}%</div>
              <div className="text-sm text-muted-foreground mb-2">Overall Compliance</div>
              <Progress value={systemMetrics.compliancePercentage} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">{systemMetrics.implementedControls}/{systemMetrics.totalControls}</div>
              <div className="text-sm text-muted-foreground mb-2">Controls Implemented</div>
              <Progress value={(systemMetrics.implementedControls / systemMetrics.totalControls) * 100} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-status-partial mb-1">{systemMetrics.activePoams}</div>
              <div className="text-sm text-muted-foreground mb-2">Active POA&Ms</div>
              <div className="text-xs text-muted-foreground">3 overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive mb-1">{systemMetrics.criticalFindings}</div>
              <div className="text-sm text-muted-foreground mb-2">Critical Findings</div>
              <div className="text-xs text-muted-foreground">Require immediate attention</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Assessment: {systemMetrics.lastAssessment}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Next Assessment: {systemMetrics.nextAssessment}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {exportPackages.map((pkg) => {
          const statusStyle = getStatusColor(pkg.status);
          const StatusIcon = statusStyle.icon;
          
          return (
            <Card key={pkg.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    {pkg.name}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {pkg.status}
                  </Badge>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground text-sm">Included Files:</h4>
                  <div className="space-y-1">
                    {pkg.files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium text-foreground">{pkg.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium text-foreground">{pkg.format}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Exported:</span>
                    <span className="font-medium text-foreground">{pkg.lastExported}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    onClick={() => handleExport(pkg.id)}
                    disabled={pkg.status === "updating"}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {pkg.status === "updating" ? "Updating..." : "Download Package"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Export History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Export History</CardTitle>
          <CardDescription>Last 10 package exports and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-01-20 09:15:00", package: "POA&M Export", user: "Sarah Johnson", status: "success" },
              { date: "2024-01-18 16:45:00", package: "Compliance Report", user: "Mike Chen", status: "success" },
              { date: "2024-01-15 14:30:00", package: "ATO Package", user: "David Kumar", status: "success" },
              { date: "2024-01-12 11:20:00", package: "POA&M Export", user: "Lisa Park", status: "success" },
              { date: "2024-01-10 13:45:00", package: "Compliance Report", user: "Jennifer Lee", status: "error" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${item.status === "success" ? "bg-status-compliant" : "bg-destructive"}`}></div>
                  <div>
                    <div className="font-medium text-foreground">{item.package}</div>
                    <div className="text-sm text-muted-foreground">{item.date} • {item.user}</div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={item.status === "success" 
                    ? "bg-status-compliant/10 text-status-compliant border-status-compliant/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}