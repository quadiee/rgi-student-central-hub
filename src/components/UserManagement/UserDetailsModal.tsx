
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Mail, Phone, MapPin, Calendar, Building, CreditCard } from 'lucide-react';

interface UserDetailsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department_id: string;
    roll_number?: string;
    employee_id?: string;
    phone?: string;
    address?: string;
    guardian_name?: string;
    guardian_phone?: string;
    is_active: boolean;
    created_at: string;
    department?: {
      name: string;
      code: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsModal: React.FC<UserDetailsProps> = ({ user, open, onOpenChange }) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'principal': return 'destructive';
      case 'chairman': return 'destructive';
      case 'hod': return 'default';
      case 'faculty': return 'secondary';
      case 'student': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.toUpperCase()}
                </Badge>
                {!user.is_active && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">{user.department?.name}</p>
            </div>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>{user.department?.name} ({user.department?.code})</span>
                  </div>
                </div>

                {user.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {user.roll_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Roll Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>{user.roll_number}</span>
                    </div>
                  </div>
                )}

                {user.employee_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employee ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>{user.employee_id}</span>
                    </div>
                  </div>
                )}
              </div>

              {user.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span>{user.address}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guardian Information (for students) */}
          {user.role === 'student' && (user.guardian_name || user.guardian_phone) && (
            <Card>
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {user.guardian_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Guardian Name</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{user.guardian_name}</span>
                      </div>
                    </div>
                  )}

                  {user.guardian_phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Guardian Phone</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{user.guardian_phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <div className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">
                    {user.id}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <div className="mt-1">
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
