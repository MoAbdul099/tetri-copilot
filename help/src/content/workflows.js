export const articles = [
  {
    slug: 'workflows/first-customer',
    title: 'Create Your First Customer',
    description: 'A complete step-by-step workflow to add your first customer in Tetri Copilot.',
    category: 'Common Workflows',
    categorySlug: 'workflows',
    keywords: ['first customer', 'create customer', 'workflow', 'getting started', 'add customer'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'This workflow walks you through adding your first customer from start to finish. It takes about 2 minutes. You will need the customer\'s business name, email address, and billing address.',
      },
      {
        type: 'steps',
        title: 'Step-by-Step: Add Your First Customer',
        items: [
          'Sign in to Tetri Copilot.',
          'In the sidebar, expand Revenue and click Customers.',
          'Click the Add Customer button in the top-right corner.',
          'In the Customer Name field, enter the customer\'s name (e.g., "ABC Trading Ltd").',
          'Enter their email address — this is used for invoice delivery.',
          'Enter their billing address.',
          'If they have a VAT number, add it in the Tax Number field.',
          'Set their default Payment Terms if different from your workspace default.',
          'Click Save.',
          'You are taken to the customer detail page. Your first customer is now ready.',
          'Next step: Create an invoice for this customer.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'Add an accurate email address. Tetri Copilot will use it to send invoices and payment reminders automatically.',
      },
      {
        type: 'related',
        links: [
          { slug: 'customers/add-customer', title: 'Add a Customer (detailed guide)' },
          { slug: 'workflows/send-invoice', title: 'Create and Send an Invoice' },
        ],
      },
    ],
  },
  {
    slug: 'workflows/send-invoice',
    title: 'Create and Send an Invoice',
    description: 'A complete workflow to create and send your first invoice in Tetri Copilot.',
    category: 'Common Workflows',
    categorySlug: 'workflows',
    keywords: ['create invoice', 'send invoice', 'workflow', 'invoice guide', 'billing'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'This workflow takes you through creating a complete invoice with line items and sending it to your customer. Estimated time: 3–5 minutes.',
      },
      {
        type: 'steps',
        title: 'Step-by-Step: Create and Send Invoice',
        items: [
          'Go to Revenue → Invoices.',
          'Click Create Invoice.',
          'Select the customer from the dropdown. If they don\'t exist, add them first.',
          'The Invoice Date defaults to today — change it if needed.',
          'The Due Date is calculated from your payment terms — override if needed.',
          'Click Add Line Item.',
          'Enter a description of the service or product (e.g., "Web design services — May 2026").',
          'Enter the quantity (e.g., 1) and unit price (e.g., 2000).',
          'If VAT applies, ensure the correct tax rate is selected.',
          'Add more line items if needed using the Add Line Item button.',
          'Review the totals at the bottom — subtotal, tax, and grand total.',
          'Optionally add a note to the customer (e.g., bank details for payment).',
          'Click Save and Send to send immediately, or Save as Draft to review first.',
          'If sent, the customer receives an email with the invoice PDF attached.',
          'The invoice status changes to Sent.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'Add your bank transfer details in the invoice Notes field so customers know exactly how to pay you.',
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/create-invoice', title: 'Create an Invoice (detailed guide)' },
          { slug: 'workflows/record-payment', title: 'Record a Customer Payment' },
        ],
      },
    ],
  },
  {
    slug: 'workflows/record-payment',
    title: 'Record a Customer Payment',
    description: 'How to record a payment you have received against an invoice.',
    category: 'Common Workflows',
    categorySlug: 'workflows',
    keywords: ['record payment', 'mark paid', 'payment received', 'workflow'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'When a customer pays an invoice, follow this workflow to record it in Tetri Copilot. This keeps your accounts receivable accurate and updates your financial dashboard.',
      },
      {
        type: 'steps',
        title: 'Step-by-Step: Record a Payment',
        items: [
          'Go to Revenue → Invoices.',
          'Find the invoice that was paid.',
          'Click the Actions menu (three dots) on the invoice row.',
          'Select Record Payment.',
          'Enter the amount received.',
          'Set the payment date (the date the money arrived).',
          'Select the payment method (bank transfer, cash, etc.).',
          'Optionally add a reference number from your bank statement.',
          'Click Save Payment.',
          'The invoice status updates to Paid (full payment) or Partial (partial payment).',
          'The customer balance and your dashboard metrics update automatically.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'invoices-payments/record-payment', title: 'Record a Payment (detailed guide)' },
          { slug: 'invoices-payments/receivables', title: 'Receivables' },
        ],
      },
    ],
  },
  {
    slug: 'workflows/add-expense',
    title: 'Add and Categorize an Expense',
    description: 'Complete workflow to add an expense with AI categorization.',
    category: 'Common Workflows',
    categorySlug: 'workflows',
    keywords: ['add expense', 'record expense', 'categorize expense', 'workflow'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'This workflow shows how to add an expense record with AI-assisted categorization, upload a receipt, and submit for approval if required.',
      },
      {
        type: 'steps',
        title: 'Step-by-Step: Add an Expense',
        items: [
          'Go to Expenses → Expenses.',
          'Click Add Expense.',
          'Enter the date of the expense.',
          'Enter the amount and select the currency.',
          'In the Supplier field, type the vendor name (e.g., "Staples").',
          'The AI will suggest a category — review the suggestion.',
          'If the suggestion looks right, click Accept. Otherwise, choose the correct category manually.',
          'Add a description (e.g., "Office printer paper and toner").',
          'Click the Upload Receipt button to attach a photo or PDF of the receipt.',
          'Add any notes if needed.',
          'Click Save.',
          'If approval is required, the expense is submitted automatically and the approver is notified.',
          'If no approval is needed, the expense is recorded immediately.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'Upload receipts at the time of adding the expense while you still have them. This makes audits and reimbursements much smoother.',
      },
      {
        type: 'related',
        links: [
          { slug: 'expenses/add-expense', title: 'Add an Expense (detailed guide)' },
          { slug: 'ai-assistant/expense-categorization', title: 'AI Expense Categorization' },
        ],
      },
    ],
  },
  {
    slug: 'workflows/compliance-review',
    title: 'Review Compliance Obligations',
    description: 'How to review and update your compliance status in Tetri Copilot.',
    category: 'Common Workflows',
    categorySlug: 'workflows',
    keywords: ['compliance review', 'compliance check', 'compliance workflow', 'deadlines review'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'This workflow shows you how to quickly review your compliance status, identify any upcoming or overdue obligations, and mark completed items.',
      },
      {
        type: 'steps',
        title: 'Step-by-Step: Compliance Review',
        items: [
          'Go to Compliance → Overview.',
          'Review the compliance health summary — look for any red (overdue) or orange (due soon) alerts.',
          'Click Compliance → Calendar to see the month view.',
          'Identify any upcoming deadlines in the next 30 days.',
          'For each obligation you have completed, go to Compliance → Occurrences.',
          'Find the occurrence and click on it.',
          'Click Mark as Complete.',
          'Enter the submission date and any reference numbers.',
          'Click Save.',
          'Repeat for all completed items.',
          'Review the updated calendar — completed items turn green.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'compliance/calendar', title: 'Compliance Calendar' },
          { slug: 'compliance/occurrences', title: 'Occurrences' },
        ],
      },
    ],
  },
  {
    slug: 'workflows/invite-member',
    title: 'Invite a Team Member',
    description: 'How to invite a colleague to your Tetri Copilot workspace.',
    category: 'Common Workflows',
    categorySlug: 'workflows',
    keywords: ['invite member', 'add user', 'team member', 'onboard colleague'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'This workflow walks you through inviting a new team member to your workspace. The invitation process takes less than a minute.',
      },
      {
        type: 'steps',
        title: 'Step-by-Step: Invite a Team Member',
        items: [
          'Go to Settings in the sidebar (or expand Workspace → Members).',
          'Click Members.',
          'Click Invite Member.',
          'Enter the colleague\'s work email address.',
          'Select the appropriate role — Admin for managers, User for regular team members, Viewer for read-only access.',
          'Click Send Invitation.',
          'Your colleague receives an email invitation.',
          'They click the link in the email, create a password if new to Tetri Copilot, and are added to your workspace.',
          'You will see them appear in the Members list once they accept.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'If the invitation is not received within 5 minutes, ask the colleague to check their spam folder. You can also resend the invitation from the Members page.',
      },
      {
        type: 'related',
        links: [
          { slug: 'workspace/members', title: 'Members and Access' },
          { slug: 'getting-started/user-roles', title: 'User Roles and Access Levels' },
        ],
      },
    ],
  },
  {
    slug: 'workflows/use-ai-assistant',
    title: 'Use the AI Assistant',
    description: 'A practical guide to getting the most out of the Tetri Copilot AI Assistant.',
    category: 'Common Workflows',
    categorySlug: 'workflows',
    keywords: ['ai assistant', 'use ai', 'ai workflow', 'ask ai', 'ai guide'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The AI Assistant is most useful when you treat it like a knowledgeable colleague — give it clear context and specific questions. This workflow shows you some practical ways to use it.',
      },
      {
        type: 'steps',
        title: 'Using the AI Assistant — Practical Examples',
        items: [
          'Click the floating AI button (bottom-right) or go to AI Assistant in the sidebar.',
          'Try asking: "What are my 3 most overdue invoices?" — the AI will list them with amounts and how long they have been overdue.',
          'Try asking: "Summarize my expenses for April 2026" — the AI gives you a quick breakdown by category.',
          'Ask: "What compliance deadlines do I have in the next 30 days?" — the AI checks your calendar and lists them.',
          'Ask: "Who are my top 5 customers by revenue this year?" — useful for business review.',
          'After reviewing an AI response, click the thumbs up/down feedback button to help improve accuracy.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'The AI Assistant remembers the context of the current conversation. You can ask follow-up questions like "and what about last month?" after an initial response.',
      },
      {
        type: 'related',
        links: [
          { slug: 'ai-assistant/ai-chat', title: 'AI Chat Workspace' },
          { slug: 'ai-assistant/safety', title: 'AI Safety and Best Practices' },
        ],
      },
    ],
  },
]
