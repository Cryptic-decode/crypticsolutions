import { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/seo/structured-data';

const path = '/from-kitchen-to-cash';

export const metadata: Metadata = {
  title: 'From Kitchen to Cash — Catering Ebook',
  description:
    'Two-part ebook for Nigerian entrepreneurs and caterers-in-the-making: foundations, mindset, pitfalls, costing, menus, templates, and practical exercises—with takeaway packs.',
  keywords: [
    'catering business Nigeria',
    'catering ebook',
    'recipe costing',
    'catering menu pricing',
    'food business fundamentals',
    'Lydei',
    'from kitchen to cash',
  ],
  openGraph: {
    title: 'From Kitchen to Cash — Catering Ebook',
    description:
      'Mindset before math. Foundations, pitfalls, costing, menus, and printable templates—from Lydeis Bakes × Cryptic Solutions.',
    type: 'website',
    url: path,
    images: [
      {
        url: '/LydeisLogo.jpg',
        width: 1200,
        height: 630,
        alt: 'Lydeis Bakes — From Kitchen to Cash',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'From Kitchen to Cash — Catering Ebook',
    description:
      'Foundations before menu magic: pitfalls, costing, menus, exercises, and takeaway packs.',
    images: ['/LydeisLogo.jpg'],
  },
  alternates: {
    canonical: path,
  },
};

export default function FromKitchenToCashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutions.com';
  const pageUrl = `${baseUrl}${path}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'From Kitchen to Cash', url: pageUrl },
        ]}
      />
      {children}
    </>
  );
}
