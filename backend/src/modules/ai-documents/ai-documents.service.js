const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const repo   = require('./ai-documents.repository');
const aiSvc  = require('../ai/ai.service');
const prisma = require('../../lib/prisma');

const CATEGORIES = [
  'Business Letter', 'Customer Communication', 'Vendor Communication',
  'Collection Letter', 'Payment Reminder', 'Proposal Introduction',
  'Quotation Cover Letter', 'Meeting Summary', 'Internal Memo',
  'HR Communication', 'Compliance Communication', 'Announcement',
  'General Business Document',
];

const TONES = [
  'Professional', 'Friendly', 'Formal', 'Persuasive',
  'Informative', 'Empathetic', 'Urgent', 'Concise',
];

const ENHANCEMENT_TYPES = [
  { id: 'improve_writing',     label: 'Improve Writing' },
  { id: 'improve_grammar',     label: 'Improve Grammar' },
  { id: 'improve_readability', label: 'Improve Readability' },
  { id: 'improve_tone',        label: 'Improve Professional Tone' },
  { id: 'improve_formality',   label: 'Improve Formality' },
  { id: 'simplify_language',   label: 'Simplify Language' },
  { id: 'expand_content',      label: 'Expand Content' },
  { id: 'shorten_content',     label: 'Shorten Content' },
  { id: 'rewrite_content',     label: 'Rewrite Content' },
  { id: 'correct_formatting',  label: 'Correct Formatting' },
];

const TRANSFORM_TONES = [
  'Professional', 'Formal', 'Friendly', 'Executive',
  'Compliance', 'Legal', 'Customer Service', 'Internal Communication',
];

const SUMMARY_FORMATS = [
  { id: 'executive_summary', label: 'Executive Summary' },
  { id: 'key_points',        label: 'Key Points' },
  { id: 'bullet_summary',    label: 'Bullet Summary' },
  { id: 'one_paragraph',     label: 'One Paragraph' },
];

// ---- Context Building ----

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
    } catch { /* skip */ }
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

// ---- Core Document Operations ----

const generate = async (workspaceId, userId, params) => {
  const { title, category, purpose, tone, language, instructions, contextSources = [], relations } = params;
  const contextString = await buildContextString(workspaceId, contextSources);
  const prompt = buildPrompt({ category, title, purpose, tone, language, instructions, contextString });
  const startTime = Date.now();
  const result = await aiSvc.execute({
    workspaceId, userId: null, feature: 'document_generation',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 2000, temperature: 0.7 },
  });
  return {
    generatedContent: result.response || '',
    provider: result.provider, model: result.model,
    inputTokens: result.tokensInput, outputTokens: result.tokensOutput,
    durationMs: Date.now() - startTime, promptText: prompt,
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
    provider, model, promptText, status: 'draft',
    contextSources, relations,
  });

  if (provider) {
    await repo.addGenerationLog(workspaceId, doc.id, userId, {
      provider, model,
      inputTokens: inputTokens ? parseInt(inputTokens) : null,
      outputTokens: outputTokens ? parseInt(outputTokens) : null,
      durationMs: durationMs ? parseInt(durationMs) : null,
    });
  }

  // Auto-create v1
  const content = finalContent || generatedContent || '';
  await repo.createVersion(doc.id, userId, content, 'Initial draft');

  return doc;
};

const regenerate = async (workspaceId, userId, id) => {
  const doc = await repo.findById(workspaceId, id);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const contextString = await buildContextString(workspaceId, doc.contextSources || []);
  const prompt = buildPrompt({ category: doc.category, title: doc.title, purpose: doc.purpose, tone: doc.tone, language: doc.language, instructions: null, contextString });
  const startTime = Date.now();
  const result = await aiSvc.execute({
    workspaceId, userId: null, feature: 'document_generation',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 2000, temperature: 0.7 },
  });
  const durationMs = Date.now() - startTime;

  const updated = await repo.update(workspaceId, id, {
    generatedContent: result.response, provider: result.provider, model: result.model, promptText: prompt, status: 'draft',
  });

  await repo.addGenerationLog(workspaceId, id, userId, {
    provider: result.provider, model: result.model,
    inputTokens: result.tokensInput ? parseInt(result.tokensInput) : null,
    outputTokens: result.tokensOutput ? parseInt(result.tokensOutput) : null,
    durationMs,
  });

  // Auto-version
  await repo.createVersion(id, userId, result.response || '', 'Regenerated');

  return updated;
};

