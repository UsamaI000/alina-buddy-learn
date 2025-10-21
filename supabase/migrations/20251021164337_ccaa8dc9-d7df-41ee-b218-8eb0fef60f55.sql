-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_base table
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for vector similarity search (HNSW)
CREATE INDEX ON public.knowledge_base 
USING hnsw (embedding vector_cosine_ops);

-- Create index for metadata filtering
CREATE INDEX ON public.knowledge_base USING gin (metadata);

-- Create index for learning_module_id lookups
CREATE INDEX ON public.knowledge_base (learning_module_id);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view knowledge base
CREATE POLICY "Everyone can view knowledge base" 
  ON public.knowledge_base FOR SELECT 
  USING (true);

-- RLS Policy: Only instructors can manage knowledge base
CREATE POLICY "Instructors can manage knowledge base" 
  ON public.knowledge_base FOR ALL 
  USING (has_role(auth.uid(), 'AUSBILDER_IN'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at 
  BEFORE UPDATE ON public.knowledge_base 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function for similarity search
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