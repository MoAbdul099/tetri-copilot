const repo = require('./ai.repository');

const DEFAULT_PROVIDERS = [
  { code: 'gemini',    name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com',  enabled: false },
  { code: 'groq',      name: 'GroqCloud',     endpoint: 'https://api.groq.com/openai/v1',             enabled: false },
  { code: 'openai',    name: 'OpenAI',        endpoint: 'https://api.openai.com/v1',                  enabled: false },
  { code: 'anthropic', name: 'Anthropic',     endpoint: 'https://api.anthropic.com',                  enabled: false },
];

const DEFAULT_MODELS = [
  // Google Gemini
  { providerCode: 'gemini', modelName: 'gemini-2.0-flash',      description: 'Gemini 2.0 Flash — fast, multimodal, cost-efficient', contextWindow: 1000000, maxOutputTokens: 8192,  inputCostPer1k: 0.0001,  outputCostPer1k: 0.0004, isDefault: true  },
  { providerCode: 'gemini', modelName: 'gemini-2.0-flash-lite',  description: 'Gemini 2.0 Flash Lite — lightest and fastest',        contextWindow: 1000000, maxOutputTokens: 8192,  inputCostPer1k: 0.000075,outputCostPer1k: 0.0003, isDefault: false },
  { providerCode: 'gemini', modelName: 'gemini-1.5-pro',         description: 'Gemini 1.5 Pro — most capable Gemini model',          contextWindow: 2000000, maxOutputTokens: 8192,  inputCostPer1k: 0.00125, outputCostPer1k: 0.005,  isDefault: false },
  // GroqCloud
  { providerCode: 'groq', modelName: 'llama-3.3-70b-versatile',  description: 'Llama 3.3 70B — best quality on Groq',               contextWindow: 128000,  maxOutputTokens: 32768, inputCostPer1k: 0.00059, outputCostPer1k: 0.00079,isDefault: true  },
  { providerCode: 'groq', modelName: 'llama-3.1-8b-instant',     description: 'Llama 3.1 8B — fastest, lowest latency',             contextWindow: 128000,  maxOutputTokens: 8192,  inputCostPer1k: 0.00005, outputCostPer1k: 0.00008,isDefault: false },
  { providerCode: 'groq', modelName: 'mixtral-8x7b-32768',       description: 'Mixtral 8x7B — large context window',                contextWindow: 32768,   maxOutputTokens: 32768, inputCostPer1k: 0.00024, outputCostPer1k: 0.00024,isDefault: false },
  // OpenAI (available but not primary)
  { providerCode: 'openai', modelName: 'gpt-4o',      description: 'GPT-4o — flagship multimodal model',   contextWindow: 128000, maxOutputTokens: 4096,  inputCostPer1k: 0.005,   outputCostPer1k: 0.015,  isDefault: false },
  { providerCode: 'openai', modelName: 'gpt-4o-mini', description: 'GPT-4o Mini — fast, cost-efficient',    contextWindow: 128000, maxOutputTokens: 16384, inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, isDefault: true  },
  // Anthropic (available but not primary)
  { providerCode: 'anthropic', modelName: 'claude-sonnet-4-6',         description: 'Claude Sonnet 4.6 — balanced performance', contextWindow: 200000, maxOutputTokens: 8192, inputCostPer1k: 0.003,  outputCostPer1k: 0.015, isDefault: true  },
  { providerCode: 'anthropic', modelName: 'claude-haiku-4-5-20251001', description: 'Claude Haiku 4.5 — fastest Claude',          contextWindow: 200000, maxOutputTokens: 8192, inputCostPer1k: 0.0008, outputCostPer1k: 0.004, isDefault: false },
];

const DEFAULT_CONFIG = {
  default_provider:   'gemini',
  backup_provider:    'groq',
  default_model:      'gemini-2.0-flash',
  temperature:        '0.7',
  max_tokens:         '1000',
  max_retries:        '3',
  timeout_ms:         '30000',
  daily_quota:        '1000',
  monthly_quota:      '10000',
  cost_limit_daily:   '10.00',
  cost_limit_monthly: '100.00',
};

async function seedAiData() {
  // Seed providers — auto-enable based on configured API keys
  const providerMap = {};
  for (const p of DEFAULT_PROVIDERS) {
    const keyMap = { gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY', openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY' };
    const enabled = !!process.env[keyMap[p.code]];
    const record = await repo.upsertProvider(p.code, { name: p.name, endpoint: p.endpoint, enabled, status: 'unknown' });
    providerMap[p.code] = record;
  }

  // Seed models (skip if already exists)
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

  // Seed config keys (only missing ones)
  const existing = await repo.getAllConfig();
  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    if (!(key in existing)) await repo.setConfigValue(key, value);
  }

  // Update default_provider and backup_provider if they still point to old values
  if (existing.default_provider === 'openai') await repo.setConfigValue('default_provider', 'gemini');
  if (existing.default_model    === 'gpt-4o-mini') await repo.setConfigValue('default_model', 'gemini-2.0-flash');
  if (!existing.backup_provider) await repo.setConfigValue('backup_provider', 'groq');

  // Seed system quota rule
  await repo.upsertQuotaRule({
    scope: 'system', scopeId: null,
    dailyRequests: 10000, monthlyRequests: 100000,
    dailyCostLimit: 50.0, monthlyCostLimit: 500.0,
    active: true,
  });
}

module.exports = { seedAiData };