const updateDoc = async (workspaceId, userId, id, data) => {
  const doc = await repo.findById(workspaceId, id);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const updated = await repo.update(workspaceId, id, data);

  // Create version when content changes
  const newContent = data.finalContent || data.generatedContent;
  if (newContent) {
    await repo.createVersion(id, userId, newContent, data.changeSummary || 'User modification');
  }

  return updated;
};

const findById = async (workspaceId, id) => {
  const doc = await repo.findById(workspaceId, id);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  return doc;
};

// ---- Versioning ----

const getVersions = async (workspaceId, documentId) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  return repo.listVersions(workspaceId, documentId);
};

const getVersion = async (workspaceId, documentId, versionId) => {
  const v = await repo.getVersion(workspaceId, documentId, versionId);
  if (!v) throw Object.assign(new Error('Version not found'), { status: 404 });
  return v;
};

const restoreVersion = async (workspaceId, userId, documentId, versionId) => {
  const version = await repo.getVersion(workspaceId, documentId, versionId);
  if (!version) throw Object.assign(new Error('Version not found'), { status: 404 });

  const updated = await repo.update(workspaceId, documentId, {
    finalContent: version.content, status: 'draft',
  });

  await repo.createVersion(documentId, userId, version.content, `Restored from v${version.versionNumber}`);

  return updated;
};

// Simple line-level diff: returns array of { type: 'added'|'removed'|'unchanged', content }
function computeDiff(sourceContent, targetContent) {
  const srcLines = (sourceContent || '').split('\n');
  const tgtLines = (targetContent || '').split('\n');

  const srcSet = new Map();
  srcLines.forEach((l, i) => { if (!srcSet.has(l)) srcSet.set(l, []); srcSet.get(l).push(i); });

  const result = [];
  const usedSrc = new Set();

  for (const tgtLine of tgtLines) {
    const srcIdxList = srcSet.get(tgtLine);
    const unusedIdx = srcIdxList?.find((i) => !usedSrc.has(i));
    if (unusedIdx !== undefined) {
      usedSrc.add(unusedIdx);
      result.push({ type: 'unchanged', content: tgtLine });
    } else {
      result.push({ type: 'added', content: tgtLine });
    }
  }

  srcLines.forEach((l, i) => {
    if (!usedSrc.has(i)) result.push({ type: 'removed', content: l });
  });

  return result;
}

const compareVersions = async (workspaceId, userId, documentId, sourceVersionId, targetVersionId) => {
  const [src, tgt] = await Promise.all([
    repo.getVersion(workspaceId, documentId, sourceVersionId),
    repo.getVersion(workspaceId, documentId, targetVersionId),
  ]);
  if (!src) throw Object.assign(new Error('Source version not found'), { status: 404 });
  if (!tgt) throw Object.assign(new Error('Target version not found'), { status: 404 });

  const diff = computeDiff(src.content, tgt.content);

  await repo.saveComparison(documentId, sourceVersionId, targetVersionId, userId);

  return { sourceVersion: src, targetVersion: tgt, diff };
};

// ---- AI Enhancement ----

