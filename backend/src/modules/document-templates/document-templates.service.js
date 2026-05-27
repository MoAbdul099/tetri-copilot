const repo   = require('./document-templates.repository');
const aiSvc  = require('../ai/ai.service');
const prisma = require('../../lib/prisma');

const CATEGORIES = [
  'Business Letter', 'Customer Communication', 'Vendor Communication',
  'Collection Letter', 'Payment Reminder', 'Proposal Introduction',
  'Quotation Cover Letter', 'Meeting Summary', 'Internal Memo',
  'HR Communication', 'Compliance Communication', 'Announcement',
  'General Business Document',
];

const TONES = ['Professional', 'Friendly', 'Formal', 'Persuasive', 'Informative', 'Empathetic', 'Urgent', 'Concise'];

const PLACEHOLDER_GROUPS = {
  company:    ['{{company_name}}', '{{company_address}}', '{{company_tax_number}}', '{{company_phone}}', '{{company_email}}', '{{company_website}}'],
  customer:   ['{{customer_name}}', '{{customer_contact}}', '{{customer_email}}', '{{customer_phone}}'],
  vendor:     ['{{vendor_name}}', '{{vendor_email}}'],
  invoice:    ['{{invoice_number}}', '{{invoice_date}}', '{{invoice_due_date}}', '{{invoice_amount}}', '{{invoice_balance}}'],
  expense:    ['{{expense_reference}}', '{{expense_amount}}', '{{expense_date}}'],
  compliance: ['{{compliance_name}}', '{{compliance_due_date}}'],
  user:       ['{{user_name}}', '{{user_position}}'],
  date:       ['{{today_date}}', '{{current_month}}', '{{current_year}}'],
};

async function resolvePlaceholders(workspaceId, text, { customerId, supplierId, invoiceId, expenseId } = {}) {
  if (!text) return text;

  const now = new Date();
  let resolved = text
    .replace(/\{\{today_date\}\}/g,    now.toLocaleDateString())
    .replace(/\{\{current_month\}\}/g, now.toLocaleString('default', { month: 'long' }))
    .replace(/\{\{current_year\}\}/g,  String(now.getFullYear()));

  // Company
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { company: true },
  });
  if (ws) {
    resolved = resolved
      .replace(/\{\{company_name\}\}/g,       ws.name || '')
      .replace(/\{\{company_address\}\}/g,    ws.company?.address || '')
      .replace(/\{\{company_tax_number\}\}/g, ws.company?.taxNumber || '')
      .replace(/\{\{company_phone\}\}/g,      ws.company?.phone || '')
      .replace(/\{\{company_email\}\}/g,      ws.company?.email || '')
      .replace(/\{\{company_website\}\}/g,    ws.company?.website || '');
  }

  // Customer
  if (customerId) {
    const c = await prisma.customer.findFirst({ where: { id: customerId, workspaceId } });
    if (c) {
      resolved = resolved
        .replace(/\{\{customer_name\}\}/g,    c.name || '')
        .replace(/\{\{customer_contact\}\}/g, c.contactName || '')
        .replace(/\{\{customer_email\}\}/g,   c.email || '')
        .replace(/\{\{customer_phone\}\}/g,   c.phone || '');
    }
  }

  // Supplier
  if (supplierId) {
    const s = await prisma.supplier.findFirst({ where: { id: supplierId, workspaceId } });
    if (s) {
      resolved = resolved
        .replace(/\{\{vendor_name\}\}/g,  s.name || '')
        .replace(/\{\{vendor_email\}\}/g, s.email || '');
    }
  }

  // Invoice
  if (invoiceId) {
    const inv = await prisma.invoice.findFirst({ where: { id: invoiceId, workspaceId } });
    if (inv) {
      resolved = resolved
        .replace(/\{\{invoice_number\}\}/g,   inv.invoiceNumber || '')
        .replace(/\{\{invoice_date\}\}/g,     inv.issueDate?.toLocaleDateString() || '')
        .replace(/\{\{invoice_due_date\}\}/g, inv.dueDate?.toLocaleDateString() || '')
        .replace(/\{\{invoice_amount\}\}/g,   String(inv.totalAmount || ''))
        .replace(/\{\{invoice_balance\}\}/g,  String(inv.balanceDue || ''));
    }
  }

  // Expense
  if (expenseId) {
    const exp = await prisma.expense.findFirst({ where: { id: expenseId, workspaceId } });
    if (exp) {
      resolved = resolved
        .replace(/\{\{expense_reference\}\}/g, exp.expenseNumber || exp.referenceNumber || '')
        .replace(/\{\{expense_amount\}\}/g,    String(exp.amount || ''))
        .replace(/\{\{expense_date\}\}/g,      exp.expenseDate?.toLocaleDateString() || '');
    }
  }

  return resolved;
}

function buildFullContent(template) {
  const s = template.contentSections || {};
  const parts = [];
  if (s.header)       parts.push(s.header);
  if (s.introduction) parts.push(s.introduction);
  if (s.body)         parts.push(s.body);
  if (s.closing)      parts.push(s.closing);
  if (s.footer)       parts.push(s.footer);
  return parts.length ? parts.join('\n\n') : (template.templateContent || '');
}

async function buildBrandingContext(workspaceId) {
  const branding = await repo.getBranding(workspaceId);
  if (!branding) return '';
  const lines = [];
  if (branding.companyFooter) lines.push(`Standard footer: ${branding.companyFooter}`);
  if (branding.profileName !== 'Default') lines.push(`Brand profile: ${branding.profileName}`);
  return lines.length ? `\n\nBranding: ${lines.join('; ')}` : '';
}

