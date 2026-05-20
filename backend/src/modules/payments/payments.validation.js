const { z } = require('zod');
const { PAYMENT_METHODS } = require('./payments.constants');

const recordPaymentSchema = z.object({
  customerId:     z.string().uuid(),
  paymentDate:    z.string().min(1),
  amount:         z.number().positive('Amount must be positive'),
  currencyCode:   z.string().min(1).max(10).default('USD'),
  paymentMethod:  z.enum(PAYMENT_METHODS),
  referenceNumber: z.string().max(100).optional().nullable(),
  bankReference:  z.string().max(100).optional().nullable(),
  chequeNumber:   z.string().max(100).optional().nullable(),
  depositDate:    z.string().optional().nullable(),
  valueDate:      z.string().optional().nullable(),
  isAdvance:      z.boolean().default(false),
  notes:          z.string().optional().nullable(),
});

const updatePaymentSchema = z.object({
  paymentDate:    z.string().min(1).optional(),
  amount:         z.number().positive().optional(),
  currencyCode:   z.string().min(1).max(10).optional(),
  paymentMethod:  z.enum(PAYMENT_METHODS).optional(),
  referenceNumber: z.string().max(100).optional().nullable(),
  bankReference:  z.string().max(100).optional().nullable(),
  chequeNumber:   z.string().max(100).optional().nullable(),
  depositDate:    z.string().optional().nullable(),
  valueDate:      z.string().optional().nullable(),
  notes:          z.string().optional().nullable(),
});

const allocateSchema = z.object({
  allocations: z.array(z.object({
    invoiceId:      z.string().uuid(),
    allocatedAmount: z.number().positive(),
    notes:          z.string().optional().nullable(),
  })).min(1),
});

const reverseSchema = z.object({
  reason: z.string().min(1, 'Reversal reason is required'),
});

const applyCreditSchema = z.object({
  invoiceId: z.string().uuid(),
  amount:    z.number().positive(),
});

module.exports = {
  recordPaymentSchema,
  updatePaymentSchema,
  allocateSchema,
  reverseSchema,
  applyCreditSchema,
};
