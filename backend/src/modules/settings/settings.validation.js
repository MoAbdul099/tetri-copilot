const { z } = require('zod');

const patchSettingsSchema = z.object({
  invoicePrefix: z.string().min(1).max(20).optional(),
  defaultInvoiceDueDays: z.number().int().min(1, 'Must be at least 1 day').max(365).optional(),
  defaultTaxRate: z.number().min(0, 'Cannot be negative').max(100).optional(),
  reminderLeadDays: z.number().int().min(0, 'Cannot be negative').max(30).optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  dashboardNotificationsEnabled: z.boolean().optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
});

module.exports = { patchSettingsSchema };
