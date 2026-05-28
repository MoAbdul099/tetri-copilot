export const articles = [
  {
    slug: 'ai-assistant/overview',
    title: 'AI Assistant Overview',
    description: 'What the AI Assistant is and how it helps you work faster in Tetri Copilot.',
    category: 'AI Assistant & AI Features',
    categorySlug: 'ai-assistant',
    keywords: ['ai assistant', 'ai', 'artificial intelligence', 'assistant', 'chat', 'overview'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The AI Assistant is your intelligent workspace companion. It understands your business data and can answer questions, help you find information, and take actions on your behalf. It combines the knowledge of your workspace with AI reasoning to give you practical, context-aware answers.',
      },
      {
        type: 'text',
        title: 'What the AI Assistant Can Do',
        content:
          'The AI Assistant can answer questions like "What are my 5 largest outstanding invoices?" or "How much did I spend on travel last quarter?". It can also help with compliance questions, generate document drafts, and suggest actions based on your data patterns.',
      },
      {
        type: 'fields',
        title: 'AI Features in Tetri Copilot',
        rows: [
          { field: 'AI Chat Assistant', required: false, description: 'A conversational chat interface where you can ask questions about your workspace data.', example: '' },
          { field: 'AI Expense Categorization', required: false, description: 'Automatically suggests the right category for expenses based on the supplier and description.', example: '' },
          { field: 'AI Document Generation', required: false, description: 'Generate professional business documents from templates using AI.', example: '' },
          { field: 'AI Compliance Assistant', required: false, description: 'Ask compliance questions and get guidance on regulatory obligations.', example: '' },
          { field: 'AI Actions', required: false, description: 'AI can suggest and perform actions in your workspace (subject to approval governance).', example: '' },
          { field: 'AI Insights', required: false, description: 'AI-generated observations about your business data surfaced on the Dashboard and Analytics pages.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'The AI Assistant operates within your workspace only. It cannot access data from other workspaces or external systems. All AI interactions are logged for audit purposes.',
      },
      {
        type: 'related',
        links: [
          { slug: 'ai-assistant/ai-chat', title: 'AI Chat Workspace' },
          { slug: 'ai-assistant/expense-categorization', title: 'AI Expense Categorization' },
          { slug: 'ai-assistant/safety', title: 'AI Safety and Best Practices' },
        ],
      },
    ],
  },
  {
    slug: 'ai-assistant/ai-chat',
    title: 'AI Chat Workspace',
    description: 'How to use the AI Chat to ask questions about your business data.',
    category: 'AI Assistant & AI Features',
    categorySlug: 'ai-assistant',
    keywords: ['ai chat', 'chat workspace', 'ask ai', 'natural language', 'ai questions'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The AI Chat lets you have a natural language conversation with Tetri Copilot. Ask questions about your data just as you would ask a colleague, and get direct, useful answers.',
      },
      {
        type: 'steps',
        title: 'How to Use AI Chat',
        items: [
          'Click AI Assistant in the sidebar (top navigation area).',
          'Or click the floating AI button in the bottom-right corner of any page.',
          'The AI Chat panel opens.',
          'Type your question in plain English.',
          'Press Enter or click Send.',
          'The AI responds with an answer, often including relevant data from your workspace.',
        ],
      },
      {
        type: 'fields',
        title: 'Example Questions You Can Ask',
        rows: [
          { field: 'Invoice Questions', required: false, description: 'Questions about your invoices and payments.', example: '"What invoices are overdue?" / "How much did ABC Trading pay last month?"' },
          { field: 'Expense Questions', required: false, description: 'Questions about your business spending.', example: '"What did I spend on software last quarter?" / "Show my top 5 expense categories."' },
          { field: 'Compliance Questions', required: false, description: 'Questions about upcoming obligations.', example: '"When is my next VAT return due?" / "What compliance items are overdue?"' },
          { field: 'Customer Questions', required: false, description: 'Questions about customers and revenue.', example: '"Who is my highest-value customer?" / "Which customers haven\'t paid in 60 days?"' },
          { field: 'Summary Questions', required: false, description: 'High-level business performance questions.', example: '"How is my business performing this month?" / "Give me a revenue summary for Q1."' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'The more specific your question, the better the answer. Instead of "show me invoices", try "show me unpaid invoices over £1,000 from the last 3 months".',
      },
      {
        type: 'related',
        links: [
          { slug: 'ai-assistant/safety', title: 'AI Safety and Best Practices' },
          { slug: 'workflows/use-ai-assistant', title: 'Use the AI Assistant (Workflow)' },
        ],
      },
    ],
  },
  {
    slug: 'ai-assistant/expense-categorization',
    title: 'AI Expense Categorization',
    description: 'How AI automatically categorizes your expenses in Tetri Copilot.',
    category: 'AI Assistant & AI Features',
    categorySlug: 'ai-assistant',
    keywords: ['expense categorization', 'ai categories', 'auto categorize', 'ml', 'smart categories'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'When you add an expense, the AI analyzes the supplier name and description to suggest the most likely category. This saves time on manual categorization and improves consistency across your expense records.',
      },
      {
        type: 'text',
        title: 'How Categorization Works',
        content:
          'As you type the supplier name or description in the expense form, the AI processes this information and suggests a category with a confidence score. Categories with high confidence (above 80%) are highlighted in green. You can accept the suggestion with one click or choose a different category manually.',
      },
      {
        type: 'fields',
        title: 'Confidence Levels',
        rows: [
          { field: 'High Confidence (80%+)', required: false, description: 'The AI is very confident in the suggested category. Accept it unless you know it is wrong.', example: 'Supplier: "British Gas" → Category: Utilities (95%)' },
          { field: 'Medium Confidence (50–79%)', required: false, description: 'The AI has a reasonable suggestion but is not certain. Review before accepting.', example: '' },
          { field: 'Low Confidence (below 50%)', required: false, description: 'The AI is unsure. Select the category manually.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'The AI learns from your corrections. Every time you override a suggestion, the system improves its accuracy for similar expenses in the future.',
      },
    ],
  },
  {
    slug: 'ai-assistant/document-generation',
    title: 'AI Document Generation',
    description: 'How to generate business documents using AI in Tetri Copilot.',
    category: 'AI Assistant & AI Features',
    categorySlug: 'ai-assistant',
    keywords: ['document generation', 'ai documents', 'generate document', 'template', 'ai write'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The AI Document Generation feature helps you create professional business documents — proposals, contracts, letters, reports, and more — using AI. You provide key details and the AI generates a complete, well-structured document.',
      },
      {
        type: 'steps',
        title: 'How to Generate a Document',
        items: [
          'Go to Documents → AI Documents in the sidebar.',
          'Click New Document.',
          'Select a document type (proposal, letter, report, etc.).',
          'Fill in the key details requested (client name, purpose, key points).',
          'Click Generate.',
          'The AI creates a draft document.',
          'Review and edit the generated content.',
          'Click Download PDF or Save to store the document.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content: 'Always review AI-generated documents before sending them to clients. The AI provides a strong first draft but human review is essential for accuracy and tone.',
      },
    ],
  },
  {
    slug: 'ai-assistant/compliance-assistant',
    title: 'AI Compliance Assistant',
    description: 'How to use the AI Compliance Assistant for regulatory guidance.',
    category: 'AI Assistant & AI Features',
    categorySlug: 'ai-assistant',
    keywords: ['compliance assistant', 'ai compliance', 'regulatory guidance', 'compliance questions'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The AI Compliance Assistant is a specialized AI chat tool focused on compliance questions. It understands your compliance calendar, your jurisdiction, and your current compliance status, and can answer questions about what needs to be done and when.',
      },
      {
        type: 'steps',
        title: 'How to Use the Compliance Assistant',
        items: [
          'Go to Compliance → AI Assistant in the sidebar.',
          'Type your compliance question.',
          'The assistant considers your current compliance profile and obligations.',
          'You receive a clear, actionable answer.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'The AI Compliance Assistant provides general guidance based on your compliance profile. It is not a substitute for professional legal or tax advice. Always confirm important compliance decisions with a qualified advisor.',
      },
    ],
  },
  {
    slug: 'ai-assistant/ai-actions',
    title: 'AI Actions',
    description: 'How AI Actions work and how to manage them safely.',
    category: 'AI Assistant & AI Features',
    categorySlug: 'ai-assistant',
    keywords: ['ai actions', 'ai do', 'automated actions', 'ai automation', 'action center'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'AI Actions allow the AI to perform operations in your workspace on your behalf — such as drafting invoices, updating records, or preparing compliance submissions. Actions are subject to governance controls: depending on your workspace settings, AI actions may require human approval before they are executed.',
      },
      {
        type: 'fields',
        title: 'Governance Modes',
        rows: [
          { field: 'Strict Mode', required: false, description: 'All AI actions require explicit human approval before execution. Recommended for most workspaces.', example: '' },
          { field: 'Standard Mode', required: false, description: 'Low-risk actions are executed automatically. Higher-risk actions require approval.', example: '' },
          { field: 'Flexible Mode', required: false, description: 'Most AI actions are executed automatically. Only destructive actions require approval.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'Start with Strict Mode and only switch to Standard or Flexible once you are comfortable with how AI Actions behave in your workspace. AI Actions cannot be undone once executed.',
      },
    ],
  },
  {
    slug: 'ai-assistant/safety',
    title: 'AI Safety and Best Practices',
    description: 'Important guidance on using AI features safely and effectively in Tetri Copilot.',
    category: 'AI Assistant & AI Features',
    categorySlug: 'ai-assistant',
    keywords: ['ai safety', 'best practices', 'ai limitations', 'ai accuracy', 'responsible ai'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'AI features in Tetri Copilot are powerful tools, but like any AI system, they have limitations. Understanding these helps you use AI effectively and avoid common mistakes.',
      },
      {
        type: 'text',
        title: 'AI Limitations',
        content:
          'AI responses are based on patterns in your data and general knowledge. The AI can make mistakes, especially with: unusual or complex transactions, incomplete data, rapidly changing regulations, and highly specific legal or tax questions. Always review AI output before acting on it.',
      },
      {
        type: 'fields',
        title: 'Best Practices',
        rows: [
          { field: 'Always Review', required: false, description: 'Treat AI suggestions as a first draft, not a final answer. Human review is always necessary.', example: '' },
          { field: 'Use Specific Questions', required: false, description: 'Specific questions get better answers than vague ones.', example: 'Instead of "show expenses", ask "show travel expenses over £100 in May 2026"' },
          { field: 'Verify Compliance Guidance', required: false, description: 'Cross-check compliance advice with HMRC.gov.uk or a qualified accountant.', example: '' },
          { field: 'Check AI Actions Before Approval', required: false, description: 'Before approving an AI Action, confirm you understand exactly what it will do.', example: '' },
          { field: 'Report Inaccuracies', required: false, description: 'If the AI gives wrong information, correct it and note it for the team.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'AI in Tetri Copilot is designed to assist, not replace, human judgment. For financial decisions, legal questions, and compliance filings, always involve a qualified professional.',
      },
    ],
  },
]
