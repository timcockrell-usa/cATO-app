import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { poamImportService } from '@/services/poamImportService';

interface POAMItem {
  id: string;
  poamId: string;
  description: string;
  status: string;
  severity: string;
  dueDate?: string;
  assignedTo?: string;
  relatedControls?: string[];
  source: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported?: number;
  updated?: number;
  errors?: string[];
}

export function POAMImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<POAMItem[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
    
    // Generate preview
    try {
      const content = await selectedFile.text();
      const allItems = poamImportService.parseCSV(content);
      setPreview(allItems.slice(0, 5)); // Show first 5 items for preview
    } catch (error) {
      console.error('Error parsing CSV preview:', error);
      toast({
        title: "Preview Error",
        description: "Could not parse CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const normalizeStatus = (status: string): string => {
    if (!status) return 'open';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complet')) return 'completed';
    if (statusLower.includes('ongoing') || statusLower.includes('progress')) return 'in-progress';
    if (statusLower.includes('accept')) return 'risk-accepted';
    if (statusLower.includes('plan')) return 'planned';
    return 'open';
  };

  const normalizeSeverity = (severity: string): string => {
    if (!severity) return 'medium';
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('high') || severityLower.includes('critical')) return 'high';
    if (severityLower.includes('low') || severityLower.includes('very low')) return 'low';
    return 'medium';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-purple-100 text-purple-800';
      case 'risk-accepted': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    try {
      // Use the service to process the file
      const result = await poamImportService.processFile(file);
      
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.imported || 0} new POAMs, updated ${result.updated || 0} existing POAMs.`,
        });
        
        // Clear file after successful import
        setFile(null);
        setPreview([]);
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Failed to import POAM data. Please check your connection and try again.'
      });
      toast({
        title: "Import Error",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateCSV = `Control Vulnerability Description,POA&M Item ID,Controls / APs,Office/Org,Security Checks,Resources Required,Scheduled Completion Date,Status,Comments,Raw Severity,Severity,Impact,Impact Description,Residual Risk Level,Recommendations
"Sample vulnerability description","POAM-001","AC-2,AC-3","IT Security Office","Monthly review","Security analyst","12/31/2024","Open","Initial assessment complete","High","High","High","Could allow unauthorized access","Medium","Implement additional access controls"`;
    
    const blob = new Blob([templateCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poam-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            POAM CSV Import
          </CardTitle>
          <CardDescription>
            Import Plan of Action and Milestones (POAMs) from a CSV file. 
            Use the template below or ensure your CSV includes the required columns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={importing}
            />
          </div>

          {file && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Preview (first 5 items):</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {preview.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.poamId}</Badge>
                      <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    {item.dueDate && (
                      <p className="text-xs text-gray-500">Due: {item.dueDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {file && (
            <Button 
              onClick={handleImport} 
              disabled={importing}
              className="w-full"
            >
              {importing ? 'Importing...' : `Import ${preview.length > 0 ? preview.length + '+' : ''} POAMs`}
            </Button>
          )}

          {importResult && (
            <Alert className={importResult.success ? 'border-green-200' : 'border-red-200'}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {importResult.message}
                {importResult.success && (
                  <div className="mt-2 text-sm">
                    <div>✅ Created: {importResult.imported || 0} new POAMs</div>
                    <div>🔄 Updated: {importResult.updated || 0} existing POAMs</div>
                  </div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">
                        View errors ({importResult.errors.length})
                      </summary>
                      <ul className="mt-1 text-xs space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="text-red-600">• {error}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
