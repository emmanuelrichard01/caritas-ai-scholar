
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Database client initialization
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
const googleAIKey = Deno.env.get('GOOGLE_AI_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { segmentId, userId } = await req.json();
    
    if (!segmentId) {
      return new Response(
        JSON.stringify({ error: 'Missing segment ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get segment content
    const { data: segment, error: segmentError } = await supabase
      .from('segments')
      .select('*, materials(user_id)')
      .eq('id', segmentId)
      .single();
    
    if (segmentError || !segment) {
      console.error('Error retrieving segment:', segmentError);
      throw new Error('Segment not found');
    }

    // Check ownership
    if (segment.materials?.user_id !== userId) {
      throw new Error('Access denied');
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from('summaries')
      .select('*')
      .eq('segment_id', segmentId)
      .single();
      
    if (existingSummary) {
      // Update existing summary
      const summaryResult = await generateSummary(segment.text, segment.title);
      
      const { error: updateError } = await supabase
        .from('summaries')
        .update({ bullets: summaryResult.bullets })
        .eq('id', existingSummary.id);
        
      if (updateError) {
        throw new Error('Failed to update summary');
      }
    } else {
      // Create new summary
      const summaryResult = await generateSummary(segment.text, segment.title);
      
      const { error: insertError } = await supabase
        .from('summaries')
        .insert({
          segment_id: segmentId,
          bullets: summaryResult.bullets
        });
        
      if (insertError) {
        throw new Error('Failed to create summary');
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Summary generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in summarize function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate summary' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to generate a summary using AI
async function generateSummary(text: string, title: string) {
  // Try Google AI first
  try {
    if (googleAIKey) {
      const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleAIKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize the following text into 5-7 key bullet points. Focus on the most important concepts and details:
                  
                  Title: ${title}
                  
                  Content:
                  ${text}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
            topP: 0.8
          }
        }),
      });

      if (googleResponse.ok) {
        const data = await googleResponse.json();
        const content = data.candidates[0].content.parts[0].text;
        
        // Parse bullet points
        const bullets = content
          .split('\n')
          .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map(line => line.replace(/^[•\-*]\s*/, '').trim())
          .filter(line => line.length > 0);
          
        if (bullets.length >= 3) {
          return { bullets };
        }
      }
    }
  } catch (googleError) {
    console.error('Google AI error:', googleError);
    // Fall back to OpenAI
  }

  // Fall back to OpenAI if available
  try {
    if (openAIKey) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an AI that summarizes educational content into clear, concise bullet points.'
            },
            { 
              role: 'user', 
              content: `Summarize the following text into 5-7 key bullet points. Focus on the most important concepts and details:
              
              Title: ${title}
              
              Content:
              ${text}`
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        const content = data.choices[0].message.content;
        
        // Parse bullet points
        const bullets = content
          .split('\n')
          .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map(line => line.replace(/^[•\-*]\s*/, '').trim())
          .filter(line => line.length > 0);
          
        if (bullets.length >= 3) {
          return { bullets };
        }
      }
    }
  } catch (openaiError) {
    console.error('OpenAI error:', openaiError);
  }

  // Fallback to manual extraction if AI services fail
  const lines = text.split('\n');
  const importantSentences = lines
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 30 && 
        trimmed.length < 200 &&
        (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?'));
    })
    .slice(0, 7)
    .map(line => line.trim());
    
  return {
    bullets: importantSentences.length > 0 
      ? importantSentences
      : [`Summary of ${title}`, 'Key information extracted from the text', 'Important concepts and definitions']
  };
}
