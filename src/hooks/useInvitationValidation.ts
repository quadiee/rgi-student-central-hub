
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { InvitationData } from '../types/invitation';

// Define the expected RPC response structure
interface RpcValidationResponse {
  id: string;
  email: string;
  role: string;
  department: string;
  roll_number: string | null;
  employee_id: string | null;
  is_valid: boolean;
  error_message: string | null;
}

// Type predicate function to validate RPC response
function isValidRpcResponse(data: unknown): data is RpcValidationResponse {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.role === 'string' &&
    typeof obj.department === 'string' &&
    typeof obj.is_valid === 'boolean' &&
    (obj.roll_number === null || typeof obj.roll_number === 'string') &&
    (obj.employee_id === null || typeof obj.employee_id === 'string') &&
    (obj.error_message === null || typeof obj.error_message === 'string')
  );
}

export const useInvitationValidation = (token: string | undefined) => {
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [userExists, setUserExists] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setInviteError("Missing invitation token.");
      setLoadingInvitation(false);
      return;
    }
    loadInvitationDetails();
  }, [token]);

  const loadInvitationDetails = async (): Promise<void> => {
    try {
      setLoadingInvitation(true);
      setInviteError(null);
      
      // Call RPC function
      const { data: rpcResponse, error: rpcError } = await supabase.rpc('validate_invitation_token', {
        p_token: token!
      });
      
      if (rpcError) {
        console.error('RPC Error:', rpcError);
        setInviteError("Failed to validate invitation token.");
        setLoadingInvitation(false);
        return;
      }

      // Validate response structure
      if (!Array.isArray(rpcResponse) || rpcResponse.length === 0) {
        setInviteError("Invalid invitation token.");
        setLoadingInvitation(false);
        return;
      }

      const responseData = rpcResponse[0];
      
      // Use type predicate to validate and narrow type
      if (!isValidRpcResponse(responseData)) {
        setInviteError("Invalid invitation response format.");
        setLoadingInvitation(false);
        return;
      }

      // Check if invitation is valid
      if (!responseData.is_valid) {
        setInviteError(responseData.error_message || "This invitation is invalid or has expired.");
        setLoadingInvitation(false);
        return;
      }

      // Transform to our internal type format
      const processedData: InvitationData = {
        id: responseData.id,
        email: responseData.email,
        role: responseData.role,
        department: responseData.department,
        roll_number: responseData.roll_number || undefined,
        employee_id: responseData.employee_id || undefined,
        is_valid: responseData.is_valid,
        error_message: responseData.error_message || undefined
      };

      setInvitationData(processedData);

      // Check if user already exists in auth.users - simplified approach
      try {
        // Use a more direct approach to check user existence
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authData?.users) {
          const existingUser = authData.users.find(user => user.email === responseData.email);
          setUserExists(!!existingUser);
        } else {
          console.warn('Could not check if user exists:', authError);
          setUserExists(false);
        }
      } catch (userCheckError) {
        console.warn('Could not check if user exists:', userCheckError);
        // Don't fail the whole flow if user check fails
        setUserExists(false);
      }

      setLoadingInvitation(false);
    } catch (err) {
      console.error('Error loading invitation details:', err);
      setInviteError("Something went wrong while verifying your invitation.");
      setLoadingInvitation(false);
    }
  };

  return {
    invitationData,
    inviteError,
    loadingInvitation,
    userExists
  };
};
