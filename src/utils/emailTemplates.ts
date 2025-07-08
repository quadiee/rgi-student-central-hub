
export interface EmailTemplateData {
  recipientName?: string;
  recipientEmail: string;
  role: string;
  department?: string;
  inviterName?: string;
  institutionName?: string;
  actionUrl: string;
  token?: string;
  rollNumber?: string;
  employeeId?: string;
}

export class EmailTemplateGenerator {
  private static getInstitutionInfo() {
    return {
      name: 'Rajiv Gandhi College of Engineering',
      shortName: 'RGCE',
      address: 'Bhopal, Madhya Pradesh',
      website: 'https://rgce.edu.in'
    };
  }

  static generateInvitationEmail(data: EmailTemplateData): string {
    const institution = this.getInstitutionInfo();
    const roleSpecificContent = this.getRoleSpecificInvitationContent(data.role, data);
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .cta-button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .info-box { background: #e0f2fe; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${institution.name}</h1>
              <p>Welcome to ${institution.shortName} Portal</p>
            </div>
            <div class="content">
              <h2>You're Invited to Join ${institution.shortName}!</h2>
              <p>Dear ${data.recipientName || 'Future RGCE Member'},</p>
              
              ${roleSpecificContent}
              
              <div class="info-box">
                <strong>Your Account Details:</strong><br>
                Role: ${this.formatRole(data.role)}<br>
                ${data.department ? `Department: ${data.department}<br>` : ''}
                ${data.rollNumber ? `Roll Number: ${data.rollNumber}<br>` : ''}
                ${data.employeeId ? `Employee ID: ${data.employeeId}<br>` : ''}
                Email: ${data.recipientEmail}
              </div>
              
              <div style="text-align: center;">
                <a href="${data.actionUrl}" class="cta-button">
                  Complete Registration & Access Portal
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This invitation will expire in 7 days for security reasons. If you have any questions, 
                please contact the IT department or your ${data.role === 'student' ? 'faculty advisor' : 'department head'}.
              </p>
              
              ${data.inviterName ? `<p><em>Invited by: ${data.inviterName}</em></p>` : ''}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${institution.name}<br>
              ${institution.address}<br>
              This is an automated email from ${institution.shortName} Portal.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generatePasswordResetEmail(data: EmailTemplateData): string {
    const institution = this.getInstitutionInfo();
    const roleSpecificContent = this.getRoleSpecificResetContent(data.role);
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fef7f7; padding: 30px; border-radius: 0 0 8px 8px; }
            .cta-button { background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .warning-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
              <p>${institution.shortName} Portal Security</p>
            </div>
            <div class="content">
              <h2>Reset Your ${institution.shortName} Portal Password</h2>
              <p>Hello ${data.recipientName || this.formatRole(data.role)},</p>
              
              <p>We received a request to reset your password for your ${institution.shortName} Portal account.</p>
              
              ${roleSpecificContent}
              
              <div style="text-align: center;">
                <a href="${data.actionUrl}" class="cta-button">
                  Reset Password Now
                </a>
              </div>
              
              <div class="warning-box">
                <strong>Security Notice:</strong><br>
                • This link will expire in 1 hour for security reasons<br>
                • If you didn't request this reset, please ignore this email<br>
                • Contact IT support if you suspect unauthorized access
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${data.actionUrl}" style="word-break: break-all; color: #dc2626;">${data.actionUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${institution.name}<br>
              This is an automated security email from ${institution.shortName} Portal.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getRoleSpecificInvitationContent(role: string, data: EmailTemplateData): string {
    switch (role) {
      case 'student':
        return `
          <p>You have been invited to join ${this.getInstitutionInfo().shortName} as a <strong>Student</strong> in the <strong>${data.department}</strong> department.</p>
          <p>Through the portal, you'll be able to:</p>
          <ul>
            <li>View and manage your fee payments</li>
            <li>Access academic information</li>
            <li>Track your academic progress</li>
            <li>Communicate with faculty and administration</li>
          </ul>
        `;
      case 'hod':
        return `
          <p>You have been invited to join ${this.getInstitutionInfo().shortName} as the <strong>Head of Department</strong> for <strong>${data.department}</strong>.</p>
          <p>As HOD, you'll have access to:</p>
          <ul>
            <li>Department-wide fee management and analytics</li>
            <li>Student academic records for your department</li>
            <li>Faculty management tools</li>
            <li>Department-specific reporting and insights</li>
          </ul>
        `;
      case 'principal':
        return `
          <p>You have been invited to join ${this.getInstitutionInfo().shortName} as the <strong>Principal</strong>.</p>
          <p>As Principal, you'll have institution-wide access to:</p>
          <ul>
            <li>Complete fee management across all departments</li>
            <li>Institution-wide analytics and reporting</li>
            <li>Student and faculty oversight</li>
            <li>Administrative management tools</li>
          </ul>
        `;
      case 'chairman':
        return `
          <p>You have been invited to join ${this.getInstitutionInfo().shortName} as the <strong>Chairman</strong>.</p>
          <p>As Chairman, you'll have complete institutional oversight including:</p>
          <ul>
            <li>Institution-wide fee management and analytics</li>
            <li>Strategic administrative tools</li>
            <li>Complete student and faculty oversight</li>
            <li>Executive reporting and decision-making tools</li>
          </ul>
        `;
      case 'admin':
        return `
          <p>You have been invited to join ${this.getInstitutionInfo().shortName} as a <strong>System Administrator</strong>.</p>
          <p>As Administrator, you'll have full system access including:</p>
          <ul>
            <li>Complete user management and role assignment</li>
            <li>System configuration and maintenance</li>
            <li>Advanced fee management features</li>
            <li>Full database access and reporting</li>
            <li>Security and audit tools</li>
          </ul>
        `;
      default:
        return `<p>You have been invited to join ${this.getInstitutionInfo().shortName} as a ${this.formatRole(role)}.</p>`;
    }
  }

  private static getRoleSpecificResetContent(role: string): string {
    switch (role) {
      case 'student':
        return `<p>Once you reset your password, you'll be able to access your student dashboard to view fees, grades, and academic information.</p>`;
      case 'hod':
        return `<p>Once you reset your password, you'll regain access to your department management tools and student oversight features.</p>`;
      case 'principal':
      case 'chairman':
        return `<p>Once you reset your password, you'll regain access to the institution-wide management dashboard and administrative tools.</p>`;
      case 'admin':
        return `<p>Once you reset your password, you'll regain access to the complete system administration panel and all management features.</p>`;
      default:
        return `<p>Once you reset your password, you'll be able to access your account dashboard.</p>`;
    }
  }

  private static formatRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      'student': 'Student',
      'hod': 'Head of Department',
      'principal': 'Principal',
      'chairman': 'Chairman',
      'admin': 'Administrator'
    };
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  }
}
