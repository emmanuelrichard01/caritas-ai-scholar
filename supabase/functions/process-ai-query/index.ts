
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const googleAIKey = Deno.env.get('GOOGLE_AI_KEY');
const openRouterKey = Deno.env.get('OPENROUTER_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client for logging
const supabase = createClient(supabaseUrl, supabaseKey);

// Request validation schema
const RequestSchema = z.object({
  query: z.string(),
  userId: z.string().optional(),
  category: z.string().optional(),
  additionalData: z.any().optional(),
  provider: z.enum(['google', 'openrouter']).default('google'),
});

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // requests per window
const RATE_LIMIT_WINDOW = 30000; // 0.5 minute

// Available Gemini models in priority order
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
];

// System prompt templates
const SYSTEM_PROMPTS = {
  'course-tutor': {
    base: "You are an advanced educational AI assistant specializing in course materials and academic concepts.",
    context: "Provide clear, structured explanations with practical examples. Break down complex topics into digestible parts and suggest learning strategies.",
    tone: "supportive and encouraging, naturally conversational"
  },
  'research': {
    base: "You are a research assistant AI that helps find scholarly sources and academic information.",
    context: "Focus on credible sources, research methodologies, and academic standards. Provide structured guidance for research projects.",
    tone: "professional yet approachable, naturally conversational"
  },
  'study-planner': {
    base: "You are an AI study planner that creates personalized study schedules and learning plans.",
    context: "Focus on time management, goal setting, and effective study strategies. Consider individual learning styles and preferences.",
    tone: "motivating and organized, naturally conversational"
  },
  'default': {
    base: "You are a helpful AI assistant for students at Caritas University.",
    context: "Provide clear, accurate, and educational responses to help with academic needs. Be supportive and encouraging.",
    tone: "friendly and naturally conversational"
  }
};

interface AIResponse {
  answer: string;
  metadata: {
    modelUsed: string;
    provider: string;
    timestamp: string;
    responseTime?: number;
    fallbackUsed?: boolean;
    usage?: any;
  };
  error?: string;
}

// Utility functions
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoff = (attempt: number): number => {
  return Math.min(1000 * Math.pow(2, attempt), 10000); // Cap at 10 seconds
};

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitStore.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

