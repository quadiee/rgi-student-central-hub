
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

interface InvitationEmailRequest {
  email: string;
  role: string;
  departmentId: string;
  invitedBy?: string;
  invitationId: string;
  rollNumber?: string;
  employeeId?: string;
}

const getAppUrl = (req: Request): string => {
  // Always use the production URL for consistency
  return 'https://rgi-student-central-hub.lovable.app';
};

const generatePersonalizedEmailTemplate = (data: {
  recipientName?: string;
  recipientEmail: string;
  role: string;
  department?: string;
  inviterName?: string;
  actionUrl: string;
  rollNumber?: string;
  employeeId?: string;
}): string => {
  const institution = {
    name: 'Rajiv Gandhi College of Engineering',
    shortName: 'RGCE'
  };

  const roleSpecificContent = getRoleSpecificContent(data.role, data.department);
  
  return `
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; background: #fafafa; }
          .cta-button { 
            background: linear-gradient(135deg, #2563eb, #9333ea); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            display: inline-block; 
            margin: 24px 0; 
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .info-card { 
            background: white; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 24px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .role-badge { 
            background: #3b82f6; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 16px; 
            font-size: 12px; 
            font-weight: 600;
            text-transform: uppercase;
          }
          .features { list-style: none; padding: 0; }
          .features li { 
            padding: 8px 0; 
            border-bottom: 1px solid #f3f4f6; 
            position: relative; 
            padding-left: 24px;
          }
          .features li:before { 
            content: "✓"; 
            color: #10b981; 
            font-weight: bold; 
            position: absolute; 
            left: 0;
          }
          .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome to ${institution.name}</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">You're invited to join ${institution.shortName} Portal</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${data.recipientName || 'Future RGCE Member'}!</h2>
            
            <p style="font-size: 16px; color: #4b5563;">
              You have been invited to join <strong>${institution.name}</strong> as a 
              <span class="role-badge">${formatRole(data.role)}</span>
              ${data.department ? ` in the <strong>${data.department}</strong> department` : ''}.
            </p>
            
            ${roleSpecificContent}
            
            <div class="info-card">
              <h3 style="margin-top: 0; color: #1f2937;">Your Account Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 8px 0;">${data.recipientEmail}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Role:</strong></td><td style="padding: 8px 0;">${formatRole(data.role)}</td></tr>
                ${data.department ? `<tr><td style="padding: 8px 0; color: #6b7280;"><strong>Department:</strong></td><td style="padding: 8px 0;">${data.department}</td></tr>` : ''}
                ${data.rollNumber ? `<tr><td style="padding: 8px 0; color: #6b7280;"><strong>Roll Number:</strong></td><td style="padding: 8px 0;">${data.rollNumber}</td></tr>` : ''}
                ${data.employeeId ? `<tr><td style="padding: 8px 0; color: #6b7280;"><strong>Employee ID:</strong></td><td style="padding: 8px 0;">${data.employeeId}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.actionUrl}" class="cta-button">
                Complete Registration & Access Portal
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Important:</strong> This invitation will expire in 7 days. 
                If you have any questions, please contact the IT department.
              </p>
            </div>
            
            ${data.inviterName ? `<p style="color: #6b7280; font-style: italic; text-align: center;">Invited by: ${data.inviterName}</p>` : ''}
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${institution.name}</p>
            <p style="margin: 8px 0 0 0;">This is an automated email from ${institution.shortName} Portal</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const getRoleSpecificContent = (role: string, department?: string): string => {
  const features = {
    student: [
      'View and manage your fee payments',
      'Access academic information and grades',
      'Track your academic progress',
      'Communicate with faculty and administration',
      'Access course materials and schedules'
    ],
    hod: [
      'Department-wide fee management and analytics',
      'Student academic records for your department',
      'Faculty management and oversight tools',
      'Department-specific reporting and insights',
      'Administrative communication tools'
    ],
    principal: [
      'Institution-wide fee management',
      'Complete analytics and reporting dashboard',
      'Student and faculty oversight across all departments',
      'Administrative management tools',
      'Strategic planning and decision-making tools'
    ],
    chairman: [
      'Complete institutional oversight and control',
      'Institution-wide fee management and analytics',
      'Strategic administrative and planning tools',
      'Executive reporting and decision-making dashboard',
      'Full student and faculty management'
    ],
    admin: [
      'Complete user management and role assignment',
      'System configuration and maintenance tools',
      'Advanced fee management and bulk operations',
      'Full database access and reporting capabilities',
      'Security, audit, and system monitoring tools'
    ]
  };

  const roleFeatures = features[role as keyof typeof features] || ['Access to portal features'];
  
  return `
    <div class="info-card">
      <h3 style="margin-top: 0; color: #1f2937;">What you'll have access to:</h3>
      <ul class="features">
        ${roleFeatures.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
    </div>
  `;
};

const formatRole = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    'student': 'Student',
    'hod': 'Head of Department',
    'principal': 'Principal',
    'chairman': 'Chairman',
    'admin': 'System Administrator'
  };
  return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, role, departmentId, invitedBy, invitationId, rollNumber, employeeId }: InvitationEmailRequest = await req.json();

    if (!email || !role || !departmentId || !invitationId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: email, role, departmentId, and invitationId are required."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Get department name
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('name')
      .eq('id', departmentId)
      .single();

    if (deptError) {
      console.error('Error fetching department:', deptError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid department ID."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const departmentName = deptData?.name || 'Unknown Department';

    // Generate secure token and update invitation
    const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('user_invitations')
      .update({ token: invitationToken })
      .eq('id', invitationId)
      .select()
      .single();

    if (updateError || !updatedInvitation) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not update invitation token.",
          details: updateError
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Get inviter details
    let inviterName = "Administrator";
    if (invitedBy) {
      const { data: inviterData } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", invitedBy)
        .single();
      if (inviterData?.name) {
        inviterName = inviterData.name;
      }
    }

    // Generate personalized invitation URL with correct app URL
    const appUrl = getAppUrl(req);
    const invitationUrl = `${appUrl}/invite/${invitationToken}?role=${role}&dept=${departmentName}`;

    // Generate personalized email content
    const emailHtml = generatePersonalizedEmailTemplate({
      recipientEmail: email,
      role,
      department: departmentName,
      inviterName,
      actionUrl: invitationUrl,
      rollNumber,
      employeeId
    });

    // Send email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service not configured. Please contact administrator."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const emailSubject = `Welcome to RGCE Portal - ${formatRole(role)} Invitation`;
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "RGCE Portal <no-reply@rgce.edu.in>",
        to: email,
        subject: emailSubject,
        html: emailHtml
      }),
    });

    const resendResult = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: resendResult.error || resendResult.message || "Failed to send email",
          resendResult
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Update invitation as sent
    await supabase
      .from("user_invitations")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", invitationId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Personalized invitation email sent successfully",
        invitationUrl: invitationUrl,
        resendResult
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-invitation-email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send invitation email",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
