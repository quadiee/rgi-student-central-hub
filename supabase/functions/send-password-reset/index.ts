
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PasswordResetRequest {
  email: string;
  resetUrl?: string;
  context?: {
    userRole?: string;
    department?: string;
    userData?: {
      name?: string;
      email?: string;
    };
  };
}

const getAppUrl = (req: Request): string => {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (origin) return origin;
  if (referer) {
    try { return new URL(referer).origin; } catch {}
  }
  return "https://rgi-student-central-hub.lovable.app";
};

const generatePersonalizedResetEmail = (data: {
  recipientEmail: string;
  recipientName?: string;
  role?: string;
  department?: string;
  resetUrl: string;
}): string => {
  const institution = {
    name: 'Rajiv Gandhi College of Engineering',
    shortName: 'RGCE'
  };

  const roleSpecificContent = getRoleSpecificResetContent(data.role || 'user');
  const greeting = data.recipientName ? `Hello ${data.recipientName}` : `Hello ${formatRole(data.role || 'user')}`;

  return `
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; background: #fefefe; }
          .cta-button { 
            background: linear-gradient(135deg, #dc2626, #ea580c); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            display: inline-block; 
            margin: 24px 0; 
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .warning-box { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 24px 0;
          }
          .security-tips {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
          .link-text { word-break: break-all; color: #dc2626; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">${institution.shortName} Portal Security</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">${greeting},</h2>
            
            <p style="font-size: 16px; color: #4b5563;">
              We received a request to reset your password for your <strong>${institution.shortName} Portal</strong> account.
            </p>
            
            ${roleSpecificContent}
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.resetUrl}" class="cta-button">
                🔑 Reset Password Now
              </a>
            </div>
            
            <div class="warning-box">
              <h3 style="margin-top: 0; color: #92400e;">⚠️ Security Notice</h3>
              <ul style="margin: 8px 0; color: #92400e;">
                <li>This link will expire in <strong>1 hour</strong> for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Contact IT support immediately if you suspect unauthorized access</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <div class="security-tips">
              <h3 style="margin-top: 0; color: #0369a1;">💡 Password Security Tips</h3>
              <ul style="margin: 8px 0; color: #0369a1;">
                <li>Use a strong password with at least 8 characters</li>
                <li>Include uppercase, lowercase, numbers, and symbols</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p class="link-text">${data.resetUrl}</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${institution.name}</p>
            <p style="margin: 8px 0 0 0;">This is an automated security email from ${institution.shortName} Portal</p>
            <p style="margin: 8px 0 0 0;">For support, contact: support@rgce.edu.in</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const getRoleSpecificResetContent = (role: string): string => {
  const roleMessages = {
    student: `
      <p style="color: #4b5563;">
        Once you reset your password, you'll be able to access your <strong>Student Dashboard</strong> 
        to view fees, grades, and academic information.
      </p>
    `,
    hod: `
      <p style="color: #4b5563;">
        Once you reset your password, you'll regain access to your <strong>Department Management Tools</strong> 
        and student oversight features for your department.
      </p>
    `,
    principal: `
      <p style="color: #4b5563;">
        Once you reset your password, you'll regain access to the <strong>Institution-wide Management Dashboard</strong> 
        and all administrative tools.
      </p>
    `,
    chairman: `
      <p style="color: #4b5563;">
        Once you reset your password, you'll regain access to the <strong>Executive Dashboard</strong> 
        with complete institutional oversight and administrative control.
      </p>
    `,
    admin: `
      <p style="color: #4b5563;">
        Once you reset your password, you'll regain access to the <strong>System Administration Panel</strong> 
        with full system management capabilities.
      </p>
    `
  };

  return roleMessages[role as keyof typeof roleMessages] || `
    <p style="color: #4b5563;">
      Once you reset your password, you'll be able to access your account dashboard and all available features.
    </p>
  `;
};

const formatRole = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    'student': 'Student',
    'hod': 'Head of Department',
    'principal': 'Principal',
    'chairman': 'Chairman',
    'admin': 'Administrator'
  };
  return roleMap[role] || 'User';
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const requestBody: PasswordResetRequest = await req.json();
    console.log('Password reset request received:', { email: requestBody.email });
    
    const { email, context } = requestBody;

    if (!email) {
      console.error('Email is required but not provided');
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile for personalization
    console.log('Fetching user profile for:', email);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, role, departments(name)')
      .eq('email', email)
      .single();

    if (profileError) {
      console.log('Profile not found, continuing with basic reset:', profileError.message);
    }

    // Generate password recovery link
    const appUrl = getAppUrl(req);
    const redirectUrl = `${appUrl}/reset-password`;
    
    console.log('Generating recovery link with redirect:', redirectUrl);
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      console.error('Error generating recovery link:', error);
      throw error;
    }

    const resetUrl = data.properties?.action_link;
    if (!resetUrl) {
      console.error('Failed to generate reset link - no action_link in response');
      throw new Error("Failed to generate reset link");
    }

    console.log('Recovery link generated successfully');

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate personalized email
    const emailHtml = generatePersonalizedResetEmail({
      recipientEmail: email,
      recipientName: profile?.name || context?.userData?.name,
      role: profile?.role || context?.userRole,
      department: profile?.departments?.name || context?.department,
      resetUrl
    });

    const emailSubject = `🔒 Reset Your RGCE Portal Password - ${formatRole(profile?.role || context?.userRole || 'user')}`;

    console.log('Sending email via Resend to:', email);
    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "RGCE Portal Security <security@rgce.edu.in>",
        to: [email],
        subject: emailSubject,
        html: emailHtml
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log('Email sent successfully:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Personalized password reset email sent successfully",
        emailId: result.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err: any) {
    console.error('Password reset error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message || "Failed to send password reset email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
