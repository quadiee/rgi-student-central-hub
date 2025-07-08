
import React, { useState, useEffect, useRef } from 'react';
import { Upload, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface BatchFeeProcessorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcessComplete: () => void;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface CSVRow {
  roll_number: string;
  fee_amount: number;
  due_date: string;
  fee_type?: string;
  error?: string;
  status?: 'error' | 'success' | 'pending';
}

const BatchFeeProcessor: React.FC<BatchFeeProcessorProps> = ({ open, onOpenChange, onProcessComplete }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState('5');
  const [department, setDepartment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        // Validate required headers
        const requiredHeaders = ['roll_number', 'fee_amount', 'due_date'];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          toast({
            title: "Error",
            description: `CSV is missing required headers: ${missingHeaders.join(', ')}`,
            variant: "destructive"
          });
          return;
        }
        
        const parsedData: CSVRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const row: CSVRow = {
            roll_number: values[headers.indexOf('roll_number')].trim(),
            fee_amount: parseFloat(values[headers.indexOf('fee_amount')]),
            due_date: values[headers.indexOf('due_date')].trim(),
            status: 'pending'
          };
          
          // Optional fee_type column
          if (headers.includes('fee_type')) {
            row.fee_type = values[headers.indexOf('fee_type')].trim();
          }
          
          // Validate row data
          if (!row.roll_number) {
            row.error = 'Roll number is required';
            row.status = 'error';
          } else if (isNaN(row.fee_amount) || row.fee_amount <= 0) {
            row.error = 'Invalid fee amount';
            row.status = 'error';
          } else if (!isValidDate(row.due_date)) {
            row.error = 'Invalid due date format (use YYYY-MM-DD)';
            row.status = 'error';
          }
          
          parsedData.push(row);
        }
        
        setCsvData(parsedData);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Error",
          description: "Failed to parse CSV file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSubmit = async () => {
    if (!department || !academicYear || !semester || csvData.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload a valid CSV",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    
    try {
      const validRows = csvData.filter(row => row.status !== 'error');
      
      if (validRows.length === 0) {
        toast({
          title: "Error",
          description: "No valid rows to process",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }
      
      // Call the stored procedure to process the CSV data
      const { data, error } = await supabase.rpc('process_fee_csv_upload_with_types', {
        p_academic_year: academicYear,
        p_semester: parseInt(semester),
        p_department: department as any, // Department code as enum
        p_csv_data: validRows,
        p_uploaded_by: null // Will be filled by RLS with auth.uid()
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Processed ${data.processed_count} student fee records successfully`,
      });
      
      onProcessComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error processing batch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process batch",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setCsvData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Fee Processing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Academic Year *</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Semester *</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Department *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* CSV Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {!file ? (
              <div className="text-center space-y-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <Label htmlFor="file-upload" className="block font-medium text-gray-900">
                    Upload CSV File
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    CSV must include: roll_number, fee_amount, due_date columns
                  </p>
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Select File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {csvData.length} records • {csvData.filter(row => row.status === 'error').length} errors
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Preview */}
                <div className="max-h-60 overflow-y-auto border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {csvData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{row.roll_number}</td>
                          <td className="px-4 py-2 text-sm">₹{row.fee_amount}</td>
                          <td className="px-4 py-2 text-sm">{row.due_date}</td>
                          <td className="px-4 py-2 text-sm">
                            {row.status === 'error' ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {row.error}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Valid
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                      
                      {csvData.length > 5 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-sm text-center text-gray-500">
                            {csvData.length - 5} more records...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {processing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-gray-500">
                Processing... {progress}%
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={processing || !file || !department || !academicYear || !semester || csvData.length === 0}
            >
              Process Batch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchFeeProcessor;
