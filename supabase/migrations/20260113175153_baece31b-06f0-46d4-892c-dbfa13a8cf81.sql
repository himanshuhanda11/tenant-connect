-- Create guide_categories table
CREATE TABLE public.guide_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guides table
CREATE TABLE public.guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.guide_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL,
  sidebar_key TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  reading_time_minutes INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guide_sections table for structured content
CREATE TABLE public.guide_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('what_is', 'when_to_use', 'how_it_works', 'example', 'common_mistakes', 'tips', 'steps')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guide_examples table for code/message examples
CREATE TABLE public.guide_examples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT,
  language TEXT DEFAULT 'text',
  is_good_example BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guide_relations table for related guides
CREATE TABLE public.guide_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  related_guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'related',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guide_id, related_guide_id)
);

-- Enable RLS
ALTER TABLE public.guide_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_relations ENABLE ROW LEVEL SECURITY;

-- Public read access policies (guides are public content)
CREATE POLICY "Guide categories are viewable by everyone" 
ON public.guide_categories FOR SELECT USING (true);

CREATE POLICY "Published guides are viewable by everyone" 
ON public.guides FOR SELECT USING (is_published = true);

CREATE POLICY "Guide sections are viewable for published guides" 
ON public.guide_sections FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.guides WHERE id = guide_id AND is_published = true));

CREATE POLICY "Guide examples are viewable for published guides" 
ON public.guide_examples FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.guides WHERE id = guide_id AND is_published = true));

CREATE POLICY "Guide relations are viewable for published guides" 
ON public.guide_relations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.guides WHERE id = guide_id AND is_published = true));

-- Create indexes
CREATE INDEX idx_guides_category ON public.guides(category_id);
CREATE INDEX idx_guides_sidebar_key ON public.guides(sidebar_key);
CREATE INDEX idx_guides_slug ON public.guides(slug);
CREATE INDEX idx_guide_sections_guide ON public.guide_sections(guide_id);
CREATE INDEX idx_guide_examples_guide ON public.guide_examples(guide_id);

-- Add updated_at trigger
CREATE TRIGGER update_guide_categories_updated_at
BEFORE UPDATE ON public.guide_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guides_updated_at
BEFORE UPDATE ON public.guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();