
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
};

serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Parse request body
    const { segmentId, type } = await req.json();

    // Initialize Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get segment content
    const { data: segment, error: segmentError } = await supabaseClient
      .from("segments")
      .select("*")
      .eq("id", segmentId)
      .single();

    if (segmentError || !segment) {
      throw new Error(`Segment not found: ${segmentError?.message}`);
    }

    let result;
    
    // In a real implementation, you would call an AI service here
    // For now, we'll create mock data based on the segment content
    if (type === "summary") {
      // Create a summary with bullet points
      const bullets = [
        `Key point 1 from "${segment.title}"`,
        `Key point 2 from "${segment.title}"`,
        `Key point 3 from "${segment.title}"`
      ];
      
      // Insert or update summary
      const { data, error } = await supabaseClient
        .from("summaries")
        .upsert({
          segment_id: segmentId,
          bullets,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create summary: ${error.message}`);
      }
      
      result = data;
    } 
    else if (type === "flashcards") {
      // Create sample flashcards
      const flashcards = [
        {
          segment_id: segmentId,
          question: `What is the main topic of ${segment.title}?`,
          answer: "The main concept covered in this segment."
        },
        {
          segment_id: segmentId,
          question: "Define the key terminology from this segment:",
          answer: "Important terms defined from the content."
        },
        {
          segment_id: segmentId,
          question: "Explain the relationship between concepts in this segment:",
          answer: "The concepts are related through shared principles."
        }
      ];
      
      // Insert flashcards
      const { data, error } = await supabaseClient
        .from("flashcards")
        .insert(flashcards)
        .select();
      
      if (error) {
        throw new Error(`Failed to create flashcards: ${error.message}`);
      }
      
      result = data;
    }
    else if (type === "quiz") {
      // Create sample quiz questions - ensuring type is explicitly set as 'mcq' or 'short'
      const quizQuestions = [
        {
          segment_id: segmentId,
          type: "mcq" as const,  // Explicitly set as literal type
          prompt: `Which statement best describes the main concept in ${segment.title}?`,
          choices: [
            "The correct statement about the content",
            "A misleading statement about the content",
            "An unrelated statement",
            "A partially correct statement"
          ],
          correct_answer: "The correct statement about the content",
          explanation: "This is the right answer because it accurately describes the main concept."
        },
        {
          segment_id: segmentId,
          type: "mcq" as const,  // Explicitly set as literal type
          prompt: "Which of the following is NOT mentioned in the segment?",
          choices: [
            "A concept that is mentioned",
            "Another concept that is mentioned",
            "A concept that is NOT mentioned",
            "A third concept that is mentioned"
          ],
          correct_answer: "A concept that is NOT mentioned",
          explanation: "This option was not discussed in the material."
        }
      ];
      
      // Insert quiz questions
      const { data, error } = await supabaseClient
        .from("quizzes")
        .insert(quizQuestions)
        .select();
      
      if (error) {
        throw new Error(`Failed to create quiz questions: ${error.message}`);
      }
      
      result = data;
    }
    else {
      throw new Error(`Invalid study aid type: ${type}`);
    }

    return new Response(
      JSON.stringify({
        message: `${type} generated successfully`,
        result,
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    );
  } catch (error) {
    console.error("Error generating study aid:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
