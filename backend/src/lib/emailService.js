const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Mock implementation — replace with real provider (Resend, SendGrid, etc.) when ready.
const sendInvitationEmail = ({ email, inviterName, workspaceName, role, token }) => {
  const acceptUrl = `${FRONTEND_URL}/invite?token=${token}`;

  console.log('[Email] Invitation');
  console.log(`  To:         ${email}`);
  console.log(`  Workspace:  ${workspaceName || '(unknown)'}`);
  console.log(`  Role:       ${role}`);
  console.log(`  Invited by: ${inviterName || '(unknown)'}`);
  console.log(`  Accept URL: ${acceptUrl}`);

  return Promise.resolve({ sent: true, acceptUrl });
};

module.exports = { sendInvitationEmail };
