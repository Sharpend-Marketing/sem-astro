# sem-astro

Sharp End Marketing website built with Astro, Tailwind CSS v4, and Keystatic CMS.

## Overview

- Astro 5 static-first site with selective React islands
- Content managed in-repo (`src/content/*`) with Keystatic
- Vercel deployment with serverless Keystatic routes
- Blog and case study content stored as Markdoc (`.mdoc`)

## Tech Stack

- `astro` 5.x
- `tailwindcss` 4.x
- `react` 19.x
- `@astrojs/vercel`
- `@keystatic/core` + `@keystatic/astro`
- `pnpm` (package manager: `pnpm@10.28.2`)

## Requirements

- Node.js 22+ (recommended)
- `pnpm`
- GitHub access to the content repo
- Vercel project access (for production env vars / deploys)

## Install

```bash
pnpm install
```

## Local Development

Start the site:

```bash
pnpm dev
```

Default local URL:

- `http://127.0.0.1:4322/` (Astro/Keystatic integration forces `127.0.0.1` when host is not set)

## Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - production build
- `pnpm preview` - preview built output

## Project Structure

- `src/pages/` - public pages and route entrypoints
- `src/components/` - Astro/React UI components
- `src/content/` - blog + case study content
- `src/keystatic/` - Keystatic UI/API routes
- `keystatic.config.ts` - Keystatic collections + storage mode
- `astro.config.mjs` - Astro config + custom Keystatic route injection
- `.specs/` - project specs, architecture, issue inventory

## Keystatic CMS

### Storage Modes

`keystatic.config.ts` supports:

- Local mode in development (default): no auth, reads/writes files directly
- GitHub mode in production: OAuth + commits to configured repo

Configured production repo:

- `Sharpend-Marketing/sem-astro`

### Local Keystatic (Default)

- Open `http://127.0.0.1:4322/keystatic`
- Uses local file storage in dev

### Local Keystatic GitHub Setup / Testing

To force GitHub mode locally (useful for OAuth app setup/testing):

```bash
PUBLIC_KEYSTATIC_STORAGE_MODE=github pnpm dev --host 127.0.0.1 --port 4322
```

Then open:

- `http://127.0.0.1:4322/keystatic/setup` (GitHub App setup screen)

## Environment Variables

Production Keystatic GitHub mode requires:

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

Contact form email delivery requires:

- `RESEND_API_KEY`
- `CONTACT_FORM_FROM` - verified Resend sender, for example `Sharp End Marketing <larry@sharpendmarketing.com>`
- `CONTACT_FORM_TO` - recipient inbox for submissions; comma-separate multiple recipients

### Resend Contact Form Setup

1. In Resend, verify `sharpendmarketing.com` and wait for DNS status to pass.
2. Create a restricted API key with email sending permission.
3. Set the local `.env` values:

```sh
RESEND_API_KEY=re_...
CONTACT_FORM_FROM="Sharp End Marketing <larry@sharpendmarketing.com>"
CONTACT_FORM_TO=larry@sharpendmarketing.com
```

4. Add the same variables to the Vercel project for Production, Preview, and Development.
5. Submit the `/contact` form after deploy and confirm the message arrives in `CONTACT_FORM_TO`.

The API key may be send-only. In that case, Resend domain-list API checks return `restricted_api_key`, which is expected and does not block contact form delivery.

### Configurable Forms

Reusable form variants live in `src/lib/form-configs.ts`. Pages import a config and pass it to the React form island:

```astro
---
import ContactForm from '../components/ContactForm.tsx'
import { serviceInquiryFormConfig } from '../lib/form-configs'
---

<ContactForm {...serviceInquiryFormConfig} sourcePage={Astro.url.pathname} client:visible />
```

Keep recipients in server environment variables rather than page props. Form configs may customize labels, success copy, audit defaults, and optional extra fields.

Reference template: `.env.example`

Do not commit `.env`.

## Vercel Deployment

Current production alias:

- `https://sem-astro.vercel.app`

Working fallback alias (useful during alias moves):

- `https://sem-astro-roan.vercel.app`

### Important Vercel Settings

- Project must be publicly reachable for Keystatic OAuth routes (`/api/keystatic/*`)
- If Vercel Authentication / Deployment Protection is enabled for production, Keystatic OAuth can fail before the request reaches the app

### Deploy

```bash
vercel deploy -y --prod
```

## GitHub App (Keystatic) Setup Notes

GitHub App used for Keystatic:

- `sharpend-marketing-keystatic`

Required callback URLs (recommended):

- `https://sem-astro.vercel.app/api/keystatic/github/oauth/callback`
- `https://sem-astro-roan.vercel.app/api/keystatic/github/oauth/callback`
- `http://127.0.0.1:4322/api/keystatic/github/oauth/callback` (local dev)

App install must include the configured repo (or the repo currently referenced in `keystatic.config.ts`).

## Keystatic / OAuth Troubleshooting

### `redirect_uri is not associated with this application`

Cause:

- GitHub App callback URL missing or incorrect

Fix:

- Add the exact callback URL shown by `/api/keystatic/github/login` to the GitHub App settings

Verification:

```bash
curl -sSI https://sem-astro.vercel.app/api/keystatic/github/login
```

### OAuth redirect uses `localhost` in production

Cause:

- Serverless runtime request URL may resolve to `localhost`

Fix implemented:

- `src/keystatic/api.ts` rebuilds request origin from `x-forwarded-host` / `x-forwarded-proto` before passing to Keystatic

### `Repo not found` in Keystatic

Cause:

- GitHub App is not installed on the configured repo, or user authenticated with the wrong GitHub account

Fix:

- Install/configure the GitHub App on the correct account/repo
- Re-authenticate Keystatic with the GitHub account that has repo access

Logout helper:

- `https://sem-astro.vercel.app/api/keystatic/github/logout`

## Content Editing Workflow

1. Open `/keystatic`
2. Log in with GitHub
3. Edit content in `blog` or `caseStudies`
4. Save changes (Keystatic writes commits to the configured repo)
5. Vercel deploys the update from GitHub

## Branching

- Use branch prefix `codex/` for Codex-created branches

## Notes

- The project includes detailed specs in `.specs/` and implementation notes in `CLAUDE.md`
- Keystatic integration is custom-wired in `astro.config.mjs` due Astro/Keystatic integration issues with the stock path in this project setup
