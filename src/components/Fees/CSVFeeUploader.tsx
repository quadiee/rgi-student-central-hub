
import React, { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Database } from '../../integrations/supabase/types';

type Department = Database['public']['Enums']['department'];

const CSVFeeUploader: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState<number>(5);
  const [department, setDepartment] = useState<Department | ''>('');

  const downloadTemplate = () => {
    const template = `roll_number,student_name,fee_amount,due_date
21CSE001,John Doe,100000,2024-12-31
21CSE002,Jane Smith,100000,2024-12-31
21CSE003,Bob Johnson,95000,2024-12-31`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'fee_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !department) {
      toast({
        title: "Error",
        description: "Please select a file and department",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index];
        });
        return record;
      });

      const { data, error } = await supabase.rpc('process_fee_csv_upload', {
        p_academic_year: academicYear,
        p_semester: semester,
        p_department: department as Department,
        p_csv_data: csvData,
        p_uploaded_by: user.id
      });

      if (error) throw error;

      // Type the response properly
      const result = data as { processed_count?: number; success?: boolean; message?: string };

      toast({
        title: "Success",
        description: `CSV uploaded successfully! Processed ${result.processed_count || 0} records.`,
      });

      // Reset form
      event.target.value = '';
      setDepartment('');
    } catch (error) {
      console.error('CSV upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload CSV",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user || !['admin', 'principal'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators and principals can upload fee configurations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Fee Configuration Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Download Template */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Step 1: Download Template</h4>
          <p className="text-sm text-blue-600 mb-3">
            Download the CSV template with the required format for fee data.
          </p>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2025-26">2025-26</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <Select value={semester.toString()} onValueChange={(value) => setSemester(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
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
        </div>

        {/* File Upload */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Step 2: Upload Fee Data</h4>
          <p className="text-sm text-green-600 mb-3">
            Select your filled CSV file to upload fee configuration for students.
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading || !department}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">CSV Format Instructions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>roll_number:</strong> Student's roll number (must match existing student)</li>
            <li>• <strong>student_name:</strong> Student's name (for verification)</li>
            <li>• <strong>fee_amount:</strong> Total fee amount in rupees</li>
            <li>• <strong>due_date:</strong> Fee due date in YYYY-MM-DD format</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVFeeUploader;
