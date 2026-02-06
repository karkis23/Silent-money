-- 🛡️ SILENT MONEY SYSTEM OPTIMIZATION
-- 1. Admin Hierarchy
-- 2. Search Scalability (RPC)
-- 3. Storage Deletion Queue

-- ============================================
-- 1. ADMIN HIERARCHY
-- ============================================

-- Add role to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('owner', 'super_admin', 'admin', 'moderator', 'user'));

-- Update existing admins to 'admin' level if they don't have a role
UPDATE public.profiles SET role = 'admin' WHERE is_admin = true AND role = 'user';

-- Set initial owner (the first admin created)
UPDATE public.profiles 
SET role = 'owner' 
WHERE id IN (
  SELECT id FROM public.profiles 
  WHERE is_admin = true 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- ============================================
-- 2. SEARCH SCALABILITY (Full-Text Search)
-- ============================================

-- Create a unified search function
CREATE OR REPLACE FUNCTION search_knowledge(search_query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  type TEXT,
  similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      i.id, 
      i.title as name, 
      i.slug, 
      'blueprint'::TEXT as type,
      ts_rank(to_tsvector('english', i.title || ' ' || i.short_description), websearch_to_tsquery('english', search_query)) as similarity
    FROM income_ideas i
    WHERE i.is_approved = true
    AND (
      to_tsvector('english', i.title || ' ' || i.short_description) @@ websearch_to_tsquery('english', search_query)
      OR i.title ILIKE '%' || search_query || '%'
    )
    
    UNION ALL
    
    SELECT 
      f.id, 
      f.name, 
      f.slug, 
      'franchise'::TEXT as type,
      ts_rank(to_tsvector('english', f.name || ' ' || f.description), websearch_to_tsquery('english', search_query)) as similarity
    FROM franchises f
    WHERE f.is_approved = true
    AND (
      to_tsvector('english', f.name || ' ' || f.description) @@ websearch_to_tsquery('english', search_query)
      OR f.name ILIKE '%' || search_query || '%'
    )
  )
  ORDER BY similarity DESC
  LIMIT 10;
END;
$$;

-- ============================================
-- 3. STORAGE CLEANUP (Deletion Queue)
-- ============================================

-- Create a table to track files that need to be deleted from storage
CREATE TABLE IF NOT EXISTS public.storage_deletion_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.storage_deletion_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view deletion queue" ON public.storage_deletion_queue 
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Trigger function for income_ideas
CREATE OR REPLACE FUNCTION queue_idea_image_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.image_url IS NOT NULL AND OLD.image_url LIKE '%/storage/v1/object/public/assets/%' THEN
    INSERT INTO public.storage_deletion_queue (bucket_name, file_path)
    VALUES ('assets', substring(OLD.image_url from '/assets/(.*)'));
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for franchises
CREATE OR REPLACE FUNCTION queue_franchise_image_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.image_url IS NOT NULL AND OLD.image_url LIKE '%/storage/v1/object/public/franchises/%' THEN
    INSERT INTO public.storage_deletion_queue (bucket_name, file_path)
    VALUES ('franchises', substring(OLD.image_url from '/franchises/(.*)'));
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS trigger_idea_image_deletion ON public.income_ideas;
CREATE TRIGGER trigger_idea_image_deletion
BEFORE DELETE ON public.income_ideas
FOR EACH ROW EXECUTE FUNCTION queue_idea_image_deletion();

DROP TRIGGER IF EXISTS trigger_franchise_image_deletion ON public.franchises;
CREATE TRIGGER trigger_franchise_image_deletion
BEFORE DELETE ON public.franchises
FOR EACH ROW EXECUTE FUNCTION queue_franchise_image_deletion();
