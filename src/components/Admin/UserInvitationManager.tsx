// src/components/UserInvitationManager.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Send, Edit3, XCircle, Mail, ExternalLink, CheckCircle } from 'lucide-react';
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
  role: UserRole;
  department: Department;
  roll_number: string | null;
  employee_id: string | null;
  email_sent: boolean;
}

function toSupabaseTimestamp(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

const UserInvitationManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [editingInvite, setEditingInvite] = useState<PendingInvite | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    role: 'student' as UserRole,
    department: 'CSE' as Department,
    rollNumber: '',
    employeeId: ''
  });

  const roles: UserRole[] = ['student', 'hod', 'principal', 'admin'];
  const departments: Department[] = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];

  // Read
  const loadPendingInvites = async () => {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .is('used_at', null)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());
    if (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not load invites', variant: 'destructive' });
      return;
    }
    setPendingInvites(
      (data ?? []).map(inv => ({
        id: inv.id,
        email: inv.email,
        invited_at: inv.invited_at!,
        role: inv.role!,
        department: inv.department!,
        roll_number: inv.roll_number,
        employee_id: inv.employee_id,
        email_sent: inv.email_sent ?? false
      }))
    );
  };

  useEffect(() => {
    loadPendingInvites();
  }, []);

  // Send email (shared by create & resend)
  const sendInvitationEmail = async (
    invitationId: string,
    email: string,
    role: UserRole,
    department: Department
  ) => {
    const { error } = await supabase.functions.invoke('send-invitation-email', {
      body: { email, role, department, invitedBy: user?.id, invitationId }
    });
    return !error;
  };

  // Create or Update handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (editingInvite) {
        // UPDATE
        const { error } = await supabase
          .from('user_invitations')
          .update({
            role: formData.role,
            department: formData.department,
            roll_number: formData.role === 'student' ? formData.rollNumber || null : null,
            employee_id: formData.role !== 'student' ? formData.employeeId || null : null,
          })
          .eq('id', editingInvite.id);

        if (error) {
          toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Invitation Updated' });
          setShowForm(false);
          setEditingInvite(null);
          loadPendingInvites();
        }
      } else {
        // CREATE
        // 1) insert invite record
        const { data: inv, error: invErr } = await supabase
          .from('user_invitations')
          .insert({
            email: formData.email.trim().toLowerCase(),
            role: formData.role,
            department: formData.department,
            roll_number: formData.role === 'student' ? formData.rollNumber || null : null,
            employee_id: formData.role !== 'student' ? formData.employeeId || null : null,
            invited_by: user.id,
            expires_at: toSupabaseTimestamp(new Date(Date.now() + 7 * 86400e3))
          })
          .select()
          .single();

        if (invErr) {
          if (invErr.code === '23505') {
            toast({ title: 'Invite Failed', description: 'Already invited', variant: 'destructive' });
          } else {
            toast({ title: 'Invite Failed', description: invErr.message, variant: 'destructive' });
          }
          setLoading(false);
          return;
        }

        // 2) send email
        await sendInvitationEmail(inv.id, inv.email, inv.role!, inv.department!);

        // 3) create auth user
        const { error: authErr } = await supabase.auth.signUp({
          email: inv.email,
          password: 'TempPassword123!',
          options: {
            data: {
              role: inv.role,
              department: inv.department,
              roll_number: inv.roll_number,
              employee_id: inv.employee_id,
              invitation_id: inv.id
            },
            emailRedirectTo: `${window.location.origin}/auth?mode=invited`
          }
        });

        toast({
          title: authErr ? 'Invitation Created' : 'Invitation Sent',
          description: authErr
            ? `Invite recorded; ask user to sign up manually.`
            : `Account created; email sent to ${inv.email}.`
        });

        setFormData({ email: '', role: 'student', department: 'CSE', rollNumber: '', employeeId: '' });
        setShowForm(false);
        loadPendingInvites();
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Open edit form
  const openEditForm = (invite: PendingInvite) => {
    setEditingInvite(invite);
    setFormData({
      email: invite.email,
      role: invite.role,
      department: invite.department,
      rollNumber: invite.roll_number ?? '',
      employeeId: invite.employee_id ?? ''
    });
    setShowForm(true);
  };

  // Cancel (soft-delete)
  const handleCancelInvitation = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('user_invitations')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      toast({ title: 'Cancel Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Invitation Cancelled' });
      loadPendingInvites();
    }
    setLoading(false);
  };

  // Resend email
  const handleResendEmail = async (invite: PendingInvite) => {
    if (await sendInvitationEmail(invite.id, invite.email, invite.role, invite.department)) {
      toast({ title: 'Email Resent', description: `Resent to ${invite.email}` });
      loadPendingInvites();
    } else {
      toast({ title: 'Resend Failed', variant: 'destructive' });
    }
  };

  // Copy link
  const copyInvitationUrl = (email: string) => {
    const url = `${window.location.origin}/auth?mode=invited&email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Invitations</h3>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Send Invitation</span>
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingInvite ? 'Edit Invitation' : 'Send Invitation'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingInvite && (
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    required
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    required
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {roles.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="dept">Dept *</Label>
                  <select
                    id="dept"
                    value={formData.department}
                    required
                    onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {formData.role === 'student' ? (
                <div>
                  <Label htmlFor="roll">Roll #</Label>
                  <Input
                    id="roll"
                    value={formData.rollNumber}
                    onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="emp">Emp ID</Label>
                  <Input
                    id="emp"
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingInvite(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? <span>Processing…</span>
                    : editingInvite
                      ? <span><Edit3 className="w-4 h-4 inline" /> Update</span>
                      : <span><Send className="w-4 h-4 inline" /> Send</span>
                  }
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h4 className="px-6 py-3 text-sm font-medium">Pending Invitations</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2">Email</th>
                <th className="px-6 py-2">Role</th>
                <th className="px-6 py-2">Dept</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2">Invited On</th>
                <th className="px-6 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingInvites.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No pending invitations.
                  </td>
                </tr>
              )}

              {pendingInvites.map(inv => (
                <tr key={inv.id}>
                  <td className="px-6 py-4">{inv.email}</td>
                  <td className="px-6 py-4">{inv.role}</td>
                  <td className="px-6 py-4">{inv.department}</td>
                  <td className="px-6 py-4">
                    {inv.email_sent
                      ? <span className="inline-flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" /> Sent
                        </span>
                      : <span className="text-orange-600">Pending</span>}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(inv.invited_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleResendEmail(inv)}>
                      <Mail className="w-3 h-3" /> Resend
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyInvitationUrl(inv.email)}>
                      <ExternalLink className="w-3 h-3" /> Link
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditForm(inv)}>
                      <Edit3 className="w-3 h-3" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleCancelInvitation(inv.id)}>
                      <XCircle className="w-3 h-3" /> Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserInvitationManager;
