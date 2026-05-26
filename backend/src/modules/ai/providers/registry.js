const openai    = require('./openai.provider');
const anthropic = require('./anthropic.provider');

const PROVIDERS = { openai, anthropic };

function get(code) {
  const provider = PROVIDERS[code];
  if (!provider) throw new Error(`Unknown AI provider: ${code}`);
  return provider;
}

function list() {
  return Object.values(PROVIDERS);
}

module.exports = { get, list };
