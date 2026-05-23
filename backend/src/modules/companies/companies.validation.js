const { z } = require('zod');

const patchCompanySchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  legalName: z.string().max(255).optional().nullable(),
  email: z.string().email('Invalid email').max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  website: z.string().max(255).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().max(150).optional().nullable(),
  postalCode: z.string().max(50).optional().nullable(),
  taxNumber: z.string().max(100).optional().nullable(),
  registrationNumber: z.string().max(100).optional().nullable(),
  // Compliance profile fields
  jurisdictionId: z.string().uuid().optional().nullable(),
  taxRegistrationNumber: z.string().max(100).optional().nullable(),
  vatRegistered: z.boolean().optional(),
  vatRegistrationNumber: z.string().max(100).optional().nullable(),
  corporateTaxRegistered: z.boolean().optional(),
  corporateTaxNumber: z.string().max(100).optional().nullable(),
  tradeLicenseNumber: z.string().max(100).optional().nullable(),
  tradeLicenseExpiry: z.string().optional().nullable(),
});

module.exports = { patchCompanySchema };
