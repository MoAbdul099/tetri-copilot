const repo = require('./ai.repository');

const DEFAULT_PROVIDERS = [
  { code: 'openai',    name: 'OpenAI',       endpoint: 'https://api.openai.com/v1',                         enabled: false },
  { code: 'anthropic', name: 'Anthropic',    endpoint: 'https://api.anthropic.com',                         enabled: false },
  { code: 'gemini',    name: 'Google Gemini',endpoint: 'https://generativelanguage.googleapis.com/v1beta',  enabled: false },
  { code: 'azure',     name: 'Azure OpenAI', endpoint: null,                                                enabled: false },
];

const DEFAULT_MODELS = [
  // OpenAI
  { providerCode: 'openai', modelName: 'gpt-4o',         description: 'GPT-4o — flagship multimodal model',        contextWindow: 128000, maxOutputTokens: 4096,  inputCostPer1k: 0.005,   outputCostPer1k: 0.015,  isDefault: false },
  { providerCode: 'openai', modelName: 'gpt-4o-mini',    description: 'GPT-4o Mini — fast, cost-efficient',         contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, isDefault: true  },
  { providerCode: 'openai', modelName: 'gpt-4.1-nano',   description: 'GPT-4.1 Nano — lightest, fastest',           contextWindow: 128000, maxOutputTokens: 4096,  inputCostPer1k: 0.0001,  outputCostPer1k: 0.0004, isDefault: false },
  // Anthropic
  { providerCode: 'anthropic', modelName: 'claude-sonnet-4-6',          description: 'Claude Sonnet 4.6 — balanced performance', contextWindow: 200000, maxOutputTokens: 8192, inputCostPer1k: 0.003, outputCostPer1k: 0.015, isDefault: true  },
  { providerCode: 'anthropic', modelName: 'claude-haiku-4-5-20251001',  description: 'Claude Haiku 4.5 — fastest Claude model',   contextWindow: 200000, maxOutputTokens: 8192, inputCostPer1k: 0.0008, outputCostPer1k: 0.004, isDefault: false },
  { providerCode: 'anthropic', modelName: 'claude-opus-4-7',            description: 'Claude Opus 4.7 — most capable Claude',     contextWindow: 200000, maxOutputTokens: 8192, inputCostPer1k: 0.015, outputCostPer1k: 0.075, isDefault: false },
];

const DEFAULT_CONFIG = {
  default_provider:    'openai',
  default_model:       'gpt-4o-mini',
  temperature:         '0.7',
  max_tokens:          '1000',
  max_retries:         '3',
  timeout_ms:          '30000',
  daily_quota:         '1000',
  monthly_quota:       '10000',
  cost_limit_daily:    '10.00',
  cost_limit_monthly:  '100.00',
};

async function seedAiData() {
  // Seed providers
  const providerMap = {};
  for (const p of DEFAULT_PROVIDERS) {
    const enabled = p.code === 'openai'
      ? !!process.env.OPENAI_API_KEY
      : p.code === 'anthropic'
        ? !!process.env.ANTHROPIC_API_KEY
        : false;
    const record = await repo.upsertProvider(p.code, { name: p.name, endpoint: p.endpoint, enabled, status: 'unknown' });
    providerMap[p.code] = record;
  }

  // Seed models
  for (const m of DEFAULT_MODELS) {
    const provider = providerMap[m.providerCode];
    if (!provider) continue;
    const existing = await repo.getModelByName(m.modelName, provider.id);
    if (!existing) {
      await repo.createModel({
        providerId:      provider.id,
        modelName:       m.modelName,
        description:     m.description,
        contextWindow:   m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        inputCostPer1k:  m.inputCostPer1k,
        outputCostPer1k: m.outputCostPer1k,
        isDefault:       m.isDefault,
        active:          true,
      });
    }
  }

  // Seed config (only if key doesn't already exist)
  const existing = await repo.getAllConfig();
  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    if (!(key in existing)) await repo.setConfigValue(key, value);
  }

  // Seed system quota rule
  await repo.upsertQuotaRule({
    scope: 'system', scopeId: null,
    dailyRequests: 10000, monthlyRequests: 100000,
    dailyCostLimit: 50.0, monthlyCostLimit: 500.0,
    active: true,
  });
}

module.exports = { seedAiData };
