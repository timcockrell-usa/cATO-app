import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Monitor, Database, Download, Trash2, Upload, Key, RefreshCw, FileText, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    autoRefresh: true,
    refreshInterval: '30',
    dataRetention: '90',
    exportFormat: 'json',
    darkMode: theme === 'dark'
  });

  const [eMassSettings, setEMassSettings] = useState({
    baseUrl: '',
    apiKey: '',
    username: '',
    systemId: '',
    connectionStatus: 'disconnected'
  });

  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }
  };

  const handleExportData = () => {
    console.log('Exporting user data...');
    // Implementation for data export
  };

  const handleDeleteAccount = () => {
    console.log('Account deletion requested...');
    // Implementation for account deletion
  };

  const handlePOAMImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      console.log('Importing POAM file:', file.name);
      
      // Validate file type
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        throw new Error('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.');
      }

      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock imported POAM entry
      const mockPoamEntry = {
        id: `POAM-${Date.now()}`,
        controlId: 'AC-2',
        finding: 'Account management procedures need enhancement',
        remediation: 'Implement automated account lifecycle management',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'Open',
        riskLevel: 'Medium',
        source: 'Imported'
      };

      // Store in localStorage for demo
      const existingPoams = JSON.parse(localStorage.getItem('cato_poam_items') || '[]');
      existingPoams.push(mockPoamEntry);
      localStorage.setItem('cato_poam_items', JSON.stringify(existingPoams));

      // Create notification for successful import
      const notification = {
        id: `poam-import-${Date.now()}`,
        title: 'POAM Import Successful',
        message: `Successfully imported POAM items from ${file.name}`,
        type: 'success' as const,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Store notification
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      localStorage.setItem('notifications', JSON.stringify([notification, ...existingNotifications]));

      alert(`POAM file "${file.name}" imported successfully! Added 1 new POAM item.`);
    } catch (error: any) {
      console.error('POAM import failed:', error);
      alert(`POAM import failed: ${error.message || 'Please check the file format.'}`);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleEMassConnectionTest = async () => {
    setSyncing(true);
    try {
      console.log('Testing eMass connection...');
      // Implementation for eMass connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEMassSettings(prev => ({ ...prev, connectionStatus: 'connected' }));
      alert('eMass connection successful!');
    } catch (error) {
      console.error('eMass connection failed:', error);
      setEMassSettings(prev => ({ ...prev, connectionStatus: 'error' }));
      alert('eMass connection failed. Please check your credentials.');
    } finally {
      setSyncing(false);
    }
  };

  const handleAzureDataSync = async () => {
    setSyncing(true);
    try {
      console.log('Syncing Azure data...');
      // This will call the Azure Function when implemented
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Azure data sync completed successfully!');
    } catch (error) {
      console.error('Azure data sync failed:', error);
      alert('Azure data sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and system configuration</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh dashboard data
                </p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
              />
            </div>
            
            {settings.autoRefresh && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval</Label>
                <Select 
                  value={settings.refreshInterval} 
                  onValueChange={(value) => handleSettingChange('refreshInterval', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive compliance alerts and updates via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser notifications for critical alerts
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly compliance summary reports
                </p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention Period</Label>
              <Select 
                value={settings.dataRetention} 
                onValueChange={(value) => handleSettingChange('dataRetention', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How long to keep audit logs and activity data
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select 
                value={settings.exportFormat} 
                onValueChange={(value) => handleSettingChange('exportFormat', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Default format for data exports
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Enabled
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Badge variant="outline">
                30 minutes
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Password Policy</Label>
                <p className="text-sm text-muted-foreground">Enterprise password requirements</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                Enforced
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Application Version</Label>
                <p className="text-sm text-muted-foreground">v2.1.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Database Status</Label>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Connected
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">License</Label>
                <p className="text-sm text-muted-foreground">Enterprise</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* POAM Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              POAM Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="poam-upload">Import POAM File</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload POAM files in Excel or CSV format to import Plan of Action & Milestones
              </p>
              <div className="flex items-center gap-3">
                <Input
                  id="poam-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handlePOAMImport}
                  disabled={importing}
                  className="w-auto"
                />
                <Button 
                  variant="outline" 
                  disabled={importing}
                  onClick={() => document.getElementById('poam-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? 'Importing...' : 'Select File'}
                </Button>
              </div>
              <Alert className="mt-3">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Supported formats: Excel (.xlsx, .xls) and CSV files. File should contain columns for Control ID, Finding Description, Remediation Plan, Due Date, and Status.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* eMass Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              eMass Integration
              <Badge 
                variant={eMassSettings.connectionStatus === 'connected' ? 'default' : 
                        eMassSettings.connectionStatus === 'error' ? 'destructive' : 'secondary'}
                className="ml-2"
              >
                {eMassSettings.connectionStatus === 'connected' ? 'Connected' :
                 eMassSettings.connectionStatus === 'error' ? 'Error' : 'Disconnected'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emass-url">eMass Base URL</Label>
                <Input
                  id="emass-url"
                  placeholder="https://your-emass-instance.mil"
                  value={eMassSettings.baseUrl}
                  onChange={(e) => setEMassSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emass-system-id">System ID</Label>
                <Input
                  id="emass-system-id"
                  placeholder="System ID"
                  value={eMassSettings.systemId}
                  onChange={(e) => setEMassSettings(prev => ({ ...prev, systemId: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emass-username">Username</Label>
                <Input
                  id="emass-username"
                  placeholder="Username"
                  value={eMassSettings.username}
                  onChange={(e) => setEMassSettings(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emass-api-key">API Key</Label>
                <Input
                  id="emass-api-key"
                  type="password"
                  placeholder="API Key"
                  value={eMassSettings.apiKey}
                  onChange={(e) => setEMassSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleEMassConnectionTest}
                disabled={syncing || !eMassSettings.baseUrl || !eMassSettings.apiKey}
              >
                <Key className="w-4 h-4 mr-2" />
                {syncing ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button 
                onClick={() => console.log('Save eMass settings')}
                disabled={!eMassSettings.baseUrl || !eMassSettings.apiKey}
              >
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Azure Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Azure Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Automatically sync compliance data from Azure Policy and other Azure services
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={handleAzureDataSync}
                  disabled={syncing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Azure Data'}
                </Button>
                <Button variant="outline">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Configure Auto-Sync
                </Button>
              </div>
              <Alert className="mt-3">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Azure Function integration will automatically pull compliance data from Azure Policy, Security Center, and other Azure services on a scheduled basis.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Data operations are logged and monitored for security compliance.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                Request Account Deletion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
