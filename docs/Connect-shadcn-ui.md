Read:

\- CLAUDE.md

\- docs/branding.md

\- docs/slices/slice-2-workspace-setup.md



We need to properly integrate and connect shadcn/ui into the frontend project and use it to fix the Slice 2 UI/branding issues.



Tasks:

1\. Inspect whether shadcn/ui is already installed and configured correctly.

2\. If not installed:

&#x20;  - install shadcn/ui for React + Vite

&#x20;  - configure it correctly with Tailwind CSS

&#x20;  - enable CSS variables/theme support

3\. Install and configure these components:

&#x20;  - Button

&#x20;  - Switch

&#x20;  - Tabs

&#x20;  - Card

&#x20;  - Input

&#x20;  - Label

&#x20;  - Select

&#x20;  - Alert

&#x20;  - Dialog

4\. Connect the Tetri branding system from docs/branding.md to the shared UI/theme layer.

5\. Centralize colors and theme tokens instead of using random hardcoded styles.

6\. Refactor the Slice 2 frontend UI to use shadcn/ui components where appropriate.



Observed issues to fix:

1\. Next links/buttons are invisible in workspace/profile/localization/preferences steps unless hovering.

2\. Email/dashboard switches are invisible because of styling/theme issues.

3\. Tetri blue branding colors are not applied to buttons, links, tabs, active states, or focus states.

4\. The horizontal logo appears too small because of incorrect sizing/layout handling.



Requirements:

\- Do not modify backend business logic.

\- Do not modify database logic.

\- Do not implement Slice 3.

\- Preserve current functionality.

\- Focus on frontend UI/theme/layout fixes only.



Branding requirements:

\- Follow docs/branding.md strictly.

\- Use:

&#x20; - Primary Blue: #1447e6

&#x20; - Secondary Blue: #155dfc

&#x20; - Primary Text: #0f172b

&#x20; - Secondary Text: #4a5565

&#x20; - Soft Background: #f8fafc

&#x20; - Border Gray: #e2e8f0

&#x20; - Manrope font

\- Use Lucide React icons if needed.



Logo requirements:

\- Fix logo rendering/layout for horizontal logo.

\- Use responsive container sizing.

\- Suggested:

&#x20; - onboarding/auth logo max-width: 180px–220px

&#x20; - sidebar logo max-width: 140px–180px

&#x20; - use object-contain and height auto



Frontend architecture requirements:

\- Reuse shared components.

\- Use centralized theme tokens.

\- Avoid random inline styles.

\- Use shadcn/ui as the primary UI foundation.



Before editing:

1\. Inspect current frontend structure.

2\. Identify whether shadcn/ui exists already.

3\. Identify affected files.

4\. Explain root causes.

5\. Explain implementation plan.

6\. Wait for approval before editing files.



After implementation:

1\. List changed files.

2\. Explain shadcn/ui setup/configuration.

3\. Explain branding/theme structure.

4\. Explain how to test each fixed issue.

