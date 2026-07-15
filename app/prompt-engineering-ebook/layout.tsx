import { Metadata } from 'next';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/structured-data';

export const metadata: Metadata = {
  title: "Talk to AI like a Pro - Master AI Communication",
  description: "Learn how to write effective AI prompts that actually work. Master prompt engineering with our comprehensive ebook covering structure, templates, and common pitfalls. Transform your AI interactions and get better results.",
  keywords: [
    "prompt engineering",
    "AI prompts",
    "ChatGPT prompts",
    "AI communication",
    "prompt templates",
    "AI best practices",
    "effective prompts",
    "AI writing",
    "prompt structure",
    "AI productivity",
    "artificial intelligence",
    "machine learning prompts"
  ],
  openGraph: {
    title: "Talk to AI like a Pro",
    description: "Learn how to write effective AI prompts that actually work. Master prompt engineering with proven templates and strategies.",
    type: "website",
    url: "/prompt-engineering-ebook",
    images: [
      {
        url: '/cryptic-assets/logoIconGreen.png',
        width: 1200,
        height: 630,
        alt: 'Prompt Engineering Ebook by Cryptic Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Talk to AI like a Pro",
    description: "Learn how to write effective AI prompts that actually work.",
    images: ['/cryptic-assets/logoIconGreen.png'],
  },
  alternates: {
    canonical: "/prompt-engineering-ebook",
  },
};

export default function PromptEngineeringEbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crypticsolutions.com';
  
  return (
    <>
      <ProductSchema
        name="Talk to AI like a Pro"
        description="Comprehensive guide to writing effective AI prompts. Learn the structure, templates, and strategies that actually work."
        price="2000"
        currency="NGN"
        url={`${baseUrl}/prompt-engineering-ebook`}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Prompt Engineering Ebook', url: `${baseUrl}/prompt-engineering-ebook` },
        ]}
      />
      {children}
    </>
  );
}
