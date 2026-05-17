const { z } = require('zod');

const bootstrapSchema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required' })
    .trim()
    .min(1, 'Workspace name cannot be empty')
    .max(255, 'Workspace name must be 255 characters or less'),
});

const patchWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  countryProfileId: z.string().uuid().optional().nullable(),
  defaultCurrencyId: z.string().uuid().optional().nullable(),
  defaultLanguageId: z.string().uuid().optional().nullable(),
});

module.exports = { bootstrapSchema, patchWorkspaceSchema };
