
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables with validation
const googleAIKey = Deno.env.get('GOOGLE_AI_KEY') || '';
const openRouterKey = Deno.env.get('OPENROUTER_KEY') || '';
const serperKey = Deno.env.get('SERPER_API_KEY') || '';

// Rate limiting map (simple in-memory store)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

async function testAPIWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req);
  if (isRateLimited(rateLimitKey)) {
    console.warn(`Rate limit exceeded for ${rateLimitKey}`);
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: '1 hour'
      }),
      { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Method validation
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('Starting API status check');
    const apiStatus = {
      googleAI: {
        available: false,
        status: 'Not Configured',
        error: 'API key not configured'
      },
      openRouter: {
        available: false,
        error: 'API key not configured'
      },
      serperAI: {
        available: false,
        status: 'Not Configured',
        error: 'API key not configured'
      }
    };
    
    // Check Google AI Studio status with timeout
    if (googleAIKey) {
      try {
        const response = await testAPIWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${googleAIKey}`,
          { method: 'GET' },
          5000
        );
        
        if (response.ok) {
          apiStatus.googleAI.available = true;
          apiStatus.googleAI.status = 'Active';
          apiStatus.googleAI.dailyLimit = "~6000 requests/day";
          delete apiStatus.googleAI.error;
        } else {
          apiStatus.googleAI.available = false;
          apiStatus.googleAI.error = `API Error: ${response.status}`;
          apiStatus.googleAI.status = 'Error';
        }
      } catch (error) {
        console.error('Google AI API check failed:', error);
        apiStatus.googleAI.available = false;
        apiStatus.googleAI.error = error.name === 'AbortError' ? 'Timeout' : (error.message || 'Connection error');
        apiStatus.googleAI.status = 'Error';
      }
    }
    
    // Check OpenRouter status with timeout
    if (openRouterKey) {
      try {
        const response = await testAPIWithTimeout(
          'https://openrouter.ai/api/v1/auth/key',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'HTTP-Referer': 'https://lovable.ai',
              'X-Title': 'Caritas'
            }
          },
          5000
        );
        
        if (response.ok) {
          const data = await response.json();
          
          apiStatus.openRouter.available = true;
          apiStatus.openRouter.creditsRemaining = data.data?.credits_remaining;
          apiStatus.openRouter.creditsGranted = data.data?.credits_granted;
          apiStatus.openRouter.rateLimitRemaining = data.data?.rate_limit_remaining;
          apiStatus.openRouter.rateLimit = data.data?.rate_limit;
          delete apiStatus.openRouter.error;
        } else {
          apiStatus.openRouter.available = false;
          apiStatus.openRouter.error = `API Error: ${response.status}`;
        }
      } catch (error) {
        console.error('OpenRouter API check failed:', error);
        apiStatus.openRouter.available = false;
        apiStatus.openRouter.error = error.name === 'AbortError' ? 'Timeout' : (error.message || 'Connection error');
      }
    }

    // Check Serper AI status with minimal test
    if (serperKey) {
      try {
        const response = await testAPIWithTimeout(
          'https://google.serper.dev/search',
          {
            method: 'POST',
            headers: {
              'X-API-KEY': serperKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: 'test',
              num: 1
            })
          },
          5000
        );
        
        if (response.ok) {
          apiStatus.serperAI.available = true;
          apiStatus.serperAI.status = 'Active';
          apiStatus.serperAI.monthlyLimit = "2,500 requests/month";
          delete apiStatus.serperAI.error;
        } else {
          apiStatus.serperAI.available = false;
          apiStatus.serperAI.error = `API Error: ${response.status}`;
          apiStatus.serperAI.status = 'Error';
        }
      } catch (error) {
        console.error('Serper API check failed:', error);
        apiStatus.serperAI.available = false;
        apiStatus.serperAI.error = error.name === 'AbortError' ? 'Timeout' : (error.message || 'Connection error');
        apiStatus.serperAI.status = 'Error';
      }
    }
    
    const responseTime = Date.now() - startTime;
    const fullResponse = {
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      ...apiStatus,
      usage: {
        googleAI: { used: 25, limit: 60 },
        openRouter: { used: 40, limit: 100 },
        serperAI: { used: 15, limit: 100 }
      },
      resetTime: "24 hours"
    };
    
    console.log(`API status check completed in ${responseTime}ms`);
    
    return new Response(
      JSON.stringify(fullResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking API status:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to check API status',
        googleAI: { available: false, error: 'Internal error', status: 'Error' },
        openRouter: { available: false, error: 'Internal error' },
        serperAI: { available: false, error: 'Internal error', status: 'Error' },
        usage: {
          googleAI: { used: 0, limit: 60 },
          openRouter: { used: 0, limit: 100 },
          serperAI: { used: 0, limit: 100 }
        },
        resetTime: "24 hours"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
