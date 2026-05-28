export const articles = [
  {
    slug: 'reports-analytics/reports-overview',
    title: 'Reports Overview',
    description: 'What reports are available in Tetri Copilot and how to use them.',
    category: 'Reports & Analytics',
    categorySlug: 'reports-analytics',
    keywords: ['reports', 'reporting', 'financial reports', 'overview', 'export'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Reports module gives you standardized financial and operational reports. Reports aggregate your data across invoices, expenses, customers, and compliance to give you the insights you need for business decisions and external reporting.',
      },
      {
        type: 'steps',
        title: 'How to Access Reports',
        items: [
          'Click Reports in the left sidebar (or use the top-level navigation link).',
          'Browse the available report types.',
          'Select a report and configure its parameters (date range, filters).',
          'Click Run Report to generate the results.',
          'Export the report as CSV, Excel, or PDF if needed.',
        ],
      },
      {
        type: 'fields',
        title: 'Available Reports',
        rows: [
          { field: 'Revenue Summary', required: false, description: 'Total revenue by period with breakdown by customer.', example: '' },
          { field: 'Invoice Aging', required: false, description: 'Outstanding invoices categorized by how long they are overdue.', example: '' },
          { field: 'Expense Summary', required: false, description: 'Total expenses by period and by category.', example: '' },
          { field: 'Accounts Receivable', required: false, description: 'Detailed list of all outstanding receivables.', example: '' },
          { field: 'Customer Statement', required: false, description: 'Full transaction history for a specific customer.', example: '' },
          { field: 'Profit & Loss Summary', required: false, description: 'Revenue minus expenses for a selected period.', example: '' },
          { field: 'Payment History', required: false, description: 'All payments recorded, with dates and methods.', example: '' },
          { field: 'Expense by Category', required: false, description: 'Spending broken down by expense category.', example: '' },
          { field: 'Compliance Status', required: false, description: 'Overview of compliance obligations and their completion status.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'reports-analytics/export', title: 'Exporting Reports' },
          { slug: 'reports-analytics/analytics', title: 'Analytics' },
          { slug: 'reports-analytics/insights', title: 'Insights Center' },
        ],
      },
    ],
  },
  {
    slug: 'reports-analytics/run-report',
    title: 'Run a Report',
    description: 'How to configure and run a report in Tetri Copilot.',
    category: 'Reports & Analytics',
    categorySlug: 'reports-analytics',
    keywords: ['run report', 'generate report', 'report parameters', 'date range'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content: 'Running a report involves selecting the report type, configuring the parameters, and clicking Run. Most reports can be filtered by date range, customer, or category.',
      },
      {
        type: 'steps',
        title: 'Steps to Run a Report',
        items: [
          'Go to Reports in the sidebar.',
          'Click on the report you want to run.',
          'Set the date range (start date and end date).',
          'Apply any additional filters (customer, category, status, etc.).',
          'Click Run Report.',
          'The results appear below. Scroll down to see the full report.',
          'Click Export to download the report in your chosen format.',
        ],
      },
    ],
  },
  {
    slug: 'reports-analytics/export',
    title: 'Exporting Reports',
    description: 'How to export Tetri Copilot reports to CSV, Excel, or PDF.',
    category: 'Reports & Analytics',
    categorySlug: 'reports-analytics',
    keywords: ['export', 'download report', 'csv', 'excel', 'pdf', 'export report'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'After generating a report, you can export it in multiple formats for use in spreadsheets, accounting software, or to share with your accountant.',
      },
      {
        type: 'fields',
        title: 'Export Formats',
        rows: [
          { field: 'CSV', required: false, description: 'Comma-separated values. Best for importing into Excel, Google Sheets, or accounting software.', example: '' },
          { field: 'Excel (.xlsx)', required: false, description: 'Formatted spreadsheet with column headers. Opens directly in Microsoft Excel.', example: '' },
          { field: 'PDF', required: false, description: 'A formatted document suitable for printing or sharing with accountants or auditors.', example: '' },
        ],
      },
      {
        type: 'steps',
        title: 'How to Export a Report',
        items: [
          'Run a report as described above.',
          'Click the Export button at the top right of the results.',
          'Select your preferred format (CSV, Excel, or PDF).',
          'The file downloads automatically to your computer.',
        ],
      },
    ],
  },
  {
    slug: 'reports-analytics/analytics',
    title: 'Analytics',
    description: 'How to use the Analytics module to explore trends and performance.',
    category: 'Reports & Analytics',
    categorySlug: 'reports-analytics',
    keywords: ['analytics', 'trends', 'charts', 'performance', 'data analysis'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Analytics page provides interactive charts and trend analysis for your revenue, expenses, and operational performance. Unlike static reports, analytics lets you explore your data visually and identify patterns over time.',
      },
      {
        type: 'fields',
        title: 'Analytics Sections',
        rows: [
          { field: 'Revenue Trend', required: false, description: 'A time-series chart of revenue over your selected period.', example: '' },
          { field: 'Expense Trend', required: false, description: 'A time-series chart of total expenses over time.', example: '' },
          { field: 'Profit Trend', required: false, description: 'Revenue minus expenses over time, showing your profit trajectory.', example: '' },
          { field: 'Customer Breakdown', required: false, description: 'Revenue contribution by customer — who your biggest clients are.', example: '' },
          { field: 'Expense Category Breakdown', required: false, description: 'A pie or bar chart showing spending by category.', example: '' },
          { field: 'Forecasting', required: false, description: '30/60/90-day projections based on your historical data patterns.', example: '' },
        ],
      },
    ],
  },
  {
    slug: 'reports-analytics/insights',
    title: 'Insights Center',
    description: 'How to use the AI-powered Insights Center for business intelligence.',
    category: 'Reports & Analytics',
    categorySlug: 'reports-analytics',
    keywords: ['insights', 'ai insights', 'business intelligence', 'recommendations', 'insights center'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Insights Center uses AI to analyze your operational data and surface meaningful observations, risks, and opportunities. It goes beyond charts — it explains what your data means in plain language.',
      },
      {
        type: 'fields',
        title: 'Insight Types',
        rows: [
          { field: 'Financial Health Score', required: false, description: 'An AI-calculated score (0–100) representing your overall business financial health.', example: '76 / 100 — Good' },
          { field: 'Risk Alerts', required: false, description: 'Specific risks identified in your data, such as high customer concentration or cash flow warnings.', example: 'ABC Trading represents 45% of your revenue — high dependency risk' },
          { field: 'Opportunities', required: false, description: 'Potential improvements identified by the AI, such as categories where costs can be reduced.', example: '' },
          { field: 'Executive Summary', required: false, description: 'A natural language summary of your business performance for the current period.', example: '' },
          { field: 'Anomaly Alerts', required: false, description: 'Unusual patterns detected in your data.', example: 'Marketing spend this month is 3× the 6-month average' },
        ],
      },
    ],
  },
]
