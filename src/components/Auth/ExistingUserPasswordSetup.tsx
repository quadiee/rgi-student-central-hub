
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { InvitationData } from '../../types/invitation';

interface ExistingUserPasswordSetupProps {
  invitationData: InvitationData;
}

const ExistingUserPasswordSetup: React.FC<ExistingUserPasswordSetupProps> = ({ invitationData }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePasswordSetup = async () => {
    // Explicit type guard with proper null checks
    if (!invitationData || !invitationData.email) {
      toast({
        title: "Error",
        description: "Invalid invitation data or missing email.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(invitationData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to send password setup email.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password Setup Email Sent",
          description: "Please check your email to set up your password.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Setup</h2>
          <p className="text-gray-600">Account exists for <strong>{invitationData.email}</strong></p>
          <p className="text-gray-600 mb-6">Click below to receive a password setup link</p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={handlePasswordSetup}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending Setup Link...' : 'Send Password Setup Link'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/auth")}
            disabled={loading}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExistingUserPasswordSetup;
