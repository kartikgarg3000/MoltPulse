import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MoltPulse | Real-time AI Agent Map',
    short_name: 'MoltPulse',
    description: 'The Bloomberg for AI Agents. Discover, track, and rank the top autonomous agents, dev frameworks, and AI tools with real-time Pulse Scores.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
