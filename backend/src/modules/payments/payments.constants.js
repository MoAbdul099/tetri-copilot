const PAYMENT_STATUSES = ['draft', 'posted', 'allocated', 'partially_allocated', 'unallocated', 'reversed', 'voided'];

const PAYMENT_METHODS = [
  'cash', 'bank_transfer', 'credit_card', 'debit_card',
  'cheque', 'mobile_wallet', 'pos', 'online_transfer', 'other',
];

const PAYMENT_METHOD_LABELS = {
  cash:            'Cash',
  bank_transfer:   'Bank Transfer',
  credit_card:     'Credit Card',
  debit_card:      'Debit Card',
  cheque:          'Cheque',
  mobile_wallet:   'Mobile Wallet',
  pos:             'POS',
  online_transfer: 'Online Transfer',
  other:           'Other',
};

const VALID_TRANSITIONS = {
  draft:               ['posted', 'voided'],
  posted:              ['reversed', 'voided'],
  allocated:           ['reversed'],
  partially_allocated: ['reversed'],
  unallocated:         ['reversed', 'voided'],
  reversed:            [],
  voided:              [],
};

const SORT_FIELDS = ['paymentNumber', 'paymentDate', 'amount', 'status', 'createdAt'];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

module.exports = {
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  VALID_TRANSITIONS,
  SORT_FIELDS,
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
};
