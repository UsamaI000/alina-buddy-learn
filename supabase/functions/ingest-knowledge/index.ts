import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking (split by paragraphs, max 2000 chars)
function chunkText(text: string, maxChunkSize = 2000): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks.length > 0 ? chunks : [text]; // Fallback if no chunks created
}

// Generate embeddings via OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    console.log('Processing knowledge ingestion for user:', user.id);

    // Verify user is AUSBILDER_IN
    const { data: roleData } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'AUSBILDER_IN'
    });

    if (!roleData) {
      throw new Error('Unauthorized: Instructor role required');
    }

    // Parse request
    const { learning_module_id, title, content, metadata = {} } = await req.json();

    if (!learning_module_id || !title || !content) {
      throw new Error('Missing required fields: learning_module_id, title, content');
    }

    console.log(`Processing article "${title}" for module ${learning_module_id}`);

    // 1. Chunk the text
    const chunks = chunkText(content);
    console.log(`Created ${chunks.length} chunks from content`);

    // 2. Generate embeddings and store
    const insertData = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
      
      const embedding = await generateEmbedding(chunk);

      insertData.push({
        learning_module_id,
        title,
        content: content,
        chunk_text: chunk,
        chunk_index: i,
        embedding: JSON.stringify(embedding),
        metadata: metadata,
        created_by: user.id,
      });
    }

    console.log(`Inserting ${insertData.length} chunks into database`);

    const { data, error } = await supabaseClient
      .from('knowledge_base')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }

    console.log(`Successfully inserted ${data.length} knowledge chunks`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunks_created: data.length,
        ids: data.map(d => d.id)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ingest-knowledge:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
