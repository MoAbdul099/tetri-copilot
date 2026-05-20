const { z } = require('zod');

const lineItemSchema = z.object({
  id:            z.string().uuid().optional(),
  description:   z.string().min(1, 'Description is required').max(1000),
  quantity:      z.coerce.number().positive('Quantity must be positive'),
  unitPrice:     z.coerce.number().min(0, 'Unit price cannot be negative'),
  discountRate:  z.coerce.number().min(0).max(100).default(0),
  taxRate:       z.coerce.number().min(0).max(100).default(0),
  itemOrder:     z.coerce.number().int().min(1).default(1),
});

const createInvoiceSchema = z.object({
  customerId:       z.string().uuid('Invalid customer ID'),
  customerContactId: z.string().uuid().optional().nullable(),
  issueDate:        z.string().min(1, 'Issue date is required'),
  dueDate:          z.string().optional().nullable(),
  currencyCode:     z.string().min(1).max(10).default('USD'),
  referenceNumber:  z.string().max(100).optional().nullable(),
  poNumber:         z.string().max(100).optional().nullable(),
  customerReference: z.string().max(100).optional().nullable(),
  notes:            z.string().optional().nullable(),
  terms:            z.string().optional().nullable(),
  internalComments: z.string().optional().nullable(),
  items:            z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  items: z.array(lineItemSchema).min(1).optional(),
});

const sendInvoiceSchema = z.object({
  to:      z.string().email('Invalid recipient email'),
  cc:      z.string().optional().nullable(),
  bcc:     z.string().optional().nullable(),
  subject: z.string().max(500).optional().nullable(),
  message: z.string().optional().nullable(),
});

const voidInvoiceSchema = z.object({
  reason: z.string().min(1, 'Void reason is required').max(1000),
});

const suggestDescriptionSchema = z.object({
  draft: z.string().min(1).max(200),
});

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
  sendInvoiceSchema,
  voidInvoiceSchema,
  suggestDescriptionSchema,
};
