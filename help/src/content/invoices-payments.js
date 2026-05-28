export const articles = [
  {
    slug: 'invoices-payments/invoices-overview',
    title: 'Invoices Overview',
    description: 'How invoicing works in Tetri Copilot — creating, sending, and tracking invoices.',
    category: 'Invoices & Payments',
    categorySlug: 'invoices-payments',
    keywords: ['invoices', 'overview', 'billing', 'invoice management'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Invoices module lets you create professional invoices, track their status, and manage payments. Every invoice is linked to a customer and can have multiple line items. Invoices move through a lifecycle of statuses from Draft to Paid.',
      },
      {
        type: 'steps',
        title: 'How to Open Invoices',
        items: [
          'In the left sidebar, expand the Revenue group.',
          'Click Invoices.',
          'You see a list of all invoices with their status, amount, and due date.',
        ],
      },
      {
        type: 'fields',
        title: 'Invoice List Columns',
        rows: [
          { field: 'Invoice Number', required: false, description: 'Auto-generated unique invoice number (e.g., INV-0001).', example: 'INV-0001' },
          { field: 'Customer', required: false, description: 'The customer this invoice is billed to.', example: 'ABC Trading Ltd' },
          { field: 'Issue Date', required: false, description: 'The date the invoice was created.', example: '01 May 2026' },
          { field: 'Due Date', required: false, description: 'The date payment is expected.', example: '31 May 2026' },
          { field: 'Amount', required: false, description: 'The total invoice amount including tax.', example: '£1,200.00' },
          { field: 'Status', required: false, description: 'The current status of the invoice.', example: 'Sent' },
          { field: 'Actions', required: false, description: 'Options to view, edit, mark as paid, or delete.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/create-invoice', title: 'Create an Invoice' },
          { slug: 'invoices-payments/invoice-statuses', title: 'Invoice Statuses' },
          { slug: 'invoices-payments/record-payment', title: 'Record a Payment' },
        ],
      },
    ],
  },
  {
    slug: 'invoices-payments/create-invoice',
    title: 'Create an Invoice',
    description: 'Step-by-step guide to creating a professional invoice in Tetri Copilot.',
    category: 'Invoices & Payments',
    categorySlug: 'invoices-payments',
    keywords: ['create invoice', 'new invoice', 'billing', 'invoice form', 'line items'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Creating an invoice in Tetri Copilot is straightforward. You select the customer, add line items for the products or services you are billing for, set a due date, and save. You can then send the invoice directly or download it as a PDF.',
      },
      {
        type: 'steps',
        title: 'How to Create an Invoice',
        items: [
          'Go to Revenue → Invoices.',
          'Click Create Invoice (top right).',
          'Select the customer from the dropdown. If the customer does not exist yet, add them first.',
          'Set the Invoice Date (defaults to today).',
          'Set the Due Date (calculated based on payment terms, but you can override it).',
          'Add line items — click Add Line Item to add each product or service.',
          'For each line item, enter a description, quantity, and unit price.',
          'Review the subtotal and tax calculation at the bottom.',
          'Optionally add a note or payment instructions.',
          'Click Save as Draft to save without sending, or Save and Send to send immediately.',
        ],
      },
      {
        type: 'fields',
        title: 'Invoice Header Fields',
        rows: [
          { field: 'Customer', required: true, description: 'The customer being invoiced.', example: 'ABC Trading Ltd' },
          { field: 'Invoice Number', required: true, description: 'Auto-generated. You can override it if needed.', example: 'INV-0042' },
          { field: 'Invoice Date', required: true, description: 'The date of the invoice.', example: '01 May 2026' },
          { field: 'Due Date', required: true, description: 'The payment due date.', example: '31 May 2026' },
          { field: 'Currency', required: false, description: 'Defaults to customer\'s currency or workspace currency.', example: 'GBP' },
          { field: 'Reference', required: false, description: 'An optional reference number for the customer (e.g., their PO number).', example: 'PO-2026-001' },
          { field: 'Notes', required: false, description: 'Additional notes or payment instructions visible on the invoice PDF.', example: 'Please pay via bank transfer. Bank details enclosed.' },
        ],
      },
      {
        type: 'fields',
        title: 'Line Item Fields',
        rows: [
          { field: 'Description', required: true, description: 'A description of the product or service being billed.', example: 'Monthly consulting services — May 2026' },
          { field: 'Quantity', required: true, description: 'The number of units.', example: '10' },
          { field: 'Unit Price', required: true, description: 'The price per unit.', example: '£100.00' },
          { field: 'Tax Rate', required: false, description: 'The applicable tax rate (VAT, GST, etc.). Defaults to workspace default.', example: '20%' },
          { field: 'Discount', required: false, description: 'An optional discount percentage for this line item.', example: '10%' },
          { field: 'Total', required: false, description: 'Calculated automatically: (Quantity × Unit Price) − Discount + Tax.', example: '£1,080.00' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'You can add as many line items as needed. Use the Tab key to move between fields quickly when entering multiple line items.',
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'Once an invoice is marked as Sent, you cannot delete it — you can only void or credit it. Make sure everything is correct before changing the status from Draft.',
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/invoice-statuses', title: 'Invoice Statuses' },
          { slug: 'invoices-payments/record-payment', title: 'Record a Payment' },
          { slug: 'workflows/send-invoice', title: 'Create and Send an Invoice (Workflow)' },
        ],
      },
    ],
  },
  {
    slug: 'invoices-payments/invoice-statuses',
    title: 'Invoice Statuses',
    description: 'What each invoice status means and how invoices move between statuses.',
    category: 'Invoices & Payments',
    categorySlug: 'invoices-payments',
    keywords: ['invoice status', 'draft', 'sent', 'paid', 'overdue', 'void', 'partial'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Every invoice in Tetri Copilot has a status that tells you where it is in its lifecycle. Understanding statuses helps you track what needs action and what is complete.',
      },
      {
        type: 'fields',
        title: 'Invoice Status Definitions',
        rows: [
          { field: 'Draft', required: false, description: 'The invoice has been created but not yet sent to the customer. It can be freely edited or deleted.', example: '' },
          { field: 'Sent', required: false, description: 'The invoice has been sent to the customer and is awaiting payment. It cannot be deleted.', example: '' },
          { field: 'Partial', required: false, description: 'A payment has been recorded but does not cover the full invoice amount.', example: '' },
          { field: 'Paid', required: false, description: 'The invoice has been fully paid. No further action required.', example: '' },
          { field: 'Overdue', required: false, description: 'The due date has passed and the invoice is not yet fully paid.', example: '' },
          { field: 'Void', required: false, description: 'The invoice has been cancelled. It remains for audit purposes but is not counted in financial reports.', example: '' },
        ],
      },
      {
        type: 'text',
        title: 'How Statuses Change',
        content:
          'Draft invoices become Sent when you click "Send Invoice" or manually change the status. Sent invoices become Paid when you record a payment that covers the full amount. If the due date passes without full payment, the status changes automatically to Overdue. You can manually void an invoice at any time.',
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/record-payment', title: 'Record a Payment' },
          { slug: 'invoices-payments/invoices-overview', title: 'Invoices Overview' },
        ],
      },
    ],
  },
  {
    slug: 'invoices-payments/record-payment',
    title: 'Record a Payment',
    description: 'How to record a customer payment and allocate it to an invoice.',
    category: 'Invoices & Payments',
    categorySlug: 'invoices-payments',
    keywords: ['record payment', 'payment', 'paid', 'allocate payment', 'mark paid'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'When a customer pays an invoice, you record the payment in Tetri Copilot. This updates the invoice status and keeps your accounts receivable accurate. You can record a full payment or a partial payment.',
      },
      {
        type: 'steps',
        title: 'How to Record a Payment',
        items: [
          'Go to Revenue → Invoices.',
          'Find the invoice you want to mark as paid.',
          'Click the Actions menu on the invoice row.',
          'Select Record Payment.',
          'A dialog box opens.',
          'Enter the amount received.',
          'Select the payment method (bank transfer, cash, cheque, etc.).',
          'Enter the payment date.',
          'Optionally add a reference (e.g., bank transaction reference).',
          'Click Save Payment.',
          'The invoice status updates to Paid (if fully paid) or Partial (if a partial payment).',
        ],
      },
      {
        type: 'fields',
        title: 'Payment Fields',
        rows: [
          { field: 'Amount', required: true, description: 'The amount received from the customer. Can be the full invoice amount or a partial amount.', example: '£1,200.00' },
          { field: 'Payment Date', required: true, description: 'The date the payment was received.', example: '15 May 2026' },
          { field: 'Payment Method', required: false, description: 'How the customer paid.', example: 'Bank Transfer, Cash, Cheque, Card' },
          { field: 'Reference', required: false, description: 'An optional payment reference for your records (e.g., bank reference number).', example: 'TRF20260515001' },
          { field: 'Notes', required: false, description: 'Any additional notes about this payment.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'You can also record payments from Revenue → Payments. This is useful when you want to enter payments in bulk before allocating them to specific invoices.',
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/receivables', title: 'Receivables' },
          { slug: 'workflows/record-payment', title: 'Record a Customer Payment (Workflow)' },
        ],
      },
    ],
  },
  {
    slug: 'invoices-payments/receivables',
    title: 'Receivables',
    description: 'How to use the Receivables module to track money owed to your business.',
    category: 'Invoices & Payments',
    categorySlug: 'invoices-payments',
    keywords: ['receivables', 'ar', 'accounts receivable', 'outstanding', 'aging', 'owed'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Receivables page shows all outstanding amounts owed to your business. It includes an aging analysis that categorizes overdue invoices by how long they have been outstanding — helping you prioritize collections.',
      },
      {
        type: 'fields',
        title: 'Receivables Page Sections',
        rows: [
          { field: 'Summary Cards', required: false, description: 'Total outstanding, current (not yet due), and overdue amounts at a glance.', example: '' },
          { field: 'Aging Analysis', required: false, description: 'Breaks down overdue invoices into time buckets: 0–30 days, 31–60 days, 61–90 days, 90+ days.', example: '' },
          { field: 'Outstanding Invoices List', required: false, description: 'All unpaid invoices sorted by customer and due date.', example: '' },
          { field: 'Customer Balance Summary', required: false, description: 'The total outstanding balance per customer.', example: 'ABC Trading: £2,400 overdue' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'Use the Collections module (Revenue → Collections) to log follow-up actions when chasing overdue payments.',
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/collections', title: 'Collections' },
          { slug: 'invoices-payments/statements', title: 'Statements' },
        ],
      },
    ],
  },
  {
    slug: 'invoices-payments/statements',
    title: 'Statements',
    description: 'How to generate and send customer account statements.',
    category: 'Invoices & Payments',
    categorySlug: 'invoices-payments',
    keywords: ['statements', 'account statement', 'customer statement', 'balance'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'A statement is a summary document sent to a customer showing all their invoices, payments, and outstanding balance over a selected period. Sending regular statements is good practice for maintaining clear financial relationships.',
      },
      {
        type: 'steps',
        title: 'How to Generate a Statement',
        items: [
          'Go to Revenue → Statements.',
          'Select a customer from the list.',
          'Choose the date range for the statement.',
          'Click Generate Statement.',
          'Review the statement — it shows all invoices, payments, and the closing balance.',
          'Click Download PDF to save it, or Send to email it directly to the customer.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/receivables', title: 'Receivables' },
          { slug: 'invoices-payments/record-payment', title: 'Record a Payment' },
        ],
      },
    ],
  },
  {
    slug: 'invoices-payments/collections',
    title: 'Collections',
    description: 'How to use the Collections module to manage overdue invoice follow-ups.',
    category: 'Invoices & Payments',
    categorySlug: 'invoices-payments',
    keywords: ['collections', 'overdue', 'follow up', 'chase payment', 'debt'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Collections is a workflow tool for following up on overdue invoices. You can log contact attempts, set follow-up reminders, and track the outcome of your collection efforts.',
      },
      {
        type: 'fields',
        title: 'Collection Record Fields',
        rows: [
          { field: 'Customer', required: true, description: 'The customer with the overdue invoice.', example: 'ABC Trading Ltd' },
          { field: 'Invoice', required: true, description: 'The specific invoice being followed up.', example: 'INV-0042' },
          { field: 'Contact Date', required: true, description: 'The date you contacted the customer.', example: '20 May 2026' },
          { field: 'Contact Method', required: false, description: 'How you contacted them (phone, email, letter).', example: 'Email' },
          { field: 'Notes', required: false, description: 'What was discussed or any commitments made.', example: 'Customer promised payment by 28 May' },
          { field: 'Follow-up Date', required: false, description: 'When to follow up again if not resolved.', example: '28 May 2026' },
        ],
      },
    ],
  },
]
