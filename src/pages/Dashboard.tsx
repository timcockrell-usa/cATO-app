import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Shield, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  MousePointer
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { chartClickHandlers } from '@/services/navigationService';

// Mock data for dashboard
const complianceData = [
  { name: "Compliant", value: 142, color: "#16a34a" },
  { name: "Partial", value: 38, color: "#f59e0b" },
  { name: "Non-Compliant", value: 12, color: "#dc2626" },
  { name: "Unknown", value: 8, color: "#6b7280" }
];

const ztaMaturityData = [
  { pillar: "Identity", traditional: 65, advanced: 45, optimal: 25 },
  { pillar: "Device", traditional: 70, advanced: 55, optimal: 30 },
  { pillar: "Network", traditional: 80, advanced: 40, optimal: 20 },
  { pillar: "App/Workload", traditional: 75, advanced: 50, optimal: 35 },
  { pillar: "Data", traditional: 60, advanced: 45, optimal: 40 },
  { pillar: "Visibility", traditional: 85, advanced: 60, optimal: 45 },
  { pillar: "Analytics", traditional: 55, advanced: 35, optimal: 25 }
];

const riskTrendData = [
  { month: "Jan", high: 15, medium: 32, low: 8 },
  { month: "Feb", high: 12, medium: 28, low: 6 },
  { month: "Mar", high: 8, medium: 25, low: 4 },
  { month: "Apr", high: 6, medium: 22, low: 3 },
  { month: "May", high: 4, medium: 18, low: 2 },
  { month: "Jun", high: 3, medium: 15, low: 1 }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const overallCompliance = 85.2;
  const ztaMaturity = 72.5;
  const activePoams = 23;
  const criticalRisks = 3;

  // Custom tooltip for clickable charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">{`${label || payload[0].name}`}</p>
          <p className="text-sm text-blue-600">
            <MousePointer className="inline w-3 h-3 mr-1" />
            Click to view details
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-muted-foreground">Real-time compliance and security posture overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            cATO Active
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <MousePointer className="w-3 h-3 mr-1" />
            Click charts to explore
          </Badge>
        </div>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-16 text-left justify-start hover:bg-blue-50 transition-colors"
          onClick={() => chartClickHandlers.handleDashboardTabClick('nist-controls', navigate)}
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">NIST Controls</div>
              <div className="text-xs text-muted-foreground">View all controls</div>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
        </Button>

        <Button 
          variant="outline"
          className="h-16 text-left justify-start hover:bg-green-50 transition-colors"
          onClick={() => chartClickHandlers.handleDashboardTabClick('zero-trust', navigate)}
        >
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-medium">Zero Trust</div>
              <div className="text-xs text-muted-foreground">Maturity assessment</div>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
        </Button>

        <Button 
          variant="outline"
          className="h-16 text-left justify-start hover:bg-yellow-50 transition-colors"
          onClick={() => chartClickHandlers.handleDashboardTabClick('poam', navigate)}
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <div className="font-medium">POA&M</div>
              <div className="text-xs text-muted-foreground">Risk management</div>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
        </Button>

        <Button 
          variant="outline"
          className="h-16 text-left justify-start hover:bg-purple-50 transition-colors"
          onClick={() => chartClickHandlers.handleDashboardTabClick('execution-enablers', navigate)}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <div>
              <div className="font-medium">Enablers</div>
              <div className="text-xs text-muted-foreground">DOTmLPF-P tracking</div>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
          </div>
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NIST Compliance</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overallCompliance}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.3% from last month
            </div>
            <Progress value={overallCompliance} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ZTA Maturity</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{ztaMaturity}%</div>
            <div className="flex items-center text-xs text-blue-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5.1% from last month
            </div>
            <Progress value={ztaMaturity} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active POA&Ms</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activePoams}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="w-3 h-3 mr-1" />
              -8 from last month
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              3 overdue • 8 due this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{criticalRisks}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="w-3 h-3 mr-1" />
              -2 from last month
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              1 requires immediate action
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NIST Compliance Breakdown */}
        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              NIST 800-53 Compliance Status
              <MousePointer className="w-4 h-4 ml-2 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Control implementation status across all families - Click segments to filter</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => chartClickHandlers.handleNistComplianceClick(data, navigate)}
                  style={{ cursor: 'pointer' }}
                >
                  {complianceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Trend Analysis */}
        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              Risk Trend Analysis
              <MousePointer className="w-4 h-4 ml-2 text-muted-foreground" />
            </CardTitle>
            <CardDescription>POA&M risk levels over time - Click bars to filter POA&M items</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="high" 
                  stackId="a" 
                  fill="#dc2626" 
                  onClick={(data) => chartClickHandlers.handleRiskTrendClick({ payload: { high: data } }, navigate)}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="medium" 
                  stackId="a" 
                  fill="#f59e0b"
                  onClick={(data) => chartClickHandlers.handleRiskTrendClick({ payload: { medium: data } }, navigate)}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="low" 
                  stackId="a" 
                  fill="#16a34a"
                  onClick={(data) => chartClickHandlers.handleRiskTrendClick({ payload: { low: data } }, navigate)}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ZTA Maturity Radar */}
      <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center">
            Zero Trust Architecture Maturity
            <MousePointer className="w-4 h-4 ml-2 text-muted-foreground" />
          </CardTitle>
          <CardDescription>Maturity assessment across all seven pillars - Click to explore specific pillars</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={ztaMaturityData}>
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis 
                dataKey="pillar" 
                tick={{ fill: "black", fontSize: 12, cursor: 'pointer' }}
                onClick={(data) => chartClickHandlers.handleZTAMaturityClick(data, navigate)}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#6b7280", fontSize: 10 }}
              />
              <Radar 
                name="Traditional" 
                dataKey="traditional" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.2}
                style={{ cursor: 'pointer' }}
                onClick={(data) => chartClickHandlers.handleZTAMaturityClick(data, navigate)}
              />
              <Radar 
                name="Advanced" 
                dataKey="advanced" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.2}
                style={{ cursor: 'pointer' }}
                onClick={(data) => chartClickHandlers.handleZTAMaturityClick(data, navigate)}
              />
              <Radar 
                name="Optimal" 
                dataKey="optimal" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
                style={{ cursor: 'pointer' }}
                onClick={(data) => chartClickHandlers.handleZTAMaturityClick(data, navigate)}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
