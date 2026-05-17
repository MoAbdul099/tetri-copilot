I retested the application after the previous Slice 2 UI fixes and shadcn/ui integration.

Current status:
- The logo sizing issue is now improved.
- However, the other UI/theme issues are STILL NOT fixed.
- Additionally, the Settings page is no longer showing/rendering correctly.

Remaining issues from testing:

1. The Next links/buttons are still not visible in all setup steps:
   - workspace
   - profile
   - localization
   - preferences

   The controls exist and become visible only on hover, which means there is still a text color, background color, variant, opacity, or theme token issue.

2. In Preferences, the Email Notifications and Dashboard Notifications switch ON/OFF controls are still not visible.
   The controls exist and are interactable on hover, but their UI styling/theme is still broken.

3. Tetri branding blue colors are still not applied correctly in:
   - buttons
   - links
   - tabs
   - active states
   - focus states
   - selected step indicators

4. NEW ISSUE:
   The Settings page is now not rendering/showing correctly after the recent UI/shared layout/shadcn changes.

Main objective:
Properly fix the frontend theme, shadcn/ui integration, styling, and layout issues without breaking Slice 2 functionality.

Important:
Do NOT just patch styles randomly.
I need the root cause fixed correctly.

Possible root causes to investigate:
- incorrect Tailwind theme token mapping
- incorrect shadcn/ui variant usage
- broken CSS variables
- incorrect Tailwind config
- incorrect globals/index.css setup
- incorrect text/background color tokens
- dark/light theme conflict
- broken layout/container rendering
- missing theme provider or class mappings
- shared layout component regression

Requirements:
- Follow CLAUDE.md
- Follow docs/branding.md strictly
- Preserve Tetri branding
- Preserve shared component architecture
- Preserve shadcn/ui integration
- Do not remove shared layouts/components unless absolutely necessary
- Do not break Slice 1 or Slice 2 functionality
- Do not implement Slice 3

Branding requirements:
Use:
- Primary Blue: #1447e6
- Secondary Blue: #155dfc
- Primary Text: #0f172b
- Secondary Text: #4a5565
- Soft Background: #f8fafc
- Border Gray: #e2e8f0
- Manrope font

shadcn/ui requirements:
Verify proper setup/configuration for:
- Button
- Switch
- Tabs
- Card
- Input
- Label
- Select
- Dialog

UI expectations:
- Buttons must always be visible without hover.
- Links must be readable without hover.
- Tabs must show visible active/inactive states.
- Switches must show clear ON/OFF states.
- Selected wizard/setup steps must use Tetri branding colors.
- Settings page must render correctly again.
- Shared layouts must not hide or override page rendering.

Before editing files:
1. Inspect the current frontend structure and shared layouts.
2. Identify the exact root causes for:
   - invisible buttons
   - invisible switches
   - missing Tetri blue colors
   - settings page rendering issue
3. Explain why the previous fix did not fully solve the issues.
4. Explain the correct implementation plan.
5. Wait for approval before editing files.

After implementation:
1. List changed files.
2. Explain the actual root causes discovered.
3. Explain the theme/token/layout fixes.
4. Explain how the Settings page issue was fixed.
5. Provide testing steps for:
   - workspace step
   - profile step
   - localization step
   - preferences step
   - switches
   - tabs
   - settings page
6. Mention any remaining frontend risks or cleanup recommendations.