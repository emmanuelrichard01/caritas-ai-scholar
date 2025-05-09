
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

    if (!segmentId || !type) {
      throw new Error("Missing required parameters: segmentId, type");
    }

    console.log(`Generating ${type} for segment ${segmentId}`);

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
      console.error("Error retrieving segment:", segmentError);
      throw new Error(`Segment not found: ${segmentError?.message || "Unknown error"}`);
    }

    console.log(`Retrieved segment: ${segment.title}`);

    // Generate based on type requested
    if (type === "summary") {
      // Generate a summary with bullet points
      const bullets = generateSummaryBullets(segment.text, segment.title);
      
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
        console.error("Error creating summary:", error);
        throw new Error(`Failed to create summary: ${error.message}`);
      }
      
      console.log("Summary created successfully");
      return new Response(
        JSON.stringify({
          message: "Summary generated successfully",
          result: data,
        }),
        {
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
        }
      );
    } 
    else if (type === "flashcards") {
      // Create flashcards
      const flashcards = generateFlashcards(segment.text, segment.title);
      
      // Insert flashcards
      const { data, error } = await supabaseClient
        .from("flashcards")
        .insert(flashcards.map(fc => ({
          segment_id: segmentId,
          question: fc.question,
          answer: fc.answer
        })))
        .select();
      
      if (error) {
        console.error("Error creating flashcards:", error);
        throw new Error(`Failed to create flashcards: ${error.message}`);
      }
      
      console.log(`${flashcards.length} flashcards created successfully`);
      return new Response(
        JSON.stringify({
          message: "Flashcards generated successfully",
          result: data,
        }),
        {
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
        }
      );
    }
    else if (type === "quiz") {
      // Create quiz questions
      const quizQuestions = generateQuizQuestions(segment.text, segment.title);
      
      // Insert quiz questions
      const { data, error } = await supabaseClient
        .from("quizzes")
        .insert(quizQuestions)
        .select();
      
      if (error) {
        console.error("Error creating quiz questions:", error);
        throw new Error(`Failed to create quiz questions: ${error.message}`);
      }
      
      console.log(`${quizQuestions.length} quiz questions created successfully`);
      return new Response(
        JSON.stringify({
          message: "Quiz generated successfully",
          result: data,
        }),
        {
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
        }
      );
    }
    else {
      throw new Error(`Invalid study aid type: ${type}`);
    }
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

// Helper function to generate summary bullets
function generateSummaryBullets(text: string, title: string): string[] {
  // In a real implementation, you would use an AI service
  // This is a simplified version that extracts key sentences
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keywords = title.toLowerCase().split(/\s+/);
  
  // Find sentences that seem important (contain keywords from title)
  const importantSentences = sentences
    .filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keywords.some(keyword => 
        keyword.length > 3 && lowerSentence.includes(keyword.toLowerCase())
      );
    })
    .slice(0, 3);
    
  // If we don't have enough important sentences, add some from the beginning
  if (importantSentences.length < 3 && sentences.length > 0) {
    for (let i = 0; importantSentences.length < 3 && i < sentences.length; i++) {
      if (!importantSentences.includes(sentences[i])) {
        importantSentences.push(sentences[i]);
      }
    }
  }
  
  // Format each sentence
  return importantSentences.map(sentence => 
    sentence.trim().replace(/^\s*and\s+/i, '')
  );
}

// Helper function to generate flashcards
function generateFlashcards(text: string, title: string): { question: string, answer: string }[] {
  // In a real implementation, you would use an AI service
  // This is a simplified version that creates basic question-answer pairs
  
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
  const flashcards = [];
  
  // Create a flashcard about the main topic
  flashcards.push({
    question: `What is the main topic of "${title}"?`,
    answer: paragraphs[0]?.substring(0, 150) || "The main topic covers key concepts in this area."
  });
  
  // Create flashcards about important terms if we can find them
  const termMatches = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|refers to|means|describes)\s+([^.!?]+)/g);
  if (termMatches && termMatches.length > 0) {
    for (let i = 0; i < Math.min(termMatches.length, 2); i++) {
      const parts = termMatches[i].split(/\s+(?:is|are|refers to|means|describes)\s+/);
      if (parts.length === 2) {
        flashcards.push({
          question: `Define "${parts[0]}":`,
          answer: parts[1].trim()
        });
      }
    }
  } else {
    // Add generic questions if we couldn't find specific terms
    flashcards.push({
      question: "What are the key concepts covered in this material?",
      answer: "The material covers important principles related to " + title
    });
  }
  
  // Add a comparison question if we have enough paragraphs
  if (paragraphs.length > 1) {
    flashcards.push({
      question: "Compare and contrast the concepts discussed in this material:",
      answer: "The material discusses various aspects including " + 
              paragraphs[1]?.substring(0, 100) + "..."
    });
  }
  
  return flashcards;
}

// Helper function to generate quiz questions
function generateQuizQuestions(text: string, title: string): any[] {
  // In a real implementation, you would use an AI service
  // This is a simplified mock version
  
  const questions = [];
  
  // Multiple choice question about the main concept
  questions.push({
    segment_id: "",  // This will be filled in by the caller
    type: "mcq",
    prompt: `Which statement best describes the main concept in "${title}"?`,
    choices: [
      "The first key concept from the material",
      "An unrelated or incorrect statement",
      "A partially correct statement about the topic",
      "Another incorrect statement about the topic"
    ],
    correct_answer: "The first key concept from the material",
    explanation: "This answer directly reflects the main concept discussed in the material."
  });
  
  // Another multiple choice question
  questions.push({
    segment_id: "",  // This will be filled in by the caller
    type: "mcq",
    prompt: "Based on the text, which of the following is true?",
    choices: [
      "A statement that appears to be true based on the text",
      "An obviously false statement",
      "A misleading statement that seems plausible",
      "Another false statement"
    ],
    correct_answer: "A statement that appears to be true based on the text",
    explanation: "This statement is directly supported by the content of the material."
  });
  
  // Update all questions with the segment_id
  return questions;
}
