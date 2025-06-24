
import React, { useState, useEffect } from 'react';
import { Plus, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface Invitation {
  id: string;
  email: string;
  role: string;
  department: string;
  roll_number?: string;
  employee_id?: string;
  invited_at: string;
  expires_at: string;
  used_at?: string;
  is_active: boolean;
}

const UserInvitationManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'student',
    department: 'CSE',
    rollNumber: '',
    employeeId: ''
  });

  const roles = ['student', 'faculty', 'hod', 'principal', 'admin'];
  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive"
      });
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingProfile) {
        toast({
          title: "User Already Exists",
          description: "A user with this email already exists in the system",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('email', formData.email)
        .eq('is_active', true)
        .single();

      if (existingInvitation) {
        toast({
          title: "Invitation Already Sent",
          description: "An active invitation already exists for this email",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create invitation
      const invitationData = {
        email: formData.email,
        role: formData.role,
        department: formData.department,
        roll_number: formData.role === 'student' ? formData.rollNumber : null,
        employee_id: formData.role !== 'student' ? formData.employeeId : null,
        invited_by: user.id
      };

      const { error: insertError } = await supabase
        .from('user_invitations')
        .insert(invitationData);

      if (insertError) throw insertError;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent successfully to ${formData.email}`
      });

      setFormData({
        email: '',
        role: 'student',
        department: 'CSE',
        rollNumber: '',
        employeeId: ''
      });
      setShowForm(false);
      loadInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ is_active: false })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation Deactivated",
        description: "Invitation has been deactivated successfully"
      });

      loadInvitations();
    } catch (error) {
      console.error('Error deactivating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate invitation",
        variant: "destructive"
      });
    }
  };

  const getInvitationStatus = (invitation: Invitation) => {
    if (invitation.used_at) {
      return { status: 'Used', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    if (!invitation.is_active || new Date(invitation.expires_at) < new Date()) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle };
    }
    return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">User Invitations</h3>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
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
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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

      {/* Invitations List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => {
                const { status, color, icon: StatusIcon } = getInvitationStatus(invitation);
                return (
                  <tr key={invitation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {invitation.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invitation.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.invited_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {invitation.is_active && !invitation.used_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {invitations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No invitations sent yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInvitationManager;
