
import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { authUtils } from '../../lib/auth-utils';

interface UserRemovalManagerProps {
  userId: string;
  userName: string;
  userEmail: string;
  onUserRemoved?: () => void;
}

const UserRemovalManager: React.FC<UserRemovalManagerProps> = ({
  userId,
  userName,
  userEmail,
  onUserRemoved
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRemoveUser = async () => {
    setLoading(true);
    
    try {
      const { error } = await authUtils.removeUser(userId);
      
      if (error) {
        toast({
          title: "Removal Failed",
          description: error.message || "Failed to remove user",
          variant: "destructive"
        });
      } else {
        toast({
          title: "User Removed",
          description: `${userName} has been successfully removed from the system.`,
        });
        onUserRemoved?.();
        setShowConfirmation(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing the user.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  if (showConfirmation) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Remove User Permanently
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Are you sure you want to remove <strong>{userName}</strong> ({userEmail})?
              This action cannot be undone and will:
            </p>
            <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
              <li>Delete their account and profile</li>
              <li>Remove all associated data</li>
              <li>Deactivate any pending invitations</li>
            </ul>
            <div className="flex space-x-2 mt-4">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemoveUser}
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Yes, Remove User'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => setShowConfirmation(true)}
      className="flex items-center space-x-1"
    >
      <Trash2 className="w-4 h-4" />
      <span>Remove User</span>
    </Button>
  );
};

export default UserRemovalManager;
