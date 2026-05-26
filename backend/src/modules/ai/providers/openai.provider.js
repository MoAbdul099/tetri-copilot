const BaseProvider = require('./base.provider');

class OpenAIProvider extends BaseProvider {
  constructor() {
    super('openai');
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      const { OpenAI } = require('openai');
      this._client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this._client;
  }

  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }

  async generateText({ messages, model = 'gpt-4o-mini', temperature = 0.7, maxTokens = 1000 }) {
    const client = this._getClient();
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    const choice = response.choices[0];
    return {
      text: choice.message.content,
      tokensInput:  response.usage?.prompt_tokens     || 0,
      tokensOutput: response.usage?.completion_tokens || 0,
      finishReason: choice.finish_reason,
    };
  }

  async generateStructuredOutput({ messages, model = 'gpt-4o-mini', schema }) {
    const client = this._getClient();
    const response = await client.chat.completions.create({
      model,
      messages,
      response_format: { type: 'json_object' },
    });
    const text = response.choices[0].message.content;
    return {
      data: JSON.parse(text),
      tokensInput:  response.usage?.prompt_tokens     || 0,
      tokensOutput: response.usage?.completion_tokens || 0,
    };
  }

  async generateEmbedding({ input, model = 'text-embedding-3-small' }) {
    const client = this._getClient();
    const response = await client.embeddings.create({ model, input });
    return { embedding: response.data[0].embedding };
  }

  async healthCheck() {
    if (!this.isConfigured()) return { status: 'down', responseTimeMs: null, message: 'OPENAI_API_KEY not configured' };
    const start = Date.now();
    try {
      const client = this._getClient();
      await client.models.list();
      return { status: 'healthy', responseTimeMs: Date.now() - start, message: 'OK' };
    } catch (err) {
      const ms = Date.now() - start;
      if (err.status === 429) return { status: 'degraded', responseTimeMs: ms, message: 'Rate limited' };
      return { status: 'down', responseTimeMs: ms, message: err.message };
    }
  }
}

module.exports = new OpenAIProvider();
