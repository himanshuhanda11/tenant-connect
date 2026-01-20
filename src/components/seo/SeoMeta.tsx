import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SeoMetaData {
  title: string;
  description: string | null;
  keywords: string | null;
  canonical_url: string | null;
  robots: string;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string;
  twitter_card: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  schema_jsonld: object | null;
}

interface SeoMetaProps {
  route: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

const BASE_URL = 'https://aireatro.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'AiReatro Communications';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// In-memory cache
const seoCache: Map<string, { data: SeoMetaData; timestamp: number }> = new Map();

export default function SeoMeta({ route, fallbackTitle, fallbackDescription }: SeoMetaProps) {
  const [meta, setMeta] = useState<SeoMetaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      // Check in-memory cache first
      const cached = seoCache.get(route);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setMeta(cached.data);
        setLoading(false);
        return;
      }

      // Check localStorage cache
      try {
        const localCached = localStorage.getItem(`seo_${route}`);
        if (localCached) {
          const parsed = JSON.parse(localCached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setMeta(parsed.data);
            seoCache.set(route, parsed);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // localStorage not available
      }

      // Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('seo_meta')
          .select(`
            title,
            description,
            keywords,
            canonical_url,
            robots,
            og_title,
            og_description,
            og_image,
            og_type,
            twitter_card,
            twitter_title,
            twitter_description,
            twitter_image,
            schema_jsonld,
            seo_pages!inner(route_path)
          `)
          .eq('seo_pages.route_path', route)
          .eq('is_published', true)
          .eq('locale', 'en')
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        const metaData: SeoMetaData = {
          title: data.title,
          description: data.description,
          keywords: data.keywords,
          canonical_url: data.canonical_url,
          robots: data.robots,
          og_title: data.og_title,
          og_description: data.og_description,
          og_image: data.og_image,
          og_type: data.og_type,
          twitter_card: data.twitter_card,
          twitter_title: data.twitter_title,
          twitter_description: data.twitter_description,
          twitter_image: data.twitter_image,
          schema_jsonld: data.schema_jsonld as object | null,
        };

        // Update caches
        const cacheEntry = { data: metaData, timestamp: Date.now() };
        seoCache.set(route, cacheEntry);
        try {
          localStorage.setItem(`seo_${route}`, JSON.stringify(cacheEntry));
        } catch (e) {
          // localStorage not available
        }

        setMeta(metaData);
      } catch (err) {
        console.error('Failed to fetch SEO meta:', err);
      }
      setLoading(false);
    };

    fetchMeta();
  }, [route]);

  // Use fallbacks if no meta or still loading
  const title = meta?.title || fallbackTitle || `${SITE_NAME}`;
  const description = meta?.description || fallbackDescription || 'AI-powered WhatsApp automation platform';
  const fullTitle = title.includes('AiReatro') ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = meta?.canonical_url || `${BASE_URL}${route}`;
  const robots = meta?.robots || 'index,follow';
  const ogTitle = meta?.og_title || fullTitle;
  const ogDescription = meta?.og_description || description;
  const ogImage = meta?.og_image || DEFAULT_OG_IMAGE;
  const ogType = meta?.og_type || 'website';
  const twitterCard = meta?.twitter_card || 'summary_large_image';
  const twitterTitle = meta?.twitter_title || fullTitle;
  const twitterDescription = meta?.twitter_description || description;
  const twitterImage = meta?.twitter_image || ogImage;

  const defaultKeywords = [
    'WhatsApp API',
    'WhatsApp Cloud API',
    'WhatsApp automation',
    'WhatsApp CRM',
    'WhatsApp chatbot',
    'WhatsApp marketing',
  ];

  const keywords = meta?.keywords || defaultKeywords.join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="AiReatro Communications" />
      <meta name="application-name" content={SITE_NAME} />

      {/* Robots */}
      <meta name="robots" content={robots} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@AiReatro" />
      <meta name="twitter:creator" content="@AiReatro" />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />

      {/* Additional Meta */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#25D366" />

      {/* JSON-LD Schema */}
      {meta?.schema_jsonld && (
        <script type="application/ld+json">
          {JSON.stringify(meta.schema_jsonld)}
        </script>
      )}
    </Helmet>
  );
}

// Helper to clear SEO cache (useful after updates in dashboard)
export function clearSeoCache(route?: string) {
  if (route) {
    seoCache.delete(route);
    try {
      localStorage.removeItem(`seo_${route}`);
    } catch (e) {}
  } else {
    seoCache.clear();
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('seo_'));
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }
}
