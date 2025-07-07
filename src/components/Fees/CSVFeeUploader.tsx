
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Database } from '../../integrations/supabase/types';

type Department = Database['public']['Enums']['department'];

interface FeeType {
  id: string;
  name: string;
  description: string;
}

const CSVFeeUploader: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState<Department | 'none'>('none');
  const [defaultFeeType, setDefaultFeeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);

  // Load fee types
  useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_types')
        .select('*')
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
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      
      return obj;
    });
    
    return data;
  };

  const validateCSVData = (data: any[]) => {
    const requiredFields = ['roll_number', 'fee_amount', 'due_date'];
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field]) {
          errors.push(`Row ${index + 2}: Missing ${field}`);
        }
      });
      
      // Validate fee amount is a number
      if (row.fee_amount && isNaN(parseFloat(row.fee_amount))) {
        errors.push(`Row ${index + 2}: Invalid fee amount`);
      }
      
      // Validate due date format
      if (row.due_date && !Date.parse(row.due_date)) {
        errors.push(`Row ${index + 2}: Invalid due date format`);
      }
    });
    
    return errors;
  };

  const handleUpload = async () => {
    if (!selectedFile || !semester || department === 'none') {
      toast({
        title: "Missing Information",
        description: "Please select a file, semester, and department",
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
      
      // Validate CSV data
      const validationErrors = validateCSVData(csvData);
      if (validationErrors.length > 0) {
        toast({
          title: "CSV Validation Failed",
          description: `Found ${validationErrors.length} errors. Please check your CSV file.`,
          variant: "destructive"
        });
        console.error('CSV validation errors:', validationErrors);
        return;
      }

      // Process the CSV data
      const { data, error } = await supabase.rpc('process_fee_csv_upload_with_types', {
        p_academic_year: academicYear,
        p_semester: parseInt(semester),
        p_department: department as Department,
        p_csv_data: csvData,
        p_uploaded_by: user.id
      });

      if (error) throw error;

      setUploadResult(data);
      
      if (data.success) {
        toast({
          title: "Upload Successful",
          description: `Processed ${data.processed_count} fee records`,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process CSV file",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canUploadCSV = user?.role && ['admin', 'principal'].includes(user.role);

  if (!canUploadCSV) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have permission to upload CSV files.</p>
            <p className="text-sm">Contact an administrator for access.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            CSV Fee Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                  <SelectItem value="3">Semester 3</SelectItem>
                  <SelectItem value="4">Semester 4</SelectItem>
                  <SelectItem value="5">Semester 5</SelectItem>
                  <SelectItem value="6">Semester 6</SelectItem>
                  <SelectItem value="7">Semester 7</SelectItem>
                  <SelectItem value="8">Semester 8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <Select value={department} onValueChange={(value: Department | 'none') => setDepartment(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                  <SelectItem value="ECE">Electronics & Communication</SelectItem>
                  <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                  <SelectItem value="CIVIL">Civil Engineering</SelectItem>
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
                  <SelectValue placeholder="Select default fee type" />
                </SelectTrigger>
                <SelectContent>
                  {feeTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'No file selected'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose CSV File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={loading || !selectedFile || !semester || department === 'none'}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Upload CSV'}
          </Button>
        </CardContent>
      </Card>

      {/* CSV Format Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Required Columns:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>roll_number</strong> - Student's roll number</li>
                <li><strong>fee_amount</strong> - Fee amount (numeric)</li>
                <li><strong>due_date</strong> - Due date (YYYY-MM-DD format)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Optional Columns:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>fee_type</strong> - Specific fee type name</li>
                <li><strong>student_name</strong> - Student name (for reference)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <h3 className="font-medium">
                {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
              </h3>
            </div>
            
            <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                {uploadResult.success ? (
                  `Successfully processed ${uploadResult.processed_count} fee records.`
                ) : (
                  uploadResult.error || 'An error occurred during upload.'
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CSVFeeUploader;
