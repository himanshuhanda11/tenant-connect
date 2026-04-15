
-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE,
  excerpt TEXT DEFAULT '',
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured_image TEXT,
  image_alt TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  author TEXT DEFAULT 'AiReatro Team',
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  schema_jsonld JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_library table
CREATE TABLE public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT DEFAULT 'image',
  file_size INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  alt_text TEXT DEFAULT '',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_blogs_slug ON public.blogs(slug);
CREATE INDEX idx_blogs_status ON public.blogs(status);
CREATE INDEX idx_blogs_category ON public.blogs(category);
CREATE INDEX idx_blogs_published_at ON public.blogs(published_at DESC);
CREATE INDEX idx_media_library_file_type ON public.media_library(file_type);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Blogs policies
CREATE POLICY "Anyone can read published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Platform admins can manage all blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin', 'support']))
  WITH CHECK (public.is_platform_user(ARRAY['super_admin', 'support']));

-- Media library policies
CREATE POLICY "Authenticated users can view media"
  ON public.media_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Platform admins can manage media"
  ON public.media_library FOR ALL
  TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin', 'support']))
  WITH CHECK (public.is_platform_user(ARRAY['super_admin', 'support']));

-- Updated_at trigger
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for blog media
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-media', 'blog-media', true);

CREATE POLICY "Anyone can view blog media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-media');

CREATE POLICY "Admins can upload blog media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-media' AND public.is_platform_user(ARRAY['super_admin', 'support']));

CREATE POLICY "Admins can delete blog media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-media' AND public.is_platform_user(ARRAY['super_admin', 'support']));
