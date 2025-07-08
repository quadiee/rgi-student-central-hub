
import React from 'react';
import { useParams } from 'react-router-dom';
import { useInvitationValidation } from '../../hooks/useInvitationValidation';
import InvitationLoadingState from './InvitationLoadingState';
import InvitationErrorState from './InvitationErrorState';
import ExistingUserPasswordSetup from './ExistingUserPasswordSetup';
import InvitationRegistrationForm from './InvitationRegistrationForm';

const InvitationSignup: React.FC = () => {
  const { token } = useParams();
  const { invitationData, inviteError, loadingInvitation, userExists } = useInvitationValidation(token);

  if (loadingInvitation) {
    return <InvitationLoadingState />;
  }

  if (inviteError) {
    return <InvitationErrorState error={inviteError} />;
  }

  if (userExists && invitationData) {
    return <ExistingUserPasswordSetup invitationData={invitationData} />;
  }

  if (!invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">Loading invitation details...</div>
      </div>
    );
  }

  return <InvitationRegistrationForm invitationData={invitationData} />;
};

export default InvitationSignup;
