
import { supabase } from '../integrations/supabase/client';

export const initializeAdminInvitation = async () => {
  try {
    console.log('Checking for existing admin invitation...');
    
    // Check if admin invitation already exists using the RPC function
    const { data: invitationDetails } = await supabase.rpc('get_invitation_details', {
      invitation_email: 'praveen@rgce.edu.in'
    });

    if (invitationDetails && invitationDetails.length > 0 && invitationDetails[0].is_valid) {
      console.log('Admin invitation already exists and is valid');
      return { success: true, message: 'Admin invitation already exists' };
    }

    console.log('Creating new admin invitation...');
    
    // Use the service role key or ensure proper permissions
    // Since we can't access service role key in frontend, we'll create a function
    const { data, error } = await supabase.rpc('create_admin_invitation_if_not_exists');

    if (error) {
      console.error('Error creating admin invitation:', error);
      return { success: false, error };
    }

    console.log('Admin invitation process completed:', data);
    return { success: true, message: 'Admin invitation process completed' };
  } catch (error) {
    console.error('Error initializing admin invitation:', error);
    return { success: false, error };
  }
};
