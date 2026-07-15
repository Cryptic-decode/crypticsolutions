import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutionsltd.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ielts-manual', '/prompt-engineering-ebook'],
        disallow: ['/dashboard/', '/api/', '/signin', '/account-created', '/payment/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

