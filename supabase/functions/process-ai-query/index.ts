
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIQueryRequest {
  query: string;
  userId: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, category } = await req.json() as AIQueryRequest;
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the query with your AI model
    // For demo purposes, we'll just respond with a structured answer
    // In real implementation, this would call an AI service API
    const response = processQuery(query, category);
    
    // Save the interaction to chat history
    const { error: saveError } = await saveToHistory(query, response, userId, category);
    
    if (saveError) {
      console.error("Error saving to history:", saveError);
    }
    
    return new Response(
      JSON.stringify({ 
        answer: response,
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error processing AI query:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Mock AI processing function - in production, connect to a real AI service
function processQuery(query: string, category: string): string {
  const responses: Record<string, string[]> = {
    "course-tutor": [
      "Based on your course materials, this concept is covered in chapter 3.",
      "This topic relates to several key principles we've discussed in class.",
      "Your question touches on an important aspect of the curriculum."
    ],
    "study-planner": [
      "For this subject, I recommend allocating at least 2 hours of focused study time.",
      "Breaking this topic into smaller sections will help you master it more effectively.",
      "Consider using spaced repetition techniques for this challenging material."
    ],
    "assignment-helper": [
      "Your assignment approach looks solid. Consider adding more analysis in section 2.",
      "For this assignment, make sure to cite relevant research from the last 5 years.",
      "This structure works well, but consider strengthening your conclusion."
    ],
    "research": [
      "Current research suggests several approaches to this question.",
      "The most recent studies in this field indicate promising developments.",
      "Academic consensus on this topic has evolved significantly in recent years."
    ],
    "default": [
      "I've analyzed your question and found some relevant information.",
      "That's an interesting question. Here's what I can tell you.",
      "Let me provide you with some helpful information on this topic."
    ]
  };

  // Select appropriate response category or default to generic responses
  const categoryResponses = responses[category] || responses.default;
  
  // Select a random response from the category
  const randomIndex = Math.floor(Math.random() * categoryResponses.length);
  
  // In real implementation, this would process the query against a real AI model
  return `${categoryResponses[randomIndex]} This is a simulated response for your query: "${query}". In a production environment, this would connect to a real AI service to provide accurate and detailed answers based on Caritas University data.`;
}

// Save interaction to chat history
async function saveToHistory(query: string, answer: string, userId: string, category: string) {
  // Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    return { error: "Supabase credentials not configured" };
  }
  
  // Create a title from the query (first 50 chars)
  const title = query.length > 50 
    ? query.substring(0, 47) + "..."
    : query;
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/chat_history`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        user_id: userId,
        title: title,
        content: `Q: ${query}\n\nA: ${answer}`,
        category: category
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Failed to save chat history: ${errorText}` };
    }
    
    return { error: null };
  } catch (error) {
    return { error: `Exception saving chat history: ${error instanceof Error ? error.message : String(error)}` };
  }
}
