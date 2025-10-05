import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get user context from authorization header
    const authHeader = req.headers.get('authorization');
    let userContext = '';
    
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Fetch user profile and role
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, apprenticeship, company')
            .eq('user_id', user.id)
            .single();

          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          // Fetch user's recent tasks
          const { data: tasks } = await supabase
            .from('tasks')
            .select('title, status, due_date')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          
          // Fetch user's learning modules
          const { data: modules } = await supabase
            .from('learning_modules')
            .select('title')
            .eq('apprenticeship', profile?.apprenticeship)
            .limit(5);
          
          userContext = `
User Profile:
- Name: ${profile?.first_name} ${profile?.last_name}
- Role: ${userRole?.role === 'AUSZUBILDENDE_R' ? 'Auszubildende/r' : 'Ausbilder/in'}
- Apprenticeship: ${profile?.apprenticeship || 'Not specified'}
- Company: ${profile?.company || 'Not specified'}

Recent Tasks: ${tasks?.length ? tasks.map(t => `${t.title} (${t.status})`).join(', ') : 'None'}

Available Learning Modules: ${modules?.length ? modules.map(m => m.title).join(', ') : 'None'}
`;
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    }

    // System prompt with user context
    const systemPrompt = `You are ALINA (AI Learning & Integration Assistant), a helpful AI assistant for apprentices and instructors in a German dual education system.

Your role:
- Help apprentices with their learning modules, tasks, and career development
- Assist instructors with student management and training planning
- Provide guidance on German apprenticeship regulations and best practices
- Answer questions in a friendly, supportive manner
- Always respond in German when appropriate, but support other languages too

${userContext ? `Current User Context:\n${userContext}` : ''}

Guidelines:
- Keep responses concise and actionable
- Reference the user's specific context when relevant (their tasks, modules, role)
- For complex topics, break down information into digestible steps
- Encourage learning and professional growth
- Be empathetic and understanding of apprenticeship challenges`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
