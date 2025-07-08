
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleAIKey = Deno.env.get('GOOGLE_AI_KEY');
const openRouterKey = Deno.env.get('OPENROUTER_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, category, additionalData, provider = 'google' } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Always use alternative providers instead of OpenAI
    if (provider === 'openrouter' || category === 'openrouter') {
      return await processOpenRouterQuery(query, category);
    } else {
      // Default to Google AI for all requests
      return await processGoogleAIQuery(query, category);
    }
  } catch (error) {
    console.error('Error processing query:', error);
    return new Response(
      JSON.stringify({ 
        answer: "I encountered an error while processing your request. Please try again later.",
        error: error.message || 'Failed to process query' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processGoogleAIQuery(query: string, category?: string) {
  try {
    console.log('Processing with Google AI for category:', category);
    
    if (!googleAIKey) {
      throw new Error('Google AI API key not configured');
    }
    
    let systemPrompt = getSystemPromptForCategory(category);
    let enhancedQuery = `${systemPrompt}\n\nUser Query: ${query}`;
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + googleAIKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedQuery
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.9
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google AI API error:', errorData);
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Google AI API');
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    return new Response(
      JSON.stringify({ answer: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calling Google AI:', error);
    return new Response(
      JSON.stringify({ 
        answer: "I'm currently experiencing technical difficulties. Please try again in a moment.",
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function processOpenRouterQuery(query: string, category?: string) {
  try {
    console.log('Processing with OpenRouter for category:', category);
    
    if (!openRouterKey) {
      throw new Error('OpenRouter API key not configured');
    }
    
    let systemPrompt = getSystemPromptForCategory(category);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.ai',
        'X-Title': 'Caritas University AI Assistant'
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { 
            role: "system", 
            content: systemPrompt
          },
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenRouter API');
    }
    
    const text = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ answer: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    return new Response(
      JSON.stringify({ 
        answer: "I'm currently experiencing technical difficulties. Please try again in a moment.",
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

function getSystemPromptForCategory(category?: string): string {
  switch (category) {
    case 'course-tutor':
      return "You are an educational AI assistant that helps students understand course materials and academic concepts. Provide clear, structured explanations and help with learning objectives.";
    case 'research':
      return "You are a research assistant AI that helps find scholarly sources and academic information. Provide relevant research insights, methodologies, and academic guidance.";
    case 'study-planner':
      return "You are an AI study planner that creates personalized study schedules and learning plans. Focus on time management, goal setting, and effective study strategies.";
    default:
      return "You are a helpful AI assistant for students at Caritas University. Provide clear, accurate, and educational responses to help with academic needs.";
  }
}
