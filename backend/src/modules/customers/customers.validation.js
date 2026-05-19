const { z } = require('zod');
const { CUSTOMER_TYPES, CUSTOMER_STATUSES, CONTACT_ROLES, PAYMENT_TERMS } = require('./customers.constants');

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(150),
  lastName: z.string().min(1, 'Last name is required').max(150),
  jobTitle: z.string().max(150).optional().nullable(),
  department: z.string().max(150).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
  mobile: z.string().max(50).optional().nullable(),
  extension: z.string().max(20).optional().nullable(),
  contactRole: z.enum(CONTACT_ROLES).optional().nullable(),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  customerType: z.enum(CUSTOMER_TYPES).optional().default('company'),
  status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
  defaultCurrency: z.string().max(10).optional().nullable(),
  openingBalance: z.coerce.number().optional().nullable(),
  creditLimit: z.coerce.number().min(0, 'Credit limit must be non-negative').optional().nullable(),
  paymentTerms: z.enum(PAYMENT_TERMS).optional().nullable(),
  country: z.string().max(150).optional().nullable(),
  stateRegion: z.string().max(150).optional().nullable(),
  city: z.string().max(150).optional().nullable(),
  postalCode: z.string().max(50).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  taxNumber: z.string().max(100).optional().nullable(),
  vatNumber: z.string().max(100).optional().nullable(),
  commercialRegistrationNumber: z.string().max(100).optional().nullable(),
  businessLicenseNumber: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional().default([]),
  primaryContact: contactSchema.optional().nullable(),
});

const updateCustomerSchema = createCustomerSchema.partial();

const createContactSchema = contactSchema;
const updateContactSchema = contactSchema.partial();

const createNoteSchema = z.object({
  noteText: z.string().min(1, 'Note text is required'),
});

const updateNoteSchema = z.object({
  noteText: z.string().min(1, 'Note text is required'),
});

const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(100),
  color: z.string().max(20).optional().nullable(),
});

const updateTagSchema = createTagSchema.partial();

const updateAttachmentSchema = z.object({
  fileName: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
});

const assignTagSchema = z.object({
  tagId: z.string().uuid('Invalid tag ID'),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  createContactSchema,
  updateContactSchema,
  createNoteSchema,
  updateNoteSchema,
  createTagSchema,
  updateTagSchema,
  updateAttachmentSchema,
  assignTagSchema,
};
