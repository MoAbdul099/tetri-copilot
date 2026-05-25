const repo    = require('./email.repository');
const { renderTemplate, resolveVars } = require('./email.variables');
const { Resend } = require('resend');

const EMAIL_FROM     = process.env.EMAIL_FROM || 'Tetri Copilot <noreply@tetrisuite.com>';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FRONTEND_URL   = process.env.FRONTEND_URL || 'http://localhost:5173';

const getResend = () => new Resend(RESEND_API_KEY);

const notFound  = (msg) => Object.assign(new Error(msg), { statusCode: 404 });
const badRequest = (msg) => Object.assign(new Error(msg), { statusCode: 400 });

// ── Template CRUD ──────────────────────────────────────────

const listTemplates = (query) => repo.listTemplates(query);

const getTemplate = async (id) => {
  const t = await repo.findTemplateById(id);
  if (!t) throw notFound('Template not found');
  return t;
};

const createTemplate = async (userId, data) => {
  const { code, name, category, language = 'en', subject, bodyHtml, bodyText = '' } = data;
  if (!code || !name || !subject || !bodyHtml) throw badRequest('code, name, subject, and HTML body are required');
  const existing = await repo.existsByCode(code);
  if (existing) throw badRequest(`A template with code "${code}" already exists. Use a different template code.`);
  return repo.createTemplate({ code, name, category, language, subject, bodyHtml, bodyText, version: 1, status: 'draft', createdById: userId, updatedById: userId });
};

const updateTemplate = async (id, userId, data) => {
  const template = await repo.findTemplateById(id);
  if (!template) throw notFound('Template not found');

  // Save version snapshot before update
  await repo.saveVersion(id, {
    version:  template.version,
    subject:  template.subject,
    bodyHtml: template.bodyHtml,
    bodyText: template.bodyText,
    savedById: userId,
  });

  const nextVersion = template.version + 1;
  const allowed = {};
  if (data.name    !== undefined) allowed.name    = data.name;
  if (data.subject !== undefined) allowed.subject = data.subject;
  if (data.bodyHtml !== undefined) allowed.bodyHtml = data.bodyHtml;
  if (data.bodyText !== undefined) allowed.bodyText = data.bodyText;
  if (data.category !== undefined) allowed.category = data.category;
  if (data.language !== undefined) allowed.language = data.language;

  return repo.updateTemplate(id, { ...allowed, version: nextVersion, updatedById: userId });
};

const publishTemplate = async (id, userId) => {
  const template = await repo.findTemplateById(id);
  if (!template) throw notFound('Template not found');
  if (template.status === 'archived') throw badRequest('Cannot publish an archived template');
  return repo.updateTemplate(id, { status: 'published', updatedById: userId });
};

const archiveTemplate = async (id, userId) => {
  const template = await repo.findTemplateById(id);
  if (!template) throw notFound('Template not found');
  return repo.updateTemplate(id, { status: 'archived', updatedById: userId });
};

const deleteTemplate = async (id) => {
  const template = await repo.findTemplateById(id);
  if (!template) throw notFound('Template not found');
  if (template.status === 'published') throw badRequest('Cannot delete a published template. Archive it first.');
  return repo.deleteTemplate(id);
};

const getVersions = (id) => repo.getVersions(id);

// ── Preview ────────────────────────────────────────────────

const previewTemplate = async (id, extraVars = {}) => {
  const template = await repo.findTemplateById(id);
  if (!template) throw notFound('Template not found');
  const vars = {
    workspace_name: 'Acme Corp', company_name: 'Acme Corp', user_name: 'John Doe',
    first_name: 'John', last_name: 'Doe', email: 'john@example.com',
    role: 'admin', support_email: 'support@tetrisuite.com',
    current_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    current_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    ...extraVars,
  };
  return {
    subject:  renderTemplate(template.subject, vars),
    bodyHtml: renderTemplate(template.bodyHtml, vars),
    bodyText: renderTemplate(template.bodyText, vars),
  };
};

