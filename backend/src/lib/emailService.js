const { Resend } = require('resend');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Tetri Copilot <noreply@tetri.app>';

let resend;
const getResend = () => {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
};

const sendInvitationEmail = async ({ email, inviterName, workspaceName, role, token }) => {
  const acceptUrl = `${FRONTEND_URL}/invite?token=${token}`;
  const from = inviterName || 'Someone';
  const workspace = workspaceName || 'a workspace';
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set — logging invitation instead');
    console.log(`  To:         ${email}`);
    console.log(`  Workspace:  ${workspace}`);
    console.log(`  Role:       ${roleLabel}`);
    console.log(`  Invited by: ${from}`);
    console.log(`  Accept URL: ${acceptUrl}`);
    return { sent: false, acceptUrl };
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to ${workspace}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Manrope',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #e2e8f0;">
              <span style="font-size:20px;font-weight:700;color:#0f172b;letter-spacing:-0.3px;">Tetri Copilot</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172b;line-height:1.3;">
                You've been invited to join ${workspace}
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#4a5565;line-height:1.6;">
                <strong style="color:#0f172b;">${from}</strong> has invited you to join
                <strong style="color:#0f172b;">${workspace}</strong> on Tetri Copilot
                as a <strong style="color:#0f172b;">${roleLabel}</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#1447e6;">
                    <a href="${acceptUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:-0.1px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                Or copy this link into your browser:<br/>
                <a href="${acceptUrl}" style="color:#1447e6;word-break:break-all;">${acceptUrl}</a>
              </p>

              <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
                This invitation expires in 7 days. If you weren't expecting this, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} Tetri Copilot. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const result = await getResend().emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `${from} invited you to join ${workspace} on Tetri Copilot`,
    html,
  });

  return { sent: true, acceptUrl, id: result.data?.id };
};

const emailCard = (content) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Manrope',Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 40px 20px;border-bottom:1px solid #e2e8f0;">
        <span style="font-size:18px;font-weight:700;color:#0f172b;">Tetri Copilot</span>
      </td></tr>
      <tr><td style="padding:28px 40px;">${content}</td></tr>
      <tr><td style="padding:16px 40px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} Tetri Copilot. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;

const priorityColor = (p) =>
  ({ critical: '#dc2626', high: '#ea580c', medium: '#2563eb', low: '#64748b' }[p] || '#2563eb');

const sendReminderEmail = async ({ to, recipientName, title, body, occurrenceName, dueDate, priority, workspaceName, sourceLink }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] Reminder → ${to}: ${title}`);
    return { sent: false };
  }
  const pColor = priorityColor(priority);
  const content = `
    <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172b;">${title}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#4a5565;">${workspaceName || 'Tetri Copilot'}</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;width:100%;">
      <tr><td style="padding:12px 16px;background:#f8fafc;border-radius:10px;border-left:3px solid ${pColor};">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#0f172b;">${occurrenceName}</p>
        <p style="margin:0;font-size:13px;color:#64748b;">Due: ${dueDate}</p>
      </td></tr>
    </table>
    <pre style="margin:0 0 24px;font-size:13px;color:#4a5565;white-space:pre-wrap;font-family:inherit;">${body}</pre>
    <table cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#1447e6;">
      <a href="${sourceLink}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;border-radius:10px;">View Obligation</a>
    </td></tr></table>`;

  const result = await getResend().emails.send({
    from: EMAIL_FROM, to,
    subject: title,
    html: emailCard(content),
  });
  return { sent: true, id: result.data?.id };
};

const sendEscalationEmail = async ({ to, recipientName, occurrenceName, dueDate, daysOverdue, priority, authority, workspaceName, escalationLevel, sourceLink }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] Escalation L${escalationLevel} → ${to}: ${occurrenceName}`);
    return { sent: false };
  }
  const content = `
    <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#dc2626;">Escalation — Level ${escalationLevel}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#4a5565;">${workspaceName || 'Tetri Copilot'}</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;width:100%;">
      <tr><td style="padding:12px 16px;background:#fff5f5;border-radius:10px;border-left:3px solid #dc2626;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#0f172b;">${occurrenceName}</p>
        <p style="margin:0 0 2px;font-size:13px;color:#64748b;">Due: ${dueDate}</p>
        <p style="margin:0;font-size:13px;font-weight:700;color:#dc2626;">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</p>
        ${authority ? `<p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">Authority: ${authority}</p>` : ''}
      </td></tr>
    </table>
    <p style="margin:0 0 24px;font-size:14px;color:#4a5565;">This compliance obligation requires immediate attention.</p>
    <table cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#dc2626;">
      <a href="${sourceLink}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;border-radius:10px;">View &amp; Act Now</a>
    </td></tr></table>`;

  const result = await getResend().emails.send({
    from: EMAIL_FROM, to,
    subject: `⚠️ Escalation L${escalationLevel}: ${occurrenceName} — ${daysOverdue} days overdue`,
    html: emailCard(content),
  });
  return { sent: true, id: result.data?.id };
};

module.exports = { sendInvitationEmail, sendReminderEmail, sendEscalationEmail };
