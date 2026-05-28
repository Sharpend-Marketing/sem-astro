/**
 * Brand consistency checks for Sharp End Marketing.
 *
 * Scans built HTML and source files for:
 * 1. Non-brand font declarations (should use Inter or Comfortaa)
 * 2. Arbitrary hex color values (should use design tokens)
 * 3. Raw <img> tags (should use Astro <Image /> or <Picture />)
 *
 * Usage: npx tsx scripts/eval/brand-check.ts
 */

import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { collectFiles, collectHtmlFiles } from './utils'

interface BrandViolation {
  file: string
  line: number
  rule: string
  message: string
  snippet: string
}

// ---------------------------------------------------------------------------
// Font usage check
// ---------------------------------------------------------------------------

function checkFontUsage(files: string[]): BrandViolation[] {
  const violations: BrandViolation[] = []
  const allowedFonts = [
    'Inter',
    'Inter Variable',
    'Comfortaa',
    'ui-sans-serif',
    'system-ui',
    'cursive',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ]
  const fontFamilyPattern = /font-family\s*:\s*([^;}"]+)/gi

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let match: RegExpExecArray | null

      fontFamilyPattern.lastIndex = 0
      while ((match = fontFamilyPattern.exec(line)) !== null) {
        const fontValue = match[1].trim()
        if (fontValue.includes('var(')) {
          continue
        }

        // Check if the font value contains only allowed fonts
        const fonts = fontValue.split(',').map((f) => f.trim().replace(/['"]/g, ''))
        const hasDisallowedFont = fonts.some(
          (f) =>
            f !== 'inherit' &&
            f !== 'initial' &&
            !f.startsWith('var(') &&
            !allowedFonts.some((allowed) => f.toLowerCase() === allowed.toLowerCase()),
        )

        if (hasDisallowedFont) {
          violations.push({
            file: relative(process.cwd(), file),
            line: i + 1,
            rule: 'brand/font',
            message: 'Use Inter or Comfortaa (Sharp End Marketing brand fonts)',
            snippet: line.trim().slice(0, 120),
          })
        }
      }
    }
  }

  // Also check for arbitrary font-[] utilities in Tailwind source
  const srcFiles = [
    ...collectFiles(resolve(process.cwd(), 'src'), '.astro'),
    ...collectFiles(resolve(process.cwd(), 'src'), '.tsx'),
    ...collectFiles(resolve(process.cwd(), 'src'), '.jsx'),
  ]

  for (const file of srcFiles) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (/font-\[['"]?[A-Z]/.test(line)) {
        violations.push({
          file: relative(process.cwd(), file),
          line: i + 1,
          rule: 'brand/font-utility',
          message:
            'Use font-heading, font-body, or font-accent utility classes instead of arbitrary font values',
          snippet: line.trim().slice(0, 120),
        })
      }
    }
  }

  return violations
}

// ---------------------------------------------------------------------------
// Arbitrary hex color check
// ---------------------------------------------------------------------------

function checkArbitraryHexColors(files: string[]): BrandViolation[] {
  const violations: BrandViolation[] = []
  // Match Tailwind arbitrary color values like bg-[#abc123], text-[#fff]
  const arbitraryHexPattern = /(?:bg|text|border|ring|shadow|outline|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let match: RegExpExecArray | null

      arbitraryHexPattern.lastIndex = 0
      while ((match = arbitraryHexPattern.exec(line)) !== null) {
        violations.push({
          file: relative(process.cwd(), file),
          line: i + 1,
          rule: 'brand/arbitrary-color',
          message: 'Use design token color classes instead of arbitrary hex values',
          snippet: line.trim().slice(0, 120),
        })
      }
    }
  }

  return violations
}

// ---------------------------------------------------------------------------
// Raw <img> tag check
// ---------------------------------------------------------------------------

function checkRawImgTags(files: string[]): BrandViolation[] {
  const violations: BrandViolation[] = []
  const imgTagPattern = /<img\s/gi

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      imgTagPattern.lastIndex = 0
      if (imgTagPattern.test(line)) {
        // Ignore lines that are clearly in code blocks or comments
        const trimmed = line.trim()
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) {
          continue
        }

        violations.push({
          file: relative(process.cwd(), file),
          line: i + 1,
          rule: 'brand/raw-img',
          message:
            'Use Astro <Image /> or <Picture /> component instead of raw <img> for optimized images',
          snippet: line.trim().slice(0, 120),
        })
      }
    }
  }

  return violations
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function run(): void {
  const root = resolve(process.cwd())
  const distDir = resolve(root, 'dist')

  console.log('Sharp End Marketing — Brand Consistency Check')
  console.log('='.repeat(50))

  // Collect files to check
  const htmlFiles = collectHtmlFiles(distDir)
  const cssFiles = collectFiles(distDir, '.css')
  const styleFiles = [
    ...cssFiles,
    ...collectFiles(resolve(root, 'src'), '.css'),
  ]
  const sourceFiles = [
    ...collectFiles(resolve(root, 'src'), '.astro'),
    ...collectFiles(resolve(root, 'src'), '.tsx'),
    ...collectFiles(resolve(root, 'src'), '.jsx'),
  ]

  const allViolations: BrandViolation[] = []

  // Run checks
  console.log(`\nChecking fonts in ${styleFiles.length} style file(s)...`)
  allViolations.push(...checkFontUsage(styleFiles))

  console.log(`Checking arbitrary colors in ${sourceFiles.length} source file(s)...`)
  allViolations.push(...checkArbitraryHexColors(sourceFiles))

  console.log(`Checking raw <img> tags in ${sourceFiles.length} source file(s)...`)
  allViolations.push(...checkRawImgTags(sourceFiles))

  // Report
  console.log('\n' + '='.repeat(50))
  console.log('Brand Check Report')
  console.log('='.repeat(50))

  if (allViolations.length === 0) {
    console.log('\n✅ No brand violations found.')
  } else {
    console.log(`\n❌ ${allViolations.length} violation(s) found:\n`)

    // Group by rule
    const byRule = new Map<string, BrandViolation[]>()
    for (const v of allViolations) {
      const existing = byRule.get(v.rule) || []
      existing.push(v)
      byRule.set(v.rule, existing)
    }

    for (const [rule, violations] of byRule) {
      console.log(`\n  ${rule} (${violations.length})`)
      for (const v of violations) {
        console.log(`    ${v.file}:${v.line}`)
        console.log(`      ${v.message}`)
        console.log(`      > ${v.snippet}`)
      }
    }
  }

  console.log('')
  process.exit(allViolations.length > 0 ? 1 : 0)
}

run()
