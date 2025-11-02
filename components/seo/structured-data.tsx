import Script from 'next/script';

interface OrganizationSchemaProps {
  url: string;
}

export function OrganizationSchema({ url }: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cryptic Solutions',
    description: 'Premium digital products and educational resources',
    url: url,
    logo: `${url}/cryptic-assets/logoIconGreen.png`,
    sameAs: [
      // Add your social media URLs here
      'https://twitter.com/crypticsolutions',
      'https://linkedin.com/company/crypticsolutions',
      'https://facebook.com/crypticsolutions',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'crypticsolutions.contact@gmail.com',
      contactType: 'Customer Service',
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  price: string;
  currency: string;
  url: string;
}

export function ProductSchema({ name, description, price, currency, url }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: description,
    image: `${url}/cryptic-assets/logoIconGreen.png`,
    brand: {
      '@type': 'Brand',
      name: 'Cryptic Solutions',
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: url,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '250',
    },
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface EducationalSchemaProps {
  name: string;
  description: string;
  url: string;
}

export function EducationalSchema({ name, description, url }: EducationalSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: name,
    description: description,
    provider: {
      '@type': 'Organization',
      name: 'Cryptic Solutions',
      sameAs: url,
    },
    educationalLevel: 'Advanced',
    teaches: 'IELTS preparation and exam strategies',
  };

  return (
    <Script
      id="educational-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

