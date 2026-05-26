const BaseProvider = require('./base.provider');

class GeminiProvider extends BaseProvider {
  constructor() {
    super('gemini');
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      const { GoogleGenAI } = require('@google/genai');
      this._client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this._client;
  }

  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  }

  // Convert OpenAI-style messages to Gemini contents format
  _toGeminiContents(messages) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  }

  _extractSystemPrompt(messages) {
    const sys = messages.find((m) => m.role === 'system');
    return sys ? sys.content : null;
  }

  async generateText({ messages, model = 'gemini-2.0-flash', temperature = 0.7, maxTokens = 1000 }) {
    const client = this._getClient();
    const contents = this._toGeminiContents(messages);
    const systemInstruction = this._extractSystemPrompt(messages);

    const config = {
      temperature,
      maxOutputTokens: maxTokens,
      ...(systemInstruction ? { systemInstruction } : {}),
    };

    const response = await client.models.generateContent({
      model,
      contents,
      config,
    });

    const text = response.text ?? '';
    const usage = response.usageMetadata ?? {};

    return {
      text,
      tokensInput:  usage.promptTokenCount     || 0,
      tokensOutput: usage.candidatesTokenCount || 0,
      finishReason: response.candidates?.[0]?.finishReason || null,
    };
  }

  async generateStructuredOutput({ messages, model = 'gemini-2.0-flash', maxTokens = 1000 }) {
    const client = this._getClient();
    const contents = this._toGeminiContents(messages);
    const systemInstruction = this._extractSystemPrompt(messages);

    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
        ...(systemInstruction ? { systemInstruction } : {}),
      },
    });

    const usage = response.usageMetadata ?? {};
    return {
      data: JSON.parse(response.text),
      tokensInput:  usage.promptTokenCount     || 0,
      tokensOutput: usage.candidatesTokenCount || 0,
    };
  }

  async *generateStream({ messages, model = 'gemini-2.0-flash', temperature = 0.7, maxTokens = 1000 }) {
    const client = this._getClient();
    const contents = this._toGeminiContents(messages);
    const systemInstruction = this._extractSystemPrompt(messages);

    const config = {
      temperature,
      maxOutputTokens: maxTokens,
      ...(systemInstruction ? { systemInstruction } : {}),
    };

    let tokensInput = 0, tokensOutput = 0;

    const stream = await client.models.generateContentStream({ model, contents, config });
    for await (const chunk of stream) {
      const text = chunk.text ?? '';
      if (text) yield { text };
      if (chunk.usageMetadata) {
        tokensInput  = chunk.usageMetadata.promptTokenCount     || 0;
        tokensOutput = chunk.usageMetadata.candidatesTokenCount || 0;
      }
    }

    yield { done: true, tokensInput, tokensOutput };
  }

  async generateEmbedding({ input, model = 'text-embedding-004' }) {
    const client = this._getClient();
    const response = await client.models.embedContent({
      model,
      contents: [{ role: 'user', parts: [{ text: input }] }],
    });
    return { embedding: response.embeddings?.[0]?.values || [] };
  }

  async healthCheck() {
    if (!this.isConfigured()) return { status: 'down', responseTimeMs: null, message: 'GEMINI_API_KEY not configured' };
    const start = Date.now();
    try {
      const client = this._getClient();
      await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
        config: { maxOutputTokens: 5 },
      });
      return { status: 'healthy', responseTimeMs: Date.now() - start, message: 'OK' };
    } catch (err) {
      const ms = Date.now() - start;
      if (err.status === 429) return { status: 'degraded', responseTimeMs: ms, message: 'Rate limited' };
      return { status: 'down', responseTimeMs: ms, message: err.message };
    }
  }
}

module.exports = new GeminiProvider();
