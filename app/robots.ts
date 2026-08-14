import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-portal-secret/'],
    },
    sitemap: 'https://www.molt-pulse.com/sitemap.xml',
  };
}
