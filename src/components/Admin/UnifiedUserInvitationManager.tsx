import React, { useState } from 'react';
import UserInvitationManager from './UserInvitationManager';
import EnhancedUserInvitationManager from './EnhancedUserInvitationManager';

const UnifiedUserInvitationManager: React.FC = () => {
  const [tab, setTab] = useState<'single' | 'bulk'>('single');

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tab === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setTab('single')}
        >
          Single Invite
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tab === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setTab('bulk')}
        >
          Bulk Invite (CSV)
        </button>
      </div>
      <div>
        {tab === 'single' ? <UserInvitationManager /> : <EnhancedUserInvitationManager />}
      </div>
    </div>
  );
};

export default UnifiedUserInvitationManager;
