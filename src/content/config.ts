import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(20).max(500),
    author: z.string().min(1),
    publishedAt: z.coerce.date(),
    category: z.enum([
      'digital-marketing',
      'seo',
      'social-media',
      'workflow-optimization',
      'data-analytics',
      'brand-strategy',
      'paid-advertising',
      'creative-design',
      'ai',
      'marketing-strategy',
    ]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
})

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    category: z.string(),
    description: z.string(),
    date: z.string().optional(),
    duration: z.string().optional(),
    heroImage: z.string().optional(),
    logo: z.string().optional(),
    gallery: z.array(z.object({
      src: z.string().optional(),
      alt: z.string().default(''),
    })).default([]),
    relatedStudies: z.array(z.string()).default([]),
    order: z.number().default(0),
    seo: z.object({
      ogImage: z.string().optional(),
      canonical: z.string().url().optional(),
      noIndex: z.boolean().default(false),
    }).default({}),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog, 'case-studies': caseStudies }
