
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

    const { userId, email, employeeId } = await req.json();

    console.log('Linking faculty profile for user:', userId, email, employeeId);

    // Find the faculty profile by employee code
    const { data: facultyProfile, error: fetchError } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('employee_code', employeeId)
      .is('user_id', null)
      .single();

    if (fetchError || !facultyProfile) {
      console.error('Faculty profile not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Faculty profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the faculty profile with the user ID and activate it
    const { error: updateError } = await supabase
      .from('faculty_profiles')
      .update({
        user_id: userId,
        is_active: true
      })
      .eq('id', facultyProfile.id);

    if (updateError) {
      console.error('Error updating faculty profile:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to link faculty profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Faculty profile linked successfully');

    return new Response(
      JSON.stringify({ success: true, facultyProfileId: facultyProfile.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in link_faculty_profile:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