const enhance = async (workspaceId, userId, documentId, enhancementType, instructions) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const currentContent = doc.finalContent || doc.generatedContent || '';
  const typeLabel = ENHANCEMENT_TYPES.find((e) => e.id === enhancementType)?.label || enhancementType;

  const prompt = `You are a professional business writing assistant.

The following is a business document that needs improvement:

---
${currentContent}
---

Task: ${typeLabel}
${instructions ? `Additional instructions: ${instructions}` : ''}

Return the improved document only. Do not include explanations, meta-commentary, or labels.`;

  const startTime = Date.now();
  const result = await aiSvc.execute({
    workspaceId, userId: null, feature: 'document_enhancement',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 2000, temperature: 0.5 },
  });

  const enhancedContent = result.response || '';
  const updated = await repo.update(workspaceId, documentId, { finalContent: enhancedContent });
  const version = await repo.createVersion(documentId, userId, enhancedContent, `AI: ${typeLabel}`);

  await repo.trackEnhancement(documentId, version.id, userId, {
    enhancementType,
    provider: result.provider,
    model: result.model,
    tokensUsed: (result.tokensInput || 0) + (result.tokensOutput || 0),
  });

  return { content: enhancedContent, version, durationMs: Date.now() - startTime };
};

const transformTone = async (workspaceId, userId, documentId, targetTone) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const currentContent = doc.finalContent || doc.generatedContent || '';

  const prompt = `You are a professional business writing assistant.

Rewrite the following business document with a ${targetTone} tone:

---
${currentContent}
---

Maintain all factual content, dates, names, and key information. Only transform the tone and style.
Return the rewritten document only. No explanations.`;

  const result = await aiSvc.execute({
    workspaceId, userId: null, feature: 'document_enhancement',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 2000, temperature: 0.5 },
  });

  const newContent = result.response || '';
  const updated = await repo.update(workspaceId, documentId, { finalContent: newContent });
  const version = await repo.createVersion(documentId, userId, newContent, `Tone: ${targetTone}`);

  await repo.trackEnhancement(documentId, version.id, userId, {
    enhancementType: `tone_${targetTone.toLowerCase().replace(/\s+/g, '_')}`,
    provider: result.provider,
    model: result.model,
    tokensUsed: (result.tokensInput || 0) + (result.tokensOutput || 0),
  });

  return { content: newContent, version };
};

const generateSummary = async (workspaceId, userId, documentId, format) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const currentContent = doc.finalContent || doc.generatedContent || '';
  const formatLabel = SUMMARY_FORMATS.find((f) => f.id === format)?.label || 'Summary';

  const formatInstructions = {
    executive_summary: 'Write a concise executive summary (2-3 paragraphs) highlighting the key message, purpose, and outcome.',
    key_points: 'Extract 5-7 key points from the document as a numbered list.',
    bullet_summary: 'Summarize the document as a concise bullet list of the most important points.',
    one_paragraph: 'Write a single paragraph (3-5 sentences) summarizing the entire document.',
  };

  const prompt = `You are a professional business writing assistant.

Summarize the following business document:

---
${currentContent}
---

Format: ${formatLabel}
Instructions: ${formatInstructions[format] || 'Provide a clear, concise summary.'}

Return the summary only. No explanations.`;

  const result = await aiSvc.execute({
    workspaceId, userId: null, feature: 'document_summary',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 500, temperature: 0.3 },
  });

  return { summary: result.response || '', format, formatLabel };
};

const qualityReview = async (workspaceId, userId, documentId) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const currentContent = doc.finalContent || doc.generatedContent || '';

  const prompt = `You are a professional business document quality reviewer.

Review the following business document:

---
${currentContent}
---

Evaluate and return a JSON response with exactly this structure:
{
  "scores": {
    "grammar": <0-100>,
    "readability": <0-100>,
    "clarity": <0-100>,
    "professionalism": <0-100>,
    "consistency": <0-100>
  },
  "overallScore": <0-100>,
  "strengths": ["strength1", "strength2"],
  "issues": ["issue1", "issue2"],
  "recommendations": ["rec1", "rec2", "rec3"]
}

Return only valid JSON.`;

  const result = await aiSvc.execute({
    workspaceId, userId: null, feature: 'document_quality',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 600, temperature: 0.2 },
  });

  let reviewResult;
  try {
    const raw = result.response || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    reviewResult = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    reviewResult = {
      scores: { grammar: 0, readability: 0, clarity: 0, professionalism: 0, consistency: 0 },
      overallScore: 0, strengths: [], issues: [], recommendations: ['Unable to parse review results.'],
    };
  }

  const versions = await repo.listVersions(workspaceId, documentId);
  const latestVersion = versions?.[0];

  await repo.saveQualityReview(documentId, latestVersion?.id || null, reviewResult, reviewResult.recommendations || null);

  return reviewResult;
};

