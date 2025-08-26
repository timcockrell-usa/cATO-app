import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Edit,
  Trash2
} from "lucide-react";

interface POAM {
  id: string;
  title: string;
  description: string;
  controlId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  dueDate: string;
  createdDate: string;
  completedDate?: string;
  mitigationSteps: string[];
  resources: string[];
  evidence: string[];
}

const mockPOAMs: POAM[] = [
  {
    id: 'POAM-001',
    title: 'Implement Multi-Factor Authentication',
    description: 'Deploy MFA for all privileged accounts to meet IA-2 requirements',
    controlId: 'IA-2',
    riskLevel: 'high',
    status: 'in-progress',
    assignedTo: 'Security Team',
    dueDate: '2025-09-15',
    createdDate: '2025-07-01',
    mitigationSteps: [
      'Procure MFA solution',
      'Configure Azure AD for MFA',
      'Train users on MFA usage',
      'Implement for privileged accounts'
    ],
    resources: ['Azure AD Premium', 'Training materials'],
    evidence: ['MFA configuration screenshots', 'User training records']
  },
  {
    id: 'POAM-002',
    title: 'Enhance Audit Log Retention',
    description: 'Extend audit log retention to meet 1-year requirement for AU-11',
    controlId: 'AU-11',
    riskLevel: 'medium',
    status: 'open',
    assignedTo: 'IT Operations',
    dueDate: '2025-10-01',
    createdDate: '2025-08-01',
    mitigationSteps: [
      'Assess current log storage capacity',
      'Implement automated archiving',
      'Update retention policies',
      'Document procedures'
    ],
    resources: ['Additional storage', 'Log management tools'],
    evidence: []
  },
  {
    id: 'POAM-003',
    title: 'Update Incident Response Plan',
    description: 'Revise IR plan to include cloud-specific procedures for IR-8',
    controlId: 'IR-8',
    riskLevel: 'medium',
    status: 'completed',
    assignedTo: 'Security Office',
    dueDate: '2025-08-15',
    createdDate: '2025-06-01',
    completedDate: '2025-08-10',
    mitigationSteps: [
      'Review current IR plan',
      'Add cloud incident procedures',
      'Conduct tabletop exercise',
      'Finalize documentation'
    ],
    resources: ['External consultant', 'IR team time'],
    evidence: ['Updated IR plan', 'Tabletop exercise report']
  }
];

export default function POAMs() {
  const [poams, setPOAMs] = useState<POAM[]>(mockPOAMs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPOAM, setSelectedPOAM] = useState<POAM | null>(null);
  const [newPOAM, setNewPOAM] = useState({
    title: '',
    description: '',
    controlId: '',
    riskLevel: 'medium' as const,
    assignedTo: '',
    dueDate: ''
  });

  const filteredPOAMs = poams.filter(poam => {
    const matchesSearch = poam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poam.controlId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || poam.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || poam.riskLevel === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleAddPOAM = () => {
    const poam: POAM = {
      id: `POAM-${String(poams.length + 1).padStart(3, '0')}`,
      ...newPOAM,
      status: 'open',
      createdDate: new Date().toISOString().split('T')[0],
      mitigationSteps: [],
      resources: [],
      evidence: []
    };
    
    setPOAMs([...poams, poam]);
    setNewPOAM({
      title: '',
      description: '',
      controlId: '',
      riskLevel: 'medium',
      assignedTo: '',
      dueDate: ''
    });
    setIsAddDialogOpen(false);
  };

  const statusCounts = {
    total: poams.length,
    open: poams.filter(p => p.status === 'open').length,
    inProgress: poams.filter(p => p.status === 'in-progress').length,
    completed: poams.filter(p => p.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plan of Action & Milestones (POA&Ms)</h1>
          <p className="text-muted-foreground">Track remediation activities and compliance milestones</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add POA&M
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New POA&M</DialogTitle>
              <DialogDescription>
                Add a new Plan of Action & Milestone item to track remediation efforts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPOAM.title}
                  onChange={(e) => setNewPOAM({ ...newPOAM, title: e.target.value })}
                  placeholder="Brief description of the remediation activity"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPOAM.description}
                  onChange={(e) => setNewPOAM({ ...newPOAM, description: e.target.value })}
                  placeholder="Detailed description of the issue and planned remediation"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="controlId">NIST Control ID</Label>
                  <Input
                    id="controlId"
                    value={newPOAM.controlId}
                    onChange={(e) => setNewPOAM({ ...newPOAM, controlId: e.target.value })}
                    placeholder="e.g., AC-2, IA-5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select value={newPOAM.riskLevel} onValueChange={(value: any) => setNewPOAM({ ...newPOAM, riskLevel: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={newPOAM.assignedTo}
                    onChange={(e) => setNewPOAM({ ...newPOAM, assignedTo: e.target.value })}
                    placeholder="Team or individual responsible"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newPOAM.dueDate}
                    onChange={(e) => setNewPOAM({ ...newPOAM, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPOAM}>
                  Create POA&M
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total POA&Ms</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search POA&Ms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* POAMs Table */}
      <Card>
        <CardHeader>
          <CardTitle>POA&M Items ({filteredPOAMs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Control</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOAMs.map((poam) => (
                  <TableRow key={poam.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{poam.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{poam.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {poam.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {poam.controlId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRiskColor(poam.riskLevel)}>
                        {poam.riskLevel.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(poam.status)}>
                        {getStatusIcon(poam.status)}
                        <span className="ml-1">{poam.status.replace('-', ' ').toUpperCase()}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        {poam.assignedTo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        {new Date(poam.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
