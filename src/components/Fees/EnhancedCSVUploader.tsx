
import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface EnhancedCSVUploaderProps {
  onUploadComplete: () => void;
}

const EnhancedCSVUploader: React.FC<EnhancedCSVUploaderProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState('5');
  const [department, setDepartment] = useState('CSE');
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    previewData?: any[];
  } | null>(null);

  const generateSampleCSV = () => {
    const sampleData = [
      'roll_number,student_name,fee_type,fee_amount,due_date',
      '21CSE001,John Doe,Semester Fee,45000,2024-12-31',
      '21CSE002,Jane Smith,Semester Fee,45000,2024-12-31',
      '21CSE003,Bob Johnson,Semester Fee,45000,2024-12-31'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_fee_upload.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sample Downloaded",
      description: "Sample CSV template has been downloaded",
    });
  };

  const validateCSV = (file: File): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    data?: any[];
  }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const requiredFields = ['roll_number', 'fee_amount', 'due_date'];
          const errors: string[] = [];
          const warnings: string[] = [];
          const data: any[] = [];

          // Check headers
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          if (missingFields.length > 0) {
            errors.push(`Missing required columns: ${missingFields.join(', ')}`);
          }

          if (lines.length < 2) {
            errors.push('CSV file must contain at least one data row');
          }

          // Validate data rows
          for (let i = 1; i < lines.length && i < 6; i++) { // Preview first 5 rows
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            if (!row.roll_number) {
              errors.push(`Row ${i}: Missing roll number`);
            }
            
            if (!row.fee_amount || isNaN(parseFloat(row.fee_amount))) {
              errors.push(`Row ${i}: Invalid fee amount`);
            }
            
            if (!row.due_date) {
              errors.push(`Row ${i}: Missing due date`);
            } else {
              const date = new Date(row.due_date);
              if (isNaN(date.getTime())) {
                errors.push(`Row ${i}: Invalid due date format`);
              }
            }

            data.push(row);
          }

          if (lines.length > 6) {
            warnings.push(`File contains ${lines.length - 1} rows. Showing preview of first 5 rows.`);
          }

          resolve({
            valid: errors.length === 0,
            errors,
            warnings,
            data: errors.length === 0 ? data : undefined
          });
        } catch (error) {
          resolve({
            valid: false,
            errors: ['Failed to parse CSV file. Please check the format.'],
            warnings: []
          });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setValidationResults(null);
    
    // Validate the CSV
    const validation = await validateCSV(file);
    setValidationResults(validation);
  };

  const handleUpload = async () => {
    if (!selectedFile || !validationResults?.valid || !user) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const csvData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });

          setUploadProgress(50);

          const { data, error } = await supabase.rpc('process_fee_csv_upload_with_types', {
            p_academic_year: academicYear,
            p_semester: parseInt(semester),
            p_department: department as any,
            p_csv_data: csvData,
            p_uploaded_by: user.id
          });

          setUploadProgress(100);

          if (error) throw error;

          if (data?.success) {
            toast({
              title: "Upload Successful",
              description: `Processed ${data.processed_count} fee records successfully`,
            });
            
            setSelectedFile(null);
            setValidationResults(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            onUploadComplete();
          } else {
            throw new Error(data?.error || 'Upload failed');
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          toast({
            title: "Upload Failed",
            description: error instanceof Error ? error.message : "Failed to process CSV file",
            variant: "destructive"
          });
        }
      };

      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload CSV file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Enhanced CSV Fee Upload
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2024-25"
            />
          </div>
          
          <div>
            <Label htmlFor="semester">Semester</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger>
                <SelectValue />
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
          
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">Computer Science</SelectItem>
                <SelectItem value="ECE">Electronics & Communication</SelectItem>
                <SelectItem value="MECH">Mechanical</SelectItem>
                <SelectItem value="CIVIL">Civil</SelectItem>
                <SelectItem value="EEE">Electrical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={generateSampleCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sample CSV
            </Button>
            
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-3">
              {validationResults.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResults.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResults.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Warnings:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResults.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResults.valid && validationResults.data && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Validation Successful! Preview:</div>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {validationResults.data.slice(0, 3).map((row, index) => (
                        <div key={index} className="mb-1">
                          {row.roll_number} - ₹{row.fee_amount} (Due: {row.due_date})
                        </div>
                      ))}
                      {validationResults.data.length > 3 && (
                        <div className="text-gray-600">...and {validationResults.data.length - 3} more rows</div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!validationResults?.valid || uploading}
            className="w-full"
          >
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Fee Records
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCSVUploader;
