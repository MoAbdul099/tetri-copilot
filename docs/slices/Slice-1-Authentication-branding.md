Read:
- CLAUDE.md
- docs/branding.md
- docs/slices/slice-1-authentication.md

Analyze the current Slice 1 authentication implementation and apply Tetri Copilot branding backward to all authentication-related frontend UI.

Scope:
- sign in page
- sign up page
- forgot password page
- reset password page
- auth layout
- onboarding redirect/loading screens if applicable
- protected layout shell if already implemented

Branding Requirements:
- Follow docs/branding.md strictly.
- Apply Tetri colors, typography, spacing, and UI direction.
- Use Manrope font if not already configured.
- Use Tailwind CSS and shadcn/ui styling conventions.
- Add Tetri logo from frontend/public/.
- Use modern enterprise SaaS styling inspired by:
  - Linear
  - Stripe
  - Mercury
  - Notion
  - Vercel

MVP Rules:
- Clerk prebuilt auth UI may remain.
- Clerk branding/logo may remain temporarily.
- However, the surrounding auth page/layout must be fully Tetri-branded.

UI/UX Requirements:
- centered auth layout
- clean spacing
- soft borders
- minimal shadows
- modern SaaS feel
- responsive layout
- dark mode compatibility if dark mode already exists
- loading/error/success states should visually match branding

Technical Requirements:
- Centralize colors and theme tokens where possible.
- Avoid hardcoded random colors.
- Reuse shared components and layouts.
- Do not rewrite authentication business logic unless required for UI integration.
- Do not modify backend authentication logic unless necessary.

Assets:
Use:
- frontend/public/logo.svg
- frontend/public/logo-light.svg
- frontend/public/logo-dark.svg if applicable

Expected Deliverables:
- updated auth pages
- updated auth layout
- updated theme/tailwind configuration if needed
- updated shared UI styles if needed
- explanation of changed files
- explanation of branding/theme structure

Before editing files:
1. Inspect the current frontend/auth implementation.
2. Identify affected files and theme configuration files.
3. Explain the branding implementation plan first.
4. Wait for approval before making changes.