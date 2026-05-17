Read:

\- CLAUDE.md

\- docs/branding.md

\- docs/slices/slice-2-workspace-setup.md



Fix the Slice 2 frontend UI issues found during testing and properly connect shadcn/ui as the shared UI foundation.



Observed testing issues:

1\. The Next link/button is not visible in all setup steps:

&#x20;  - workspace

&#x20;  - profile

&#x20;  - localization

&#x20;  - preferences



&#x20;  The controls exist and become noticeable only when hovering, which means the text color, background color, hover state, or button variant styling is wrong.



2\. In Preferences, the Email Notifications and Dashboard Notifications switch ON/OFF controls are not visible.

&#x20;  They are interactable on hover, but the switch styling is not visible because of text/background/theme issues.



3\. Tetri branding blue colors are not showing anywhere in:

&#x20;  - buttons

&#x20;  - links

&#x20;  - tabs

&#x20;  - active states

&#x20;  - focus states

&#x20;  - selected step indicators



4\. The Tetri logo appears too small across the frontend.

&#x20;  It seems the horizontal logo is being forced into a small height/width container, because the logo is a wide rectangle with long width and short height.



Main objective:

Fix these frontend UI, layout, branding, and theme issues without changing backend business logic.



shadcn/ui requirement:

\- Inspect whether shadcn/ui is already installed and configured.

\- If shadcn/ui is not installed, install and configure it for the existing React + Vite + Tailwind frontend.

\- Enable CSS variables/theme support where appropriate.

\- Add or verify these shadcn/ui components:

&#x20; - Button

&#x20; - Switch

&#x20; - Tabs

&#x20; - Card

&#x20; - Input

&#x20; - Label

&#x20; - Select

&#x20; - Alert

&#x20; - Dialog

\- Use shadcn/ui components as the shared UI foundation for Slice 2 where appropriate.



Branding requirements:

Follow docs/branding.md strictly.



Apply Tetri branding tokens:

\- Primary Blue: #1447e6

\- Secondary Blue: #155dfc

\- Primary Text: #0f172b

\- Secondary Text: #4a5565

\- Soft Background: #f8fafc

\- Border Gray: #e2e8f0

\- Font: Manrope



UI fixes required:

\- Make all Next, Back, Save, Continue, and action buttons clearly visible without hover.

\- Ensure primary actions use Tetri Primary Blue.

\- Ensure hover states use Tetri Secondary Blue.

\- Ensure links use Tetri blue and remain visible in normal state.

\- Ensure tabs have visible active, inactive, hover, and focus states.

\- Ensure selected wizard/setup steps are clearly visible.

\- Ensure switches show clear ON and OFF states.

\- Ensure switch thumb and track contrast is correct.

\- Ensure cards/forms use proper borders, spacing, and readable text.

\- Ensure loading, error, success, and empty states follow Tetri branding.



Logo/layout fixes:

\- Fix the horizontal logo sizing issue.

\- Do not simply force a tiny height.

\- Use a responsive logo container.

\- Use object-contain and height auto.

\- Suggested sizing:

&#x20; - onboarding/setup header logo max-width: 180px to 220px

&#x20; - dashboard/sidebar logo max-width: 140px to 180px

\- If the space is too compact, use an icon-only logo or app icon instead of shrinking the full horizontal logo too much.

\- Keep the logo proportions correct.

\- Do not stretch or distort the logo.



Frontend architecture requirements:

\- Centralize theme colors and design tokens.

\- Avoid random hardcoded colors.

\- Avoid inline styling unless absolutely necessary.

\- Reuse shared UI components.

\- Do not create another separate UI system.

\- Preserve existing Slice 2 functionality.

\- Do not refactor unrelated modules.



Scope restrictions:

\- Do not change backend business logic.

\- Do not change database logic.

\- Do not implement Slice 3.

\- Do not implement billing, invoices, expenses, AI chat, compliance, or document generation.

\- Do not change authentication logic unless required for visual layout integration.



Before editing files:

1\. Inspect the current frontend structure.

2\. Check whether shadcn/ui is installed and configured correctly.

3\. Identify the files/components causing:

&#x20;  - invisible Next buttons

&#x20;  - invisible switches

&#x20;  - missing brand blue colors

&#x20;  - poor logo sizing

4\. Explain the root causes.

5\. Explain the implementation plan.

6\. Wait for my approval before editing files.



After implementation:

1\. List all changed files.

2\. Explain whether shadcn/ui was installed or only reused.

3\. Explain how Tetri branding tokens are now connected.

4\. Explain how buttons, links, tabs, switches, and logo sizing were fixed.

5\. Provide testing steps for:

&#x20;  - workspace step

&#x20;  - profile step

&#x20;  - localization step

&#x20;  - preferences step

&#x20;  - notification switches

&#x20;  - tabs/active states

&#x20;  - logo responsiveness

6\. Mention any remaining UI risks or future improvements.

