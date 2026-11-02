import type { MetadataRoute } from 'next'
import { PROFILE } from '@/lib/cv'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/projects', '/cv'].map((path) => ({ url: `${PROFILE.site}${path}` }))
}
