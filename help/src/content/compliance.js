export const articles = [
  {
    slug: 'compliance/overview',
    title: 'Compliance Overview',
    description: 'How the Compliance module helps you track regulatory obligations and deadlines.',
    category: 'Compliance',
    categorySlug: 'compliance',
    keywords: ['compliance', 'regulatory', 'obligations', 'deadlines', 'overview'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Compliance module helps you track all the regulatory filings, tax deadlines, and statutory obligations your business must meet. It uses a template-based system — you configure what compliance obligations apply to your business, and Tetri Copilot creates recurring occurrences with due dates and reminders automatically.',
      },
      {
        type: 'text',
        title: 'How Compliance Tracking Works',
        content:
          'Each compliance obligation starts as a Template (e.g., "Quarterly VAT Return"). From the template, the system generates Occurrences — individual instances of that obligation for specific periods (e.g., "Q1 2026 VAT Return due 31 May 2026"). You mark each occurrence as complete when you have filed or fulfilled it.',
      },
      {
        type: 'steps',
        title: 'Getting Started with Compliance',
        items: [
          'Go to Compliance → Overview in the sidebar.',
          'Review the compliance packs available for your jurisdiction.',
          'Apply the relevant packs — they pre-load templates for common obligations (VAT, PAYE, Corporation Tax, etc.).',
          'Review and customize templates as needed.',
          'Check the Calendar to see your upcoming deadlines.',
          'Mark occurrences as complete as you fulfill each obligation.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'compliance/templates', title: 'Compliance Templates' },
          { slug: 'compliance/calendar', title: 'Compliance Calendar' },
          { slug: 'compliance/occurrences', title: 'Occurrences' },
        ],
      },
    ],
  },
  {
    slug: 'compliance/templates',
    title: 'Compliance Templates',
    description: 'How to create and manage compliance obligation templates.',
    category: 'Compliance',
    categorySlug: 'compliance',
    keywords: ['compliance templates', 'templates', 'obligations', 'vat', 'tax return', 'paye'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'A Compliance Template defines a recurring regulatory obligation. It specifies what the obligation is, who is responsible, how often it recurs, and when it is due. Templates generate Occurrences automatically.',
      },
      {
        type: 'fields',
        title: 'Template Fields',
        rows: [
          { field: 'Name', required: true, description: 'A clear name for the compliance obligation.', example: 'Quarterly VAT Return' },
          { field: 'Category', required: true, description: 'The type of compliance (Tax, Employment, Regulatory, etc.).', example: 'Tax' },
          { field: 'Jurisdiction', required: false, description: 'The regulatory jurisdiction this obligation applies to.', example: 'United Kingdom — HMRC' },
          { field: 'Authority', required: false, description: 'The regulatory body this is reported to.', example: 'HMRC' },
          { field: 'Frequency', required: true, description: 'How often this obligation recurs.', example: 'Quarterly' },
          { field: 'Due Day Offset', required: false, description: 'How many days after the period end the filing is due.', example: '37 days (standard VAT return)' },
          { field: 'Responsible Person', required: false, description: 'The team member responsible for completing this obligation.', example: 'Finance Manager' },
          { field: 'Description', required: false, description: 'Additional details about the obligation.', example: 'Submit VAT return and payment via HMRC online portal.' },
        ],
      },
      {
        type: 'text',
        title: 'Compliance Packs',
        content:
          'Rather than creating templates from scratch, you can apply a Compliance Pack. Packs are pre-built collections of templates for specific jurisdictions (e.g., UK SME Compliance Pack includes VAT returns, PAYE submissions, Corporation Tax, and more). Go to Compliance → Packs to browse and apply packs.',
      },
      {
        type: 'related',
        links: [
          { slug: 'compliance/occurrences', title: 'Occurrences' },
          { slug: 'compliance/calendar', title: 'Compliance Calendar' },
        ],
      },
    ],
  },
  {
    slug: 'compliance/calendar',
    title: 'Compliance Calendar',
    description: 'How to use the Compliance Calendar to see and manage upcoming deadlines.',
    category: 'Compliance',
    categorySlug: 'compliance',
    keywords: ['compliance calendar', 'deadlines', 'calendar', 'due dates', 'filing dates'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Compliance Calendar gives you a visual month-by-month view of all your upcoming compliance deadlines. Each item on the calendar represents an Occurrence — a specific filing or obligation due on that date.',
      },
      {
        type: 'steps',
        title: 'How to Use the Calendar',
        items: [
          'Go to Compliance → Calendar.',
          'The current month is shown by default.',
          'Upcoming deadlines appear as colored events on the calendar.',
          'Click any event to see its details — what it is, who is responsible, and its current status.',
          'Use the navigation arrows to move forward or backward between months.',
          'Switch between month view and list view using the view toggle.',
        ],
      },
      {
        type: 'fields',
        title: 'Calendar Event Colors',
        rows: [
          { field: 'Blue', required: false, description: 'Upcoming deadline — not yet due.', example: '' },
          { field: 'Orange', required: false, description: 'Due soon — within the next 7 days.', example: '' },
          { field: 'Red', required: false, description: 'Overdue — past the due date without being marked complete.', example: '' },
          { field: 'Green', required: false, description: 'Completed — the obligation has been fulfilled.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'Set up compliance reminders (Compliance → Reminders) to receive email or in-app notifications before each deadline. This prevents missed filings.',
      },
    ],
  },
  {
    slug: 'compliance/occurrences',
    title: 'Occurrences',
    description: 'How to manage individual compliance occurrences and mark them as complete.',
    category: 'Compliance',
    categorySlug: 'compliance',
    keywords: ['occurrences', 'compliance occurrence', 'filing', 'complete', 'mark complete'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'An Occurrence is a single instance of a compliance obligation — for example, "Q1 2026 VAT Return". Occurrences are generated automatically from your Templates on a rolling basis. You manage them by updating their status as you work through your obligations.',
      },
      {
        type: 'fields',
        title: 'Occurrence Statuses',
        rows: [
          { field: 'Upcoming', required: false, description: 'The deadline is in the future and no action has been taken yet.', example: '' },
          { field: 'In Progress', required: false, description: 'Work has started on this filing.', example: '' },
          { field: 'Submitted', required: false, description: 'The filing has been submitted to the relevant authority.', example: '' },
          { field: 'Completed', required: false, description: 'Fully completed — filed and any payment made.', example: '' },
          { field: 'Overdue', required: false, description: 'The due date has passed without completion.', example: '' },
          { field: 'Not Applicable', required: false, description: 'This occurrence does not apply for this period (e.g., nil return).', example: '' },
        ],
      },
      {
        type: 'steps',
        title: 'How to Mark an Occurrence as Complete',
        items: [
          'Go to Compliance → Occurrences.',
          'Find the occurrence in the list.',
          'Click on it to open the details.',
          'Click Mark as Complete.',
          'Enter the submission date and any reference number (e.g., HMRC submission reference).',
          'Click Save.',
          'The occurrence turns green in the calendar and list.',
        ],
      },
    ],
  },
  {
    slug: 'compliance/reminders',
    title: 'Reminders and Escalations',
    description: 'How to set up compliance reminders and escalation alerts.',
    category: 'Compliance',
    categorySlug: 'compliance',
    keywords: ['reminders', 'escalations', 'compliance reminders', 'notifications', 'alerts'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Reminders send automatic notifications to your team before compliance deadlines. Escalations are follow-up alerts sent if a reminder is ignored and the deadline approaches without the obligation being marked complete.',
      },
      {
        type: 'steps',
        title: 'How to Set Up a Reminder',
        items: [
          'Go to Compliance → Reminders in the sidebar.',
          'Click Add Reminder Profile or edit an existing one.',
          'Choose the compliance template this reminder applies to.',
          'Set the reminder timing (e.g., 30 days before, 7 days before, 1 day before).',
          'Select how the reminder is sent (email, in-app, or both).',
          'Choose who receives the reminder.',
          'Click Save.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'Escalation Profiles work the same way but are triggered only if the initial reminder was not acted upon. Use escalations to ensure critical deadlines are never missed.',
      },
    ],
  },
  {
    slug: 'compliance/reports',
    title: 'Compliance Reports',
    description: 'How to generate and review compliance reports in Tetri Copilot.',
    category: 'Compliance',
    categorySlug: 'compliance',
    keywords: ['compliance reports', 'reports', 'compliance history', 'audit'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Compliance Reports give you a historical view of your compliance performance — which obligations were completed on time, which were late, and which are currently outstanding. This is useful for audits and board reporting.',
      },
      {
        type: 'steps',
        title: 'How to Run a Compliance Report',
        items: [
          'Go to Compliance → Reports.',
          'Select the date range for the report.',
          'Filter by obligation category if needed.',
          'Click Generate Report.',
          'Review the summary and the detailed list of occurrences.',
          'Download as PDF or CSV for external use.',
        ],
      },
    ],
  },
]
