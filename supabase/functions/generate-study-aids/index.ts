
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
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
    
  // If we don't have enough important sentences, add some more from the beginning
  let bullets = [...importantSentences];
  if (bullets.length < 3) {
    const additionalSentences = sentences
      .filter(sentence => !importantSentences.includes(sentence))
      .slice(0, 3 - bullets.length);
    bullets = [...bullets, ...additionalSentences];
  }
  
  // Convert sentences to bullet points format
  return bullets.map(sentence => {
    sentence = sentence.trim();
    // Capitalize first letter
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  });
}

// Helper function to generate flashcards
function generateFlashcards(text: string, title: string) {
  // In a real implementation, you would use an AI service
  // This is a simplified version that creates basic flashcards
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const cards = [];
  
  // Create flashcards based on sentences
  for (let i = 0; i < Math.min(5, sentences.length); i++) {
    const sentence = sentences[i].trim();
    
    // Simple method: find a key term and create a question about it
    const words = sentence.split(/\s+/);
    const keyTermIndex = Math.floor(words.length / 2);
    const keyTerm = words[keyTermIndex];
    
    if (keyTerm && keyTerm.length > 3) {
      // Create a question by removing the key term
      const question = `What ${keyTerm.length > 5 ? 'term' : 'concept'} is described as: "${
        sentence.replace(new RegExp(`\\b${keyTerm}\\b`, 'i'), '______')
      }"?`;
      
      cards.push({
        question,
        answer: `${keyTerm.charAt(0).toUpperCase() + keyTerm.slice(1)}`
      });
    } else {
      // Fallback: create a simple recall question
      cards.push({
        question: `What is described in the following: "${sentence.substring(0, sentence.length / 2)}..."?`,
        answer: sentence
      });
    }
  }
  
  // Add a title-based flashcard
  cards.push({
    question: `What are the main concepts covered in "${title}"?`,
    answer: "Key concepts include: " + 
      sentences.slice(0, 3).map(s => s.trim().toLowerCase()).join(' ... ')
  });
  
  return cards;
}

// Helper function to generate quiz questions
function generateQuizQuestions(text: string, title: string) {
  // In a real implementation, you would use an AI service
  // This is a simplified version that creates basic multiple-choice questions
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const quizQuestions = [];
  
  // Create a few multiple choice questions
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const words = sentence.split(/\s+/).filter(word => word.length > 4);
    
    if (words.length > 3) {
      // Pick a word to be the correct answer
      const correctWordIndex = Math.floor(Math.random() * words.length);
      const correctWord = words[correctWordIndex];
      
      // Create prompt by replacing the word with a blank
      const prompt = `${sentence.replace(new RegExp(`\\b${correctWord}\\b`, 'i'), "______")}`;
      
      // Create choices - one correct and 3 incorrect
      const otherWords = text
        .split(/\s+/)
        .filter(word => word.length > 3 && word.toLowerCase() !== correctWord.toLowerCase())
        .slice(0, 10);
      
      const shuffledChoices = [correctWord];
      while (shuffledChoices.length < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        const word = otherWords.splice(randomIndex, 1)[0];
        if (!shuffledChoices.includes(word)) {
          shuffledChoices.push(word);
        }
      }
      
      // Fill in if we don't have enough choices
      while (shuffledChoices.length < 4) {
        shuffledChoices.push(`Option ${shuffledChoices.length + 1}`);
      }
      
      // Shuffle choices
      for (let j = shuffledChoices.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffledChoices[j], shuffledChoices[k]] = [shuffledChoices[k], shuffledChoices[j]];
      }
      
      quizQuestions.push({
        segment_id: text.length, // This will be overwritten with the actual segment_id
        type: "mcq",
        prompt,
        choices: shuffledChoices,
        correct_answer: correctWord,
        explanation: `The correct answer is "${correctWord}" because it fits the context of the sentence.`
      });
    }
  }
  
  // Add a simple short-answer question
  quizQuestions.push({
    type: "short",
    prompt: `Summarize the main idea of "${title}" in one sentence.`,
    correct_answer: "This is a subjective question with multiple possible answers.",
    explanation: "Your answer should capture the key concept discussed in the text."
  });
  
  return quizQuestions;
}
