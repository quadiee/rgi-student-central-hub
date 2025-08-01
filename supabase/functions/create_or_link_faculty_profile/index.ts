
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, email, employeeId, name, designation, departmentId } = await req.json();

    console.log('Creating/linking faculty profile for user:', userId, email, employeeId);

    // First, check if a faculty profile already exists for this employee code
    const { data: existingFaculty, error: checkError } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('employee_code', employeeId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing faculty profile:', checkError);
      throw checkError;
    }

    let facultyProfile;

    if (existingFaculty) {
      // Link existing faculty profile to the new user
      const { data: updatedProfile, error: updateError } = await supabase
        .from('faculty_profiles')
        .update({
          user_id: userId,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingFaculty.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error linking faculty profile:', updateError);
        throw updateError;
      }

      facultyProfile = updatedProfile;
      console.log('Linked existing faculty profile:', facultyProfile);
    } else {
      // Create new faculty profile
      const { data: newProfile, error: createError } = await supabase
        .from('faculty_profiles')
        .insert({
          user_id: userId,
          employee_code: employeeId,
          designation: designation || 'Faculty',
          joining_date: new Date().toISOString().split('T')[0], // Today's date as joining date
          is_active: true,
          created_by: userId
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating faculty profile:', createError);
        throw createError;
      }

      facultyProfile = newProfile;
      console.log('Created new faculty profile:', facultyProfile);
    }

    // Also ensure the user's profile is properly updated with department info
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        name: name,
        department_id: departmentId,
        employee_id: employeeId,
        is_active: true,
        profile_completed: true
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error('Error updating user profile:', profileUpdateError);
      // Don't throw here as the faculty profile was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        faculty_profile: facultyProfile,
        message: existingFaculty ? 'Faculty profile linked successfully' : 'Faculty profile created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create_or_link_faculty_profile:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
