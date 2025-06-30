
import React, { useState } from 'react';
import { User, Shield, Clock, LogOut, Edit2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';

// Make sure this type matches your DB schema!
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  profile_photo_url?: string;
  department_name?: string;
  roll_number?: string;
  employee_id?: string;
  created_at?: string;
}

const UserProfile: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        const result = await signOut();
        if (!result.error) {
          toast({
            title: "Success",
            description: "Logged out successfully",
          });
        } else {
          throw result.error;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to logout",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editData.name,
          phone: editData.phone,
          address: editData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await refreshUser();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  if (!user) return null;

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'principal':
        return 'bg-purple-100 text-purple-800';
      case 'hod':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          {user.profile_photo_url ? (
            <img 
              src={user.profile_photo_url} 
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-2xl font-bold">
              {user.name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name"
              className="text-center"
            />
            <Input
              value={editData.phone}
              onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone Number"
              className="text-center"
            />
            <Input
              value={editData.address}
              onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Address"
              className="text-center"
            />
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </>
        )}
        
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Department</span>
          </div>
          <span className="text-gray-900 font-medium">{user.department_name || 'Unknown'}</span>
        </div>

        {user.roll_number && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Roll Number</span>
            </div>
            <span className="text-gray-900 font-medium">{user.roll_number}</span>
          </div>
        )}

        {user.employee_id && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Employee ID</span>
            </div>
            <span className="text-gray-900 font-medium">{user.employee_id}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Member Since</span>
          </div>
          <span className="text-gray-900 font-medium">
            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
          </span>
        </div>

        <div className="border-t pt-4 space-y-3">
          {isEditing ? (
            <div className="flex space-x-2">
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
