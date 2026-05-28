# Tetri Copilot Help Center

This is the static Help Center and User Manual site for Tetri Copilot.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Deploy to Cloudflare Pages.

Recommended settings:

- Root directory: `help`
- Build command: `npm run build`
- Build output directory: `dist`
- Custom domain: `help.tetre-copilot.com`
- Node version: 18+

## Content Updates

Help articles are stored in `src/content/`. Each file exports an `articles` array.
To add a new article, add it to the appropriate content file and update `src/data/navigation.js` and `src/data/searchIndex.js`.

## In-App Links

The main Tetri Copilot app can link directly to article URLs:

- `https://help.tetre-copilot.com/getting-started/welcome`
- `https://help.tetre-copilot.com/customers/add-customer`
- `https://help.tetre-copilot.com/invoices/create-invoice`
- `https://help.tetre-copilot.com/expenses/add-expense`
- `https://help.tetre-copilot.com/compliance/calendar`
- `https://help.tetre-copilot.com/ai-assistant/overview`

## Structure

```
src/
  content/        Article content files (one per module)
  data/           Navigation + search index
  components/     Reusable help UI components
  pages/          Route-level page components
```
