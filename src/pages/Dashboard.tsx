import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Shield, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown 
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
  const overallCompliance = 85.2;
  const ztaMaturity = 72.5;
  const activePoams = 23;
  const criticalRisks = 3;

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
        </div>
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
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>NIST 800-53 Compliance Status</CardTitle>
            <CardDescription>Control implementation status across all families</CardDescription>
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
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Trend Analysis */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Risk Trend Analysis</CardTitle>
            <CardDescription>POA&M risk levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="high" stackId="a" fill="#dc2626" />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
                <Bar dataKey="low" stackId="a" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ZTA Maturity Radar */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Zero Trust Architecture Maturity</CardTitle>
          <CardDescription>Maturity assessment across all seven pillars</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={ztaMaturityData}>
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis dataKey="pillar" tick={{ fill: "black", fontSize: 12 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#6b7280", fontSize: 10 }}
              />
              <Radar name="Traditional" dataKey="traditional" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              <Radar name="Advanced" dataKey="advanced" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Optimal" dataKey="optimal" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
