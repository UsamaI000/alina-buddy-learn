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
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    // Get user profile for context
    const authHeader = req.headers.get('Authorization');
    let userContext = '';
    
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (user) {
        console.log('Fetching user context for:', user.id);
        
        // Get user profile
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, apprenticeship, company')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else {
          console.log('Profile fetched:', profile);
        }

        // Get ALL learning modules (not filtered by apprenticeship for now)
        const { data: modules, error: modulesError } = await supabaseClient
          .from('learning_modules')
          .select('title, description, apprenticeship')
          .limit(10);

        if (modulesError) {
          console.error('Modules fetch error:', modulesError);
        } else {
          console.log('Modules fetched:', modules?.length || 0);
        }

        // Get open tasks
        const { data: tasks, error: tasksError } = await supabaseClient
          .from('tasks')
          .select('title, description, status, due_date, learning_modules(title)')
          .eq('user_id', user.id)
          .in('status', ['OPEN', 'IN_PROGRESS'])
          .order('due_date', { ascending: true })
          .limit(10);

        if (tasksError) {
          console.error('Tasks fetch error:', tasksError);
        } else {
          console.log('Tasks fetched:', tasks?.length || 0);
        }

        if (profile) {
          userContext = `\n\nUser Profile:\n- Name: ${profile.first_name} ${profile.last_name}\n- Apprenticeship: ${profile.apprenticeship || 'Not specified'}\n- Company: ${profile.company || 'Not specified'}`;
          
          if (modules && modules.length > 0) {
            userContext += `\n\nAvailable Learning Modules (${modules.length} total):`;
            modules.forEach(mod => {
              userContext += `\n- ${mod.title} (for ${mod.apprenticeship})${mod.description ? ': ' + mod.description.substring(0, 80) : ''}`;
            });
          } else {
            userContext += `\n\nNo learning modules available yet.`;
          }
          
          if (tasks && tasks.length > 0) {
            userContext += `\n\nCurrent Tasks (${tasks.length} open/in progress):`;
            tasks.forEach(task => {
              const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('de-DE') : 'No deadline';
              const moduleName = task.learning_modules?.title || 'No module assigned';
              userContext += `\n- "${task.title}" | Status: ${task.status} | Due: ${dueDate} | Module: ${moduleName}`;
            });
          } else {
            userContext += `\n\nNo open tasks at the moment.`;
          }
        }
        
        console.log('Final user context length:', userContext.length);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompt for ALINA
    const systemPrompt = `You are ALINA (Adaptive Learning & Interactive Navigation Assistant), an AI assistant designed to support apprentices (Auszubildende) in their vocational training in Germany.

Your role:
- Help with learning modules, assignments, and vocational training questions
- Provide guidance on German apprenticeship systems (duale Ausbildung)
- Answer questions about tasks, deadlines, and learning materials
- Be encouraging, patient, and supportive
- Respond in German when appropriate, but can switch to English if requested
- Always reference the user's current situation (their profile, learning modules, and tasks) when giving advice
- If asked about learning progress or tasks, use the specific information provided in the context

IMPORTANT: You have access to the user's:
- Personal profile information
- Available learning modules
- Current tasks and their status

Use this information actively when the user asks about their learning progress, tasks, or modules.${userContext}

Keep responses clear, concise, and actionable. If you don't know something specific to their training, encourage them to consult their Ausbilder (trainer).`;

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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in alina-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