const generateSystemPrompt = (category?: string, query?: string): string => {
  const template = SYSTEM_PROMPTS[category as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.default;
  
  return `${template.base}

Context: ${template.context}

Communication Style: 
- Be ${template.tone} in your responses
- Start conversations naturally without generic greetings
- Respond directly to what the user is asking
- Vary your opening approach based on the specific question
- Use a conversational tone that feels human and personalized
- Avoid repetitive patterns or formulaic responses

Guidelines:
- Provide accurate, well-structured information
- Use examples and practical applications when relevant
- If uncertain about specific details, acknowledge limitations
- Maintain academic integrity and educational value
- Adapt your response style to match the user's tone and context

Remember: Jump straight into helping with their specific question. No need for "Hello there!" or similar generic greetings.

User Query Context: ${category || 'general academic assistance'}`;
};

const logError = async (error: any, context: any) => {
  try {
    const logData = {
      error_message: error.message || String(error),
      error_stack: error.stack || null,
      context: JSON.stringify(context),
      timestamp: new Date().toISOString(),
      function_name: 'process-ai-query'
    };
    
    console.error('Error logged:', logData);
    
    // Optionally log to Supabase (uncomment if you have an error_logs table)
    // await supabase.from('error_logs').insert(logData);
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request
    const body = await req.json();
    const validatedData = RequestSchema.parse(body);
    
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = validatedData.userId || clientIP;
    
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          metadata: {
            modelUsed: 'none',
            provider: 'none',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime
          }
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { query, category, provider } = validatedData;
    
    // Process the query with enhanced fallback logic
    if (provider === 'openrouter') {
      return await processOpenRouterQuery(query, category, startTime);
    } else {
      return await processGeminiWithFallback(query, category, startTime);
    }
    
  } catch (error) {
    await logError(error, { 
      url: req.url, 
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });
    
    const isValidationError = error instanceof z.ZodError;
    const statusCode = isValidationError ? 400 : 500;
    const errorMessage = isValidationError 
      ? `Validation error: ${error.errors.map(e => e.message).join(', ')}`
      : "I encountered an error while processing your request. Please try again later.";
    
    return new Response(
      JSON.stringify({ 
        answer: errorMessage,
        error: error.message || 'Failed to process query',
        metadata: {
          modelUsed: 'none',
          provider: 'none',
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime
        }
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enhanced Gemini processing with retry and fallback
const processGeminiWithFallback = async (query: string, category?: string, startTime?: number): Promise<Response> => {
  const requestStartTime = startTime || Date.now();
  let fallbackUsed = false;
  
  for (let modelIndex = 0; modelIndex < GEMINI_MODELS.length; modelIndex++) {
    const model = GEMINI_MODELS[modelIndex];
    const maxRetries = modelIndex === 0 ? 3 : 1; // More retries for primary model
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Attempting ${model} (attempt ${attempt + 1}/${maxRetries})`);
        
        const response = await processGeminiModel(model, query, category);
        
        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({
              ...data,
              metadata: {
                modelUsed: model,
                provider: 'google',
                timestamp: new Date().toISOString(),
                responseTime: Date.now() - requestStartTime,
                fallbackUsed: modelIndex > 0 || attempt > 0,
                usage: data.usage
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // If 503, retry with backoff
        if (response.status === 503 && attempt < maxRetries - 1) {
          const backoffTime = calculateBackoff(attempt);
          console.log(`Model ${model} overloaded, retrying in ${backoffTime}ms...`);
          await sleep(backoffTime);
          continue;
        }
        
        // If other error or max retries reached, try next model
        break;
        
      } catch (error) {
        console.error(`Error with ${model} (attempt ${attempt + 1}):`, error);
        
        if (attempt < maxRetries - 1) {
          const backoffTime = calculateBackoff(attempt);
          await sleep(backoffTime);
        }
      }
    }
  }
  
  // All Gemini models failed, fallback to OpenRouter
  console.log('All Gemini models failed, falling back to OpenRouter...');
  return await processOpenRouterQuery(query, category, requestStartTime, true);
};

// Individual Gemini model processor
const processGeminiModel = async (model: string, query: string, category?: string): Promise<Response> => {
  if (!googleAIKey) {
    throw new Error('Google AI API key not configured');
  }
  
  const systemPrompt = generateSystemPrompt(category, query);
  const enhancedQuery = `${systemPrompt}\n\nUser Query: ${query}`;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleAIKey}`, {
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
    console.error(`${model} API error:`, errorData);
    return response; // Return the error response to be handled by caller
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error(`Invalid response from ${model}`);
  }
  
  const text = data.candidates[0].content.parts[0].text;
  
  return new Response(
    JSON.stringify({ 
      answer: text,
      usage: data.usageMetadata 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
};

// Enhanced OpenRouter processor
const processOpenRouterQuery = async (query: string, category?: string, startTime?: number, isFallback = false): Promise<Response> => {
  const requestStartTime = startTime || Date.now();
  
  try {
    console.log('Processing with OpenRouter for category:', category);
    
    if (!openRouterKey) {
      throw new Error('OpenRouter API key not configured');
    }
    
    const systemPrompt = generateSystemPrompt(category, query);
    
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
      JSON.stringify({ 
        answer: text,
        metadata: {
          modelUsed: 'claude-3-haiku',
          provider: 'openrouter',
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - requestStartTime,
          fallbackUsed: isFallback,
          usage: data.usage
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    await logError(error, { provider: 'openrouter', category, isFallback });
    
    return new Response(
      JSON.stringify({ 
        answer: "I'm currently experiencing technical difficulties. Please try again in a moment.",
        error: error.message,
        metadata: {
          modelUsed: 'none',
          provider: 'openrouter',
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - requestStartTime,
          fallbackUsed: isFallback
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};
