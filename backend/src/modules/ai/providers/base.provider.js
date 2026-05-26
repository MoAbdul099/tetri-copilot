/**
 * AI Provider base interface.
 * All concrete providers must implement these methods.
 */
class BaseProvider {
  constructor(code) {
    this.code = code;
  }

  /** @returns {{ text, tokensInput, tokensOutput }} */
  async generateText(/* { messages, model, temperature, maxTokens } */) {
    throw new Error(`${this.code}.generateText() not implemented`);
  }

  /** @returns {{ data: object, tokensInput, tokensOutput }} */
  async generateStructuredOutput(/* { messages, model, schema } */) {
    throw new Error(`${this.code}.generateStructuredOutput() not implemented`);
  }

  /** @returns {{ embedding: number[] }} */
  async generateEmbedding(/* { input, model } */) {
    throw new Error(`${this.code}.generateEmbedding() not implemented`);
  }

  /** @returns {{ status: 'healthy'|'degraded'|'down', responseTimeMs, message } } */
  async healthCheck() {
    throw new Error(`${this.code}.healthCheck() not implemented`);
  }

  isConfigured() {
    throw new Error(`${this.code}.isConfigured() not implemented`);
  }
}

module.exports = BaseProvider;