const generateFromTemplate = async (workspaceId, userId, templateId, { contextSources = [], instructions } = {}) => {
  const template = await repo.findById(workspaceId, templateId);
  if (!template) throw Object.assign(new Error('Template not found'), { status: 404 });
  if (template.status !== 'active') throw Object.assign(new Error('Template is not active'), { status: 400 });

  const fullContent = buildFullContent(template);
  const brandingCtx = template.brandingEnabled ? await buildBrandingContext(workspaceId) : '';

  // Resolve context IDs from contextSources
  const ctx = {};
  for (const src of contextSources) {
    if (src.sourceType === 'customer')  ctx.customerId  = src.sourceRecordId;
    if (src.sourceType === 'supplier')  ctx.supplierId  = src.sourceRecordId;
    if (src.sourceType === 'invoice')   ctx.invoiceId   = src.sourceRecordId;
    if (src.sourceType === 'expense')   ctx.expenseId   = src.sourceRecordId;
  }

  const resolvedContent = await resolvePlaceholders(workspaceId, fullContent, ctx);

  const prompt = `You are a professional business document writer.

Generate a complete ${template.category || 'business'} document based on the following template structure.
${template.tone ? `Tone: ${template.tone}.` : ''}
${template.languageName && template.languageName !== 'English' ? `Language: ${template.languageName}.` : ''}
${template.aiInstructions ? `\nTemplate instructions: ${template.aiInstructions}` : ''}
${instructions ? `\nAdditional instructions: ${instructions}` : ''}
${brandingCtx}

Template content to use as the basis:
---
${resolvedContent}
---

Produce a complete, professional, ready-to-use document. Replace any remaining placeholders with contextually appropriate content. Output the document content only.`;

  const startTime = Date.now();
  const result = await aiSvc.execute({
    workspaceId,
    userId:   null,
    feature:  'document_generation',
    messages: [{ role: 'user', content: prompt }],
    options:  { maxTokens: 2000, temperature: 0.7 },
  });
  const durationMs = Date.now() - startTime;

  await repo.incrementUsage(templateId);

  return {
    generatedContent: result.response || '',
    provider:     result.provider,
    model:        result.model,
    inputTokens:  result.tokensInput,
    outputTokens: result.tokensOutput,
    durationMs,
    promptText:   prompt,
    template:     { id: template.id, name: template.name, category: template.category },
  };
};

const previewTemplate = async (workspaceId, id, ctx = {}) => {
  const template = await repo.findById(workspaceId, id);
  if (!template) throw Object.assign(new Error('Template not found'), { status: 404 });

  const fullContent = buildFullContent(template);
  const resolved    = await resolvePlaceholders(workspaceId, fullContent, ctx);
  return { ...template, resolvedContent: resolved };
};

const aiGenerateTemplate = async (workspaceId, userId, { category, description }) => {
  const prompt = `You are a business document template designer. Create a reusable document template structure.

Category: ${category}
Purpose: ${description || `Standard ${category} template`}

Create a template with these sections. Use {{placeholder}} tokens where dynamic data should go.
Available placeholders: {{company_name}}, {{company_address}}, {{customer_name}}, {{customer_email}}, {{invoice_number}}, {{invoice_due_date}}, {{invoice_balance}}, {{today_date}}, {{user_name}}

Return JSON only:
{
  "name": "<template name>",
  "description": "<brief description>",
  "header": "<header text>",
  "introduction": "<opening paragraph>",
  "body": "<main content>",
  "closing": "<closing paragraph>",
  "footer": "<footer text>",
  "aiInstructions": "<guidance for AI when using this template>",
  "suggestedTone": "<tone>",
  "suggestedPlaceholders": ["{{placeholder1}}", "{{placeholder2}}"]
}`;

  const result = await aiSvc.execute({
    workspaceId,
    userId:   null,
    feature:  'document_generation',
    messages: [{ role: 'user', content: prompt }],
    options:  { maxTokens: 1000, temperature: 0.5, structured: true },
  });

  try {
    const parsed = typeof result.response === 'object' ? result.response : JSON.parse(result.response);
    return {
      name:            parsed.name || `${category} Template`,
      description:     parsed.description || '',
      contentSections: {
        header:       parsed.header       || '',
        introduction: parsed.introduction || '',
        body:         parsed.body         || '',
        closing:      parsed.closing      || '',
        footer:       parsed.footer       || '',
      },
      aiInstructions: parsed.aiInstructions || '',
      tone:           parsed.suggestedTone  || 'Professional',
      category,
    };
  } catch {
    return { name: `${category} Template`, category, description: '', contentSections: {}, aiInstructions: '', tone: 'Professional' };
  }
};

module.exports = {
  CATEGORIES,
  TONES,
  PLACEHOLDER_GROUPS,
  list:                 (wid, p) => repo.list(wid, p),
  findById:             async (wid, id) => { const t = await repo.findById(wid, id); if (!t) throw Object.assign(new Error('Not found'), { status: 404 }); return t; },
  create:               (wid, uid, data) => repo.create(wid, uid, data),
  update:               (wid, id, uid, data) => repo.update(wid, id, uid, data),
  clone:                async (wid, id, uid) => { const t = await repo.clone(wid, id, uid); if (!t) throw Object.assign(new Error('Not found'), { status: 404 }); return t; },
  archive:              (id, uid) => repo.archive(id, uid),
  softDelete:           (id) => repo.softDelete(id),
  getBranding:          (wid) => repo.getBranding(wid),
  upsertBranding:       (wid, data) => repo.upsertBranding(wid, data),
  generateFromTemplate,
  previewTemplate,
  aiGenerateTemplate,
};
