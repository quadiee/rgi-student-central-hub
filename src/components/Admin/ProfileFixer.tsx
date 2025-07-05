
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

const ProfileFixer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fixAdmission60Profile = async () => {
    try {
      setLoading(true);
      
      // Get the invitation details for admission60@rgce.edu.in
      const { data: invitationData, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('email', 'admission60@rgce.edu.in')
        .eq('is_active', true)
        .is('used_at', null)
        .single();

      if (invitationError || !invitationData) {
        toast({
          title: "Error",
          description: "No active invitation found for admission60@rgce.edu.in",
          variant: "destructive",
        });
        return;
      }

      // Get the department_id for the invitation department
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('code', invitationData.department)
        .single();

      if (deptError || !deptData) {
        toast({
          title: "Error",
          description: `Department ${invitationData.department} not found`,
          variant: "destructive",
        });
        return;
      }

      // Update the user's profile with invitation data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: invitationData.roll_number || 'Student Name', // Use roll number as temporary name
          role: invitationData.role,
          department_id: deptData.id,
          roll_number: invitationData.roll_number,
          employee_id: invitationData.employee_id,
        })
        .eq('email', 'admission60@rgce.edu.in');

      if (updateError) {
        throw updateError;
      }

      // Mark the invitation as used
      await supabase
        .from('user_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitationData.id);

      toast({
        title: "Success",
        description: "Profile fixed successfully! The user now has correct role and department.",
      });

    } catch (error) {
      console.error('Error fixing profile:', error);
      toast({
        title: "Error",
        description: "Failed to fix profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-medium text-yellow-800 mb-2">Profile Fix Utility</h4>
      <p className="text-sm text-yellow-700 mb-3">
        Fix the admission60@rgce.edu.in user profile to match their invitation data.
      </p>
      <Button
        onClick={fixAdmission60Profile}
        disabled={loading}
        variant="outline"
        size="sm"
        className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
      >
        {loading ? 'Fixing...' : 'Fix admission60 Profile'}
      </Button>
    </div>
  );
};

export default ProfileFixer;
