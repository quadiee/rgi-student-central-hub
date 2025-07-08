
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface AdminSetupResult {
  success: boolean;
  message: string;
  error?: any;
  requiresManualAuth?: boolean;
}

export const secureAdminSetup = async (): Promise<AdminSetupResult> => {
  try {
    console.log('Starting secure admin setup process...');
    
    // Step 1: Check if we're already logged in as admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error checking session:', sessionError);
      return {
        success: false,
        message: 'Failed to check authentication status',
        error: sessionError
      };
    }

    if (session?.user) {
      // Check if current user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, name, email')
        .eq('id', session.user.id)
        .single();

      if (!profileError && profile?.role === 'admin') {
        console.log('Already logged in as admin:', profile);
        return {
          success: true,
          message: `Welcome back, ${profile.name}! You're already logged in as admin.`
        };
      }
    }

    // Step 2: Create or verify admin invitation
    console.log('Creating admin invitation...');
    const { data: invitationResult, error: invitationError } = await supabase.rpc('create_direct_admin');
    
    if (invitationError) {
      console.error('Error creating admin invitation:', invitationError);
      return {
        success: false,
        message: 'Failed to create admin invitation',
        error: invitationError
      };
    }

    console.log('Admin invitation created/verified:', invitationResult);

    // Step 3: Check if admin account already exists
    const { data: existingProfile, error: existingError } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .eq('email', 'praveen@rgce.edu.in')
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing profile:', existingError);
    }

    if (existingProfile) {
      console.log('Admin profile already exists:', existingProfile);
      return {
        success: true,
        message: 'Admin account exists. Please sign in with email: praveen@rgce.edu.in',
        requiresManualAuth: true
      };
    }

    // Step 4: Create admin account
    console.log('Creating admin account...');
    const adminPassword = 'Admin@123!RGCE';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'praveen@rgce.edu.in',
      password: adminPassword,
      options: {
        data: {
          name: 'RGCE Administrator',
          role: 'admin',
          department: 'ADMIN',
          employee_id: 'ADMIN001'
        }
      }
    });

    if (signUpError) {
      console.error('Error creating admin user:', signUpError);
      
      // If user already exists, don't auto sign-in
      if (signUpError.message?.includes('already registered')) {
        console.log('Admin user already exists');
        
        return {
          success: true,
          message: 'Admin account already exists. Please sign in manually with praveen@rgce.edu.in',
          requiresManualAuth: true
        };
      }
      
      return {
        success: false,
        message: 'Failed to create admin account',
        error: signUpError
      };
    }

    console.log('Admin user created successfully:', signUpData);

    // Step 5: Mark invitation as used
    try {
      const { error: markError } = await supabase.rpc('mark_invitation_used', { 
        invitation_email: 'praveen@rgce.edu.in' 
      });
      
      if (markError) {
        console.error('Warning: Could not mark invitation as used:', markError);
      }
    } catch (markInvitationError) {
      console.error('Warning: Exception marking invitation as used:', markInvitationError);
    }

    // Admin account created successfully - require manual sign-in
    if (signUpData.user && !signUpError) {
      console.log('Admin user created successfully');
      
      return {
        success: true,
        message: 'Admin account created! Please sign in with:\nEmail: praveen@rgce.edu.in\nPassword: Admin@123!RGCE',
        requiresManualAuth: true
      };
    }

    return {
      success: true,
      message: 'Admin setup completed. Please sign in with praveen@rgce.edu.in',
      requiresManualAuth: true
    };

  } catch (error) {
    console.error('Unexpected error in admin setup:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during admin setup',
      error
    };
  }
};

export const displayAdminSetupResult = (result: AdminSetupResult) => {
  if (result.success) {
    toast.success(result.message, {
      duration: 5000,
      description: result.requiresManualAuth ? 
        'You can now sign in using the admin credentials.' : 
        'The admin account is ready to use.'
    });
  } else {
    toast.error('Admin Setup Failed', {
      duration: 8000,
      description: result.message
    });
    console.error('Admin setup error details:', result.error);
  }
};
