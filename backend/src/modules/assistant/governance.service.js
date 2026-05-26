const INJECTION_PATTERNS = [
  /ignore (previous|above|prior|all) instructions/i,
  /you are now/i,
  /system prompt/i,
  /reveal (your|the) (prompt|instructions|system)/i,
  /act as (a different|an? (unrestricted|unfiltered|jailbreak))/i,
  /DAN mode/i,
];

const WRITE_PATTERNS = [
  /\b(create|delete|update|modify|insert|drop|truncate|alter)\b.*\b(invoice|expense|payment|customer|record|data|database)\b/i,
  /\b(send|trigger|approve|execute|run|process)\b.*\b(email|workflow|action|payment|approval)\b/i,
];

function check(userMessage) {
  const msg = userMessage || '';

  // Prompt injection detection
  for (const p of INJECTION_PATTERNS) {
    if (p.test(msg)) {
      return { allowed: false, reason: 'prompt_injection', message: 'I cannot process that request.' };
    }
  }

  // Write operation attempt
  for (const p of WRITE_PATTERNS) {
    if (p.test(msg)) {
      return {
        allowed: false,
        reason: 'write_attempt',
        message: 'I currently operate in **read-only mode** and cannot create, update, or delete records. You can do this directly in the relevant section of the app.',
      };
    }
  }

  return { allowed: true };
}

function buildReadOnlyFooter(response) {
  return response;
}

module.exports = { check, buildReadOnlyFooter };