// ---- Export Engines ----

const exportPdf = async (workspaceId, documentId, userId) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const content = doc.finalContent || doc.generatedContent || '';
  const workspace = await prisma.workspace.findFirst({ where: { id: workspaceId }, select: { name: true } });

  return new Promise((resolve, reject) => {
    const pdfDoc = new PDFDocument({ margin: 60, size: 'A4' });
    const buffers = [];

    pdfDoc.on('data', (chunk) => buffers.push(chunk));
    pdfDoc.on('end', async () => {
      const buffer = Buffer.concat(buffers);
      try {
        const versions = await repo.listVersions(workspaceId, documentId);
        await repo.trackExport(documentId, versions?.[0]?.id || null, userId, 'pdf');
      } catch { /* non-critical */ }
      resolve(buffer);
    });
    pdfDoc.on('error', reject);

    // Header
    pdfDoc.fontSize(8).fillColor('#666').text(workspace?.name || 'Tetri Copilot', { align: 'right' });
    pdfDoc.moveDown(0.5);
    pdfDoc.moveTo(60, pdfDoc.y).lineTo(535, pdfDoc.y).strokeColor('#e5e7eb').stroke();
    pdfDoc.moveDown(0.5);

    // Title
    pdfDoc.fontSize(18).fillColor('#111827').font('Helvetica-Bold').text(doc.title, { align: 'center' });
    pdfDoc.moveDown(0.3);
    if (doc.category) {
      pdfDoc.fontSize(10).fillColor('#6b7280').font('Helvetica').text(doc.category, { align: 'center' });
    }
    pdfDoc.moveDown(1);

    // Content — split paragraphs
    const paragraphs = content.split(/\n\n+/);
    pdfDoc.fontSize(11).fillColor('#1f2937').font('Helvetica');

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      // Detect heading-like lines (all-caps or ending with :)
      if (/^[A-Z\s]{5,}$/.test(trimmed) || (trimmed.length < 60 && trimmed.endsWith(':'))) {
        pdfDoc.font('Helvetica-Bold').text(trimmed).font('Helvetica');
      } else {
        pdfDoc.text(trimmed, { lineGap: 3 });
      }
      pdfDoc.moveDown(0.7);
    }

    // Footer
    pdfDoc.moveDown(1);
    pdfDoc.moveTo(60, pdfDoc.y).lineTo(535, pdfDoc.y).strokeColor('#e5e7eb').stroke();
    pdfDoc.moveDown(0.3);
    pdfDoc.fontSize(8).fillColor('#9ca3af').text(
      `Generated by Tetri Copilot · ${new Date().toLocaleDateString()}`,
      { align: 'center' },
    );

    pdfDoc.end();
  });
};

