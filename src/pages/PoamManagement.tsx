import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Calendar,
  User,
  Shield
} from "lucide-react";

// Mock POA&M data
const poamData = [
  {
    id: "POAM-001",
    title: "Implement Multi-Factor Authentication for Admin Accounts",
    description: "Administrative accounts lack MFA implementation for privileged access",
    weakness: "AC-2: Account Management",
    severity: "High",
    status: "Open",
    owner: "Sarah Johnson",
    scheduledCompletion: "2024-04-15",
    resourcesRequired: "$25,000",
    milestones: ["Design approval", "Procurement", "Implementation", "Testing"],
    isOverdue: false
  },
  {
    id: "POAM-002", 
    title: "Network Segmentation for Critical Systems",
    description: "Critical systems are not properly isolated from general network traffic",
    weakness: "SC-7: Boundary Protection",
    severity: "High",
    status: "In Progress",
    owner: "Mike Chen",
    scheduledCompletion: "2024-05-30",
    resourcesRequired: "$50,000",
    milestones: ["Network design", "Hardware procurement", "Implementation", "Testing"],
    isOverdue: false
  },
  {
    id: "POAM-003",
    title: "Automated Vulnerability Scanning",
    description: "Lack of automated vulnerability scanning for cloud infrastructure",
    weakness: "RA-5: Vulnerability Scanning",
    severity: "Medium",
    status: "Open",
    owner: "David Kumar",
    scheduledCompletion: "2024-03-20",
    resourcesRequired: "$15,000",
    milestones: ["Tool selection", "Configuration", "Testing", "Deployment"],
    isOverdue: true
  },
  {
    id: "POAM-004",
    title: "Incident Response Plan Update",
    description: "Current incident response plan needs updates for cloud environment",
    weakness: "IR-8: Incident Response Plan",
    severity: "Medium",
    status: "In Progress",
    owner: "Lisa Park",
    scheduledCompletion: "2024-04-01",
    resourcesRequired: "$10,000",
    milestones: ["Plan review", "Updates", "Training", "Testing"],
    isOverdue: false
  },
  {
    id: "POAM-005",
    title: "Data Encryption at Rest",
    description: "Sensitive data storage lacks encryption at rest implementation",
    weakness: "SC-28: Protection of Information at Rest",
    severity: "High",
    status: "Open",
    owner: "Jennifer Lee",
    scheduledCompletion: "2024-06-15",
    resourcesRequired: "$30,000",
    milestones: ["Encryption key management", "Implementation", "Testing", "Validation"],
    isOverdue: false
  },
  {
    id: "POAM-006",
    title: "Security Awareness Training",
    description: "Annual security awareness training program needs enhancement",
    weakness: "AT-2: Security Awareness Training",
    severity: "Low",
    status: "Completed",
    owner: "Amy Rodriguez",
    scheduledCompletion: "2024-02-28",
    resourcesRequired: "$8,000",
    milestones: ["Content development", "Delivery", "Assessment", "Reporting"],
    isOverdue: false
  },
  {
    id: "POAM-007",
    title: "Privileged Access Review",
    description: "Quarterly privileged access review process needs automation",
    weakness: "AC-2: Account Management",
    severity: "Medium",
    status: "Open",
    owner: "Robert Kim",
    scheduledCompletion: "2024-01-30",
    resourcesRequired: "$12,000",
    milestones: ["Process design", "Automation", "Testing", "Implementation"],
    isOverdue: true
  }
];

function getSeverityColor(severity: string) {
  switch (severity) {
    case "High": return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" };
    case "Medium": return { bg: "bg-status-partial/10", text: "text-status-partial", border: "border-status-partial/20" };
    case "Low": return { bg: "bg-status-compliant/10", text: "text-status-compliant", border: "border-status-compliant/20" };
    default: return { bg: "bg-status-unknown/10", text: "text-status-unknown", border: "border-status-unknown/20" };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Completed": return { bg: "bg-status-compliant/10", text: "text-status-compliant", border: "border-status-compliant/20" };
    case "In Progress": return { bg: "bg-status-partial/10", text: "text-status-partial", border: "border-status-partial/20" };
    case "Open": return { bg: "bg-status-unknown/10", text: "text-status-unknown", border: "border-status-unknown/20" };
    default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" };
  }
}

