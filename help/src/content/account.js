export const articles = [
  {
    slug: 'account/sign-in',
    title: 'Sign In',
    description: 'How to sign in to Tetri Copilot with your email and password.',
    category: 'Account & Authentication',
    categorySlug: 'account',
    keywords: ['sign in', 'login', 'access', 'password', 'email'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'To access Tetri Copilot, go to the application URL and sign in with your registered email address and password. Authentication is handled securely and your session is maintained across browser tabs.',
      },
      {
        type: 'steps',
        title: 'How to Sign In',
        items: [
          'Open your browser and go to the Tetri Copilot app URL.',
          'On the Sign In page, enter your registered email address.',
          'Enter your password.',
          'Click Sign In.',
          'If your credentials are correct, you are taken to your Dashboard.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'If you have multiple workspaces, you will be asked to select which workspace to open after signing in.',
      },
      {
        type: 'text',
        title: 'Common Sign-In Issues',
        content:
          'If you cannot sign in, first check that your email and password are correct. If you have forgotten your password, use the "Forgot password?" link on the sign-in page. If your account has been deactivated or removed from a workspace, contact your workspace owner.',
      },
      {
        type: 'related',
        links: [
          { slug: 'account/forgot-password', title: 'Forgot Password' },
          { slug: 'account/sign-up', title: 'Sign Up' },
          { slug: 'troubleshooting/login-issues', title: 'Login Issues' },
        ],
      },
    ],
  },
  {
    slug: 'account/sign-up',
    title: 'Sign Up',
    description: 'How to create a new Tetri Copilot account.',
    category: 'Account & Authentication',
    categorySlug: 'account',
    keywords: ['sign up', 'register', 'create account', 'new account'],
    roles: ['Owner'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Creating a Tetri Copilot account takes less than 2 minutes. You will need a valid email address. After registration, you will be guided through workspace setup.',
      },
      {
        type: 'steps',
        title: 'How to Sign Up',
        items: [
          'Go to the Tetri Copilot sign-up page.',
          'Enter your full name and email address.',
          'Create a strong password (minimum 8 characters, mix of letters and numbers recommended).',
          'Click Create Account.',
          'Check your email for a verification link and click it.',
          'You are redirected to the workspace setup wizard.',
          'Complete workspace setup and you are ready to go.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'If you were invited to join an existing workspace, do not create a new account. Use the invitation link sent to your email instead.',
      },
      {
        type: 'related',
        links: [
          { slug: 'account/sign-in', title: 'Sign In' },
          { slug: 'getting-started/workspace-setup-overview', title: 'Workspace Setup Overview' },
        ],
      },
    ],
  },
  {
    slug: 'account/forgot-password',
    title: 'Forgot Password',
    description: 'How to reset your password if you have forgotten it.',
    category: 'Account & Authentication',
    categorySlug: 'account',
    keywords: ['forgot password', 'reset password', 'password recovery'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'If you have forgotten your password, you can reset it from the sign-in page. A password reset link will be sent to your registered email address.',
      },
      {
        type: 'steps',
        title: 'How to Reset Your Password',
        items: [
          'On the Sign In page, click the "Forgot password?" link below the password field.',
          'Enter your registered email address.',
          'Click Send Reset Link.',
          'Check your email inbox for the password reset message.',
          'Click the link in the email (it expires after 1 hour).',
          'Enter your new password and confirm it.',
          'Click Reset Password.',
          'Sign in with your new password.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'If you do not receive the reset email within a few minutes, check your spam or junk folder. The email comes from no-reply@tetrisuite.com.',
      },
      {
        type: 'related',
        links: [
          { slug: 'account/sign-in', title: 'Sign In' },
          { slug: 'troubleshooting/login-issues', title: 'Login Issues' },
        ],
      },
    ],
  },
  {
    slug: 'account/profile-settings',
    title: 'Profile and Account Settings',
    description: 'How to update your name, email, and other personal account details.',
    category: 'Account & Authentication',
    categorySlug: 'account',
    keywords: ['profile', 'account settings', 'update name', 'change email', 'personal settings'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Your profile settings let you update your personal information such as your name. Account security settings like email and password are managed through the authentication provider.',
      },
      {
        type: 'steps',
        title: 'How to Access Profile Settings',
        items: [
          'Click your name or avatar in the top-right corner of the app.',
          'Select Notification Preferences or navigate to Settings in the sidebar.',
          'Your profile details are shown at the top of the settings page.',
          'Update your display name as needed.',
          'Click Save to apply changes.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'settings/general', title: 'General Settings' },
          { slug: 'settings/notification-settings', title: 'Notification Settings' },
        ],
      },
    ],
  },
  {
    slug: 'account/logout',
    title: 'Sign Out',
    description: 'How to safely sign out of Tetri Copilot.',
    category: 'Account & Authentication',
    categorySlug: 'account',
    keywords: ['sign out', 'logout', 'log out', 'end session'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'You can sign out of Tetri Copilot at any time from the user menu. It is good practice to sign out when using a shared or public computer.',
      },
      {
        type: 'steps',
        title: 'How to Sign Out',
        items: [
          'Click your avatar or name in the top-right corner of the app.',
          'Select Sign Out from the dropdown menu.',
          'You are signed out and redirected to the sign-in page.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'Your session is automatically kept active while you are using the app. If you are inactive for an extended period, you may be asked to sign in again for security.',
      },
    ],
  },
]
