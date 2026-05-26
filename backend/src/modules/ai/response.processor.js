const UNSAFE_PATTERNS = [
  /\b(password|secret|api.?key|private.?key)\s*[:=]\s*\S+/i,
];

function process({ text, feature }) {
  if (!text || !text.trim()) {
    return { text: '', safe: false, reason: 'empty_response' };
  }

  const cleaned = text.trim();

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(cleaned)) {
      return { text: '', safe: false, reason: 'unsafe_content' };
    }
  }

  return { text: cleaned, safe: true, reason: null };
}

module.exports = { process };
