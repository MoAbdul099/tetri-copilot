const INVOICE_STATUSES = ['draft', 'issued', 'sent', 'paid', 'overdue', 'cancelled', 'void'];

// Which transitions are allowed from each status
const VALID_TRANSITIONS = {
  draft:     ['issued', 'cancelled'],
  issued:    ['sent', 'cancelled', 'void'],
  sent:      ['paid', 'cancelled', 'void'],
  paid:      [],
  overdue:   ['paid', 'void'],
  cancelled: [],
  void:      [],
};

const EDITABLE_STATUSES = ['draft'];

const SORT_FIELDS = ['invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status', 'createdAt'];

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

module.exports = {
  INVOICE_STATUSES,
  VALID_TRANSITIONS,
  EDITABLE_STATUSES,
  SORT_FIELDS,
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
};
