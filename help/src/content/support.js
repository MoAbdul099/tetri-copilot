export const articles = [
  {
    slug: 'support/contact',
    title: 'Contact Support',
    description: 'How to get in touch with the Tetri Copilot support team.',
    category: 'Support',
    categorySlug: 'support',
    keywords: ['contact support', 'help', 'support', 'get help', 'email support'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'If you cannot find the answer in this Help Center, our support team is here to help. We aim to respond to all support requests promptly.',
      },
      {
        type: 'fields',
        title: 'Support Contact Options',
        rows: [
          { field: 'Email Support', required: false, description: 'Send your question or issue to our support team by email.', example: 'support@tetrisuite.com' },
          { field: 'Help Center', required: false, description: 'This Help Center contains guides for most common questions. Use the search at the top to find answers quickly.', example: '' },
          { field: 'In-App Help', required: false, description: 'Click any help link within the app to open the relevant Help Center article.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'Before contacting Support, search this Help Center for your question. Most common issues are answered here and you will get a faster resolution.',
      },
      {
        type: 'related',
        links: [
          { slug: 'support/report-issue', title: 'How to Report an Issue' },
          { slug: 'support/what-to-include', title: 'What Information to Provide' },
        ],
      },
    ],
  },
  {
    slug: 'support/report-issue',
    title: 'How to Report an Issue',
    description: 'How to effectively report a bug or problem to the Tetri Copilot team.',
    category: 'Support',
    categorySlug: 'support',
    keywords: ['report issue', 'bug report', 'report bug', 'problem report'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'A good bug report helps us understand and resolve your issue faster. Please include as much relevant detail as possible.',
      },
      {
        type: 'steps',
        title: 'How to Report an Issue',
        items: [
          'Note down exactly what you were doing when the issue occurred.',
          'Take a screenshot of the error or unexpected behavior.',
          'Note your browser name and version (e.g., Chrome 124).',
          'Note the date and time the issue occurred.',
          'Email support@tetrisuite.com with this information.',
          'Include your workspace name and email address so we can look up your account.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'support/what-to-include', title: 'What Information to Provide' },
          { slug: 'support/contact', title: 'Contact Support' },
        ],
      },
    ],
  },
  {
    slug: 'support/what-to-include',
    title: 'What Information to Provide',
    description: 'A checklist of information to include when contacting Tetri Copilot support.',
    category: 'Support',
    categorySlug: 'support',
    keywords: ['support information', 'bug report details', 'what to include', 'support checklist'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content: 'When you contact Support, including the right information from the start saves time and helps us resolve your issue in the first response.',
      },
      {
        type: 'fields',
        title: 'Recommended Information to Include',
        rows: [
          { field: 'Your email address', required: true, description: 'The email address linked to your Tetri Copilot account.', example: 'john@mycompany.com' },
          { field: 'Workspace name', required: true, description: 'The name of your workspace (shown in the top bar).', example: 'Acme Trading Ltd' },
          { field: 'Page or feature affected', required: true, description: 'Which page or feature has the issue.', example: 'Invoices → Create Invoice' },
          { field: 'Steps to reproduce', required: true, description: 'What you did before the problem occurred.', example: '1. Opened Create Invoice. 2. Filled in customer. 3. Clicked Save — got error.' },
          { field: 'Error message', required: false, description: 'The exact text of any error message shown on screen.', example: '"Something went wrong. Please try again."' },
          { field: 'Screenshot', required: false, description: 'A screenshot showing the issue.', example: '' },
          { field: 'Browser and OS', required: false, description: 'Which browser and operating system you are using.', example: 'Chrome 124 on Windows 11' },
          { field: 'Date and time', required: false, description: 'When the issue occurred, including your timezone.', example: '29 May 2026 at 14:30 UTC' },
        ],
      },
    ],
  },
  {
    slug: 'support/response-times',
    title: 'Support Response Expectations',
    description: 'What to expect in terms of response times from the Tetri Copilot support team.',
    category: 'Support',
    categorySlug: 'support',
    keywords: ['response times', 'support sla', 'how long', 'support expectations'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'We aim to respond to all support requests as quickly as possible. Response times may vary based on the type of issue and your subscription plan.',
      },
      {
        type: 'fields',
        title: 'Typical Response Times',
        rows: [
          { field: 'General questions', required: false, description: 'We aim to respond within 1 business day.', example: '' },
          { field: 'Technical issues', required: false, description: 'We aim to respond within 4–8 business hours.', example: '' },
          { field: 'Critical issues (data loss, cannot access account)', required: false, description: 'We prioritize these and aim to respond within 2 hours during business hours.', example: '' },
          { field: 'Security issues', required: false, description: 'Email security@tetrisuite.com for urgent security concerns. These are treated as highest priority.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'Business hours are Monday–Friday, 9:00 AM – 6:00 PM UTC. Response times may be longer outside business hours and during public holidays.',
      },
    ],
  },
]
