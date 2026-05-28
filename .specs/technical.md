# Sharp End Marketing Site - Technical Specification

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Astro | 5.x | Static-first, Islands architecture |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with design tokens |
| Interactive | React | 19.x | Islands for contact form |
| Content | MDX | - | Rich content with embedded components |
| Deployment | Vercel | - | Edge network, preview deployments |
| CI/CD | GitHub Actions | - | Build, type-check, eval pipeline |
| Type Safety | TypeScript | 5.x | Strict mode |

## Architecture

### Islands Architecture

- All pages are static HTML by default (zero JS shipped)
- React used only for contact form and Keystatic admin UI with `client:only="react"` / `client:visible`
- Prefer Astro components (`.astro`) over React components (`.tsx`)

### Content Collections

- Astro Content Collections with Zod schemas
- Collections: `blog`, `case-studies`
- Schemas defined in `src/content/config.ts`
- Content managed via Keystatic CMS (see CMS section below)

### Keystatic CMS

- **Config**: `keystatic.config.ts` — defines `blog` and `caseStudies` collections
- **Storage**: Dual-mode via `import.meta.env.DEV`
  - Dev: `{ kind: 'local' }` — reads/writes local files, no auth
  - Production: `{ kind: 'github', repo: 'Sharpend-Marketing/sem-astro' }` — GitHub API, OAuth required
- **Custom integration**: `keystatic()` in `astro.config.mjs` (replaces broken `@keystatic/astro`)
  - Vite plugin resolves `virtual:keystatic-config`
  - `injectRoute` for `/keystatic/[...params]` and `/api/keystatic/[...params]` (both `prerender: false`)
  - Server binds to `127.0.0.1` (required by Keystatic client)
- **Key files**:
  - `src/keystatic/page.astro` — Admin UI page (SSR)
  - `src/keystatic/api.ts` — API handler via `makeHandler` (SSR)
  - `src/components/KeystaticApp.tsx` — React wrapper for Keystatic UI
- **Image fields**: Store filenames only (e.g., `workflow-optimization.avif`), rendering code prepends public path
- **Collection path format**: Must end with `*/` for directory entries, such as each slug folder containing an `index.mdoc` file

### Deployment

- **Adapter**: `@astrojs/vercel` — SSR routes deploy as Vercel Serverless Functions, static pages unaffected
- **Production**: Vercel, triggered by merge to `main`
- **Preview**: Vercel preview deployments for each PR
- **Build**: `pnpm build` → static pages to `.vercel/output/static/`, serverless functions for Keystatic routes
- **Node version**: 22.x

## Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | >= 90 | Lighthouse CI |
| Largest Contentful Paint (LCP) | < 2.5s | Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Web Vitals |
| Total Blocking Time (TBT) | < 200ms | Lighthouse |
| JavaScript bundle | < 200 KB | Build output |
| CSS (critical) | < 100 KB | Build output |

## Verification

### Build-time Checks

1. `pnpm build` — Astro static build succeeds
2. `pnpm astro check` — TypeScript and Astro type checking
3. `validate-frontmatter` — MDX frontmatter matches Zod schemas
4. `brand-check` — Design token compliance
5. `a11y-check` — Accessibility validation
6. `seo-check` — Meta tags, OG, structured data
7. `perf-check` — Performance budgets

### Preview Checks

1. Lighthouse CI against preview URL
2. axe-core against preview URL
