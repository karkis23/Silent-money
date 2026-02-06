-- Migration to add SEO fields to the franchises table
ALTER TABLE franchises
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

COMMENT ON COLUMN franchises.meta_title IS 'SEO Strategic Title for search engine visibility';
COMMENT ON COLUMN franchises.meta_description IS 'SEO Summary for search engine snippets';
