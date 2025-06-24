
import { supabase } from '../integrations/supabase/client';

export const initializeAdminInvitation = async () => {
  try {
    console.log('Checking for existing admin invitation...');
    
    // Check if admin invitation already exists using the RPC function
    const { data: invitationDetails, error: invitationError } = await supabase.rpc('get_invitation_details', {
      invitation_email: 'praveen@rgce.edu.in'
    });

    if (invitationError) {
      console.error('Error checking invitation details:', invitationError);
      return { success: false, error: invitationError };
    }

    console.log('Invitation details response:', invitationDetails);

    if (invitationDetails && Array.isArray(invitationDetails) && invitationDetails.length > 0) {
      const invitation = invitationDetails[0];
      console.log('Found existing invitation:', invitation);
      
      if (invitation.is_valid && invitation.role === 'admin') {
        console.log('Valid admin invitation already exists');
        return { success: true, message: 'Valid admin invitation already exists' };
      } else if (invitation.role !== 'admin') {
        console.log('Existing invitation has wrong role:', invitation.role);
        // The invitation exists but has wrong role - this should be handled by creating a new one
      } else {
        console.log('Existing invitation is not valid or expired');
      }
    }

    console.log('Creating new admin invitation...');
    
    // Create admin invitation using the RPC function
    const { data, error } = await supabase.rpc('create_admin_invitation_if_not_exists');

    if (error) {
      console.error('Error creating admin invitation:', error);
      return { success: false, error };
    }

    console.log('Admin invitation process completed:', data);
    return { 
      success: true, 
      message: data?.message || 'Admin invitation process completed',
      data 
    };
  } catch (error) {
    console.error('Error initializing admin invitation:', error);
    return { success: false, error };
  }
};
