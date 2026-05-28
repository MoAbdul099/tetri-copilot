export const articles = [
  {
    slug: 'customers/overview',
    title: 'Customers Overview',
    description: 'How the Customers module works in Tetri Copilot.',
    category: 'Customers',
    categorySlug: 'customers',
    keywords: ['customers', 'clients', 'contacts', 'overview'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Customers page is your central database of all the businesses and individuals you invoice. Every invoice you create is linked to a customer. Keeping customer records accurate ensures your invoices, statements, and collections are handled correctly.',
      },
      {
        type: 'steps',
        title: 'How to Open the Customers Page',
        items: [
          'Sign in to Tetri Copilot.',
          'In the left sidebar, expand the Revenue group.',
          'Click Customers.',
          'The Customers list page opens, showing all your customers.',
        ],
      },
      {
        type: 'fields',
        title: 'Customers Page Sections',
        rows: [
          { field: 'Search Bar', required: false, description: 'Search customers by name, email, or reference number.', example: '' },
          { field: 'Filters', required: false, description: 'Filter customers by status (Active, Inactive) or by other criteria.', example: '' },
          { field: 'Customers Table', required: false, description: 'A table showing all customers with their name, email, phone, outstanding balance, and status.', example: '' },
          { field: 'Add Customer Button', required: false, description: 'Opens the Add Customer form to create a new customer record.', example: '' },
          { field: 'Actions Menu', required: false, description: 'For each customer row, use the actions menu to view, edit, or delete the record.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'customers/add-customer', title: 'Add a Customer' },
          { slug: 'customers/customer-details', title: 'View Customer Details' },
          { slug: 'workflows/first-customer', title: 'Create Your First Customer' },
        ],
      },
    ],
  },
  {
    slug: 'customers/add-customer',
    title: 'Add a Customer',
    description: 'How to create a new customer record in Tetri Copilot.',
    category: 'Customers',
    categorySlug: 'customers',
    keywords: ['add customer', 'create customer', 'new customer', 'client', 'contact'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Adding a customer takes about 1 minute. You need at least a customer name to create a record. All other fields are optional but recommended for complete records and professional invoices.',
      },
      {
        type: 'steps',
        title: 'How to Add a Customer',
        items: [
          'Go to Revenue → Customers in the sidebar.',
          'Click the Add Customer button (top right).',
          'Fill in the customer details (see field descriptions below).',
          'Click Save to create the customer record.',
          'The customer now appears in your customers list.',
        ],
      },
      {
        type: 'fields',
        title: 'Customer Form Fields',
        rows: [
          { field: 'Customer Name', required: true, description: 'The name of the business or individual. Appears on all invoices and statements.', example: 'ABC Trading LLC' },
          { field: 'Email', required: false, description: 'The customer\'s primary email address. Used for invoice delivery and communications.', example: 'finance@abctrading.com' },
          { field: 'Phone', required: false, description: 'The customer\'s phone number.', example: '+44 7911 000000' },
          { field: 'Company / Organisation', required: false, description: 'If different from the customer name, the legal company name.', example: 'ABC Trading Limited' },
          { field: 'Address', required: false, description: 'The customer\'s billing or mailing address. Printed on invoices.', example: '10 Commerce Road, London, EC1A 1BB' },
          { field: 'Tax / VAT Number', required: false, description: 'The customer\'s tax registration number, if applicable.', example: 'GB987654321' },
          { field: 'Currency', required: false, description: 'The currency for this customer\'s invoices. Defaults to your workspace currency.', example: 'GBP' },
          { field: 'Payment Terms', required: false, description: 'Default payment terms for invoices to this customer. Overrides the workspace default for this customer only.', example: 'Net 30' },
          { field: 'Notes', required: false, description: 'Internal notes about this customer. Not visible to the customer.', example: 'Preferred contact: Sarah in Finance' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'Always add an email address. It is used when sending invoices directly from Tetri Copilot and for automated payment reminder notifications.',
      },
      {
        type: 'related',
        links: [
          { slug: 'customers/edit-customer', title: 'Edit Customer' },
          { slug: 'customers/customer-details', title: 'View Customer Details' },
          { slug: 'invoices-payments/create-invoice', title: 'Create an Invoice' },
        ],
      },
    ],
  },
  {
    slug: 'customers/edit-customer',
    title: 'Edit Customer',
    description: 'How to update an existing customer record.',
    category: 'Customers',
    categorySlug: 'customers',
    keywords: ['edit customer', 'update customer', 'change customer details'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'You can update a customer\'s details at any time. Changes take effect immediately but do not retroactively update invoices that have already been created.',
      },
      {
        type: 'steps',
        title: 'How to Edit a Customer',
        items: [
          'Go to Revenue → Customers.',
          'Find the customer in the list.',
          'Click the Actions menu (three dots) on the customer row.',
          'Select Edit.',
          'Update the fields as needed.',
          'Click Save to apply the changes.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'Editing a customer\'s name or address will not update invoices that were already created. If you need the updated address on a new invoice, make sure to edit the customer before creating the invoice.',
      },
    ],
  },
  {
    slug: 'customers/customer-details',
    title: 'View Customer Details',
    description: 'What you can see on the Customer Details page and how to use it.',
    category: 'Customers',
    categorySlug: 'customers',
    keywords: ['customer details', 'view customer', 'customer page', 'customer history'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Customer Details page gives you a full view of a single customer — their contact information, invoice history, payment history, outstanding balance, and any attached documents.',
      },
      {
        type: 'steps',
        title: 'How to Open Customer Details',
        items: [
          'Go to Revenue → Customers.',
          'Click on a customer\'s name in the list.',
          'The Customer Details page opens.',
        ],
      },
      {
        type: 'fields',
        title: 'Customer Details Sections',
        rows: [
          { field: 'Profile', required: false, description: 'Name, email, phone, address, and other contact details.', example: '' },
          { field: 'Invoices Tab', required: false, description: 'All invoices created for this customer, with their status and amount.', example: '' },
          { field: 'Payments Tab', required: false, description: 'All payments recorded from this customer.', example: '' },
          { field: 'Outstanding Balance', required: false, description: 'The total amount currently owed by this customer.', example: '£1,250 outstanding' },
          { field: 'Statements', required: false, description: 'Generate and view account statements for this customer.', example: '' },
          { field: 'Notes', required: false, description: 'Internal notes about this customer.', example: '' },
        ],
      },
    ],
  },
  {
    slug: 'customers/search-filter',
    title: 'Search and Filter Customers',
    description: 'How to find customers quickly using search and filters.',
    category: 'Customers',
    categorySlug: 'customers',
    keywords: ['search customers', 'filter customers', 'find customer'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'As your customer list grows, use the search and filter tools to quickly find the customer you need.',
      },
      {
        type: 'fields',
        title: 'Search and Filter Options',
        rows: [
          { field: 'Search Bar', required: false, description: 'Type any part of a customer name, email, or reference to instantly filter the list.', example: 'Type "ABC" to find "ABC Trading"' },
          { field: 'Status Filter', required: false, description: 'Filter by Active or Inactive customers.', example: '' },
          { field: 'Sort', required: false, description: 'Sort the customer list by name, balance, or date added.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'Use the search bar for the fastest results. It searches across names, emails, and company names simultaneously.',
      },
    ],
  },
]
