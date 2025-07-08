
import { supabase } from '../integrations/supabase/client';

export interface LinkContext {
  userRole?: string;
  department?: string;
  invitationType?: 'new_user' | 'password_reset' | 'magic_link';
  redirectPath?: string;
  userData?: {
    name?: string;
    email?: string;
    roll_number?: string;
    employee_id?: string;
  };
}

export class LinkGenerator {
  private static getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://rgi-student-central-hub.lovable.app';
  }

  static generateInvitationUrl(token: string, context?: LinkContext): string {
    const baseUrl = this.getBaseUrl();
    let url = `${baseUrl}/invite/${token}`;
    
    // Add context parameters for personalized landing
    if (context?.userRole) {
      url += `?role=${context.userRole}`;
    }
    if (context?.department) {
      url += `${url.includes('?') ? '&' : '?'}dept=${context.department}`;
    }
    
    return url;
  }

  static generatePasswordResetUrl(token?: string, context?: LinkContext): string {
    const baseUrl = this.getBaseUrl();
    let url = `${baseUrl}/reset-password`;
    
    if (token) {
      url += `?token=${token}`;
    }
    
    // Add context for personalized flow
    if (context?.userRole) {
      url += `${url.includes('?') ? '&' : '?'}role=${context.userRole}`;
    }
    
    return url;
  }

  static generateMagicLinkUrl(token: string, context?: LinkContext): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/auth/callback?token=${token}&type=magiclink`;
  }

  static getRoleBasedDashboardUrl(role: string): string {
    const baseUrl = this.getBaseUrl();
    const dashboardPaths = {
      'student': '/dashboard',
      'hod': '/dashboard',
      'principal': '/dashboard',
      'chairman': '/dashboard',
      'admin': '/dashboard'
    };
    
    return `${baseUrl}${dashboardPaths[role as keyof typeof dashboardPaths] || '/dashboard'}`;
  }

  static generateSecureToken(): string {
    return `secure_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
}
