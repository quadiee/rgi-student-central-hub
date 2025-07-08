
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

interface InvitationErrorStateProps {
  error: string;
}

const InvitationErrorState: React.FC<InvitationErrorStateProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white border border-red-200 rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-3">Invitation Invalid</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate("/auth")} className="mt-4">
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default InvitationErrorState;
