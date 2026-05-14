const { z } = require('zod');

const bootstrapSchema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required' })
    .trim()
    .min(1, 'Workspace name cannot be empty')
    .max(255, 'Workspace name must be 255 characters or less'),
});

module.exports = { bootstrapSchema };
