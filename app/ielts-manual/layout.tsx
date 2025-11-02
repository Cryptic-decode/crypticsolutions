import { Metadata } from 'next';
import { ProductSchema, EducationalSchema, BreadcrumbSchema } from '@/components/seo/structured-data';

export const metadata: Metadata = {
  title: "IELTS Preparation Manual - Comprehensive Study Guide",
  description: "Master IELTS with our comprehensive preparation manual. Complete study guide covering all 4 modules: Listening, Reading, Writing, and Speaking. Proven strategies, practice materials, and expert tips for band 7+ scores.",
  keywords: [
    "IELTS preparation",
    "IELTS manual",
    "IELTS study guide",
    "IELTS band 7",
    "IELTS listening",
    "IELTS reading",
    "IELTS writing",
    "IELTS speaking",
    "IELTS practice test",
    "IELTS exam tips",
    "IELTS online course",
    "English language test",
    "study abroad preparation"
  ],
  openGraph: {
    title: "IELTS Preparation Manual - Your Path to Band 7+",
    description: "Comprehensive IELTS preparation manual with proven strategies, practice materials, and expert guidance. Master all 4 modules and achieve your target score.",
    type: "website",
    url: "/ielts-manual",
    images: [
      {
        url: '/cryptic-assets/logoIconGreen.png',
        width: 1200,
        height: 630,
        alt: 'IELTS Preparation Manual by Cryptic Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "IELTS Preparation Manual - Your Path to Band 7+",
    description: "Comprehensive IELTS preparation manual with proven strategies and expert guidance.",
    images: ['/cryptic-assets/logoIconGreen.png'],
  },
  alternates: {
    canonical: "/ielts-manual",
  },
};

export default function IELTSManualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutions.com';
  
  return (
    <>
      <ProductSchema
        name="IELTS Preparation Manual"
        description="Comprehensive IELTS preparation manual with proven strategies, practice materials, and expert guidance for all 4 modules"
        price="5000"
        currency="NGN"
        url={`${baseUrl}/ielts-manual`}
      />
      <EducationalSchema
        name="IELTS Preparation Manual"
        description="Complete study guide for IELTS exam preparation covering Listening, Reading, Writing, and Speaking modules"
        url={`${baseUrl}/ielts-manual`}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'IELTS Manual', url: `${baseUrl}/ielts-manual` },
        ]}
      />
      {children}
    </>
  );
}

