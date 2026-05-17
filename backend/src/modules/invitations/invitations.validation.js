const { z } = require('zod');

const createSchema = z.object({
  email: z.string().email('Valid email is required').max(255),
  role: z.enum(['user', 'viewer']).default('user'),
});

const acceptSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

module.exports = { createSchema, acceptSchema };
