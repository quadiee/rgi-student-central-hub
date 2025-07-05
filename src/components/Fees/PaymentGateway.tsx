
import React, { useState } from 'react';
import { CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { FeeRecord } from '../../types';
import { formatCurrency } from '../../utils/feeValidation';

interface PaymentGatewayProps {
  feeRecord: FeeRecord;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  feeRecord,
  onPaymentSuccess,
  onPaymentCancel
}) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const simulatePayment = async (method: 'UPI' | 'Card' | 'NetBanking') => {
    setProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        // In real implementation, you would:
        // 1. Redirect to actual payment gateway (Paytm, Razorpay, etc.)
        // 2. Handle payment response
        // 3. Verify payment status
        // 4. Update database
        
        toast({
          title: "Payment Successful",
          description: `Payment of ${formatCurrency(feeRecord.amount)} completed successfully`,
        });
        
        onPaymentSuccess();
      } else {
        throw new Error('Payment failed due to insufficient funds');
      }
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const redirectToPaytm = () => {
    // In real implementation, you would:
    // 1. Create payment order on your backend
    // 2. Get payment URL from Paytm
    // 3. Redirect user to Paytm checkout
    
    const paytmUrl = `https://securegw-stage.paytm.in/theia/processTransaction?ORDER_ID=ORDER_${Date.now()}`;
    
    toast({
      title: "Demo Mode",
      description: "In production, this would redirect to Paytm payment gateway",
    });
    
    // Simulate redirect behavior
    setTimeout(() => {
      simulatePayment('UPI');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Fee Type:</span>
              <span>{feeRecord.feeType}</span>
            </div>
            <div className="flex justify-between">
              <span>Semester:</span>
              <span>{feeRecord.semester}</span>
            </div>
            <div className="flex justify-between">
              <span>Academic Year:</span>
              <span>{feeRecord.academicYear}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span className="text-green-600">{formatCurrency(feeRecord.amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={redirectToPaytm}
            disabled={processing}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Pay with Paytm
          </Button>

          <Button
            onClick={() => simulatePayment('UPI')}
            disabled={processing}
            variant="outline"
            className="w-full h-12"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            UPI Payment
          </Button>

          <Button
            onClick={() => simulatePayment('Card')}
            disabled={processing}
            variant="outline"
            className="w-full h-12"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Credit/Debit Card
          </Button>

          <Button
            onClick={() => simulatePayment('NetBanking')}
            disabled={processing}
            variant="outline"
            className="w-full h-12"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Net Banking
          </Button>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Demo Mode Active</p>
              <p>This is a simulation. In production, integrate with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Paytm Payment Gateway</li>
                <li>Razorpay</li>
                <li>CCAvenue</li>
                <li>Other payment providers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={onPaymentCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>

      {processing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Processing payment...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentGateway;
