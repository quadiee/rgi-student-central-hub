
import React from 'react';

const InvitationLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Validating invitation...</p>
      </div>
    </div>
  );
};

export default InvitationLoadingState;
