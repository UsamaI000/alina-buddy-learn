-- Fix 1: Update match_knowledge_base function to have secure search_path
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id uuid,
  learning_module_id uuid,
  title text,
  chunk_text text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.learning_module_id,
    kb.title,
    kb.chunk_text,
    1 - (kb.embedding <=> query_embedding) AS similarity,
    kb.metadata
  FROM public.knowledge_base kb
  WHERE 
    (filter = '{}' OR kb.metadata @> filter)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Fix 2: Move vector extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;