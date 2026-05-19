const CUSTOMER_TYPES = ['individual', 'company', 'government', 'ngo', 'other'];

const CUSTOMER_STATUSES = ['active', 'inactive', 'suspended', 'archived'];

const CONTACT_ROLES = [
  'primary_contact',
  'billing_contact',
  'finance_contact',
  'procurement_contact',
  'operations_contact',
  'legal_contact',
  'technical_contact',
  'other',
];

const PAYMENT_TERMS = ['due_immediately', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60'];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 20 MB

const SORT_FIELDS = ['name', 'customerCode', 'status', 'customerType', 'createdAt'];

module.exports = {
  CUSTOMER_TYPES,
  CUSTOMER_STATUSES,
  CONTACT_ROLES,
  PAYMENT_TERMS,
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
  SORT_FIELDS,
};
