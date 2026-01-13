export interface GuideCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  guides_count?: number;
}

export interface Guide {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  sidebar_key: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reading_time_minutes: number;
  is_published: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: GuideCategory;
  sections?: GuideSection[];
  examples?: GuideExample[];
  related_guides?: Guide[];
}

export interface GuideSection {
  id: string;
  guide_id: string;
  section_type: 'what_is' | 'when_to_use' | 'how_it_works' | 'example' | 'common_mistakes' | 'tips' | 'steps';
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
}

export interface GuideExample {
  id: string;
  guide_id: string;
  title: string;
  description: string | null;
  code: string | null;
  language: string;
  is_good_example: boolean;
  sort_order: number;
  created_at: string;
}

export interface GuideRelation {
  id: string;
  guide_id: string;
  related_guide_id: string;
  relation_type: string;
  created_at: string;
}

// Sidebar menu item with guide info
export interface SidebarMenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
  helpLink?: string;
}
