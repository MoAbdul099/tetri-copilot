export const articles = [
  {
    slug: 'billing/current-plan',
    title: 'Current Plan',
    description: 'How to view your current subscription plan and usage in Tetri Copilot.',
    category: 'Billing & Subscription',
    categorySlug: 'billing',
    keywords: ['billing', 'plan', 'subscription', 'current plan', 'usage'],
    roles: ['Owner'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Billing page shows your current subscription plan, usage statistics, and billing history. Only the Workspace Owner can access billing settings.',
      },
      {
        type: 'steps',
        title: 'How to View Your Plan',
        items: [
          'Expand the Workspace group in the sidebar.',
          'Click Billing.',
          'Your current plan, renewal date, and usage are shown.',
        ],
      },
      {
        type: 'fields',
        title: 'Billing Page Sections',
        rows: [
          { field: 'Current Plan', required: false, description: 'The name of your active subscription plan and its features.', example: 'Growth Plan — £49/month' },
          { field: 'Renewal Date', required: false, description: 'When your current billing period ends and renews.', example: '01 June 2026' },
          { field: 'Usage Summary', required: false, description: 'How many users, invoices, and storage you have used out of your plan limits.', example: '3 of 10 users' },
          { field: 'Payment Method', required: false, description: 'The card or payment method on file for automatic billing.', example: 'Visa ending 4242' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'Billing is managed securely through Stripe. Tetri Copilot does not store your payment card details — they are held by Stripe.',
      },
      {
        type: 'related',
        links: [
          { slug: 'billing/billing-history', title: 'Billing History' },
          { slug: 'billing/upgrade', title: 'Upgrade or Change Plan' },
        ],
      },
    ],
  },
  {
    slug: 'billing/billing-history',
    title: 'Billing History',
    description: 'How to view and download past invoices and payment history.',
    category: 'Billing & Subscription',
    categorySlug: 'billing',
    keywords: ['billing history', 'invoices', 'receipts', 'payment history'],
    roles: ['Owner'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Your billing history shows all past subscription charges and lets you download receipts for your accounting records.',
      },
      {
        type: 'steps',
        title: 'How to Access Billing History',
        items: [
          'Go to Workspace → Billing.',
          'Scroll down to the Billing History section.',
          'Each past payment is listed with the date, amount, and status.',
          'Click Download Receipt on any entry to get a PDF receipt.',
        ],
      },
    ],
  },
  {
    slug: 'billing/upgrade',
    title: 'Upgrade or Change Plan',
    description: 'How to upgrade, downgrade, or cancel your Tetri Copilot subscription.',
    category: 'Billing & Subscription',
    categorySlug: 'billing',
    keywords: ['upgrade', 'downgrade', 'change plan', 'cancel subscription', 'plan change'],
    roles: ['Owner'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'You can change your subscription plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.',
      },
      {
        type: 'steps',
        title: 'How to Change Your Plan',
        items: [
          'Go to Workspace → Billing.',
          'Click Change Plan.',
          'Browse the available plans and their features.',
          'Click Select Plan on the plan you want.',
          'Confirm the change.',
          'For upgrades, you are charged the prorated difference immediately.',
          'For downgrades, your current plan continues until the renewal date.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content: 'If you downgrade to a plan with lower limits (e.g., fewer users) and you are currently over those limits, you will need to remove members or data before the downgrade takes effect.',
      },
    ],
  },
]
