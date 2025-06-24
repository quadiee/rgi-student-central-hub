
import { supabase } from '../integrations/supabase/client';

export const initializeAdminInvitation = async () => {
  try {
    // Check if admin invitation already exists
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('email', 'praveen@rgce.edu.in')
      .eq('is_active', true)
      .single();

    if (existingInvitation) {
      console.log('Admin invitation already exists');
      return { success: true, message: 'Admin invitation already exists' };
    }

    // Create admin invitation
    const { error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email: 'praveen@rgce.edu.in',
        role: 'admin',
        department: 'CSE',
        employee_id: 'ADMIN001',
        invited_by: null // System invitation
      });

    if (invitationError) {
      console.error('Error creating admin invitation:', invitationError);
      return { success: false, error: invitationError };
    }

    console.log('Admin invitation created successfully');
    return { success: true, message: 'Admin invitation created successfully' };
  } catch (error) {
    console.error('Error initializing admin invitation:', error);
    return { success: false, error };
  }
};
