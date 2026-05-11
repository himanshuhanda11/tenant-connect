import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  children?: React.ReactNode;
}

const BASE_URL = 'https://aireatro.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'AiReatro Communications';

export default function SEO({
  title,
  description,
  keywords = [],
  canonical,
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  children,
}: SEOProps) {
  const fullTitle = title.includes('AiReatro') ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  const defaultKeywords = [
    'WhatsApp API',
    'WhatsApp Cloud API',
    'WhatsApp automation',
    'WhatsApp CRM',
    'WhatsApp chatbot',
    'WhatsApp marketing',
    'business messaging',
    'team inbox',
    'Meta Ads WhatsApp',
  ];

  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content="AiReatro Communications" />
      <meta name="application-name" content={SITE_NAME} />

      {/* Robots */}
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow'}
      />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@AiReatro" />
      <meta name="twitter:creator" content="@AiReatro" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#25D366" />

      {/* Google Search Console Verification (placeholder) */}
      <meta name="google-site-verification" content="g_i2WRtDrHOqK6Eow_8u5M4Mna79p6wH9wpcPztgN9I" />

      {children}
    </Helmet>
  );
}
