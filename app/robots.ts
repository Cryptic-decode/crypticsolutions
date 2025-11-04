import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutions.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ielts-manual'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/account-created', '/payment/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

