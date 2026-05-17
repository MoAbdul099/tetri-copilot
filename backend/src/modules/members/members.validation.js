const { z } = require('zod');

const inviteSchema = z.object({
  email: z.string().email('Valid email is required').max(255),
  role: z.enum(['user', 'viewer']).default('user'),
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

const updateRoleSchema = z.object({
  role: z.enum(['owner', 'user', 'viewer']),
});

module.exports = { inviteSchema, updateStatusSchema, updateRoleSchema };
