import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  BookOpen, 
  Wrench, 
  Building, 
  Zap, 
  User, 
  Shield, 
  TrendingUp,
  Plus,
  Edit
} from "lucide-react";

// DOTmLPF-P Framework Categories
const dotmlpfCategories = [
  {
    id: "doctrine",
    name: "Doctrine",
    icon: BookOpen,
    description: "Policies, procedures, and guidance",
    color: "text-blue-500",
    enablers: [
      {
        id: "D001",
        name: "Zero Trust Policy Framework",
        status: "complete",
        owner: { name: "Sarah Johnson", avatar: "SJ", role: "Policy Lead" },
        description: "Comprehensive ZTA policy framework aligned with DoD guidance",
        priority: "high",
        dueDate: "2024-03-15"
      },
      {
        id: "D002", 
        name: "Incident Response Procedures",
        status: "in-progress",
        owner: { name: "Mike Chen", avatar: "MC", role: "Security Manager" },
        description: "Updated IR procedures for ZTA environment",
        priority: "medium",
        dueDate: "2024-04-30"
      },
      {
        id: "D003",
        name: "Risk Management Framework",
        status: "planned",
        owner: { name: "Lisa Park", avatar: "LP", role: "Risk Manager" },
        description: "RMF updates for continuous monitoring",
        priority: "high",
        dueDate: "2024-05-15"
      }
    ]
  },
  {
    id: "organization",
    name: "Organization",
    icon: Users,
    description: "Roles, responsibilities, and structure",
    color: "text-green-500",
    enablers: [
      {
        id: "O001",
        name: "Security Operations Center",
        status: "complete",
        owner: { name: "David Kumar", avatar: "DK", role: "SOC Manager" },
        description: "24/7 SOC operations for continuous monitoring",
        priority: "high",
        dueDate: "2024-02-01"
      },
      {
        id: "O002",
        name: "Identity Management Team",
        status: "in-progress", 
        owner: { name: "Jennifer Lee", avatar: "JL", role: "IAM Specialist" },
        description: "Dedicated IAM team for ZTA implementation",
        priority: "medium",
        dueDate: "2024-04-15"
      }
    ]
  },
  {
    id: "training",
    name: "Training",
    icon: TrendingUp,
    description: "Education and skill development",
    color: "text-purple-500",
    enablers: [
      {
        id: "T001",
        name: "ZTA Awareness Training",
        status: "complete",
        owner: { name: "Amy Rodriguez", avatar: "AR", role: "Training Coordinator" },
        description: "Organization-wide ZTA awareness program",
        priority: "high",
        dueDate: "2024-01-31"
      },
      {
        id: "T002",
        name: "Advanced Security Training",
        status: "in-progress",
        owner: { name: "Robert Kim", avatar: "RK", role: "Technical Trainer" },
        description: "Advanced cybersecurity skills for technical staff",
        priority: "medium",
        dueDate: "2024-06-30"
      }
    ]
  },
  {
    id: "materiel",
    name: "Materiel",
    icon: Wrench,
    description: "Tools, equipment, and technology",
    color: "text-orange-500",
    enablers: [
      {
        id: "M001",
        name: "SIEM Platform Upgrade",
        status: "complete",
        owner: { name: "Tom Wilson", avatar: "TW", role: "Infrastructure Lead" },
        description: "Azure Sentinel deployment and configuration",
        priority: "high",
        dueDate: "2024-02-15"
      },
      {
        id: "M002",
        name: "Endpoint Detection Response",
        status: "in-progress",
        owner: { name: "Priya Patel", avatar: "PP", role: "Endpoint Specialist" },
        description: "Microsoft Defender for Endpoint deployment",
        priority: "high",
        dueDate: "2024-04-01"
      },
      {
        id: "M003",
        name: "Network Security Tools",
        status: "planned",
        owner: { name: "Carlos Martinez", avatar: "CM", role: "Network Engineer" },
        description: "Advanced network monitoring and protection tools",
        priority: "medium",
        dueDate: "2024-07-15"
      }
    ]
  },
  {
    id: "leadership",
    name: "Leadership",
    icon: Shield,
    description: "Management support and governance",
    color: "text-red-500",
    enablers: [
      {
        id: "L001",
        name: "Executive Sponsorship",
        status: "complete",
        owner: { name: "General Adams", avatar: "GA", role: "CIO" },
        description: "Senior leadership support for ZTA initiative",
        priority: "high",
        dueDate: "2024-01-01"
      },
      {
        id: "L002",
        name: "Governance Board",
        status: "complete",
        owner: { name: "Colonel Smith", avatar: "CS", role: "Deputy CIO" },
        description: "ZTA governance and oversight board established",
        priority: "high",
        dueDate: "2024-01-15"
      }
    ]
  },
  {
    id: "personnel",
    name: "Personnel",
    icon: User,
    description: "Staffing and human resources",
    color: "text-cyan-500",
    enablers: [
      {
        id: "P001",
        name: "Security Clearance Processing",
        status: "in-progress",
        owner: { name: "Helen Davis", avatar: "HD", role: "HR Manager" },
        description: "Expedited clearance processing for key positions",
        priority: "high",
        dueDate: "2024-05-01"
      },
      {
        id: "P002",
        name: "Contractor Integration",
        status: "planned",
        owner: { name: "Mark Thompson", avatar: "MT", role: "Contracting Officer" },
        description: "Integration of contractor personnel into ZTA framework",
        priority: "medium",
        dueDate: "2024-06-15"
      }
    ]
  },
  {
    id: "facilities",
    name: "Facilities",
    icon: Building,
    description: "Physical infrastructure and space",
    color: "text-yellow-500",
    enablers: [
      {
        id: "F001",
        name: "Data Center Modernization",
        status: "in-progress",
        owner: { name: "Steve Brown", avatar: "SB", role: "Facilities Manager" },
        description: "Physical security upgrades for data centers",
        priority: "medium",
        dueDate: "2024-08-30"
      }
    ]
  },
  {
    id: "policy",
    name: "Policy",
    icon: BookOpen,
    description: "Regulations and compliance requirements",
    color: "text-indigo-500",
    enablers: [
      {
        id: "PL001",
        name: "Compliance Mapping",
        status: "complete",
        owner: { name: "Diana Lee", avatar: "DL", role: "Compliance Officer" },
        description: "Mapping of ZTA requirements to existing policies",
        priority: "high",
        dueDate: "2024-03-01"
      },
      {
        id: "PL002",
        name: "Policy Updates",
        status: "in-progress",
        owner: { name: "Frank Garcia", avatar: "FG", role: "Policy Analyst" },
        description: "Updates to existing policies for ZTA alignment",
        priority: "medium",
        dueDate: "2024-05-30"
      }
    ]
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case "complete": return { bg: "bg-status-compliant/10", text: "text-status-compliant", border: "border-status-compliant/20" };
    case "in-progress": return { bg: "bg-status-partial/10", text: "text-status-partial", border: "border-status-partial/20" };
    case "planned": return { bg: "bg-status-unknown/10", text: "text-status-unknown", border: "border-status-unknown/20" };
    default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" };
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high": return "text-destructive";
    case "medium": return "text-status-partial";
    case "low": return "text-status-compliant";
    default: return "text-muted-foreground";
  }
}

