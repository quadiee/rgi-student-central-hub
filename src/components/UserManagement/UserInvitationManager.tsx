
import React, { useState, useEffect } from 'react';
import { Send, Copy, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface Invitation {
  id: string;
  email: string;
  role: string;
  department: string;
  roll_number?: string;
  employee_id?: string;
  is_active: boolean;
  expires_at: string;
  used_at?: string;
  invited_at: string;
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
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
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

  const copyInvitationLink = (email: string) => {
    const invitationUrl = `${window.location.origin}/signup?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(invitationUrl);
    toast({
      title: "Success",
      description: "Invitation link copied to clipboard",
    });
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
      return <Badge variant="default">Used</Badge>;
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (!invitation.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Invitations</CardTitle>
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
                      <Badge variant="secondary">{invitation.role}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {invitation.department} • {invitation.roll_number || invitation.employee_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sent: {new Date(invitation.invited_at).toLocaleDateString()} • 
                      Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(invitation.email)}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {invitations.filter(i => !i.used_at && new Date(i.expires_at) > new Date()).length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {invitations.filter(i => i.used_at).length}
            </div>
            <p className="text-sm text-gray-600">Used</p>
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

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {invitations.length}
            </div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserInvitationManager;
