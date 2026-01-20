-- Create SEO pages table
CREATE TABLE public.seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_path TEXT NOT NULL UNIQUE,
  page_key TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SEO meta table
CREATE TABLE public.seo_meta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.seo_pages(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT,
  canonical_url TEXT,
  robots TEXT NOT NULL DEFAULT 'index,follow',
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT NOT NULL DEFAULT 'website',
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schema_jsonld JSONB,
  is_published BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_id, locale)
);

-- Enable RLS
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_meta ENABLE ROW LEVEL SECURITY;

-- Public read access for published SEO meta
CREATE POLICY "Anyone can read seo_pages"
ON public.seo_pages FOR SELECT
USING (true);

CREATE POLICY "Anyone can read published seo_meta"
ON public.seo_meta FOR SELECT
USING (is_published = true);

-- Admin/Owner can manage SEO (check tenant membership with admin role)
CREATE POLICY "Admins can insert seo_pages"
ON public.seo_pages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can update seo_pages"
ON public.seo_pages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can delete seo_pages"
ON public.seo_pages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can read all seo_meta"
ON public.seo_meta FOR SELECT
USING (
  is_published = true OR
  EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can insert seo_meta"
ON public.seo_meta FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can update seo_meta"
ON public.seo_meta FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can delete seo_meta"
ON public.seo_meta FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_meta_updated_at
  BEFORE UPDATE ON public.seo_meta
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial pages
INSERT INTO public.seo_pages (route_path, page_key, page_name, is_public) VALUES
('/', 'home', 'Home', true),
('/about', 'about', 'About', true),
('/pricing', 'pricing', 'Pricing', true),
('/integrations', 'integrations', 'Integrations', true),
('/whatsapp-business-api', 'whatsapp-business-api', 'WhatsApp Business API', true),
('/click-to-whatsapp', 'click-to-whatsapp', 'Click to WhatsApp', true),
('/why-whatsapp-marketing', 'why-whatsapp-marketing', 'Why WhatsApp Marketing', true),
('/whatsapp-forms', 'whatsapp-forms', 'WhatsApp Forms', true),
('/case-studies', 'case-studies', 'Case Studies', true),
('/privacy-policy', 'privacy-policy', 'Privacy Policy', true),
('/terms', 'terms', 'Terms & Conditions', true),
('/refund-policy', 'refund-policy', 'Refund Policy', true),
('/blog', 'blog', 'Blog', true),
('/contact', 'contact', 'Contact', true),
('/features', 'features', 'Features', true),
('/login', 'login', 'Login', false),
('/signup', 'signup', 'Signup', false),
('/select-workspace', 'select-workspace', 'Select Workspace', false),
('/dashboard', 'dashboard', 'Dashboard', false);

-- Seed default SEO meta for each page
INSERT INTO public.seo_meta (page_id, title, description, keywords, robots, og_type, schema_jsonld)
SELECT 
  id,
  CASE page_key
    WHEN 'home' THEN 'AiReatro - AI-Powered WhatsApp Business Platform'
    WHEN 'about' THEN 'About AiReatro - Our Mission & Team'
    WHEN 'pricing' THEN 'Pricing Plans - AiReatro WhatsApp Platform'
    WHEN 'integrations' THEN 'Integrations - Connect Your Tools with AiReatro'
    WHEN 'whatsapp-business-api' THEN 'WhatsApp Business API - Official Meta Partner'
    WHEN 'click-to-whatsapp' THEN 'Click to WhatsApp Ads - Meta Ads Integration'
    WHEN 'why-whatsapp-marketing' THEN 'Why WhatsApp Marketing - Benefits & ROI'
    WHEN 'whatsapp-forms' THEN 'WhatsApp Forms - Collect Data via Chat'
    WHEN 'case-studies' THEN 'Customer Success Stories - AiReatro Case Studies'
    WHEN 'privacy-policy' THEN 'Privacy Policy - AiReatro'
    WHEN 'terms' THEN 'Terms & Conditions - AiReatro'
    WHEN 'refund-policy' THEN 'Refund Policy - AiReatro'
    WHEN 'blog' THEN 'Blog - WhatsApp Marketing Insights'
    WHEN 'contact' THEN 'Contact Us - Get in Touch with AiReatro'
    WHEN 'features' THEN 'Features - AiReatro Platform Capabilities'
    WHEN 'login' THEN 'Login - AiReatro'
    WHEN 'signup' THEN 'Sign Up - Get Started with AiReatro'
    WHEN 'select-workspace' THEN 'Select Workspace - AiReatro'
    WHEN 'dashboard' THEN 'Dashboard - AiReatro'
    ELSE page_name || ' - AiReatro'
  END,
  CASE page_key
    WHEN 'home' THEN 'Transform customer engagement with AI-powered WhatsApp automation. Team inbox, flow diagnostics, Meta Ads attribution, and more.'
    WHEN 'about' THEN 'Learn about AiReatro''s mission to revolutionize business communication through WhatsApp automation and AI.'
    WHEN 'pricing' THEN 'Flexible pricing plans for businesses of all sizes. Start free, scale as you grow.'
    WHEN 'integrations' THEN 'Connect AiReatro with your CRM, e-commerce, and payment tools. 50+ integrations available.'
    WHEN 'whatsapp-business-api' THEN 'Official WhatsApp Business API access through Meta partnership. Get started in minutes.'
    WHEN 'click-to-whatsapp' THEN 'Drive conversions with Click to WhatsApp ads. Full attribution and automation.'
    WHEN 'why-whatsapp-marketing' THEN 'Discover why WhatsApp marketing delivers 98% open rates and 45% response rates.'
    WHEN 'whatsapp-forms' THEN 'Collect customer data through conversational WhatsApp forms. Higher completion rates.'
    WHEN 'case-studies' THEN 'See how businesses achieve 3x ROI with AiReatro WhatsApp automation.'
    WHEN 'privacy-policy' THEN 'AiReatro privacy policy. How we collect, use, and protect your data.'
    WHEN 'terms' THEN 'Terms and conditions for using AiReatro services.'
    WHEN 'refund-policy' THEN 'AiReatro refund and cancellation policy.'
    WHEN 'blog' THEN 'Latest insights on WhatsApp marketing, automation, and customer engagement.'
    WHEN 'contact' THEN 'Get in touch with our team for sales, support, or partnerships.'
    WHEN 'features' THEN 'Explore AiReatro platform features: inbox, automation, campaigns, analytics, and more.'
    ELSE 'AiReatro - AI-powered WhatsApp Business Platform'
  END,
  'WhatsApp API, WhatsApp automation, WhatsApp CRM, WhatsApp chatbot, WhatsApp marketing, business messaging',
  CASE WHEN is_public THEN 'index,follow' ELSE 'noindex,nofollow' END,
  'website',
  CASE page_key
    WHEN 'home' THEN '{"@context":"https://schema.org","@type":"WebSite","name":"AiReatro","url":"https://aireatro.com"}'::jsonb
    WHEN 'about' THEN '{"@context":"https://schema.org","@type":"AboutPage","name":"About AiReatro"}'::jsonb
    WHEN 'pricing' THEN '{"@context":"https://schema.org","@type":"Product","name":"AiReatro Platform"}'::jsonb
    ELSE '{"@context":"https://schema.org","@type":"WebPage"}'::jsonb
  END
FROM public.seo_pages;