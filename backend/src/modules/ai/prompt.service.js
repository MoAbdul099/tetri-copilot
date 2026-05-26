const repo    = require('./prompt.repository');
const aiSvc   = require('./ai.service');

// Replace {{variable}} placeholders with supplied values
function renderTemplate(content, variables = {}) {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

// ── Groups ────────────────────────────────────────────────────────────────────

async function listGroups() {
  return repo.listGroups();
}

async function createGroup({ name, description }) {
  if (!name) throw Object.assign(new Error('Group name is required'), { status: 400 });
  return repo.createGroup({ name, description });
}

// ── Prompts ───────────────────────────────────────────────────────────────────

async function listPrompts(filters) {
  return repo.listPrompts(filters);
}

async function getPrompt(id) {
  const prompt = await repo.getPromptById(id);
  if (!prompt) throw Object.assign(new Error('Prompt not found'), { status: 404 });
  return prompt;
}

async function createPrompt({ name, description, category, groupId }) {
  if (!name) throw Object.assign(new Error('Prompt name is required'), { status: 400 });
  return repo.createPrompt({ name, description, category: category || 'general', groupId, status: 'draft' });
}

async function updatePrompt(id, { name, description, category, groupId, status }) {
  await getPrompt(id);
  return repo.updatePrompt(id, { name, description, category, groupId, status });
}

async function archivePrompt(id) {
  await getPrompt(id);
  return repo.updatePrompt(id, { status: 'archived' });
}

// ── Versions ──────────────────────────────────────────────────────────────────

async function listVersions(promptId) {
  await getPrompt(promptId);
  return repo.getVersions(promptId);
}

async function createVersion(promptId, { content, changeNotes, userId }) {
  if (!content) throw Object.assign(new Error('Version content is required'), { status: 400 });
  await getPrompt(promptId);
  const version = await repo.createVersion(promptId, { content, changeNotes, createdBy: userId });
  // Auto-activate if first version
  const versions = await repo.getVersions(promptId);
  if (versions.length === 1) {
    await activateVersion(promptId, version.id);
  }
  return version;
}

async function activateVersion(promptId, versionId) {
  const prompt  = await getPrompt(promptId);
  const version = await repo.getVersion(versionId);
  if (!version || version.promptId !== promptId) throw Object.assign(new Error('Version not found'), { status: 404 });

  await Promise.all([
    repo.updateVersionStatus(versionId, 'active'),
    repo.updatePrompt(promptId, { activeVersionId: versionId, status: 'active' }),
  ]);

  // Archive previous active version if different
  if (prompt.activeVersionId && prompt.activeVersionId !== versionId) {
    await repo.updateVersionStatus(prompt.activeVersionId, 'archived');
  }

  return repo.getVersion(versionId);
}

async function rollbackVersion(promptId, targetVersionId) {
  return activateVersion(promptId, targetVersionId);
}

// ── Testing ───────────────────────────────────────────────────────────────────

async function testPrompt({ promptId, versionId, variables = {}, workspaceId, userId }) {
  const prompt  = await getPrompt(promptId);
  let version;
  if (versionId) {
    version = await repo.getVersion(versionId);
  } else if (prompt.activeVersionId) {
    version = await repo.getVersion(prompt.activeVersionId);
  }
  if (!version) throw Object.assign(new Error('No active version to test'), { status: 400 });

  const rendered = renderTemplate(version.content, variables);
  const messages = [{ role: 'user', content: rendered }];

  const start = Date.now();
  let output, tokens = 0, cost = 0, succeeded = true, errMsg;
  try {
    const result = await aiSvc.execute({
      workspaceId,
      userId,
      feature: 'prompt_test',
      messages,
    });
    output  = result.response;
    tokens  = (result.tokensInput || 0) + (result.tokensOutput || 0);
    cost    = result.cost || 0;
  } catch (err) {
    succeeded = false;
    errMsg    = err.message;
    output    = null;
  }

  const durationMs = Date.now() - start;

  const test = await repo.createTest({
    promptId,
    promptVersionId: version.id,
    inputPayload:  { content: rendered, variables },
    outputPayload: output,
    tokens,
    cost,
    durationMs,
    success:      succeeded,
    errorMessage: errMsg,
  });

  return { ...test, rendered, output };
}

// ── Active prompt for feature use ─────────────────────────────────────────────

async function getActivePromptContent(promptName, variables = {}) {
  const prompt = await repo.listPrompts({}).then((list) => list.find((p) => p.name === promptName));
  if (!prompt?.activeVersionId) return null;
  const version = await repo.getVersion(prompt.activeVersionId);
  if (!version) return null;
  return renderTemplate(version.content, variables);
}

module.exports = {
  listGroups, createGroup,
  listPrompts, getPrompt, createPrompt, updatePrompt, archivePrompt,
  listVersions, createVersion, activateVersion, rollbackVersion,
  testPrompt, getActivePromptContent, renderTemplate,
};
