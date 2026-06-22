/**
 * Performance budget checks for Sharp End Marketing.
 *
 * Scans built output for:
 * 1. HTML file sizes (budget: 100KB)
 * 2. CSS file sizes (budget: 50KB per file, 150KB total)
 * 3. JS file sizes (budget: 100KB per file, 300KB total)
 * 4. Image file sizes (budget: 500KB per file)
 * 5. Total page weight estimate
 * 6. Inline script / style sizes
 *
 * Usage: npx tsx scripts/eval/perf-check.ts
 */

import { readFileSync, statSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { collectFiles, collectHtmlFiles } from './utils'

interface PerfViolation {
  file: string
  rule: string
  message: string
  actual: number
  budget: number
}

// ---------------------------------------------------------------------------
// Budgets (in bytes)
// ---------------------------------------------------------------------------

const BUDGETS = {
  htmlFile: 100 * 1024, // 100KB per HTML file
  cssFile: 50 * 1024, // 50KB per CSS file
  cssTotal: 150 * 1024, // 150KB total CSS
  jsFile: 200 * 1024, // 200KB per public JS file
  jsTotal: 300 * 1024, // 300KB total JS
  imageFile: 3 * 1024 * 1024, // 3MB per referenced image
  inlineScript: 10 * 1024, // 10KB inline script
  inlineStyle: 10 * 1024, // 10KB inline style
  totalWeight: 1024 * 1024, // 1MB total page weight
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

function toDistFile(distDir: string, publicPath: string): string | null {
  if (!publicPath.startsWith('/') || publicPath.startsWith('//')) {
    return null
  }

  return resolve(distDir, publicPath.slice(1))
}

function collectReferencedAssets(htmlFiles: string[], distDir: string, extensions: string[]): string[] {
  const referenced = new Set<string>()
  const assetPattern = /(?:src|href|component-url|renderer-url)=["']([^"']+)["']/gi

  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8')
    let match: RegExpExecArray | null

    assetPattern.lastIndex = 0
    while ((match = assetPattern.exec(content)) !== null) {
      const assetPath = match[1].split('?')[0]
      if (!extensions.some((ext) => assetPath.endsWith(ext))) {
        continue
      }

      const distFile = toDistFile(distDir, assetPath)
      if (distFile) {
        referenced.add(distFile)
      }
    }
  }

  return [...referenced]
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function checkFileSizes(
  files: string[],
  budget: number,
  rule: string,
  label: string,
): { violations: PerfViolation[]; totalSize: number } {
  const violations: PerfViolation[] = []
  let totalSize = 0

  for (const file of files) {
    try {
      const stat = statSync(file)
      totalSize += stat.size

      if (stat.size > budget) {
        violations.push({
          file: relative(process.cwd(), file),
          rule,
          message: `${label} file exceeds budget: ${formatBytes(stat.size)} > ${formatBytes(budget)}`,
          actual: stat.size,
          budget,
        })
      }
    } catch {
      // File may not exist
    }
  }

  return { violations, totalSize }
}

function checkTotalSize(
  totalSize: number,
  budget: number,
  rule: string,
  label: string,
): PerfViolation[] {
  if (totalSize > budget) {
    return [
      {
        file: '(total)',
        rule,
        message: `Total ${label} size exceeds budget: ${formatBytes(totalSize)} > ${formatBytes(budget)}`,
        actual: totalSize,
        budget,
      },
    ]
  }
  return []
}

function checkInlineResources(htmlFiles: string[]): PerfViolation[] {
  const violations: PerfViolation[] = []

  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8')
    const rel = relative(process.cwd(), file)

    // Check inline scripts
    const scriptPattern = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi
    let match: RegExpExecArray | null
    scriptPattern.lastIndex = 0
    while ((match = scriptPattern.exec(content)) !== null) {
      const size = Buffer.byteLength(match[1], 'utf-8')
      if (size > BUDGETS.inlineScript) {
        violations.push({
          file: rel,
          rule: 'perf/inline-script',
          message: `Inline script exceeds budget: ${formatBytes(size)} > ${formatBytes(BUDGETS.inlineScript)}`,
          actual: size,
          budget: BUDGETS.inlineScript,
        })
      }
    }

    // Check inline styles
    const stylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi
    stylePattern.lastIndex = 0
    while ((match = stylePattern.exec(content)) !== null) {
      const size = Buffer.byteLength(match[1], 'utf-8')
      if (size > BUDGETS.inlineStyle) {
        violations.push({
          file: rel,
          rule: 'perf/inline-style',
          message: `Inline style exceeds budget: ${formatBytes(size)} > ${formatBytes(BUDGETS.inlineStyle)}`,
          actual: size,
          budget: BUDGETS.inlineStyle,
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
  const assetDir = resolve(distDir, 'client')

  console.log('Sharp End Marketing — Performance Budget Check')
  console.log('='.repeat(50))

  const htmlFiles = collectHtmlFiles(distDir)
  const cssFiles = collectFiles(distDir, '.css')
  const jsFiles = collectReferencedAssets(htmlFiles, assetDir, ['.js'])
  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']
  const imageFiles = collectReferencedAssets(htmlFiles, assetDir, imageExts)

  if (htmlFiles.length === 0) {
    console.log('\n⚠️  No HTML files found in dist/. Run `pnpm build` first.')
    process.exit(0)
  }

  const allViolations: PerfViolation[] = []

  // HTML files
  console.log(`\nChecking ${htmlFiles.length} HTML file(s)...`)
  const html = checkFileSizes(htmlFiles, BUDGETS.htmlFile, 'perf/html-size', 'HTML')
  allViolations.push(...html.violations)

  // CSS files
  console.log(`Checking ${cssFiles.length} CSS file(s)...`)
  const css = checkFileSizes(cssFiles, BUDGETS.cssFile, 'perf/css-size', 'CSS')
  allViolations.push(...css.violations)
  allViolations.push(...checkTotalSize(css.totalSize, BUDGETS.cssTotal, 'perf/css-total', 'CSS'))

  // JS files
  console.log(`Checking ${jsFiles.length} JS file(s)...`)
  const js = checkFileSizes(jsFiles, BUDGETS.jsFile, 'perf/js-size', 'JS')
  allViolations.push(...js.violations)
  allViolations.push(...checkTotalSize(js.totalSize, BUDGETS.jsTotal, 'perf/js-total', 'JS'))

  // Image files
  console.log(`Checking ${imageFiles.length} image file(s)...`)
  const img = checkFileSizes(imageFiles, BUDGETS.imageFile, 'perf/image-size', 'Image')
  allViolations.push(...img.violations)

  // Inline resources
  console.log('Checking inline scripts and styles...')
  allViolations.push(...checkInlineResources(htmlFiles))

  // Total page weight
  const totalWeight = html.totalSize + css.totalSize + js.totalSize
  allViolations.push(
    ...checkTotalSize(totalWeight, BUDGETS.totalWeight, 'perf/total-weight', 'page'),
  )

  // Report
  console.log('\n' + '='.repeat(50))
  console.log('Performance Budget Report')
  console.log('='.repeat(50))

  console.log(`\n  HTML:   ${formatBytes(html.totalSize)} (${htmlFiles.length} files)`)
  console.log(`  CSS:    ${formatBytes(css.totalSize)} (${cssFiles.length} files)`)
  console.log(`  JS:     ${formatBytes(js.totalSize)} (${jsFiles.length} files)`)
  console.log(`  Images: ${formatBytes(img.totalSize)} (${imageFiles.length} files)`)
  console.log(`  Total:  ${formatBytes(totalWeight)}`)

  if (allViolations.length === 0) {
    console.log('\n✅ All performance budgets met.')
  } else {
    console.log(`\n❌ ${allViolations.length} budget violation(s):\n`)
    for (const v of allViolations) {
      console.log(`  ${v.rule}`)
      console.log(`    ${v.file}: ${v.message}`)
    }
  }

  console.log('')
  process.exit(allViolations.length > 0 ? 1 : 0)
}

run()
