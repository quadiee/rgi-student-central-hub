
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Loader2, Link, Unlink } from 'lucide-react';

interface ScholarshipFeeConnectorProps {
  onConnectionUpdate?: () => void;
}

interface FeeRecord {
  id: string;
  student_name: string;
  roll_number: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  final_amount: number;
  status: string;
  scholarship_id?: string;
}

interface Scholarship {
  id: string;
  student_name: string;
  roll_number: string;
  scholarship_type: string;
  eligible_amount: number;
  academic_year: string;
  received_by_institution: boolean;
}

const ScholarshipFeeConnector: React.FC<ScholarshipFeeConnectorProps> = ({ onConnectionUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<string>('');
  const [selectedScholarship, setSelectedScholarship] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load fee records without scholarships
      const { data: feeData, error: feeError } = await supabase
        .from('fee_records')
        .select(`
          id,
          academic_year,
          semester,
          original_amount,
          final_amount,
          status,
          scholarship_id,
          profiles!fee_records_student_id_fkey(
            name,
            roll_number
          )
        `)
        .is('scholarship_id', null)
        .order('created_at', { ascending: false });

      if (feeError) throw feeError;

      const transformedFeeRecords = feeData?.map(record => ({
        id: record.id,
        student_name: record.profiles?.name || 'Unknown',
        roll_number: record.profiles?.roll_number || '',
        academic_year: record.academic_year,
        semester: record.semester,
        original_amount: record.original_amount,
        final_amount: record.final_amount,
        status: record.status,
        scholarship_id: record.scholarship_id
      })) || [];

      // Load available scholarships
      const { data: scholarshipData, error: scholarshipError } = await supabase
        .from('scholarships')
        .select(`
          id,
          scholarship_type,
          eligible_amount,
          academic_year,
          received_by_institution,
          profiles!scholarships_student_id_fkey(
            name,
            roll_number
          )
        `)
        .eq('received_by_institution', true)
        .order('created_at', { ascending: false });

      if (scholarshipError) throw scholarshipError;

      const transformedScholarships = scholarshipData?.map(scholarship => ({
        id: scholarship.id,
        student_name: scholarship.profiles?.name || 'Unknown',
        roll_number: scholarship.profiles?.roll_number || '',
        scholarship_type: scholarship.scholarship_type,
        eligible_amount: scholarship.eligible_amount,
        academic_year: scholarship.academic_year,
        received_by_institution: scholarship.received_by_institution
      })) || [];

      setFeeRecords(transformedFeeRecords);
      setScholarships(transformedScholarships);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const connectScholarshipToFee = async () => {
    if (!selectedFeeRecord || !selectedScholarship) {
      toast({
        title: "Selection Required",
        description: "Please select both a fee record and a scholarship",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call the database function to apply scholarship
      const { error } = await supabase.rpc('apply_scholarship_to_fee_record', {
        p_fee_record_id: selectedFeeRecord,
        p_scholarship_id: selectedScholarship
      });

      if (error) throw error;

      toast({
        title: "Scholarship Applied",
        description: "Scholarship has been successfully connected to the fee record",
      });

      // Reset selections and reload data
      setSelectedFeeRecord('');
      setSelectedScholarship('');
      loadData();
      onConnectionUpdate?.();
    } catch (error) {
      console.error('Error connecting scholarship:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect scholarship to fee record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const autoConnectScholarships = async () => {
    try {
      setLoading(true);
      
      // Call the auto-apply function
      const { error } = await supabase.rpc('auto_apply_scholarships');

      if (error) throw error;

      toast({
        title: "Auto-Connection Complete",
        description: "Scholarships have been automatically connected to matching fee records",
      });

      loadData();
      onConnectionUpdate?.();
    } catch (error) {
      console.error('Error auto-connecting scholarships:', error);
      toast({
        title: "Auto-Connection Failed",
        description: "Failed to automatically connect scholarships",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Connect Scholarships to Fee Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Fee Record</label>
              <Select value={selectedFeeRecord} onValueChange={setSelectedFeeRecord}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose fee record..." />
                </SelectTrigger>
                <SelectContent>
                  {feeRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {record.student_name} ({record.roll_number}) - {record.academic_year} Sem {record.semester} - ₹{record.original_amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Scholarship</label>
              <Select value={selectedScholarship} onValueChange={setSelectedScholarship}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose scholarship..." />
                </SelectTrigger>
                <SelectContent>
                  {scholarships.map((scholarship) => (
                    <SelectItem key={scholarship.id} value={scholarship.id}>
                      {scholarship.student_name} ({scholarship.roll_number}) - {scholarship.scholarship_type} - ₹{scholarship.eligible_amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={connectScholarshipToFee} 
              disabled={loading || !selectedFeeRecord || !selectedScholarship}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              Connect Scholarship
            </Button>

            <Button 
              onClick={autoConnectScholarships} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              Auto-Connect All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Unconnected Fee Records ({feeRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {feeRecords.map((record) => (
                <div key={record.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{record.student_name} ({record.roll_number})</div>
                  <div className="text-sm text-gray-600">
                    {record.academic_year} - Semester {record.semester}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    Original: ₹{record.original_amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {feeRecords.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No unconnected fee records found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Scholarships ({scholarships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scholarships.map((scholarship) => (
                <div key={scholarship.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{scholarship.student_name} ({scholarship.roll_number})</div>
                  <div className="text-sm text-gray-600">
                    {scholarship.scholarship_type} - {scholarship.academic_year}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Amount: ₹{scholarship.eligible_amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {scholarships.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No available scholarships found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScholarshipFeeConnector;
