
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request validation schema
const RequestSchema = z.object({
  segmentId: z.string().uuid("Invalid segment ID format"),
  type: z.enum(['summary', 'flashcards', 'quiz'], {
    errorMap: () => ({ message: "Type must be 'summary', 'flashcards', or 'quiz'" })
  })
});

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Method validation
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        expectedMethod: 'POST' 
      }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Invalid JSON in request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate using Zod schema
    const validation = RequestSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Request validation failed:', validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request parameters',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { segmentId, type } = validation.data;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    console.log(`Generating ${type} for segment ${segmentId}`);

    // Get segment content
    const { data: segment, error: segmentError } = await supabaseClient
      .from("segments")
      .select("*")
      .eq("id", segmentId)
      .single();

    if (segmentError || !segment) {
      throw new Error(`Failed to fetch segment: ${segmentError?.message || "Segment not found"}`);
    }

    let result;
    switch (type) {
      case 'summary':
        result = await generateSummary(supabaseClient, segment);
        break;
      case 'flashcards':
        result = await generateFlashcards(supabaseClient, segment);
        break;
      case 'quiz':
        result = await generateQuiz(supabaseClient, segment);
        break;
      default:
        throw new Error(`Unknown study aid type: ${type}`);
    }

    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        message: `${type} generated successfully`,
        result,
        metadata: {
          segmentId,
          type,
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`
        }
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Error generating study aids (${responseTime}ms):`, error);
    
    const isClientError = error instanceof Error && (
      error.message.includes('Missing required parameters') ||
      error.message.includes('Invalid') ||
      error.message.includes('not found')
    );
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      }),
      {
        status: isClientError ? 400 : 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});

async function generateSummary(supabaseClient: any, segment: any) {
  const content = segment.text;
  const bullets = extractKeyPoints(content);
  
  const { data, error } = await supabaseClient
    .from("summaries")
    .insert({
      segment_id: segment.id,
      bullets
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function generateFlashcards(supabaseClient: any, segment: any) {
  const content = segment.text;
  const flashcards = createFlashcardsFromContent(content);
  
  const flashcardData = flashcards.map(card => ({
    segment_id: segment.id,
    question: card.question,
    answer: card.answer
  }));

  const { data, error } = await supabaseClient
    .from("flashcards")
    .insert(flashcardData)
    .select();

  if (error) throw error;
  return data;
}

async function generateQuiz(supabaseClient: any, segment: any) {
  const content = segment.text;
  const quizQuestions = createQuizFromContent(content);
  
  const quizData = quizQuestions.map(q => ({
    segment_id: segment.id,
    type: 'mcq',
    prompt: q.question,
    choices: q.choices,
    correct_answer: q.correctAnswer,
    explanation: q.explanation
  }));

  const { data, error } = await supabaseClient
    .from("quizzes")
    .insert(quizData)
    .select();

  if (error) throw error;
  return data;
}

function extractKeyPoints(content: string): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyPoints: string[] = [];
  
  // Extract important sentences based on keywords and structure
  const importantKeywords = ['important', 'key', 'main', 'primary', 'significant', 'crucial', 'essential', 'fundamental'];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (importantKeywords.some(keyword => lowerSentence.includes(keyword)) || 
        sentence.length > 50 && sentence.length < 200) {
      keyPoints.push(sentence.trim());
    }
  });
  
  // If no key points found, take first few sentences
  if (keyPoints.length === 0) {
    return sentences.slice(0, 5).map(s => s.trim());
  }
  
  return keyPoints.slice(0, 8);
}

function createFlashcardsFromContent(content: string): Array<{question: string, answer: string}> {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const flashcards: Array<{question: string, answer: string}> = [];
  
  // Create definition-based flashcards
  sentences.forEach(sentence => {
    if (sentence.includes(' is ') || sentence.includes(' are ') || sentence.includes(' means ')) {
      const parts = sentence.split(/ is | are | means /);
      if (parts.length >= 2) {
        flashcards.push({
          question: `What is ${parts[0].trim()}?`,
          answer: parts[1].trim()
        });
      }
    }
  });
  
  // Generate basic comprehension questions
  const topics = extractTopics(content);
  topics.forEach(topic => {
    flashcards.push({
      question: `Explain the concept of ${topic}`,
      answer: `Review the material for detailed information about ${topic}`
    });
  });
  
  return flashcards.slice(0, 10);
}

function createQuizFromContent(content: string): Array<{question: string, choices: string[], correctAnswer: string, explanation: string}> {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const questions: Array<{question: string, choices: string[], correctAnswer: string, explanation: string}> = [];
  
  sentences.slice(0, 5).forEach((sentence, index) => {
    const words = sentence.split(' ').filter(w => w.length > 3);
    if (words.length > 5) {
      const keyWord = words[Math.floor(words.length / 2)];
      const question = `What is mentioned about ${keyWord} in the material?`;
      const correctAnswer = sentence.trim();
      
      questions.push({
        question,
        choices: [
          correctAnswer,
          `Alternative explanation ${index + 1}`,
          `Different perspective ${index + 1}`,
          `Unrelated concept ${index + 1}`
        ],
        correctAnswer,
        explanation: `This information is directly stated in the source material.`
      });
    }
  });
  
  return questions.slice(0, 5);
}

function extractTopics(content: string): string[] {
  const words = content.toLowerCase().split(/\W+/);
  const topicWords = words.filter(word => 
    word.length > 5 && 
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
  );
  
  // Count frequency and return most common topics
  const frequency: {[key: string]: number} = {};
  topicWords.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}
