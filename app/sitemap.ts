import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/projects', '/cv'].map((path) => ({ url: `https://cillian.dev${path}` }))
}
