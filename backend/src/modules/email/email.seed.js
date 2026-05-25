const prisma = require('../../lib/prisma');

// ── HTML wrapper ──────────────────────────────────────────────────────────────

const card = (content) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Tetri Copilot</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Manrope',Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 40px 20px;border-bottom:1px solid #e2e8f0;">
        <span style="font-size:18px;font-weight:700;color:#0f172b;letter-spacing:-0.3px;">{{company_name}}</span>
      </td></tr>
      <tr><td style="padding:28px 40px;">${content}</td></tr>
      <tr><td style="padding:16px 40px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; Tetri Copilot. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;

const btn = (label, url, color = '#1447e6') =>
  `<table cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:${color};">
  <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;border-radius:10px;">${label}</a>
  </td></tr></table>`;

// ── Template definitions ───────────────────────────────────────────────────────

const TEMPLATES = [
  {
    code: 'user_invited',
    name: 'User Invitation',
    category: 'workspace',
    language: 'en',
    subject: "You've been invited to join {{workspace_name}}",
    bodyText: "Hi {{first_name}},\n\n{{user_name}} has invited you to join {{workspace_name}} on Tetri Copilot as a {{role}}.\n\nAccept your invitation: {{invite_url}}\n\nThis invitation expires in 7 days.",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172b;">You've been invited</p>
      <p style="margin:0 0 20px;font-size:15px;color:#4a5565;line-height:1.6;">
        <strong>{{inviter_name}}</strong> has invited you to join <strong>{{workspace_name}}</strong> as a <strong>{{role}}</strong>.
      </p>
      ${btn("Accept Invitation", "{{invite_url}}")}
      <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">This invitation expires in 7 days. If you weren't expecting this, you can safely ignore it.</p>`),
  },
  {
    code: 'expense_approval_required',
    name: 'Expense Approval Required',
    category: 'approval',
    language: 'en',
    subject: 'Expense approval required — {{workspace_name}}',
    bodyText: "Hi {{first_name}},\n\nAn expense is waiting for your approval.\n\n{{body}}\n\nReview it here: {{app_url}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172b;">Expense Approval Required</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;line-height:1.6;">{{body}}</p>
      <table style="margin-bottom:20px;width:100%;background:#fffbeb;border-radius:10px;border-left:3px solid #d97706;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#0f172b;">Action required: review and approve or reject.</p>
        </td></tr>
      </table>
      ${btn("Review Expense", "{{app_url}}", "#d97706")}`),
  },
  {
    code: 'expense_approved',
    name: 'Expense Approved',
    category: 'expense',
    language: 'en',
    subject: 'Your expense has been approved — {{workspace_name}}',
    bodyText: "Hi {{first_name}},\n\nGreat news! Your expense has been approved.\n\n{{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172b;">Expense Approved</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;line-height:1.6;">{{body}}</p>
      <table style="margin-bottom:20px;width:100%;background:#f0fdf4;border-radius:10px;border-left:3px solid #16a34a;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;"><p style="margin:0;font-size:13px;font-weight:600;color:#15803d;">✓ Approved</p></td></tr>
      </table>
      ${btn("View Expense", "{{app_url}}", "#16a34a")}`),
  },
  {
    code: 'expense_rejected',
    name: 'Expense Rejected',
    category: 'expense',
    language: 'en',
    subject: 'Your expense has been rejected — {{workspace_name}}',
    bodyText: "Hi {{first_name}},\n\nYour expense has been rejected.\n\n{{body}}\n\nPlease review and resubmit if needed.",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#dc2626;">Expense Rejected</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;line-height:1.6;">{{body}}</p>
      <table style="margin-bottom:20px;width:100%;background:#fff5f5;border-radius:10px;border-left:3px solid #dc2626;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;"><p style="margin:0;font-size:13px;font-weight:600;color:#dc2626;">Please review the reason and resubmit if appropriate.</p></td></tr>
      </table>
      ${btn("View Expense", "{{app_url}}", "#dc2626")}`),
  },
  {
    code: 'invoice_created',
    name: 'Invoice Created',
    category: 'invoice',
    language: 'en',
    subject: 'New invoice created — {{workspace_name}}',
    bodyText: "Hi {{first_name}},\n\nA new invoice has been created in {{workspace_name}}.\n\n{{title}}: {{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172b;">New Invoice Created</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;line-height:1.6;">A new invoice has been created in <strong>{{workspace_name}}</strong>.</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;">{{body}}</p>
      ${btn("View Invoice", "{{source_link}}")}`),
  },
  {
    code: 'invoice_overdue',
    name: 'Invoice Overdue',
    category: 'invoice',
    language: 'en',
    subject: 'Invoice overdue — action required',
    bodyText: "Hi {{first_name}},\n\nAn invoice is now overdue in {{workspace_name}}.\n\n{{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#dc2626;">Invoice Overdue</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <table style="margin-bottom:20px;width:100%;background:#fff5f5;border-radius:10px;border-left:3px solid #dc2626;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;"><p style="margin:0;font-size:13px;color:#4a5565;">{{body}}</p></td></tr>
      </table>
      ${btn("View Invoice", "{{source_link}}", "#dc2626")}`),
  },
  {
    code: 'payment_received',
    name: 'Payment Received',
    category: 'payment',
    language: 'en',
    subject: 'Payment received — {{workspace_name}}',
    bodyText: "Hi {{first_name}},\n\nA payment has been received in {{workspace_name}}.\n\n{{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#16a34a;">Payment Received</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;">{{body}}</p>
      ${btn("View Payment", "{{source_link}}", "#16a34a")}`),
  },
  {
    code: 'payment_failed',
    name: 'Payment Failed',
    category: 'billing',
    language: 'en',
    subject: 'Payment failed — immediate action required',
    bodyText: "Hi {{first_name}},\n\nA billing payment has failed for {{workspace_name}}. Please update your payment method to avoid service interruption.\n\n{{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#dc2626;">Payment Failed</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;line-height:1.6;">A billing payment has failed for <strong>{{workspace_name}}</strong>. Please update your payment method to avoid service interruption.</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;">{{body}}</p>
      ${btn("Update Payment Method", "{{app_url}}/billing", "#dc2626")}`),
  },
  {
    code: 'compliance_task_assigned',
    name: 'Compliance Task Assigned',
    category: 'compliance',
    language: 'en',
    subject: 'Compliance task assigned to you — {{workspace_name}}',
    bodyText: "Hi {{first_name}},\n\nA compliance task has been assigned to you in {{workspace_name}}.\n\n{{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172b;">Compliance Task Assigned</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;line-height:1.6;">A compliance task has been assigned to you in <strong>{{workspace_name}}</strong>.</p>
      <table style="margin-bottom:20px;width:100%;background:#f0fdf4;border-radius:10px;border-left:3px solid #059669;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;"><p style="margin:0;font-size:13px;color:#4a5565;">{{body}}</p></td></tr>
      </table>
      ${btn("View Task", "{{source_link}}", "#059669")}`),
  },
  {
    code: 'compliance_task_overdue',
    name: 'Compliance Task Overdue',
    category: 'compliance',
    language: 'en',
    subject: '⚠️ Compliance task overdue — {{workspace_name}}',
    bodyText: "Hi {{first_name}},\n\nA compliance task is now overdue in {{workspace_name}}. Immediate attention required.\n\n{{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#dc2626;">Compliance Task Overdue</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <table style="margin-bottom:20px;width:100%;background:#fff5f5;border-radius:10px;border-left:3px solid #dc2626;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#dc2626;">Immediate attention required</p>
          <p style="margin:0;font-size:13px;color:#4a5565;">{{body}}</p>
        </td></tr>
      </table>
      ${btn("View Task Now", "{{source_link}}", "#dc2626")}`),
  },
  {
    code: 'user_role_changed',
    name: 'User Role Changed',
    category: 'workspace',
    language: 'en',
    subject: 'Your role in {{workspace_name}} has changed',
    bodyText: "Hi {{first_name}},\n\nYour role in {{workspace_name}} has been updated.\n\n{{body}}",
    bodyHtml: card(`
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172b;">Role Updated</p>
      <p style="margin:0 0 8px;font-size:14px;color:#4a5565;">Hi {{first_name}},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;line-height:1.6;">Your role in <strong>{{workspace_name}}</strong> has been updated.</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4a5565;">{{body}}</p>
      ${btn("Open Workspace", "{{app_url}}")}`),
  },
];

const seedEmailTemplates = async () => {
  console.log('[EmailSeed] Seeding email templates…');
  for (const tmpl of TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where:  { code: tmpl.code },
      create: { ...tmpl, status: 'published', version: 1 },
      update: { name: tmpl.name, subject: tmpl.subject, bodyHtml: tmpl.bodyHtml, bodyText: tmpl.bodyText, status: 'published' },
    });
  }
  console.log(`[EmailSeed] Done — ${TEMPLATES.length} templates seeded.`);
};

module.exports = { seedEmailTemplates };

if (require.main === module) {
  seedEmailTemplates()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); });
}
