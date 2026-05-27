const repo     = require('./ai-documents.repository');
const aiSvc    = require('../ai/ai.service');
const prisma   = require('../../lib/prisma');

const CATEGORIES = [
  'Business Letter',
  'Customer Communication',
  'Vendor Communication',
  'Collection Letter',
  'Payment Reminder',
  'Proposal Introduction',
  'Quotation Cover Letter',
  'Meeting Summary',
  'Internal Memo',
  'HR Communication',
  'Compliance Communication',
  'Announcement',
  'General Business Document',
];

const TONES = [
  'Professional',
  'Friendly',
  'Formal',
  'Persuasive',
  'Informative',
  'Empathetic',
  'Urgent',
  'Concise',
];

async function buildContextString(workspaceId, contextSources = []) {
  if (!contextSources.length) return '';

  const parts = [];

  for (const src of contextSources) {
    try {
      if (src.sourceType === 'customer' && src.sourceRecordId) {
        const rec = await prisma.customer.findFirst({ where: { id: src.sourceRecordId, workspaceId } });
        if (rec) parts.push(`Customer: ${rec.name}${rec.email ? `, Email: ${rec.email}` : ''}${rec.phone ? `, Phone: ${rec.phone}` : ''}`);
      } else if (src.sourceType === 'supplier' && src.sourceRecordId) {
        const rec = await prisma.supplier.findFirst({ where: { id: src.sourceRecordId, workspaceId } });
        if (rec) parts.push(`Supplier/Vendor: ${rec.name}${rec.email ? `, Email: ${rec.email}` : ''}`);
      } else if (src.sourceType === 'invoice' && src.sourceRecordId) {
        const rec = await prisma.invoice.findFirst({
          where: { id: src.sourceRecordId, workspaceId },
          include: { customer: { select: { name: true } } },
        });
        if (rec) parts.push(`Invoice: ${rec.invoiceNumber}, Customer: ${rec.customer?.name || 'N/A'}, Amount: ${rec.currency} ${rec.totalAmount}, Status: ${rec.status}, Due: ${rec.dueDate?.toISOString().split('T')[0] || 'N/A'}`);
      } else if (src.sourceType === 'expense' && src.sourceRecordId) {
        const rec = await prisma.expense.findFirst({
          where: { id: src.sourceRecordId, workspaceId },
          include: { supplier: { select: { name: true } }, category: { select: { name: true } } },
        });
        if (rec) parts.push(`Expense: ${rec.expenseNumber || rec.id.slice(0, 8)}, Amount: ${rec.currencyCode} ${rec.amount}, Category: ${rec.category?.name || 'N/A'}, Vendor: ${rec.supplier?.name || 'N/A'}, Date: ${rec.expenseDate?.toISOString().split('T')[0] || 'N/A'}`);
      } else if (src.sourceType === 'company') {
        const rec = await prisma.workspace.findFirst({ where: { id: workspaceId } });
        if (rec) parts.push(`Company: ${rec.name}${rec.country ? `, Country: ${rec.country}` : ''}${rec.industry ? `, Industry: ${rec.industry}` : ''}`);
      } else if (src.sourceName) {
        parts.push(`Context (${src.sourceType}): ${src.sourceName}`);
      }
    } catch {
      // Skip failed context lookups
    }
  }

  return parts.length ? `\n\nContext:\n${parts.join('\n')}` : '';
}

function buildPrompt({ category, title, purpose, tone, language, instructions, contextString }) {
  const toneGuide = tone ? `Write in a ${tone.toLowerCase()} tone.` : 'Write in a professional tone.';
  const langGuide = language && language !== 'English' ? `Write entirely in ${language}.` : '';

  return `You are a professional business document writer for a financial operations platform.

Generate a ${category} document titled "${title}".

${purpose ? `Purpose: ${purpose}` : ''}
${toneGuide}
${langGuide}
${instructions ? `\nAdditional instructions: ${instructions}` : ''}
${contextString || ''}

Requirements:
- Write a complete, ready-to-use business document
- Use professional formatting with clear sections
- Include appropriate salutations and closings for the document type
- Be specific and actionable
- Do not include placeholder text like [Your Name] — use the context provided
- Output only the document content, no meta-commentary or explanations`;
}

const generate = async (workspaceId, userId, params) => {
  const {
    title, category, purpose, tone, language,
    instructions, contextSources = [], relations,
  } = params;

  const contextString = await buildContextString(workspaceId, contextSources);
  const prompt = buildPrompt({ category, title, purpose, tone, language, instructions, contextString });

  const startTime = Date.now();
  const result = await aiSvc.execute({ prompt, workspaceId });
  const durationMs = Date.now() - startTime;

  const generatedContent = result.response || '';

  return {
    generatedContent,
    provider:     result.provider,
    model:        result.model,
    inputTokens:  result.tokensInput,
    outputTokens: result.tokensOutput,
    durationMs,
    promptText:   prompt,
  };
};

const save = async (workspaceId, userId, params) => {
  const {
    title, category, purpose, tone, language,
    generatedContent, finalContent, provider, model,
    promptText, contextSources = [], relations,
    inputTokens, outputTokens, durationMs,
  } = params;

  const doc = await repo.create(workspaceId, userId, {
    title, category, purpose, tone, language,
    generatedContent, finalContent: finalContent || generatedContent,
    provider, model, promptText,
    status: 'saved',
    contextSources,
    relations,
  });

  if (provider) {
    await repo.addGenerationLog(workspaceId, doc.id, userId, {
      provider, model,
      inputTokens:  inputTokens ? parseInt(inputTokens) : null,
      outputTokens: outputTokens ? parseInt(outputTokens) : null,
      durationMs:   durationMs ? parseInt(durationMs) : null,
    });
  }

  return doc;
};

const regenerate = async (workspaceId, userId, id) => {
  const doc = await repo.findById(workspaceId, id);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const contextString = await buildContextString(workspaceId, doc.contextSources || []);
  const prompt = buildPrompt({
    category:     doc.category,
    title:        doc.title,
    purpose:      doc.purpose,
    tone:         doc.tone,
    language:     doc.language,
    instructions: null,
    contextString,
  });

  const startTime = Date.now();
  const result = await aiSvc.execute({ prompt, workspaceId });
  const durationMs = Date.now() - startTime;

  const updated = await repo.update(workspaceId, id, {
    generatedContent: result.response,
    provider:         result.provider,
    model:            result.model,
    promptText:       prompt,
    status:           'saved',
  });

  await repo.addGenerationLog(workspaceId, id, userId, {
    provider:     result.provider,
    model:        result.model,
    inputTokens:  result.tokensInput ? parseInt(result.tokensInput) : null,
    outputTokens: result.tokensOutput ? parseInt(result.tokensOutput) : null,
    durationMs,
  });

  return updated;
};

const updateDoc = async (workspaceId, userId, id, data) => {
  const doc = await repo.findById(workspaceId, id);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  return repo.update(workspaceId, id, data);
};

const findById = async (workspaceId, id) => {
  const doc = await repo.findById(workspaceId, id);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  return doc;
};

module.exports = {
  CATEGORIES,
  TONES,
  list:        (wid, params) => repo.list(wid, params),
  findById,
  generate,
  save,
  regenerate,
  updateDoc,
  softDelete:  (wid, id) => repo.softDelete(wid, id),
};