// ── Test email ─────────────────────────────────────────────

const sendTestEmail = async (id, toEmail, extraVars = {}) => {
  if (!toEmail) throw badRequest('Recipient email is required');
  const template = await repo.findTemplateById(id);
  if (!template) throw notFound('Template not found');

  const vars = {
    workspace_name: 'Acme Corp', company_name: 'Acme Corp', user_name: 'John Doe',
    first_name: 'John', last_name: 'Doe', email: toEmail,
    role: 'admin', support_email: 'support@tetrisuite.com',
    current_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    current_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    ...extraVars,
  };

  const subject  = renderTemplate(template.subject, vars);
  const bodyHtml = renderTemplate(template.bodyHtml, vars);

  if (!RESEND_API_KEY) {
    console.log(`[Email] Test email (no API key) → ${toEmail}: ${subject}`);
    return { sent: false, message: 'RESEND_API_KEY not configured' };
  }

  const result = await getResend().emails.send({ from: EMAIL_FROM, to: toEmail, subject, html: bodyHtml });
  return { sent: true, id: result.data?.id };
};

// ── Analytics ──────────────────────────────────────────────

const getAnalytics = (workspaceId, days) => repo.getDeliveryStats(workspaceId, days ? parseInt(days, 10) : 30);

const listDeliveries = (workspaceId, query) => repo.listDeliveryLogs(workspaceId, query);

// ── Internal send (called by email worker) ─────────────────

const sendEmailFromTemplate = async ({ templateCode, workspaceId, recipientId, recipientEmail, extraVars = {}, notificationId }) => {
  const template = await repo.findTemplateByCodeFallback(templateCode);

  let subject, bodyHtml;

  if (template) {
    const vars = await resolveVars(workspaceId, recipientId, extraVars);
    subject  = renderTemplate(template.subject, vars);
    bodyHtml = renderTemplate(template.bodyHtml, vars);
  } else {
    // Fallback: plain email card with the notification title/body
    const appUrl = extraVars.app_url || FRONTEND_URL;
    subject  = extraVars.title || 'Notification from Tetri Copilot';
    bodyHtml = buildFallbackEmail({ subject, body: extraVars.body || '', appUrl });
  }

  const log = {
    notificationId,
    workspaceId,
    recipientEmail,
    templateCode: template?.code || templateCode,
    subject,
    status: 'failed',
    attemptCount: 1,
  };

  if (!RESEND_API_KEY) {
    console.log(`[Email] No API key — skipping delivery to ${recipientEmail}: ${subject}`);
    return null;
  }

  try {
    const result = await getResend().emails.send({ from: EMAIL_FROM, to: recipientEmail, subject, html: bodyHtml });
    log.status = 'sent';
    log.providerMessageId = result.data?.id || null;
  } catch (err) {
    log.failureReason = err.message;
  }

  await repo.createDeliveryLog(log);
  return log;
};

// ── Fallback email card HTML ───────────────────────────────

const buildFallbackEmail = ({ subject, body, appUrl }) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Manrope',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 40px 20px;border-bottom:1px solid #e2e8f0;">
        <span style="font-size:18px;font-weight:700;color:#0f172b;">Tetri Copilot</span>
      </td></tr>
      <tr><td style="padding:28px 40px;">
        <p style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172b;">${subject}</p>
        <pre style="margin:0 0 24px;font-size:14px;color:#4a5565;white-space:pre-wrap;font-family:inherit;">${body}</pre>
        <a href="${appUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#fff;background:#1447e6;border-radius:10px;text-decoration:none;">Open Tetri Copilot</a>
      </td></tr>
      <tr><td style="padding:16px 40px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} Tetri Copilot. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;

module.exports = {
  listTemplates, getTemplate, createTemplate, updateTemplate,
  publishTemplate, archiveTemplate, deleteTemplate, getVersions,
  previewTemplate, sendTestEmail,
  getAnalytics, listDeliveries,
  sendEmailFromTemplate,
};
