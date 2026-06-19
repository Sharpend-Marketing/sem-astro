# Sharp End Marketing Astro - Agent Operational Protocols

## Pre-Commit Verification (MANDATORY)

Before every commit, run the full CI check suite locally. Do NOT push without confirming all checks pass. Do NOT wait for the user to report CI failures.

```sh
pnpm build && pnpm astro check && npx tsx scripts/eval/validate-frontmatter.ts && npx tsx scripts/eval/brand-check.ts && npx tsx scripts/eval/a11y-check.ts && npx tsx scripts/eval/seo-check.ts && npx tsx scripts/eval/perf-check.ts && npx tsx scripts/eval/consistency-check.ts
```

If any check fails, fix the issue before committing. This mirrors exactly what CI runs in `.github/workflows/ci.yml`.

## Tech Stack

- **Framework**: Astro (Islands architecture) - zero JS by default
- **Styling**: Tailwind CSS v4
- **React Islands**: Only for interactive elements (contact form)
- **Content**: MDX for rich content with embedded components

## This is a Marketing Agency Site

- Static-first: pages are marketing content, not application UI
- Performance is critical: zero unnecessary JS
- SEO matters: semantic HTML, meta tags, Open Graph
- Light, professional aesthetic with brand teal accent

## Architecture: Islands

- Static pages use `.astro` components (zero JS shipped)
- Interactive elements use React with `client:visible` or `client:idle` directives
- Never hydrate a component unless it requires client-side interactivity

## Rules

### Brand Compliance
- Design tokens are defined in `src/styles/global.css` `@theme` block
- Do NOT use arbitrary Tailwind values for brand colors — use SEM token utilities only
- **Colors**: `--teal` (rgba(8,109,114,0.82)), `--teal-solid` (#086d72), `--teal-dark` (#013941), `--teal-accent` (#009688), `--heading` (#0A0D14), `--text-body` (#525866), `--text-muted` (rgba(10,13,20,0.45)), `--bg-white` (#ffffff), `--bg-light` (#F6F8FA), `--border` (rgba(9,14,29,0.1))
- **Fonts**: Inter Variable (body), Comfortaa (headings/accent/logo)
- **Light theme**: All pages use light backgrounds (`--bg-white`, `--bg-light`)
- Teal (`--teal`, `--teal-solid`) used for CTAs, links, and highlights
- Dark teal (`--teal-dark` #013941) used for footer, hero overlays, and CTA sections
- Buttons use asymmetric border-radius: `0px 7px` (`.btn-sem` class)
- Use SEM section components (`SEMSectionHeader`, `SEMHero`, `SEMServiceCard`, `SEMCTASection`, etc.) for page assembly

### Image Optimization
- All images MUST use the `<Image />` component from `astro:assets`
- Never use raw `<img>` tags

### Accessibility
- All interactive elements must have visible focus states
- Color contrast must meet WCAG AA minimum (4.5:1 for text)
- All images require meaningful `alt` text
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)

### File Organization
- `src/components/sem/` - SEM section components (SEMHero, SEMSectionHeader, SEMServiceCard, SEMCTASection, etc.)
- `src/components/seo/` - SEO components (Head)
- `src/layouts/` - Page layouts (BaseLayout, SEMLayout)
- `src/pages/` - Routes (services/, case-studies/, blog/, about-us, contact)
- `src/content/` - Astro content collections (blog, case-studies)
- `src/lib/` - Utility functions (seo.ts)
- `src/styles/` - Global styles and design tokens
- `public/` - Static assets (favicons, images)
- `.specs/` - **Source of truth** for all content, design, and architecture decisions
- `.Codex/agents/` - Project agent definitions (content-writer, content-reviewer, page-builder, seo-optimizer, visual-qa)
- `.Codex/evals/` - Model-based evaluation rubrics
- `content/approved/` - Verified stats and boilerplate (machine-readable, single source of truth)
- `content/raw/` - Brand voice, audience personas, channel guidelines, briefs
- `examples/` - Annotated reference implementations for agents
- `scripts/eval/` - Deterministic evaluation scripts

## Content Pipeline

### Stages

1. **Ingest** — Raw briefs, transcripts, and docs placed in `content/raw/`
2. **Draft** — `content-writer` agent transforms raw inputs into MDX drafts
3. **Review** — `content-reviewer` agent evaluates draft against quality rubrics
4. **Refine** — `content-writer` agent applies review feedback
5. **Publish** — Human approves, PR merged, Vercel deploys

### Agent Roles

| Stage | Agent | Model | Action |
|-------|-------|-------|--------|
| Draft | `content-writer` | Sonnet | Transforms briefs → MDX using specs + examples + approved content |
| Review | `content-reviewer` | Opus | Scores content on 1-5 rubric, flags unverified claims |
| Build | `page-builder` | Sonnet | Assembles pages from SEM section components |
| SEO | `seo-optimizer` | Haiku | Optimizes meta tags, structured data, headings |
| Visual QA | `visual-qa` | Opus | Reviews screenshots for layout/brand issues |

### Specifications

All content decisions reference `.specs/` as the single source of truth:
- `.specs/content-strategy.md` — Voice, tone, CTA library, audience segments, keyword strategy
- `.specs/brand.md` — Terminology, writing style, visual identity
- `.specs/domain.md` — Page types with required sections
- `.specs/schemas.md` — Frontmatter schema documentation
- `.specs/design.md` — Visual system extracted from design tokens
- `.specs/sitemap.md` — URL structure, navigation hierarchy

### Content Rules

- **Never fabricate statistics** — All numbers must come from `content/approved/stats.yaml`
- **Conversational, direct tone** — Talk like a trusted advisor, not a salesperson
- **Results-focused** — Lead with what we've achieved, not what we promise
- **Storytelling-first** — Every piece of content tells a story
- **Internal linking** — Every page links to at least 2 other pages
- **CTA placement** — Every page has a CTA above the fold and at the bottom
- **Words we avoid** — leverage, synergy, disrupt, guaranteed, promise, best, cheap, affordable, discount, holistic, seamless, cutting-edge

## Evaluation

### Deterministic Evals (CI)

All must pass on every PR:
- `validate-frontmatter` — MDX frontmatter matches Zod schemas
- `brand-check` — No arbitrary Tailwind values, correct token usage
- `a11y-check` — Heading hierarchy, alt text, landmarks
- `seo-check` — Title length, meta description, OG tags, canonical URLs
- `perf-check` — Bundle sizes, hydration directives
- `consistency-check` — File references exist, stat citations valid

### Model-Based Evals (Content PRs)

Triggered on PRs touching `src/content/**` or `src/pages/**`. The CI workflow auto-discovers all rubrics in `.Codex/evals/` — drop a new `.md` file there and it runs automatically.

Current rubrics:
- `brand-compliance` — Voice, terminology, value props, visual language (avg >= 4.0, none < 3)
- `content-quality` — Substance density, assertion titles, narrative flow, proof points (avg >= 4.0, substance >= 4)
- `voice-consistency` — Persona fit, voice stability, evidence appropriateness (avg >= 4.0, persona fit >= 4)
- `page-completeness` — Required sections, CTA placement, internal links (all pass)
- `seo` — Keyword integration, meta quality, structured data (avg >= 4.0)
- `accessibility` — Alt text quality, reading order, ARIA patterns (all pass)