export default function PoamManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPoam, setSelectedPoam] = useState<any>(null);

  const filteredPoams = poamData.filter(poam => {
    const matchesSearch = poam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poam.weakness.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "all" || poam.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || poam.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalPoams = poamData.length;
  const openPoams = poamData.filter(p => p.status === "Open").length;
  const inProgressPoams = poamData.filter(p => p.status === "In Progress").length;
  const completedPoams = poamData.filter(p => p.status === "Completed").length;
  const overduePoams = poamData.filter(p => p.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">POA&M Management</h1>
          <p className="text-muted-foreground">Plan of Action and Milestones tracking and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New POA&M
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{totalPoams}</div>
            <p className="text-sm text-muted-foreground">Total POA&Ms</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-unknown">{openPoams}</div>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-partial">{inProgressPoams}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-compliant">{completedPoams}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{overduePoams}</div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search POA&Ms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* POA&M Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>POA&M List</CardTitle>
          <CardDescription>
            {filteredPoams.length} of {totalPoams} POA&Ms shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>POA&M ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Weakness</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPoams.map((poam) => {
                const severityStyle = getSeverityColor(poam.severity);
                const statusStyle = getStatusColor(poam.status);
                
                return (
                  <TableRow 
                    key={poam.id} 
                    className={poam.isOverdue ? "bg-destructive/5 hover:bg-destructive/10" : ""}
                  >
                    <TableCell className="font-mono text-sm">{poam.id}</TableCell>
                    <TableCell className="font-medium">
                      {poam.title}
                      {poam.isOverdue && (
                        <AlertTriangle className="inline ml-2 h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{poam.weakness}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`}
                      >
                        {poam.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {poam.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{poam.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-sm ${poam.isOverdue ? "text-destructive font-medium" : ""}`}>
                          {poam.scheduledCompletion}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedPoam(poam)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                              {poam.id} - {poam.title}
                            </DialogTitle>
                            <DialogDescription>
                              POA&M Details and Milestone Tracking
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Severity</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`}
                                >
                                  {poam.severity}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Status</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                >
                                  {poam.status}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{poam.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Control Weakness</h4>
                              <Badge variant="secondary">{poam.weakness}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Owner</h4>
                                <p className="text-sm text-muted-foreground">{poam.owner}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Due Date</h4>
                                <p className="text-sm text-muted-foreground">{poam.scheduledCompletion}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Resources</h4>
                                <p className="text-sm text-muted-foreground">{poam.resourcesRequired}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Milestones</h4>
                              <div className="space-y-2">
                                {poam.milestones.map((milestone, index) => (
                                  <div key={index} className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-sm text-foreground">{milestone}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                             <div className="flex space-x-2">
                               <Dialog>
                                 <DialogTrigger asChild>
                                   <Button variant="outline" size="sm">
                                     <Edit className="w-4 h-4 mr-2" />
                                     Edit POA&M
                                   </Button>
                                 </DialogTrigger>
                                 <DialogContent>
                                   <DialogHeader>
                                     <DialogTitle>Edit POA&M</DialogTitle>
                                     <DialogDescription>Modify POA&M details and milestones</DialogDescription>
                                   </DialogHeader>
                                   <div className="space-y-4">
                                     <p className="text-sm text-muted-foreground">
                                       POA&M editing functionality would be implemented here with form fields for:
                                     </p>
                                     <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                       <li>Title and description</li>
                                       <li>Severity and status</li>
                                       <li>Owner assignment</li>
                                       <li>Due dates and milestones</li>
                                       <li>Resource requirements</li>
                                     </ul>
                                   </div>
                                 </DialogContent>
                               </Dialog>
                               <Dialog>
                                 <DialogTrigger asChild>
                                   <Button variant="default" size="sm">
                                     Update Status
                                   </Button>
                                 </DialogTrigger>
                                 <DialogContent>
                                   <DialogHeader>
                                     <DialogTitle>Update Status</DialogTitle>
                                     <DialogDescription>Change POA&M status and add progress notes</DialogDescription>
                                   </DialogHeader>
                                   <div className="space-y-4">
                                     <div>
                                       <h4 className="font-semibold mb-2">Current Status</h4>
                                       <Badge 
                                         variant="outline" 
                                         className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                       >
                                         {poam.status}
                                       </Badge>
                                     </div>
                                     <p className="text-sm text-muted-foreground">
                                       Status update functionality would include:
                                     </p>
                                     <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                       <li>Status dropdown selection</li>
                                       <li>Progress notes textarea</li>
                                       <li>Milestone completion tracking</li>
                                       <li>File attachment support</li>
                                     </ul>
                                   </div>
                                 </DialogContent>
                               </Dialog>
                             </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}