const prisma = require('../../lib/prisma');

async function build({ workspaceId, userId, feature, sessionHistory = [] }) {
  const [workspace, company] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true, planId: true } }).catch(() => null),
    prisma.company.findFirst({ where: { workspaceId }, select: { name: true, industry: true, country: true } }).catch(() => null),
  ]);

  const parts = [
    `You are Tetri Copilot, an AI-powered assistant for ${company?.name || workspace?.name || 'this workspace'}.`,
    `Feature: ${feature}`,
  ];

  if (company?.industry) parts.push(`Industry: ${company.industry}`);
  if (company?.country)  parts.push(`Country: ${company.country}`);

  parts.push('Answer professionally and concisely. Only use information relevant to the workspace context.');

  const systemContent = parts.join('\n');

  const messages = [{ role: 'system', content: systemContent }];

  for (const msg of sessionHistory) {
    messages.push({ role: msg.senderType === 'user' ? 'user' : 'assistant', content: msg.content });
  }

  return messages;
}

module.exports = { build };
