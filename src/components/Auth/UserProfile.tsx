import React, { useState } from 'react';
import { User, Settings, Shield, Clock, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

// Optional: If you want to map department_id to the department name for display
const DEPARTMENT_NAMES: { [uuid: string]: string } = {
  // 'uuid-1': 'CSE',
  // 'uuid-2': 'ECE',
  // Add all department_id: name mappings here
};

const UserProfile: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleSwitch(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  if (!user) return null;

  const roles: UserRole[] = ['student', 'hod', 'principal', 'admin'];

  // Get department name from id (optional)
  const departmentDisplay =
    (user.department_id && DEPARTMENT_NAMES[user.department_id]) || user.department_id || 'Unknown';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
          {user.role}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Department</span>
          </div>
          <span className="text-gray-900 font-medium">{departmentDisplay}</span>
        </div>

        {user.rollNumber && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Roll Number</span>
            </div>
            <span className="text-gray-900 font-medium">{user.rollNumber}</span>
          </div>
        )}

        {user.employeeId && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Employee ID</span>
            </div>
            <span className="text-gray-900 font-medium">{user.employeeId}</span>
          </div>
        )}

        <div className="border-t pt-4">
          <Button
            onClick={() => setShowRoleSwitch(!showRoleSwitch)}
            variant="outline"
            className="w-full mb-3"
          >
            <Settings className="w-4 h-4 mr-2" />
            Switch Role (Demo)
          </Button>

          {showRoleSwitch && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {roles.map(role => (
                <Button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  variant={user.role === role ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                >
                  {role}
                </Button>
              ))}
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;