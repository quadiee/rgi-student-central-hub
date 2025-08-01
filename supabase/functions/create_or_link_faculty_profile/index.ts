
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

    // Use the new database function that can both create and link profiles
    const { data, error } = await supabase.rpc('create_or_link_faculty_profile', {
      p_user_id: userId,
      p_email: email,
      p_employee_code: employeeId,
      p_name: name,
      p_designation: designation,
      p_department_id: departmentId
    });

    if (error) {
      console.error('Error creating/linking faculty profile:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Faculty profile created/linked successfully:', data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create_or_link_faculty_profile:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
