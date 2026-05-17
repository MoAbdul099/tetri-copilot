Read:

\- CLAUDE.md

\- docs/branding.md

\- the currently active slice document



While implementing or updating any slice, follow a reusable shared-component architecture approach.



Requirements:

\- Use shadcn/ui as the primary shared UI foundation.

\- Use Tailwind CSS and Tetri branding from docs/branding.md.

\- Reuse existing shared components whenever possible.

\- If repeated UI/layout patterns are discovered, extract them into reusable shared components.



Examples of reusable shared components may include:

\- AppShell

\- Sidebar

\- Header

\- AuthLayout

\- SetupLayout

\- PageHeader

\- FormCard

\- SettingsCard

\- DataTable

\- EmptyState

\- LoadingState

\- StatusBadge

\- ConfirmationDialog



Important architecture rules:

\- Only create shared components when there is clear reuse value.

\- Avoid premature overengineering.

\- Avoid creating unnecessary wrapper components.

\- Avoid building a large generic component system too early.

\- Keep components clean, focused, and reusable.

\- Keep business logic separate from presentation components.



Frontend requirements:

\- Use:

&#x20; - shadcn/ui

&#x20; - Tailwind CSS

&#x20; - Lucide React

&#x20; - centralized theme tokens

&#x20; - docs/branding.md



\- Avoid:

&#x20; - duplicated layouts

&#x20; - duplicated form structures

&#x20; - duplicated styling logic

&#x20; - random hardcoded colors

&#x20; - inconsistent spacing

&#x20; - inline styling unless absolutely necessary



Branding requirements:

\- Follow docs/branding.md strictly.

\- Shared components must automatically inherit Tetri branding:

&#x20; - colors

&#x20; - typography

&#x20; - spacing

&#x20; - borders

&#x20; - shadows

&#x20; - dark mode support if applicable



Before creating a new shared component:

1\. Check whether an equivalent component already exists.

2\. Check whether the pattern is actually reusable.

3\. Explain why the shared component is needed.

4\. Explain where it will be reused.



When creating shared components:

\- Place them in logical shared locations.

\- Keep naming consistent.

\- Keep props clean and minimal.

\- Prefer composition over overcomplicated abstraction.



Suggested shared structure:

frontend/src/components/layout/

frontend/src/components/shared/

frontend/src/components/ui/



Before editing files:

1\. Inspect the current frontend structure.

2\. Identify reusable UI/layout patterns.

3\. Explain which shared components should be reused or extracted.

4\. Explain the implementation plan.

5\. Wait for approval before editing files.



After implementation:

1\. List all created/updated shared components.

2\. Explain where each component is reused.

3\. Explain any extracted layout/theme improvements.

4\. Explain any future reusable opportunities discovered.

