const Anthropic = require('@anthropic-ai/sdk');

let client = null;
if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const isAvailable = () => !!client;

const generate = async (prompt, maxTokens = 1024) => {
  if (!client) return null;
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return msg.content[0]?.text || null;
};

module.exports = { isAvailable, generate };