const exportDocx = async (workspaceId, documentId, userId) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const content = doc.finalContent || doc.generatedContent || '';
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());

  const docChildren = [
    new Paragraph({
      text: doc.title,
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  if (doc.category) {
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: doc.category, color: '6b7280', size: 20 })],
    }));
  }

  docChildren.push(new Paragraph({ text: '' }));

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const isHeading = /^[A-Z\s]{5,}$/.test(trimmed) || (trimmed.length < 60 && trimmed.endsWith(':'));
    if (isHeading) {
      docChildren.push(new Paragraph({ text: trimmed, heading: HeadingLevel.HEADING_2 }));
    } else {
      // Handle line breaks within paragraph
      const lines = trimmed.split('\n');
      const runs = [];
      lines.forEach((line, i) => {
        runs.push(new TextRun({ text: line, break: i > 0 ? 1 : 0 }));
      });
      docChildren.push(new Paragraph({ children: runs, spacing: { after: 160 } }));
    }
  }

  // Footer paragraph
  docChildren.push(new Paragraph({ text: '' }));
  docChildren.push(new Paragraph({
    children: [new TextRun({ text: `Generated by Tetri Copilot · ${new Date().toLocaleDateString()}`, color: '9ca3af', size: 18 })],
  }));

  const wordDoc = new Document({
    sections: [{ children: docChildren }],
    creator: 'Tetri Copilot',
    title: doc.title,
  });

  const buffer = await Packer.toBuffer(wordDoc);

  try {
    const versions = await repo.listVersions(workspaceId, documentId);
    await repo.trackExport(documentId, versions?.[0]?.id || null, userId, 'docx');
  } catch { /* non-critical */ }

  return buffer;
};

const exportHtml = async (workspaceId, documentId, userId) => {
  const doc = await repo.findById(workspaceId, documentId);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  const content = doc.finalContent || doc.generatedContent || '';
  const workspace = await prisma.workspace.findFirst({ where: { id: workspaceId }, select: { name: true } });

  const paragraphsHtml = content.split(/\n\n+/).map((para) => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    const isHeading = /^[A-Z\s]{5,}$/.test(trimmed) || (trimmed.length < 60 && trimmed.endsWith(':'));
    if (isHeading) return `<h2 style="font-size:15px;font-weight:600;margin:20px 0 8px">${escapeHtml(trimmed)}</h2>`;
    return `<p style="margin:0 0 12px;line-height:1.7">${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(doc.title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; background: #fff; margin: 0; padding: 40px; }
  .container { max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
  .company { font-size: 12px; color: #6b7280; text-align: right; }
  h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
  .category { font-size: 13px; color: #6b7280; }
  .content { font-size: 14px; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="company">${escapeHtml(workspace?.name || 'Tetri Copilot')}</div>
    <h1>${escapeHtml(doc.title)}</h1>
    ${doc.category ? `<div class="category">${escapeHtml(doc.category)}</div>` : ''}
  </div>
  <div class="content">
    ${paragraphsHtml}
  </div>
  <div class="footer">Generated by Tetri Copilot · ${new Date().toLocaleDateString()}</div>
</div>
</body>
</html>`;

  try {
    const versions = await repo.listVersions(workspaceId, documentId);
    await repo.trackExport(documentId, versions?.[0]?.id || null, userId, 'html');
  } catch { /* non-critical */ }

  return html;
};

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- Duplicate ----

const duplicateDoc = async (workspaceId, userId, documentId) => {
  const copy = await repo.duplicate(workspaceId, documentId, userId);
  if (!copy) throw Object.assign(new Error('Document not found'), { status: 404 });
  const content = copy.finalContent || copy.generatedContent || '';
  if (content) await repo.createVersion(copy.id, userId, content, 'Duplicated document');
  return copy;
};

module.exports = {
  CATEGORIES, TONES, ENHANCEMENT_TYPES, TRANSFORM_TONES, SUMMARY_FORMATS,
  list:           (wid, params) => repo.list(wid, params),
  findById,
  generate,
  save,
  regenerate,
  updateDoc,
  softDelete:     (wid, id) => repo.softDelete(wid, id),
  getVersions,
  getVersion,
  restoreVersion,
  compareVersions,
  enhance,
  transformTone,
  generateSummary,
  qualityReview,
  exportPdf,
  exportDocx,
  exportHtml,
  duplicateDoc,
  getExports:     (wid, id) => repo.listExports(wid, id),
};
