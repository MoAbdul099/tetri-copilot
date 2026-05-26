const BaseProvider = require('./base.provider');

class AnthropicProvider extends BaseProvider {
  constructor() {
    super('anthropic');
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      const Anthropic = require('@anthropic-ai/sdk');
      this._client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this._client;
  }

  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async generateText({ messages, model = 'claude-haiku-4-5-20251001', temperature = 0.7, maxTokens = 1000 }) {
    const client = this._getClient();
    // Separate system message from user messages
    const systemMsg = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      ...(systemMsg ? { system: systemMsg.content } : {}),
      messages: userMessages,
    });

    return {
      text: response.content[0]?.text || '',
      tokensInput:  response.usage?.input_tokens  || 0,
      tokensOutput: response.usage?.output_tokens || 0,
      finishReason: response.stop_reason,
    };
  }

  async generateStructuredOutput({ messages, model = 'claude-haiku-4-5-20251001', maxTokens = 1000 }) {
    const augmented = [...messages, { role: 'user', content: 'Respond with valid JSON only.' }];
    const result = await this.generateText({ messages: augmented, model, maxTokens });
    return {
      data: JSON.parse(result.text),
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
    };
  }

  async generateEmbedding() {
    throw new Error('Anthropic does not support embeddings via this SDK');
  }

  async healthCheck() {
    if (!this.isConfigured()) return { status: 'down', responseTimeMs: null, message: 'ANTHROPIC_API_KEY not configured' };
    const start = Date.now();
    try {
      const client = this._getClient();
      await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return { status: 'healthy', responseTimeMs: Date.now() - start, message: 'OK' };
    } catch (err) {
      const ms = Date.now() - start;
      if (err.status === 429) return { status: 'degraded', responseTimeMs: ms, message: 'Rate limited' };
      return { status: 'down', responseTimeMs: ms, message: err.message };
    }
  }
}

module.exports = new AnthropicProvider();
