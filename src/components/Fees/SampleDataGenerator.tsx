
import React, { useState } from 'react';
import { Database, RefreshCw, Users, IndianRupee } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

const SampleDataGenerator: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const generateSampleData = async () => {
    setLoading(true);
    setGenerationStep('Initializing...');

    try {
      // Step 1: Clear existing data
      setGenerationStep('Clearing existing data...');
      await supabase.from('payment_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('fee_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Step 2: Get all student profiles with department info
      setGenerationStep('Fetching student profiles...');
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        throw new Error('No student profiles found. Please create some student users first.');
      }

      // Step 3: Create fee structure if it doesn't exist
      setGenerationStep('Setting up fee structures...');
      const { data: existingStructure } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('academic_year', '2024-25')
        .eq('semester', 5)
        .eq('is_active', true)
        .maybeSingle();

      let feeStructureId;
      if (!existingStructure) {
        const { data: newStructure, error: structureError } = await supabase
          .from('fee_structures')
          .insert({
            academic_year: '2024-25',
            semester: 5,
            total_amount: 120000,
            due_date: '2024-12-31',
            fee_categories: {
              tuition: 80000,
              development: 20000,
              lab: 10000,
              library: 5000,
              exam: 5000
            },
            is_active: true,
            installment_allowed: true,
            max_installments: 3
          })
          .select()
          .single();

        if (structureError) throw structureError;
        feeStructureId = newStructure.id;
      } else {
        feeStructureId = existingStructure.id;
      }

      // Step 4: Generate fee records for each student
      setGenerationStep('Generating fee records...');
      const feeRecords = [];
      
      for (const student of students) {
        const baseAmount = 120000;
        const hasScholarship = Math.random() < 0.1; // 10% scholarship
        const hasLateFee = Math.random() < 0.2; // 20% late fee
        const paymentStatus = Math.random();
        
        const discountAmount = hasScholarship ? 20000 : 0;
        const penaltyAmount = hasLateFee ? 5000 : 0;
        const finalAmount = baseAmount - discountAmount + penaltyAmount;
        
        let paidAmount = 0;
        let status = 'Pending';
        
        if (paymentStatus < 0.4) { // 40% fully paid
          paidAmount = finalAmount;
          status = 'Paid';
        } else if (paymentStatus < 0.6) { // 20% partial payment
          paidAmount = Math.floor(finalAmount * (0.3 + Math.random() * 0.4)); // 30-70% paid
          status = 'Partial';
        } else if (paymentStatus < 0.8) { // 20% overdue
          status = 'Overdue';
        }
        // 20% remain pending

        feeRecords.push({
          student_id: student.id,
          fee_structure_id: feeStructureId,
          academic_year: '2024-25',
          semester: 5,
          original_amount: baseAmount,
          discount_amount: discountAmount,
          penalty_amount: penaltyAmount,
          final_amount: finalAmount,
          paid_amount: paidAmount,
          due_date: '2024-12-31',
          status
        });
      }

      const { data: insertedRecords, error: recordsError } = await supabase
        .from('fee_records')
        .insert(feeRecords)
        .select();

      if (recordsError) throw recordsError;

      // Step 5: Generate payment transactions for paid records
      setGenerationStep('Generating payment transactions...');
      const paymentTransactions = [];
      
      for (const record of insertedRecords) {
        if (record.paid_amount > 0) {
          const paymentMethods = ['Online', 'Cash', 'UPI', 'Cheque'];
          const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          const randomDaysAgo = Math.floor(Math.random() * 30) + 1;
          const processedDate = new Date();
          processedDate.setDate(processedDate.getDate() - randomDaysAgo);

          paymentTransactions.push({
            fee_record_id: record.id,
            student_id: record.student_id,
            amount: record.paid_amount,
            payment_method: randomMethod,
            transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: 'Success',
            receipt_number: `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(paymentTransactions.length + 1).padStart(4, '0')}`,
            processed_at: processedDate.toISOString(),
            gateway: randomMethod === 'Online' ? 'Razorpay' : null
          });
        }
      }

      if (paymentTransactions.length > 0) {
        const { error: paymentsError } = await supabase
          .from('payment_transactions')
          .insert(paymentTransactions);

        if (paymentsError) throw paymentsError;
      }

      setGenerationStep('Completed!');
      
      toast({
        title: "Success",
        description: `Generated ${feeRecords.length} fee records and ${paymentTransactions.length} payment transactions`,
      });

      // Auto-clear step after success
      setTimeout(() => setGenerationStep(''), 2000);

    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate sample data",
        variant: "destructive"
      });
      setGenerationStep('');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear all fee and payment data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setGenerationStep('Clearing all data...');

    try {
      await supabase.from('payment_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('fee_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('fee_structures').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Success",
        description: "All fee and payment data cleared successfully",
      });

      setGenerationStep('');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive"
      });
      setGenerationStep('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Sample Data Generator</h3>
        </div>
        {generationStep && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{generationStep}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Generate realistic sample fee records and payment transactions for testing and demonstration purposes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Student Records</span>
            </div>
            <p className="text-sm text-blue-700">
              Generates fee records for all existing student profiles with realistic payment statuses.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <IndianRupee className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Payment Transactions</span>
            </div>
            <p className="text-sm text-green-700">
              Creates payment transactions with various methods and realistic timestamps.
            </p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <Button
            onClick={generateSampleData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>{loading ? 'Generating...' : 'Generate Sample Data'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={clearAllData}
            disabled={loading}
            className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear All Data</span>
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Note:</strong> This will clear existing fee records and generate new ones. 
          The generator creates realistic data with various payment statuses, scholarship discounts, 
          and late fees to simulate real-world scenarios.
        </div>
      </div>
    </div>
  );
};

export default SampleDataGenerator;
