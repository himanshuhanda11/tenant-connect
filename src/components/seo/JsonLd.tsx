import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data];
  
  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
}

// Organization Schema - use on all pages
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AiReatro Communications',
  url: 'https://aireatro.com',
  logo: 'https://aireatro.com/favicon.png',
  description: 'AI-powered WhatsApp automation platform with team inbox, flow diagnostics, and Meta Ads attribution.',
  email: 'support@aireatro.com',
  sameAs: [
    'https://twitter.com/AiReatro',
    'https://linkedin.com/company/aireatro',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@aireatro.com',
  },
};

// WebSite Schema - use on homepage
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AiReatro Communications',
  url: 'https://aireatro.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://aireatro.com/help?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

// SoftwareApplication Schema - use on homepage and pricing
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AiReatro Communications',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://aireatro.com',
  description: 'AI-powered WhatsApp automation platform with team inbox, flow diagnostics, and Meta Ads attribution.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free trial available',
    url: 'https://aireatro.com/pricing',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '128',
    bestRating: '5',
    worstRating: '1',
  },
  brand: {
    '@type': 'Brand',
    name: 'AiReatro',
  },
};

// About Page Schema
export const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About AiReatro Communications',
  description: 'Learn about AiReatro Communications - AI-powered WhatsApp automation platform.',
  url: 'https://aireatro.com/about',
  mainEntity: organizationSchema,
};

// Pricing/Product Schema Generator
export function createPricingSchema(plans: Array<{
  name: string;
  price: number;
  description: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'AiReatro Communications Platform',
    description: 'AI-powered WhatsApp automation, team inbox, and Meta Ads attribution platform.',
    brand: {
      '@type': 'Brand',
      name: 'AiReatro',
    },
    offers: plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      price: plan.price,
      priceCurrency: 'USD',
      description: plan.description,
      url: 'https://aireatro.com/pricing',
      availability: 'https://schema.org/InStock',
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

// ItemList Schema for Integrations
export function createIntegrationsListSchema(integrations: Array<{
  name: string;
  description: string;
  url: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AiReatro Integrations',
    description: 'Connect AiReatro with your favorite tools and platforms.',
    itemListElement: integrations.map((integration, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: integration.name,
        description: integration.description,
        url: integration.url,
      },
    })),
  };
}

// FAQ Schema Generator
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Breadcrumb Schema Generator
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://aireatro.com${item.url}`,
    })),
  };
}
