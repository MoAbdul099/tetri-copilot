const BaseProvider = require('./base.provider');

class GroqProvider extends BaseProvider {
  constructor() {
    super('groq');
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      const Groq = require('groq-sdk');
      this._client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return this._client;
  }

  isConfigured() {
    return !!process.env.GROQ_API_KEY;
  }

  async generateText({ messages, model = 'llama-3.3-70b-versatile', temperature = 0.7, maxTokens = 1000 }) {
    const client = this._getClient();
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    const choice = response.choices[0];
    return {
      text:         choice.message.content,
      tokensInput:  response.usage?.prompt_tokens     || 0,
      tokensOutput: response.usage?.completion_tokens || 0,
      finishReason: choice.finish_reason,
    };
  }

  async *generateStream({ messages, model = 'llama-3.3-70b-versatile', temperature = 0.7, maxTokens = 1000 }) {
    const client = this._getClient();
    const stream = await client.chat.completions.create({
      model, messages, temperature, max_tokens: maxTokens, stream: true,
    });

    let tokensInput = 0, tokensOutput = 0;
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) yield { text };
      // Groq surfaces usage on the final chunk via x_groq
      if (chunk.x_groq?.usage) {
        tokensInput  = chunk.x_groq.usage.prompt_tokens     || 0;
        tokensOutput = chunk.x_groq.usage.completion_tokens || 0;
      }
    }

    yield { done: true, tokensInput, tokensOutput };
  }

  async generateStructuredOutput({ messages, model = 'llama-3.3-70b-versatile', maxTokens = 1000 }) {
    const augmented = [
      ...messages,
      { role: 'user', content: 'Respond with valid JSON only, no markdown.' },
    ];
    const result = await this.generateText({ messages: augmented, model, maxTokens });
    return {
      data: JSON.parse(result.text),
      tokensInput:  result.tokensInput,
      tokensOutput: result.tokensOutput,
    };
  }

  async generateEmbedding() {
    throw new Error('Groq does not support embeddings');
  }

  async healthCheck() {
    if (!this.isConfigured()) return { status: 'down', responseTimeMs: null, message: 'GROQ_API_KEY not configured' };
    const start = Date.now();
    try {
      const client = this._getClient();
      await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
      });
      return { status: 'healthy', responseTimeMs: Date.now() - start, message: 'OK' };
    } catch (err) {
      const ms = Date.now() - start;
      if (err.status === 429) return { status: 'degraded', responseTimeMs: ms, message: 'Rate limited' };
      return { status: 'down', responseTimeMs: ms, message: err.message };
    }
  }
}

module.exports = new GroqProvider();
