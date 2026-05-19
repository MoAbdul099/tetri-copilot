const { z } = require('zod');

const checkoutSessionSchema = z.object({
  planCode: z.string().min(1, 'Plan code is required'),
  billingInterval: z.enum(['monthly', 'yearly']).default('monthly'),
});

module.exports = { checkoutSessionSchema };
