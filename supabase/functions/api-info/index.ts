
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleAIKey = Deno.env.get('GOOGLE_AI_KEY') || '';
const openRouterKey = Deno.env.get('OPENROUTER_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiStatus = {
      openRouter: {
        available: false
      },
      googleAI: {
        available: false
      }
    };
    
    // Check Google AI Studio status
    if (googleAIKey) {
      try {
        // Make a lightweight request to check if API is working
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleAIKey}`, {
          method: 'GET'
        });
        
        if (response.ok) {
          apiStatus.googleAI.available = true;
          apiStatus.googleAI.status = 'Working';
          apiStatus.googleAI.dailyLimit = "~6000 requests/day";
        } else {
          const errorData = await response.text();
          apiStatus.googleAI.available = false;
          apiStatus.googleAI.error = `API Error: ${response.status}`;
          apiStatus.googleAI.status = 'Error';
        }
      } catch (error) {
        apiStatus.googleAI.available = false;
        apiStatus.googleAI.error = error.message || 'Connection error';
        apiStatus.googleAI.status = 'Error';
      }
    } else {
      apiStatus.googleAI.available = false;
      apiStatus.googleAI.error = 'API key not configured';
      apiStatus.googleAI.status = 'Not Configured';
    }
    
    // Check OpenRouter status if key is available
    if (openRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://lovable.ai',
            'X-Title': 'Caritas'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          apiStatus.openRouter.available = true;
          apiStatus.openRouter.creditsRemaining = data.data?.credits_remaining;
          apiStatus.openRouter.creditsGranted = data.data?.credits_granted;
          apiStatus.openRouter.rateLimitRemaining = data.data?.rate_limit_remaining;
          apiStatus.openRouter.rateLimit = data.data?.rate_limit;
        } else {
          const errorData = await response.text();
          apiStatus.openRouter.available = false;
          apiStatus.openRouter.error = `API Error: ${response.status}`;
        }
      } catch (error) {
        apiStatus.openRouter.available = false;
        apiStatus.openRouter.error = error.message || 'Connection error';
      }
    } else {
      apiStatus.openRouter.available = false;
      apiStatus.openRouter.error = 'API key not configured';
    }
    
    // Add usage data for frontend display (using mock data for now)
    const fullResponse = {
      ...apiStatus,
      usage: {
        googleAI: { used: 25, limit: 60 },
        openai: { used: 40, limit: 100 }
      },
      resetTime: "24 hours"
    };
    
    return new Response(
      JSON.stringify(fullResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking API status:', error);
    
    // Return a failsafe response structure that won't break the frontend
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to check API status',
        googleAI: { available: false, error: 'Internal error', status: 'Error' },
        openRouter: { available: false, error: 'Internal error' },
        usage: {
          googleAI: { used: 0, limit: 60 },
          openai: { used: 0, limit: 100 }
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