export default function ExecutionEnablers() {
  const [selectedEnabler, setSelectedEnabler] = useState<any>(null);

  const totalEnablers = dotmlpfCategories.reduce((sum, cat) => sum + cat.enablers.length, 0);
  const completeEnablers = dotmlpfCategories.reduce((sum, cat) => sum + cat.enablers.filter(e => e.status === "complete").length, 0);
  const inProgressEnablers = dotmlpfCategories.reduce((sum, cat) => sum + cat.enablers.filter(e => e.status === "in-progress").length, 0);
  const completionRate = Math.round((completeEnablers / totalEnablers) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Execution Enablers</h1>
          <p className="text-muted-foreground">DOTmLPF-P framework implementation status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Enabler
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{totalEnablers}</div>
            <p className="text-sm text-muted-foreground">Total Enablers</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-compliant">{completeEnablers}</div>
            <p className="text-sm text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-status-partial">{inProgressEnablers}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* DOTmLPF-P Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {dotmlpfCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <Card key={category.id} className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <CategoryIcon className={`w-5 h-5 mr-2 ${category.color}`} />
                  {category.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {category.enablers.filter(e => e.status === "complete").length} of {category.enablers.length} complete
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round((category.enablers.filter(e => e.status === "complete").length / category.enablers.length) * 100)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.enablers.map((enabler) => {
                  const statusStyle = getStatusColor(enabler.status);
                  return (
                    <Dialog key={enabler.id}>
                      <DialogTrigger asChild>
                        <Card 
                          className="p-3 cursor-pointer hover:shadow-md transition-all duration-200 bg-card/50"
                          onClick={() => setSelectedEnabler(enabler)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                                    {enabler.id}
                                  </code>
                                  <Badge 
                                    variant="outline" 
                                    className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                  >
                                    {enabler.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-medium text-foreground leading-tight">
                                  {enabler.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {enabler.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={enabler.owner.avatar} />
                                  <AvatarFallback className="text-xs">{enabler.owner.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{enabler.owner.name}</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(enabler.priority)}`}
                              >
                                {enabler.priority}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <CategoryIcon className={`w-5 h-5 mr-2 ${category.color}`} />
                            {enabler.id} - {enabler.name}
                          </DialogTitle>
                          <DialogDescription>
                            {category.name} • {enabler.owner.role}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Status</h4>
                              <Badge 
                                variant="outline" 
                                className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                              >
                                {enabler.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Priority</h4>
                              <Badge 
                                variant="outline" 
                                className={getPriorityColor(enabler.priority)}
                              >
                                {enabler.priority}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{enabler.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Owner</h4>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={enabler.owner.avatar} />
                                <AvatarFallback>{enabler.owner.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">{enabler.owner.name}</p>
                                <p className="text-xs text-muted-foreground">{enabler.owner.role}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Due Date</h4>
                            <p className="text-sm text-muted-foreground">{enabler.dueDate}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="default" size="sm">
                              Update Status
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}