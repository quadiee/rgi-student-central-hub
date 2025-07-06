
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Receipt, Calendar, CreditCard, User, Building, IndianRupee } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { formatCurrency } from '../../utils/feeValidation';

interface PaymentDetails {
  id: string;
  amount: number;
  payment_method?: string;
  status: string;
  receipt_number?: string;
  transaction_id?: string;
  processed_at?: string;
  gateway?: string;
  student_name: string;
  student_roll: string;
  department_name: string;
  fee_record_id: string;
  academic_year: string;
  semester: number;
  fee_categories: any;
  original_amount: number;
  discount_amount: number;
  penalty_amount: number;
  final_amount: number;
  due_date: string;
  paid_amount: number;
}

interface PaymentBreakdownProps {
  paymentId: string;
  onBack: () => void;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ 
  paymentId, 
  onBack, 
  breadcrumbItems = [] 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentTransaction, setIsPaymentTransaction] = useState(true);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      
      // First try to fetch as payment transaction
      let { data: paymentData, error: paymentError } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          fee_records!inner(
            *,
            fee_structures(fee_categories),
            profiles!inner(
              name,
              roll_number,
              departments(name)
            )
          )
        `)
        .eq('id', paymentId)
        .maybeSingle();

      if (paymentError || !paymentData) {
        // If not found as payment transaction, try as fee record
        const { data: feeData, error: feeError } = await supabase
          .from('fee_records')
          .select(`
            *,
            fee_structures(fee_categories),
            profiles!inner(
              name,
              roll_number,
              departments(name)
            )
          `)
          .eq('id', paymentId)
          .single();

        if (feeError) throw feeError;

        setIsPaymentTransaction(false);
        const paymentDetails: PaymentDetails = {
          id: feeData.id,
          amount: feeData.paid_amount || 0,
          status: feeData.status || 'Pending',
          student_name: feeData.profiles.name,
          student_roll: feeData.profiles.roll_number,
          department_name: feeData.profiles.departments.name,
          fee_record_id: feeData.id,
          academic_year: feeData.academic_year,
          semester: feeData.semester,
          fee_categories: feeData.fee_structures?.fee_categories || {},
          original_amount: feeData.original_amount,
          discount_amount: feeData.discount_amount || 0,
          penalty_amount: feeData.penalty_amount || 0,
          final_amount: feeData.final_amount,
          due_date: feeData.due_date,
          paid_amount: feeData.paid_amount || 0
        };

        setPayment(paymentDetails);
      } else {
        setIsPaymentTransaction(true);
        const paymentDetails: PaymentDetails = {
          id: paymentData.id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          status: paymentData.status,
          receipt_number: paymentData.receipt_number,
          transaction_id: paymentData.transaction_id,
          processed_at: paymentData.processed_at,
          gateway: paymentData.gateway,
          student_name: paymentData.fee_records.profiles.name,
          student_roll: paymentData.fee_records.profiles.roll_number,
          department_name: paymentData.fee_records.profiles.departments.name,
          fee_record_id: paymentData.fee_records.id,
          academic_year: paymentData.fee_records.academic_year,
          semester: paymentData.fee_records.semester,
          fee_categories: paymentData.fee_records.fee_structures?.fee_categories || {},
          original_amount: paymentData.fee_records.original_amount,
          discount_amount: paymentData.fee_records.discount_amount || 0,
          penalty_amount: paymentData.fee_records.penalty_amount || 0,
          final_amount: paymentData.fee_records.final_amount,
          due_date: paymentData.fee_records.due_date,
          paid_amount: paymentData.fee_records.paid_amount || 0
        };

        setPayment(paymentDetails);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': 
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': 
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'failed': 
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return <Receipt className="w-5 h-5 text-gray-600" />;
    
    switch (method.toLowerCase()) {
      case 'online':
      case 'upi':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'cash':
        return <IndianRupee className="w-5 h-5 text-green-600" />;
      default:
        return <Receipt className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-8">
        <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Details not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const allBreadcrumbItems = [
    ...breadcrumbItems,
    { label: isPaymentTransaction ? 'Payment Details' : 'Fee Details' }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            {allBreadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {index === allBreadcrumbItems.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <span className="cursor-pointer hover:text-foreground" onClick={onBack}>
                      {item.label}
                    </span>
                  )}
                </BreadcrumbItem>
                {index < allBreadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getPaymentMethodIcon(payment.payment_method)}
              <div>
                <CardTitle className="text-xl">
                  {isPaymentTransaction ? 'Payment Receipt' : 'Fee Record Details'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {payment.receipt_number ? `#${payment.receipt_number}` : `ID: ${payment.id.slice(0, 8)}`}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
              {payment.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Student Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium ml-2">{payment.student_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Roll Number:</span>
                  <span className="font-medium ml-2">{payment.student_roll}</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium ml-2">{payment.department_name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Academic Details
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Academic Year:</span>
                  <span className="font-medium ml-2">{payment.academic_year}</span>
                </div>
                <div>
                  <span className="text-gray-600">Semester:</span>
                  <span className="font-medium ml-2">{payment.semester}</span>
                </div>
                {payment.due_date && (
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium ml-2">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                {isPaymentTransaction ? 'Payment Details' : 'Fee Details'}
              </h4>
              <div className="space-y-2 text-sm">
                {payment.payment_method && (
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium ml-2">{payment.payment_method}</span>
                  </div>
                )}
                {payment.gateway && (
                  <div>
                    <span className="text-gray-600">Gateway:</span>
                    <span className="font-medium ml-2">{payment.gateway}</span>
                  </div>
                )}
                {payment.processed_at && (
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium ml-2">
                      {new Date(payment.processed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {payment.transaction_id && (
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium ml-2">{payment.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Structure Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Original Amount</span>
                <span className="font-medium">{formatCurrency(payment.original_amount)}</span>
              </div>
              
              {payment.discount_amount > 0 && (
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Discount Applied</span>
                  <span className="font-medium">-{formatCurrency(payment.discount_amount)}</span>
                </div>
              )}
              
              {payment.penalty_amount > 0 && (
                <div className="flex justify-between py-2 border-b text-red-600">
                  <span>Late Fee/Penalty</span>
                  <span className="font-medium">+{formatCurrency(payment.penalty_amount)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-3 border-t-2 text-lg font-semibold">
                <span>Final Amount</span>
                <span>{formatCurrency(payment.final_amount)}</span>
              </div>
              
              <div className="flex justify-between py-2 bg-blue-50 px-3 rounded text-blue-800">
                <span className="font-medium">Amount Paid</span>
                <span className="font-bold">{formatCurrency(payment.paid_amount)}</span>
              </div>

              {(payment.final_amount - payment.paid_amount) > 0 && (
                <div className="flex justify-between py-2 bg-orange-50 px-3 rounded text-orange-800">
                  <span className="font-medium">Outstanding</span>
                  <span className="font-bold">{formatCurrency(payment.final_amount - payment.paid_amount)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(payment.fee_categories || {}).map(([category, amount]) => (
                <div key={category} className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 capitalize">
                    {category.replace('_', ' ')}
                  </span>
                  <span className="font-medium">{formatCurrency(Number(amount))}</span>
                </div>
              ))}
              
              {Object.keys(payment.fee_categories || {}).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No detailed fee categories available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {isPaymentTransaction && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => window.print()}>
            <Receipt className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
          <Button>
            <Receipt className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentBreakdown;
