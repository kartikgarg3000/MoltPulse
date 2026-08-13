import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://molt-pulse.com';
  
  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/playbooks`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
