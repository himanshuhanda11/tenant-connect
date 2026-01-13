import { useState, useRef, ChangeEvent } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

interface ParsedRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  field: string;
}

const FIELD_OPTIONS = [
  { value: '', label: 'Skip this column' },
  { value: 'wa_id', label: 'Phone Number *', required: true },
  { value: 'name', label: 'Full Name' },
  { value: 'first_name', label: 'First Name' },
  { value: 'country', label: 'Country' },
  { value: 'language', label: 'Language' },
  { value: 'source', label: 'Source' },
  { value: 'tags', label: 'Tags (comma-separated)' },
  { value: 'notes', label: 'Notes' },
];

export default function ContactImports() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, errors: 0, duplicates: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        toast.error('CSV file must have headers and at least one data row');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      const data = lines.slice(1, 21).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
        const row: ParsedRow = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvData(data);

      // Auto-map columns based on header names
      const autoMappings: ColumnMapping[] = headers.map((header) => {
        const lowerHeader = header.toLowerCase();
        let field = '';

        if (lowerHeader.includes('phone') || lowerHeader.includes('wa_id') || lowerHeader.includes('number')) {
          field = 'wa_id';
        } else if (lowerHeader === 'name' || lowerHeader.includes('full name')) {
          field = 'name';
        } else if (lowerHeader.includes('first')) {
          field = 'first_name';
        } else if (lowerHeader.includes('country')) {
          field = 'country';
        } else if (lowerHeader.includes('language')) {
          field = 'language';
        } else if (lowerHeader.includes('source')) {
          field = 'source';
        } else if (lowerHeader.includes('tag')) {
          field = 'tags';
        }

        return { csvColumn: header, field };
      });

      setColumnMappings(autoMappings);
      setStep('mapping');
    };
    reader.readAsText(selectedFile);
  };

  const handleMapping = (csvColumn: string, field: string) => {
    setColumnMappings((prev) =>
      prev.map((m) => (m.csvColumn === csvColumn ? { ...m, field } : m))
    );
  };

  const hasPhoneMapping = columnMappings.some((m) => m.field === 'wa_id');

  const startImport = async () => {
    setStep('importing');
    
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setImportProgress(i);
    }

    // Mock results
    setImportResults({
      success: csvData.length - 2,
      errors: 1,
      duplicates: 1,
    });
    setStep('complete');
    toast.success('Import completed!');
  };

  const resetImport = () => {
    setStep('upload');
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMappings([]);
    setImportProgress(0);
    setImportResults({ success: 0, errors: 0, duplicates: 0 });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Import Contacts</h1>
          <p className="text-muted-foreground">
            Import contacts from a CSV file
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {['upload', 'mapping', 'preview', 'importing', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > i ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 4 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file with your contacts. The first row should contain column headers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 cursor-pointer transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">CSV files only</p>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-sm">Tips for successful import:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Include column headers in the first row</li>
                  <li>• Phone numbers should be in E.164 format (e.g., +971501234567)</li>
                  <li>• Tags can be comma-separated in a single column</li>
                  <li>• Maximum 10,000 contacts per import</li>
                </ul>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Sample CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <Card>
            <CardHeader>
              <CardTitle>Map Columns</CardTitle>
              <CardDescription>
                Match your CSV columns to contact fields. Phone number is required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {columnMappings.map((mapping) => (
                  <div key={mapping.csvColumn} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <Badge variant="secondary" className="font-mono">
                        {mapping.csvColumn}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="w-1/2">
                      <Select
                        value={mapping.field}
                        onValueChange={(v) => handleMapping(mapping.csvColumn, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                {!hasPhoneMapping && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Phone number mapping is required. Please map a column to "Phone Number".
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={resetImport}>
                    Cancel
                  </Button>
                  <Button onClick={() => setStep('preview')} disabled={!hasPhoneMapping}>
                    Continue to Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Import</CardTitle>
              <CardDescription>
                Review the first 20 rows before importing. Total rows: {csvData.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnMappings
                        .filter((m) => m.field)
                        .map((m) => (
                          <TableHead key={m.csvColumn}>
                            {FIELD_OPTIONS.find((f) => f.value === m.field)?.label || m.field}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        {columnMappings
                          .filter((m) => m.field)
                          .map((m) => (
                            <TableCell key={m.csvColumn} className="font-mono text-sm">
                              {row[m.csvColumn] || '-'}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Back to Mapping
                </Button>
                <Button onClick={startImport}>
                  Start Import
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <Card>
            <CardHeader>
              <CardTitle>Importing Contacts...</CardTitle>
              <CardDescription>
                Please wait while we import your contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={importProgress} className="h-2" />
              <p className="text-center text-muted-foreground">
                {importProgress}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Import Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-700">{importResults.success}</p>
                  <p className="text-sm text-green-600">Imported</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                  <p className="text-2xl font-bold text-amber-700">{importResults.duplicates}</p>
                  <p className="text-sm text-amber-600">Duplicates</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-center">
                  <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-700">{importResults.errors}</p>
                  <p className="text-sm text-red-600">Errors</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={resetImport}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Import More
                </Button>
                <Button onClick={() => window.location.href = '/contacts'}>
                  View Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
