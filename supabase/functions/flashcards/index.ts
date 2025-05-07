
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
const googleAIKey = Deno.env.get('GOOGLE_AI_KEY') || '';
const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { segmentId, userId, count = 10 } = await req.json();
    
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

    // Create flashcards based on segment content
    const flashcardResults = await generateFlashcards(segment.text, segment.title, count);
    
    // Save flashcards to the database
    const { error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardResults.map(card => ({
        segment_id: segmentId,
        question: card.question,
        answer: card.answer,
        next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
      })));
      
    if (insertError) {
      throw new Error('Failed to create flashcards: ' + insertError.message);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Flashcards generated successfully',
        count: flashcardResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in flashcards function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate flashcards' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to generate flashcards using AI
async function generateFlashcards(text: string, title: string, count: number) {
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
                  text: `Create ${count} flashcards from the following text. Format as JSON array with "question" and "answer" properties for each card.
                  
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
        
        // Try to extract JSON from the response
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```([\s\S]*?)```/) ||
                       content.match(/\[([\s\S]*?)\]/);
        
        if (jsonMatch) {
          try {
            const jsonStr = jsonMatch[0];
            const flashcards = JSON.parse(jsonStr);
            
            if (Array.isArray(flashcards) && flashcards.length > 0) {
              return flashcards.map(card => ({
                question: card.question || 'Question missing',
                answer: card.answer || 'Answer missing'
              }));
            }
          } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
          }
        }
      }
    }
  } catch (googleError) {
    console.error('Google AI error:', googleError);
  }

  // Create fallback flashcards
  const cards = [];
  for (let i = 1; i <= Math.min(count, 5); i++) {
    cards.push({
      question: `Question ${i} about ${title}?`,
      answer: `This is a fallback answer for question ${i}. The actual flashcards would be created using AI.`
    });
  }
  
  return cards;
}
