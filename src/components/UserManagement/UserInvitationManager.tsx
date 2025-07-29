import React, { useState, useEffect } from 'react';
import { Send, Copy, RefreshCw, Eye, Trash2, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface Invitation {
  id: string;
  email: string;
  role: string;
  department_id?: string;
  department?: string; // Legacy field
  department_name?: string;
  department_code?: string;
  roll_number?: string;
  employee_id?: string;
  is_active: boolean;
  expires_at: string;
  used_at?: string;
  invited_at: string;
  email_sent: boolean;
  email_sent_at?: string;
  token?: string;
}

interface UserInvitationManagerProps {
  onDataChange: () => void;
}

const UserInvitationManager: React.FC<UserInvitationManagerProps> = ({ onDataChange }) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          id,
          email,
          role,
          department_id,
          department,
          roll_number,
          employee_id,
          is_active,
          expires_at,
          used_at,
          invited_at,
          email_sent,
          email_sent_at,
          token
        `)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      
      // Handle both old and new data structures
      const invitationsWithDepts = await Promise.all(
        (data || []).map(async (invitation: any) => {
          let departmentName = 'Unknown Department';
          let departmentCode = 'UNK';
          
          // Check if we have department_id (new structure)
          if (invitation.department_id) {
            try {
              const { data: deptData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', invitation.department_id)
                .single();
              
              if (deptData) {
                departmentName = deptData.name;
                departmentCode = deptData.code;
              }
            } catch (error) {
              console.error('Error fetching department:', error);
            }
          }
          // Fallback to old department enum structure
          else if (invitation.department) {
            try {
              const { data: deptData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('code', invitation.department)
                .single();
              
              if (deptData) {
                departmentName = deptData.name;
                departmentCode = deptData.code;
              }
            } catch (error) {
              console.error('Error fetching department by code:', error);
            }
          }
          
          return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            department_id: invitation.department_id,
            department: invitation.department,
            roll_number: invitation.roll_number,
            employee_id: invitation.employee_id,
            is_active: invitation.is_active,
            expires_at: invitation.expires_at,
            used_at: invitation.used_at,
            invited_at: invitation.invited_at,
            email_sent: invitation.email_sent,
            email_sent_at: invitation.email_sent_at,
            token: invitation.token,
            department_name: departmentName,
            department_code: departmentCode
          };
        })
      );

      // Remove duplicates based on email and keep the most recent one
      const uniqueInvitations = invitationsWithDepts.reduce((acc: Invitation[], current) => {
        const existingIndex = acc.findIndex(inv => inv.email === current.email);
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          // Keep the more recent invitation
          if (new Date(current.invited_at) > new Date(acc[existingIndex].invited_at)) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []);

      setInvitations(uniqueInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invitations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const copyInvitationLink = (invitation: Invitation) => {
    const baseUrl = window.location.origin;
    const invitationUrl = invitation.token 
      ? `${baseUrl}/invite/${invitation.token}`
      : `${baseUrl}/signup?email=${encodeURIComponent(invitation.email)}`;
    
    navigator.clipboard.writeText(invitationUrl);
    toast({
      title: "Success",
      description: "Invitation link copied to clipboard",
    });
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: invitation.email,
          role: invitation.role,
          departmentId: invitation.department_id || '',
          invitationId: invitation.id,
          rollNumber: invitation.roll_number,
          employeeId: invitation.employee_id
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Invitation email resent successfully",
      });

      // Update the invitation record to mark email as sent
      await supabase
        .from('user_invitations')
        .update({ 
          email_sent: true, 
          email_sent_at: new Date().toISOString() 
        })
        .eq('id', invitation.id);

      fetchInvitations();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive"
      });
    }
  };

  const deleteInvitation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation deleted successfully",
      });

      fetchInvitations();
      onDataChange();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.used_at) {
      return <Badge variant="default" className="bg-green-600">Used</Badge>;
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (!invitation.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!invitation.email_sent) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Email Pending</Badge>;
    }
    return <Badge variant="outline" className="border-blue-500 text-blue-600">Sent</Badge>;
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'student': 'Student',
      'faculty': 'Faculty',
      'hod': 'Head of Department',
      'principal': 'Principal',
      'chairman': 'Chairman',
      'admin': 'Administrator'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Invitations ({invitations.length})</CardTitle>
          <Button onClick={fetchInvitations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{invitation.email}</h3>
                      {getStatusBadge(invitation)}
                      <Badge variant="secondary" className="capitalize">
                        {getRoleDisplayName(invitation.role)}
                      </Badge>
                      <Badge variant="outline">{invitation.department_name}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {invitation.roll_number && `Roll: ${invitation.roll_number} • `}
                      {invitation.employee_id && `Employee ID: ${invitation.employee_id} • `}
                      Department: {invitation.department_name} ({invitation.department_code})
                    </p>
                    <p className="text-xs text-gray-500">
                      Invited: {new Date(invitation.invited_at).toLocaleDateString()} • 
                      Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                      {invitation.email_sent_at && ` • Email sent: ${new Date(invitation.email_sent_at).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!invitation.email_sent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendInvitation(invitation)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(invitation)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {invitations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No invitations found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {invitations.filter(i => !i.used_at && new Date(i.expires_at) > new Date() && i.is_active).length}
            </div>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {invitations.filter(i => i.used_at).length}
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {invitations.filter(i => !i.email_sent).length}
            </div>
            <p className="text-sm text-gray-600">Email Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {invitations.filter(i => !i.used_at && new Date(i.expires_at) < new Date()).length}
            </div>
            <p className="text-sm text-gray-600">Expired</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserInvitationManager;
