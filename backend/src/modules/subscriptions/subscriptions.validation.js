const { z } = require('zod');

const changePlanSchema = z.object({
  planCode: z.string().min(1, 'Plan code is required'),
});

module.exports = { changePlanSchema };
