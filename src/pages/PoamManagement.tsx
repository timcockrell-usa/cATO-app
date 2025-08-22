import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Plus, 
  Edit, 
  Calendar,
  User,
  Upload,
  Filter,
  X,
  ArrowLeft
} from "lucide-react";
import { POAMImport } from "@/components/POAMImport";
import { useNavigationContext, filterUtils } from '@/services/navigationService';
import { useNavigate } from 'react-router-dom';

// POAM data will be loaded from Cosmos DB or imported via CSV
const poamData: any[] = [];

function getSeverityColor(severity: string) {
  switch (severity) {
    case "High": return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" };
    case "Medium": return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" };
    case "Low": return { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" };
    default: return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Completed": return { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" };
    case "In Progress": return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
    case "Open": return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" };
    default: return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
  }
}

export default function PoamManagement() {
  const navigate = useNavigate();
  const { getContext, clearContext } = useNavigationContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPoam, setSelectedPoam] = useState<any>(null);
  const [navigationFilter, setNavigationFilter] = useState<any>(null);

  // Handle navigation context on component mount
  useEffect(() => {
    const context = getContext();
    if (context) {
      setNavigationFilter(context);
      
      // Apply filter based on navigation context
      if (context.filterType === 'risk') {
        // Map risk levels to severity
        const severityMap: Record<string, string> = {
          'High': 'High',
          'Medium': 'Medium',
          'Low': 'Low'
        };
        if (severityMap[context.filterValue]) {
          setSelectedSeverity(severityMap[context.filterValue]);
        }
      } else if (context.filterType === 'status') {
        setSelectedStatus(context.filterValue);
      }
    }
  }, [getContext]);

  // Clear navigation filter
  const clearNavigationFilter = () => {
    setNavigationFilter(null);
    setSelectedSeverity("all");
    setSelectedStatus("all");
    clearContext();
  };

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
          {navigationFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New POA&M
          </Button>
        </div>
      </div>

      {/* Navigation Filter Alert */}
      {navigationFilter && (
        <Alert className="border-red-200 bg-red-50">
          <Filter className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Filtered by <strong>{navigationFilter.filterType}</strong>: {navigationFilter.filterValue}
              {navigationFilter.sourceChart && (
                <span className="text-sm text-muted-foreground ml-2">
                  (from {navigationFilter.sourceChart})
                </span>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNavigationFilter}
              className="h-6 px-2 text-red-600 hover:text-red-800"
            >
              <X className="w-3 h-3 mr-1" />
              Clear Filter
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalPoams}</div>
            <p className="text-sm text-muted-foreground">Total POA&Ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{openPoams}</div>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{inProgressPoams}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{completedPoams}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{overduePoams}</div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage POA&Ms</TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Import POA&Ms
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-6">

      {/* Search and Filters */}
      <Card>
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
      <Card>
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
                    className={poam.isOverdue ? "bg-red-50 hover:bg-red-100" : ""}
                  >
                    <TableCell className="font-mono text-sm">{poam.id}</TableCell>
                    <TableCell className="font-medium">
                      {poam.title}
                      {poam.isOverdue && (
                        <AlertTriangle className="inline ml-2 h-4 w-4 text-red-500" />
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
                        <span className={`text-sm ${poam.isOverdue ? "text-red-500 font-medium" : ""}`}>
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
                                <h4 className="font-semibold mb-2">Severity</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`}
                                >
                                  {poam.severity}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Status</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                >
                                  {poam.status}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{poam.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Control Weakness</h4>
                              <Badge variant="secondary">{poam.weakness}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Owner</h4>
                                <p className="text-sm text-muted-foreground">{poam.owner}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Due Date</h4>
                                <p className="text-sm text-muted-foreground">{poam.scheduledCompletion}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Resources</h4>
                                <p className="text-sm text-muted-foreground">{poam.resourcesRequired}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Milestones</h4>
                              <div className="space-y-2">
                                {poam.milestones.map((milestone, index) => (
                                  <div key={index} className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-sm">{milestone}</span>
                                  </div>
                                ))}
                              </div>
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
        </TabsContent>
        
        <TabsContent value="import" className="space-y-6">
          <POAMImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
