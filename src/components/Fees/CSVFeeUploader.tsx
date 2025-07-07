
import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';

interface FeeType {
  id: string;
  name: string;
  description: string;
}

const CSVFeeUploader: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [defaultFeeType, setDefaultFeeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  React.useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_types')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFeeTypes(data || []);
    } catch (error) {
      console.error('Error loading fee types:', error);
      toast({
        title: "Error",
        description: "Failed to load fee types",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive"
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      ['roll_number', 'fee_amount', 'due_date', 'fee_type'],
      ['RGCE001', '50000', '2024-12-31', 'Semester Fee'],
      ['RGCE002', '55000', '2024-12-31', 'Exam Fee'],
      ['RGCE003', '48000', '2024-12-31', 'Lab Fee']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fee_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['roll_number', 'fee_amount', 'due_date'];
    
    // Check required headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const record: any = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      // If no fee_type specified in CSV, use default
      if (!record.fee_type && defaultFeeType) {
        const feeType = feeTypes.find(ft => ft.id === defaultFeeType);
        record.fee_type = feeType?.name || '';
      }

      return record;
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !academicYear || !semester || !department) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and select a file",
        variant: "destructive"
      });
      return;
    }

    if (!user || !['admin', 'principal'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to upload fee data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const csvText = await selectedFile.text();
      const csvData = parseCSV(csvText);

      if (csvData.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      // Use the new function that handles fee types
      const { data, error } = await supabase.rpc('process_fee_csv_upload_with_types', {
        p_academic_year: academicYear,
        p_semester: parseInt(semester),
        p_department: department,
        p_csv_data: csvData,
        p_uploaded_by: user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; processed_count: number; error?: string };

      if (result.success) {
        setUploadResult({
          success: true,
          message: `Successfully processed ${result.processed_count} records`,
          processedCount: result.processed_count
        });
        
        toast({
          title: "Upload Successful",
          description: `Processed ${result.processed_count} fee records`,
        });

        // Reset form
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !['admin', 'principal'].includes(user.role)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>CSV Fee Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Download Template</h3>
            <p className="text-sm text-blue-700 mb-3">
              Download the CSV template with the correct format. Required columns: roll_number, fee_amount, due_date. 
              Optional: fee_type (if not provided, default fee type will be used).
            </p>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Upload Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">Computer Science</SelectItem>
                  <SelectItem value="ECE">Electronics & Communication</SelectItem>
                  <SelectItem value="MECH">Mechanical</SelectItem>
                  <SelectItem value="CIVIL">Civil</SelectItem>
                  <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                  <SelectItem value="IT">Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Fee Type
              </label>
              <Select value={defaultFeeType} onValueChange={setDefaultFeeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default type" />
                </SelectTrigger>
                <SelectContent>
                  {feeTypes.map(feeType => (
                    <SelectItem key={feeType.id} value={feeType.id}>
                      {feeType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto" />
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">Click to select CSV file</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                {uploadResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Upload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Fee Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVFeeUploader;
