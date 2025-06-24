
import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Receipt, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useFeeManagement } from '../../hooks/useFeeManagement';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { formatCurrency } from '../../utils/feeValidation';

interface PaymentProcessorProps {
  feeRecord: any;
  onPaymentSuccess?: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ 
  feeRecord, 
  onPaymentSuccess 
}) => {
  const { user } = useAuth();
  const { processPayment, loading } = useFeeManagement();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const outstandingAmount = feeRecord.final_amount - (feeRecord.paid_amount || 0);

  const paymentMethods = [
    { value: 'Online', label: 'Online Payment', icon: CreditCard },
    { value: 'UPI', label: 'UPI Payment', icon: Smartphone },
    { value: 'Cash', label: 'Cash Payment', icon: Building },
    { value: 'Cheque', label: 'Cheque Payment', icon: Receipt }
  ];

  const handlePayment = async () => {
    if (!paymentMethod || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select payment method and enter valid amount",
        variant: "destructive"
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount > outstandingAmount) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount cannot exceed outstanding balance",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const success = await processPayment({
        feeRecordId: feeRecord.id,
        studentId: feeRecord.student_id,
        amount: paymentAmount,
        paymentMethod: paymentMethod as any
      });

      if (success) {
        toast({
          title: "Payment Successful",
          description: `Payment of ${formatCurrency(paymentAmount)} processed successfully`,
        });
        
        // Reset form
        setAmount('');
        setPaymentMethod('');
        
        // Callback for parent component
        onPaymentSuccess?.();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const setFullAmount = () => {
    setAmount(outstandingAmount.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Process Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Outstanding Balance */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">Outstanding Balance:</span>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(outstandingAmount)}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{method.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={outstandingAmount}
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={setFullAmount}
              disabled={outstandingAmount <= 0}
            >
              Full Amount
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum: {formatCurrency(outstandingAmount)}
          </p>
        </div>

        {/* Payment Simulation Notice */}
        {paymentMethod === 'Online' && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Demo Mode:</strong> Online payments are simulated. 
              In production, this would integrate with actual payment gateways.
            </p>
          </div>
        )}

        {/* Process Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={processing || loading || !paymentMethod || !amount || parseFloat(amount) <= 0}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Process Payment of {amount ? formatCurrency(parseFloat(amount)) : '₹0'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentProcessor;
