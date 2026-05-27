const aiSvc = require('../ai/ai.service');

const COMPLIANCE_ACTION_TYPES = [
  'CREATE_REMINDER',
  'PREPARE_CHECKLIST',
  'GENERATE_DOCUMENT',
  'UPDATE_COMPLIANCE_STATUS',
  'ESCALATE_COMPLIANCE_ITEM',
];

async function suggestActions(workspaceId, userId, contextText) {
  const prompt = `You are a compliance AI advisor for a business. Based on the workspace compliance status below, suggest 3-5 specific AI actions that would help improve compliance readiness.

${contextText}

For each action, provide a JSON object with these exact fields:
- actionType: one of ${COMPLIANCE_ACTION_TYPES.join(', ')}
- title: short title (max 80 chars)
- description: what this action will do (1-2 sentences)
- explanation: why this action is needed based on the data
- expectedOutcome: what will be achieved
- confidenceScore: integer 50-95
- riskLevel: "low", "medium", "high", or "critical"
- supportingEvidence: brief evidence from the compliance data

Respond ONLY with a JSON array of action objects. No markdown, no explanation. Example:
[{"actionType":"CREATE_REMINDER","title":"...","description":"...","explanation":"...","expectedOutcome":"...","confidenceScore":80,"riskLevel":"medium","supportingEvidence":"..."}]`;

  const result = await aiSvc.execute({
    workspaceId,
    userId,
    feature: 'compliance_assistant',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 1200, temperature: 0.2 },
  });

  try {
    const cleaned = result.response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

async function generatePackage(workspaceId, userId, { packageType, obligationContext, contextText }) {
  const prompt = `You are a compliance preparation specialist. Generate a structured compliance preparation package.

Package Type: ${packageType}
${obligationContext ? `Obligation Details:\n${obligationContext}` : ''}
${contextText ? `Workspace Compliance Status:\n${contextText}` : ''}

Generate a JSON preparation package with this structure:
{
  "title": "Package title",
  "packageType": "${packageType}",
  "summary": "Executive summary (2-3 sentences)",
  "sections": [
    {
      "title": "Section title",
      "description": "Section description",
      "items": ["item 1", "item 2"],
      "priority": "high|medium|low"
    }
  ],
  "requiredDocuments": ["document 1", "document 2"],
  "requiredApprovals": ["approval 1"],
  "timeline": "Estimated timeline",
  "notes": "Additional notes",
  "generatedAt": "${new Date().toISOString()}"
}

Respond ONLY with valid JSON. No markdown, no explanation.`;

  const result = await aiSvc.execute({
    workspaceId,
    userId,
    feature: 'compliance_assistant',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 1500, temperature: 0.2 },
  });

  try {
    const cleaned = result.response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      title: `${packageType} Preparation Package`,
      packageType,
      summary: 'Package generated. Please review the details below.',
      sections: [],
      requiredDocuments: [],
      requiredApprovals: [],
      timeline: 'Review required',
      notes: result.response,
      generatedAt: new Date().toISOString(),
    };
  }
}

async function generateChecklist(workspaceId, userId, { obligationContext, contextText, checklistType }) {
  const prompt = `You are a compliance specialist. Generate a detailed compliance preparation checklist.

Checklist Type: ${checklistType || 'General Compliance'}
${obligationContext ? `Obligation:\n${obligationContext}` : ''}
${contextText ? `Workspace Context:\n${contextText}` : ''}

Generate a JSON checklist with this structure:
{
  "title": "Checklist title",
  "description": "Brief description",
  "items": [
    {
      "id": "1",
      "category": "Documentation|Evidence|Review|Approval|Submission",
      "task": "Task description",
      "priority": "critical|high|medium|low",
      "estimatedTime": "e.g. 30 minutes",
      "notes": "Optional note",
      "completed": false
    }
  ],
  "totalItems": 0,
  "estimatedTotalTime": "Total estimated time",
  "generatedAt": "${new Date().toISOString()}"
}

Include 8-15 specific, actionable checklist items. Respond ONLY with valid JSON. No markdown.`;

  const result = await aiSvc.execute({
    workspaceId,
    userId,
    feature: 'compliance_assistant',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 1200, temperature: 0.2 },
  });

  try {
    const cleaned = result.response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    parsed.totalItems = (parsed.items || []).length;
    return parsed;
  } catch {
    return {
      title: `${checklistType || 'Compliance'} Checklist`,
      description: 'Compliance preparation checklist',
      items: [],
      totalItems: 0,
      estimatedTotalTime: 'Unknown',
      notes: result.response,
      generatedAt: new Date().toISOString(),
    };
  }
}

async function draftReminderAction(workspaceId, userId, { occurrenceName, dueDate, urgency }) {
  return {
    title: `Reminder: ${occurrenceName}`,
    description: `Send a ${urgency === 'URGENT' ? 'urgent ' : ''}compliance reminder for "${occurrenceName}" due ${new Date(dueDate).toLocaleDateString()}.`,
    explanation: `The obligation "${occurrenceName}" ${urgency === 'OVERDUE' ? 'is overdue' : `is due in ${Math.ceil((new Date(dueDate) - Date.now()) / 86400000)} days`}. A reminder will ensure responsible parties are aware.`,
    expectedOutcome: 'Responsible parties are notified and take action.',
    confidenceScore: 85,
    riskLevel: urgency === 'OVERDUE' ? 'high' : urgency === 'URGENT' ? 'medium' : 'low',
    supportingEvidence: `Obligation status: ${urgency.toLowerCase()}, due ${new Date(dueDate).toLocaleDateString()}`,
  };
}

module.exports = { suggestActions, generatePackage, generateChecklist, draftReminderAction };
