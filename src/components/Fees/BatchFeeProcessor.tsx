
import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

// Define proper types for CSV data
interface CSVRow {
  [key: string]: string | number;
}

interface ProcessResponse {
  success: boolean;
  message?: string;
  processed_count?: number;
  error?: string;
}

interface Student {
  id: string;
  name: string;
  roll_number: string;
  year: number;
  department: string;
}

interface BatchFeeProcessorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudents: Student[];
  onProcessComplete: () => void;
}

const BatchFeeProcessor: React.FC<BatchFeeProcessorProps> = ({ 
  open, 
  onOpenChange, 
  selectedStudents,
  onProcessComplete
}) => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processResults, setProcessResults] = useState<any>(null);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState('5');
  const [processingMode, setProcessingMode] = useState<'csv' | 'bulk'>('bulk');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data: CSVRow[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const generateSampleCSV = () => {
    const headers = ['roll_number', 'fee_amount', 'due_date', 'fee_type'];
    const sampleData = [
      ['21CS001', '75000', '2024-12-31', 'Semester Fee'],
      ['21CS002', '75000', '2024-12-31', 'Semester Fee'],
      ['21CS003', '75000', '2024-12-31', 'Semester Fee']
    ];
    
    const csvContent = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_fee_upload.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const processBulkFeeAssignment = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "No students selected for bulk fee assignment",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const student of selectedStudents) {
        try {
          const { error } = await supabase
            .from('fee_records')
            .insert({
              student_id: student.id,
              academic_year: academicYear,
              semester: parseInt(semester),
              original_amount: 75000, // Default amount
              final_amount: 75000,
              due_date: '2024-12-31',
              status: 'Pending'
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Error processing student ${student.roll_number}:`, error);
          errorCount++;
        }
      }

      setProcessResults({
        success: true,
        processed_count: successCount,
        error_count: errorCount,
        message: `Successfully processed ${successCount} students`
      });

      toast({
        title: "Success",
        description: `Bulk fee assignment completed. ${successCount} students processed successfully.`,
      });

      onProcessComplete();
    } catch (error: any) {
      console.error('Error in bulk processing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk fee assignment",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const processCSVUpload = async () => {
    if (!csvFile || csvData.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a valid CSV file",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Convert CSV data to proper format for the database function
      const processedData = csvData.map(row => ({
        roll_number: row.roll_number,
        fee_amount: row.fee_amount,
        due_date: row.due_date,
        fee_type: row.fee_type || 'Semester Fee'
      }));

      const { data, error } = await supabase.rpc('process_fee_csv_upload_with_types', {
        p_academic_year: academicYear,
        p_semester: parseInt(semester),
        p_department: 'CSE', // You might want to make this dynamic
        p_csv_data: processedData as any, // Type assertion for JSONB
        p_uploaded_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      // Properly type the response with typecasting
      const response = data as unknown as ProcessResponse;
      
      setProcessResults(response);

      toast({
        title: "Success",
        description: `CSV processed successfully. ${response.processed_count || 0} records processed.`,
      });

      onProcessComplete();
    } catch (error: any) {
      console.error('Error processing CSV:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process CSV file",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Fee Processor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Processing Mode Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${
                processingMode === 'bulk' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setProcessingMode('bulk')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Bulk Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Assign fees to {selectedStudents.length} selected students with default amounts
                </p>
                <Badge variant="outline" className="mt-2">
                  {selectedStudents.length} students selected
                </Badge>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                processingMode === 'csv' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setProcessingMode('csv')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  CSV Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Upload a CSV file with custom fee amounts and details
                </p>
                <Badge variant="outline" className="mt-2">
                  {csvData.length} records loaded
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Common Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academic-year">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CSV Upload Section */}
          {processingMode === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="csv-file">Upload CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={generateSampleCSV}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Sample
                </Button>
              </div>

              {csvData.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">CSV Preview ({csvData.length} records)</h4>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(csvData[0] || {}).map(key => (
                            <th key={key} className="text-left p-2">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="p-2">{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bulk Assignment Preview */}
          {processingMode === 'bulk' && selectedStudents.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Selected Students ({selectedStudents.length})</h4>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Roll Number</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Year</th>
                      <th className="text-left p-2">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudents.slice(0, 5).map((student, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{student.roll_number}</td>
                        <td className="p-2">{student.name}</td>
                        <td className="p-2">{student.year}</td>
                        <td className="p-2">{student.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedStudents.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ... and {selectedStudents.length - 5} more students
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Processing Results */}
          {processResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {processResults.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  Processing Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={processResults.success ? "default" : "destructive"}>
                      {processResults.success ? "Success" : "Error"}
                    </Badge>
                  </div>
                  {processResults.processed_count && (
                    <div className="flex justify-between">
                      <span>Records Processed:</span>
                      <span className="font-medium">{processResults.processed_count}</span>
                    </div>
                  )}
                  {processResults.error_count && (
                    <div className="flex justify-between">
                      <span>Errors:</span>
                      <span className="font-medium text-red-600">{processResults.error_count}</span>
                    </div>
                  )}
                  {processResults.message && (
                    <p className="text-sm text-gray-600">{processResults.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Progress */}
          {processing && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span>Processing...</span>
                </div>
                <Progress value={45} className="mt-4" />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={processingMode === 'csv' ? processCSVUpload : processBulkFeeAssignment}
              disabled={processing || (processingMode === 'csv' && csvData.length === 0) || (processingMode === 'bulk' && selectedStudents.length === 0)}
            >
              {processing ? 'Processing...' : 'Process Fees'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchFeeProcessor;
