import React, { useState, useEffect } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type Department = Database['public']['Enums']['department'];

interface PendingInvite {
  id: string;
  email: string;
  invited_at: string;
  role?: string;
  department?: string;
}

const UserInvitationManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    role: 'student' as UserRole,
    department: 'CSE' as Department,
    rollNumber: '',
    employeeId: ''
  });

  const roles: UserRole[] = ['student', 'hod', 'principal', 'admin'];
  const departments: Department[] = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  // Load pending invites from user_invitations table
  const loadPendingInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('used_at', null)
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

      const invites = (data || []).map(invite => ({
        id: invite.id,
        email: invite.email,
        invited_at: invite.invited_at || new Date().toISOString(),
        role: invite.role || "",
        department: invite.department || ""
      }));
      
      setPendingInvites(invites);
    } catch (error) {
      console.error('Error in loadPendingInvites:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load pending invites", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    loadPendingInvites();
  }, []);

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
          role: formData.role,
          department: formData.department,
          roll_number: formData.role === 'student' ? formData.rollNumber || null : null,
          employee_id: formData.role !== 'student' ? formData.employeeId || null : null,
          invited_by: user.id,
          is_active: true,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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

      // Create the user in auth.users with metadata - CRITICAL FIX
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: 'TempPassword123!', // Temporary password - user will be prompted to change
        options: {
          data: {
            name: formData.email.split('@')[0], // Use email prefix as initial name
            role: formData.role,
            department: formData.department,
            roll_number: formData.role === 'student' ? formData.rollNumber || null : null,
            employee_id: formData.role !== 'student' ? formData.employeeId || null : null,
            invitation_id: inviteData.id
          },
          emailRedirectTo: `${window.location.origin}/auth?mode=invited`
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        toast({
          title: "Invitation Created",
          description: `Invitation sent to ${formData.email}. User will need to register manually.`,
        });
      } else {
        toast({
          title: "Invitation Sent Successfully",
          description: `User account created and invitation sent to ${formData.email}`,
        });
      }

      // Reset form and reload invites
      setFormData({
        email: '',
        role: 'student',
        department: 'CSE',
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
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
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
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
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
                <Button type="submit" disabled={loading}>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invited On</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingInvites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No pending invitations.
                  </td>
                </tr>
              ) : (
                pendingInvites.map(invite => (
                  <tr key={invite.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{invite.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(invite.invited_at).toLocaleDateString()}</td>
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
