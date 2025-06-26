import React, { useState } from 'react';
import { Users, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const SampleDataGenerator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const generateSampleFeeRecords = async () => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can generate sample data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get all active users who are students
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, name, email, department_id, roll_number')
        .eq('role', 'student')
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        toast({
          title: "No Students Found",
          description: "Please ensure students are registered first",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Get fee structures for current academic year
      const { data: feeStructures, error: feeError } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('academic_year', '2024-25')
        .eq('semester', 5)
        .eq('is_active', true);

      if (feeError) throw feeError;

      if (!feeStructures || feeStructures.length === 0) {
        toast({
          title: "No Fee Structures Found",
          description: "Please create fee structures first",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create sample fee records for students
      const feeRecords = [];
      const paymentTransactions = [];

      for (const student of students) {
        // Find matching fee structure for student's department
        // You may want to match by department_id if your fee_structures are department-specific
        const feeStructure = feeStructures.find(fs => {
          // If you have department_id on fee_structures, match here:
          // return fs.department_id === student.department_id;
          // For now, fallback to any available structure
          return fs.total_amount > 0;
        });

        if (!feeStructure) continue;

        // Create different payment scenarios
        const scenarios = ['paid', 'partial', 'pending', 'overdue'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        let status = 'Pending';
        let paidAmount = 0;
        let dueDate = new Date('2024-08-15');
        
        switch (scenario) {
          case 'paid':
            status = 'Paid';
            paidAmount = Number(feeStructure.total_amount);
            break;
          case 'partial':
            status = 'Partial';
            paidAmount = Math.floor(Number(feeStructure.total_amount) * 0.5);
            break;
          case 'overdue':
            status = 'Overdue';
            paidAmount = 0;
            dueDate = new Date('2024-07-15'); // Past due date
            break;
          default:
            status = 'Pending';
            paidAmount = 0;
        }

        const feeRecord = {
          student_id: student.id,
          fee_structure_id: feeStructure.id,
          academic_year: '2024-25',
          semester: 5,
          original_amount: Number(feeStructure.total_amount),
          discount_amount: 0,
          penalty_amount: status === 'Overdue' ? Math.floor(Number(feeStructure.total_amount) * 0.05) : 0,
          final_amount: status === 'Overdue' ? 
            Number(feeStructure.total_amount) + Math.floor(Number(feeStructure.total_amount) * 0.05) : 
            Number(feeStructure.total_amount),
          paid_amount: paidAmount,
          status: status,
          due_date: dueDate.toISOString().split('T')[0]
        };

        feeRecords.push(feeRecord);

        // Create payment transaction if amount was paid
        if (paidAmount > 0) {
          paymentTransactions.push({
            student_id: student.id,
            amount: paidAmount,
            payment_method: Math.random() > 0.5 ? 'Online' : 'Cash',
            transaction_id: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            status: 'Success',
            receipt_number: `RCP-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
            processed_by: user.id,
            processed_at: new Date().toISOString()
          });
        }
      }

      // Insert fee records
      const { data: insertedFeeRecords, error: insertError } = await supabase
        .from('fee_records')
        .insert(feeRecords)
        .select();

      if (insertError) throw insertError;

      // Insert payment transactions with fee_record_id
      if (paymentTransactions.length > 0) {
        const transactionsWithFeeRecords = paymentTransactions.map((transaction, index) => ({
          ...transaction,
          fee_record_id: insertedFeeRecords?.[feeRecords.findIndex(fr => fr.student_id === transaction.student_id)]?.id
        })).filter(t => t.fee_record_id);

        const { error: paymentError } = await supabase
          .from('payment_transactions')
          .insert(transactionsWithFeeRecords);

        if (paymentError) throw paymentError;
      }

      setGeneratedData({
        feeRecords: insertedFeeRecords?.length || 0,
        paymentTransactions: paymentTransactions.length,
        students: students.length
      });

      toast({
        title: "Sample Data Generated",
        description: `Created ${insertedFeeRecords?.length || 0} fee records and ${paymentTransactions.length} payment transactions`,
      });

    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: "Error",
        description: "Failed to generate sample data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSampleData = async () => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can clear sample data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Delete payment transactions first (due to foreign key constraints)
      await supabase.from('payment_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Delete fee records
      await supabase.from('fee_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      setGeneratedData(null);
      
      toast({
        title: "Sample Data Cleared",
        description: "All sample fee records and transactions have been removed",
      });

    } catch (error) {
      console.error('Error clearing sample data:', error);
      toast({
        title: "Error",
        description: "Failed to clear sample data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Sample Data Management</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4" />
          <span>Admin Only</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Generate realistic sample data for testing multi-user fee management scenarios.
        </p>

        {generatedData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Sample Data Active</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>• {generatedData.feeRecords} fee records created</p>
              <p>• {generatedData.paymentTransactions} payment transactions</p>
              <p>• {generatedData.students} students with fees</p>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={generateSampleFeeRecords}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? 'Generating...' : 'Generate Sample Data'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={clearSampleData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>{loading ? 'Clearing...' : 'Clear Sample Data'}</span>
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <p>Sample data includes various payment scenarios: paid, partial, pending, and overdue fees.</p>
        </div>
      </div>
    </div>
  );
};

export default SampleDataGenerator;