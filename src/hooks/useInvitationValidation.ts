
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { InvitationData, ValidateInvitationResponse } from '../types/invitation';

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

  const loadInvitationDetails = async () => {
    try {
      setLoadingInvitation(true);
      
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        p_token: token!
      });
      
      if (error) {
        console.error('RPC Error:', error);
        setInviteError("Failed to validate invitation token.");
        setLoadingInvitation(false);
        return;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        setInviteError("Invalid invitation token.");
        setLoadingInvitation(false);
        return;
      }

      // Explicit type assertion with proper validation
      const inviteData = data[0] as ValidateInvitationResponse;
      
      // Validate the response structure
      if (!inviteData || typeof inviteData !== 'object' || !inviteData.email) {
        setInviteError("Invalid invitation response format.");
        setLoadingInvitation(false);
        return;
      }

      if (!inviteData.is_valid) {
        setInviteError(inviteData.error_message || "This invitation is invalid or has expired.");
        setLoadingInvitation(false);
        return;
      }

      // Convert to our internal type format
      const processedInvitationData: InvitationData = {
        id: inviteData.id,
        email: inviteData.email,
        role: inviteData.role,
        department: inviteData.department,
        roll_number: inviteData.roll_number || undefined,
        employee_id: inviteData.employee_id || undefined,
        is_valid: inviteData.is_valid,
        error_message: inviteData.error_message || undefined
      };

      setInvitationData(processedInvitationData);

      // Check if user already exists in auth.users
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      if (!userError && users) {
        const existingUser = users.find(u => u.email === inviteData.email);
        setUserExists(!!existingUser);
      }

      setInviteError(null);
      setLoadingInvitation(false);
    } catch (err: any) {
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
