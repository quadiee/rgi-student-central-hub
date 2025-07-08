import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { secureAdminSetup, displayAdminSetupResult } from '../../utils/secureAdminSetup';
import { useAuth } from '../../contexts/SupabaseAuthContext';
const SecureAdminButton: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const {
    user
  } = useAuth();

  // Don't show the button if user is already logged in as admin
  if (user?.role === 'admin') {
    return null;
  }
  const handleCreateAdmin = async () => {
    setIsCreating(true);
    try {
      const result = await secureAdminSetup();
      displayAdminSetupResult(result);
    } catch (error) {
      console.error('Error in admin setup:', error);
      displayAdminSetupResult({
        success: false,
        message: 'Failed to set up admin account',
        error
      });
    } finally {
      setIsCreating(false);
    }
  };
  return;
};
export default SecureAdminButton;