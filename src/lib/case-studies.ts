type GalleryItem = {
  src?: string
  alt?: string
}

type CaseStudyData = {
  title: string
  client: string
  category: string
  description: string
  date?: string
  duration?: string
  heroImage?: string
  logo?: string
  gallery?: GalleryItem[]
  relatedStudies?: string[]
  order?: number
  draft?: boolean
}

const caseStudyMediaDefaults: Record<string, Pick<CaseStudyData, 'heroImage' | 'logo' | 'gallery'>> = {
  'jack-storms': {
    heroImage: 'jack-storms.jpg',
    logo: 'jack-storms-logo.png',
    gallery: [
      { src: 'jack-storms/gallery-1.png', alt: 'Jack Storms glass sculpture' },
      { src: 'jack-storms/gallery-2.png', alt: 'Jack Storms artwork' },
      { src: 'jack-storms/gallery-3.jpg', alt: 'Jack Storms cold glass technique' },
      { src: 'jack-storms/gallery-4.jpg', alt: 'Jack Storms sculpture detail' },
      { src: 'jack-storms/gallery-5.jpg', alt: 'Jack Storms art collection' },
    ],
  },
}

export function toCaseStudySlug(id: string) {
  return id.replace(/\/index\.(mdoc|mdx|md)$/, '').replace(/\.(mdoc|mdx|md)$/, '').replace(/\.md$/, '')
}

export function caseStudyImagePath(filename?: string) {
  return filename ? `/images/case-studies/${filename}` : undefined
}

export function normalizeCaseStudyData(id: string, data: CaseStudyData): CaseStudyData {
  const slug = toCaseStudySlug(id)
  const defaults = caseStudyMediaDefaults[slug]
  const gallery = (data.gallery ?? []).map((item, index) => ({
    src: item.src ?? defaults?.gallery?.[index]?.src,
    alt: item.alt || defaults?.gallery?.[index]?.alt || '',
  }))

  return {
    ...data,
    heroImage: data.heroImage ?? defaults?.heroImage,
    logo: data.logo ?? defaults?.logo,
    gallery,
  }
}
