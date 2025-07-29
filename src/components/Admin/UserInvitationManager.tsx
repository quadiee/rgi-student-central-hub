
import React, { useState, useEffect } from 'react';
import { Plus, Send, ExternalLink, Mail, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface PendingInvite {
  id: string;
  email: string;
  invited_at: string;
  role?: string;
  department_id?: string;
  department_name?: string;
  email_sent?: boolean;
  email_sent_at?: string | null;
}

// Utility function to format date for Supabase/Postgres (no milliseconds, +00:00 timezone)
function toSupabaseTimestamp(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

const UserInvitationManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    role: 'student',
    department_id: '',
    rollNumber: '',
    employeeId: ''
  });

  const roles = ['student', 'hod', 'principal', 'admin', 'faculty', 'chairman'];

  useEffect(() => {
    loadDepartments();
    loadPendingInvites();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Load pending invites from user_invitations table
  const loadPendingInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          id,
          email,
          role,
          department_id,
          invited_at,
          email_sent,
          email_sent_at
        `)
        .is('used_at', null)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error loading pending invites:', error);
        toast({ 
          title: "Error", 
          description: "Failed to load pending invites", 
          variant: "destructive" 
        });
        return;
      }

      // Get department names for each invite
      const invitesWithDepartments = await Promise.all(
        (data || []).map(async (invite) => {
          let departmentName = 'Unknown Department';
          
          if (invite.department_id) {
            try {
              const { data: deptData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', invite.department_id)
                .single();
              
              if (deptData) {
                departmentName = deptData.name;
              }
            } catch (error) {
              console.error('Error fetching department:', error);
            }
          }
          
          return {
            ...invite,
            department_name: departmentName
          };
        })
      );
      
      setPendingInvites(invitesWithDepartments);
    } catch (error) {
      console.error('Error in loadPendingInvites:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load pending invites", 
        variant: "destructive" 
      });
    }
  };

  const sendInvitationEmail = async (invitationId: string, email: string, role: string, departmentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email,
          role,
          departmentId,
          invitedBy: user?.id,
          invitationId
        }
      });

      if (error) {
        console.error('Error sending invitation email:', error);
        return false;
      }

      console.log('Invitation email sent:', data);
      return true;
    } catch (error) {
      console.error('Error in sendInvitationEmail:', error);
      return false;
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // First create the invitation record
      const { data: inviteData, error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: formData.email.trim().toLowerCase(),
          role: formData.role as any,
          department_id: formData.department_id,
          roll_number: formData.role === 'student' ? formData.rollNumber || null : null,
          employee_id: formData.role !== 'student' ? formData.employeeId || null : null,
          invited_by: user.id,
          is_active: true,
          expires_at: toSupabaseTimestamp(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        })
        .select()
        .single();

      if (inviteError) {
        if (inviteError.code === '23505') { // Unique constraint violation
          toast({
            title: "Invite Failed",
            description: "An invitation for this email already exists.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Invite Failed",
            description: inviteError.message,
            variant: "destructive"
          });
        }
        return;
      }

      // Send invitation email
      const emailSent = await sendInvitationEmail(
        inviteData.id,
        formData.email.trim().toLowerCase(),
        formData.role,
        formData.department_id
      );

      toast({
        title: "Invitation Sent Successfully",
        description: `User invitation sent to ${formData.email}. ${emailSent ? 'Email notification sent.' : 'User will need to register manually.'}`,
      });

      // Reset form and reload invites
      setFormData({
        email: '',
        role: 'student',
        department_id: '',
        rollNumber: '',
        employeeId: ''
      });
      setShowForm(false);
      loadPendingInvites();

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (invite: PendingInvite) => {
    const emailSent = await sendInvitationEmail(
      invite.id,
      invite.email,
      invite.role || 'student',
      invite.department_id || ''
    );

    if (emailSent) {
      toast({
        title: "Email Resent",
        description: `Invitation email resent to ${invite.email}`,
      });
      loadPendingInvites();
    } else {
      toast({
        title: "Failed to Resend",
        description: "Failed to resend invitation email",
        variant: "destructive"
      });
    }
  };

  const copyInvitationUrl = (email: string) => {
    const invitationUrl = `${window.location.origin}/auth?mode=invited&email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(invitationUrl);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">User Invitations</h3>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Send Invitation</span>
        </Button>
      </div>

      {/* Invitation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send User Invitation</h3>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@rgce.edu.in"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="department_id">Department *</Label>
                  <select
                    id="department_id"
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.role === 'student' ? (
                <div>
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g., 21CSE001"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g., FAC001"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.department_id}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Send Invitation</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Invites List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
        <h4 className="px-6 py-3 text-left text-sm font-medium text-gray-700">Pending Invitations</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invited On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingInvites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No pending invitations.
                  </td>
                </tr>
              ) : (
                pendingInvites.map(invite => (
                  <tr key={invite.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{invite.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.department_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {invite.email_sent ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Email Sent</span>
                          </div>
                        ) : (
                          <span className="text-sm text-orange-600">Email Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(invite.invited_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendEmail(invite)}
                          className="flex items-center space-x-1"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Resend</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInvitationUrl(invite.email)}
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Copy Link</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserInvitationManager;
