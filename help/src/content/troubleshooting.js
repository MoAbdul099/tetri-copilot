export const articles = [
  {
    slug: 'troubleshooting/login-issues',
    title: 'Login Issues',
    description: 'How to fix common sign-in problems with Tetri Copilot.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
    keywords: ['login issues', 'cant sign in', 'password', 'authentication', 'locked out'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content: 'Most sign-in problems have simple solutions. Work through the steps below before contacting Support.',
      },
      {
        type: 'fields',
        title: 'Common Login Problems and Solutions',
        rows: [
          { field: 'Wrong password', required: false, description: 'Use the "Forgot password?" link on the sign-in page to reset your password.', example: '' },
          { field: 'Wrong email address', required: false, description: 'Try the email address you used when you registered. Check for typos.', example: '' },
          { field: 'No workspace after login', required: false, description: 'Your account exists but you may not be in any workspace. Contact the workspace owner to send you an invitation.', example: '' },
          { field: 'Account not verified', required: false, description: 'Check your email for a verification message. Check spam if not found. You can request a new verification email from the sign-in page.', example: '' },
          { field: 'Invitation expired', required: false, description: 'Invitation links expire after 7 days. Ask the workspace owner to resend the invitation.', example: '' },
          { field: 'Browser issues', required: false, description: 'Clear your browser cache and cookies, or try a different browser (Chrome or Firefox recommended).', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'If none of the above solve your problem, contact Support and include: your email address, the browser you are using, and the exact error message you see.',
      },
      {
        type: 'related',
        links: [
          { slug: 'account/sign-in', title: 'Sign In' },
          { slug: 'account/forgot-password', title: 'Forgot Password' },
          { slug: 'support/contact', title: 'Contact Support' },
        ],
      },
    ],
  },
  {
    slug: 'troubleshooting/permission-issues',
    title: 'Access Denied / Permission Issues',
    description: 'What to do when you cannot access a page or feature in Tetri Copilot.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
    keywords: ['access denied', 'permission denied', 'unauthorized', 'no access', 'forbidden'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'If you see an "Access Denied" message or cannot find a page in the sidebar, it is likely a role or permission issue. Here is how to diagnose and resolve it.',
      },
      {
        type: 'fields',
        title: 'Common Causes',
        rows: [
          { field: 'Insufficient role', required: false, description: 'Your current role does not have access to that page. Contact your workspace Owner or Admin to upgrade your role.', example: 'User trying to access Billing (Owner only)' },
          { field: 'Wrong workspace', required: false, description: 'You may be in a different workspace than expected. Check the workspace name in the top bar.', example: '' },
          { field: 'Page removed or renamed', required: false, description: 'The page may have moved. Use the search or check the sidebar navigation.', example: '' },
        ],
      },
      {
        type: 'steps',
        title: 'How to Request Access',
        items: [
          'Note which page or feature you need access to.',
          'Contact your workspace Owner or Admin.',
          'Ask them to change your role (e.g., from User to Admin).',
          'Once changed, sign out and sign back in for changes to take effect.',
        ],
      },
    ],
  },
  {
    slug: 'troubleshooting/missing-workspace',
    title: 'Missing Workspace',
    description: 'What to do if your workspace is not visible after signing in.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
    keywords: ['missing workspace', 'workspace not found', 'no workspace', 'workspace access'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'If you sign in but cannot see your workspace, there are a few possible reasons — from account issues to workspace membership changes.',
      },
      {
        type: 'fields',
        title: 'Possible Causes',
        rows: [
          { field: 'Removed from workspace', required: false, description: 'You may have been removed by an Owner or Admin. Contact the workspace Owner to restore access.', example: '' },
          { field: 'Wrong account', required: false, description: 'You may be signed in with a different email address. Sign out and sign in with the correct email.', example: '' },
          { field: 'Invitation not accepted', required: false, description: 'If you were newly invited, you need to accept the invitation from the email first.', example: '' },
          { field: 'Workspace deleted', required: false, description: 'If the workspace was deleted by the Owner, the data is no longer accessible.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'support/contact', title: 'Contact Support' },
        ],
      },
    ],
  },
  {
    slug: 'troubleshooting/data-not-loading',
    title: 'Data Not Loading',
    description: 'What to do when pages or data are not loading in Tetri Copilot.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
    keywords: ['data not loading', 'page not loading', 'blank page', 'loading error', 'spinner'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content: 'If a page shows a loading spinner that never completes, or shows an error message, try the following steps.',
      },
      {
        type: 'steps',
        title: 'Troubleshooting Steps',
        items: [
          'Refresh the page (press F5 or Cmd+R).',
          'Check your internet connection — the app requires a stable connection.',
          'Clear your browser cache (Ctrl+Shift+Delete in most browsers).',
          'Try opening the page in a different browser tab.',
          'Sign out and sign back in.',
          'If the issue persists on a specific page, check the Tetri Copilot system status.',
          'If the issue affects all pages, there may be a temporary service outage. Check back in 10–15 minutes.',
          'If the problem continues, contact Support with details of the page affected and any error messages shown.',
        ],
      },
    ],
  },
  {
    slug: 'troubleshooting/ai-not-responding',
    title: 'AI Assistant Not Responding',
    description: 'What to do when the AI Assistant is not working or giving errors.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
    keywords: ['ai not working', 'ai error', 'assistant not responding', 'ai broken'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'If the AI Assistant is not responding, giving generic errors, or seems stuck, try the following steps.',
      },
      {
        type: 'steps',
        title: 'Troubleshooting AI Issues',
        items: [
          'Wait a few seconds — the AI processes your request which can take 5–10 seconds for complex questions.',
          'Refresh the page and try your question again.',
          'Try simplifying your question — very long or complex queries can sometimes cause issues.',
          'Check if other pages in the app are working normally.',
          'If the AI is completely unavailable, there may be a temporary AI service outage. Try again in a few minutes.',
          'If the problem persists, contact Support.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'AI response times vary depending on the complexity of your question and current service load. Simple queries typically respond in 2–5 seconds.',
      },
    ],
  },
  {
    slug: 'troubleshooting/general-errors',
    title: 'General Error Messages',
    description: 'What common error messages in Tetri Copilot mean and how to resolve them.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
    keywords: ['error messages', 'errors', '500 error', '403 error', 'something went wrong'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content: 'Here is a guide to the most common error messages and what they mean.',
      },
      {
        type: 'fields',
        title: 'Error Message Guide',
        rows: [
          { field: '"Something went wrong"', required: false, description: 'A general server error. Refresh the page and try again. If it persists, contact Support.', example: '' },
          { field: '"Access denied" / 403', required: false, description: 'You do not have permission to perform this action. Check your role with an Admin.', example: '' },
          { field: '"Not found" / 404', required: false, description: 'The page or record no longer exists. It may have been deleted or the URL is wrong.', example: '' },
          { field: '"Session expired"', required: false, description: 'Your session has timed out due to inactivity. Sign in again.', example: '' },
          { field: '"Validation error"', required: false, description: 'A required field is missing or in the wrong format. Check all required fields in the form.', example: '' },
          { field: '"Network error"', required: false, description: 'Your internet connection was interrupted. Check your connection and try again.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'support/contact', title: 'Contact Support' },
          { slug: 'support/report-issue', title: 'How to Report an Issue' },
        ],
      },
    ],
  },
]
