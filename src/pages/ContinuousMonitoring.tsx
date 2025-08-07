import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Shield, 
  Target,
  ArrowRight,
  Clock,
  CheckCircle
} from "lucide-react";

const ContinuousMonitoring = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Continuous Monitoring</h1>
          <p className="text-muted-foreground">Real-time security posture assessment and compliance monitoring</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Activity className="w-3 h-3 mr-1" />
          Monitoring Active
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Controls</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-green-600">
              <CheckCircle className="inline w-3 h-3 mr-1" />
              Compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-xs text-blue-600">
              <Clock className="inline w-3 h-3 mr-1" />
              Real-time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Low</div>
            <p className="text-xs text-yellow-600">
              <Target className="inline w-3 h-3 mr-1" />
              Current Status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-green-600">
              <CheckCircle className="inline w-3 h-3 mr-1" />
              FedRAMP High
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navigation to Key Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Monitoring Dashboard</CardTitle>
            <CardDescription>Access real-time security metrics and compliance status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/" className="block">
              <Button variant="outline" className="w-full justify-between">
                Executive Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              View comprehensive security posture, compliance metrics, and risk assessments in real-time.
            </p>
          </CardContent>
        </Card>

        {/* POA&M Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Plan of Action & Milestones</CardTitle>
            <CardDescription>Track and manage security findings and remediation efforts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/poam" className="block">
              <Button variant="outline" className="w-full justify-between">
                POA&M Management
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Monitor active POA&Ms, track remediation progress, and manage security findings.
            </p>
          </CardContent>
        </Card>

        {/* NIST Controls */}
        <Card>
          <CardHeader>
            <CardTitle>NIST 800-53 Controls</CardTitle>
            <CardDescription>Monitor implementation status of all security controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/nist" className="block">
              <Button variant="outline" className="w-full justify-between">
                Security Controls
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Review control implementation status, evidence, and compliance assessments.
            </p>
          </CardContent>
        </Card>

        {/* Zero Trust */}
        <Card>
          <CardHeader>
            <CardTitle>Zero Trust Architecture</CardTitle>
            <CardDescription>Monitor ZTA implementation across all seven pillars</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/zta" className="block">
              <Button variant="outline" className="w-full justify-between">
                ZTA Assessment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Track Zero Trust maturity progression and implementation activities.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Information Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Continuous Monitoring Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            The cATO Command Center provides continuous monitoring capabilities through integrated dashboards, 
            real-time metrics, and automated compliance tracking. All monitoring data is collected from Azure 
            Security Center, Application Insights, and custom compliance automation tools.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900">Real-time Monitoring</h4>
              <p className="text-blue-700">24/7 security posture assessment</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Automated Compliance</h4>
              <p className="text-blue-700">Continuous control validation</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Risk Management</h4>
              <p className="text-blue-700">Proactive threat detection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContinuousMonitoring;
