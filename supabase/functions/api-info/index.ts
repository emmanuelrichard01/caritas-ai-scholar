
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleAIKey = Deno.env.get('GOOGLE_AI_KEY') || '';
const openRouterKey = Deno.env.get('OPENROUTER_KEY') || '';
const serperKey = Deno.env.get('SERPER_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    
    // Check Google AI Studio status
    if (googleAIKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleAIKey}`, {
          method: 'GET'
        });
        
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
        apiStatus.googleAI.available = false;
        apiStatus.googleAI.error = error.message || 'Connection error';
        apiStatus.googleAI.status = 'Error';
      }
    }
    
    // Check OpenRouter status
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
          delete apiStatus.openRouter.error;
        } else {
          apiStatus.openRouter.available = false;
          apiStatus.openRouter.error = `API Error: ${response.status}`;
        }
      } catch (error) {
        apiStatus.openRouter.available = false;
        apiStatus.openRouter.error = error.message || 'Connection error';
      }
    }

    // Check Serper AI status
    if (serperKey) {
      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: 'test query',
            num: 1
          })
        });
        
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
        apiStatus.serperAI.available = false;
        apiStatus.serperAI.error = error.message || 'Connection error';
        apiStatus.serperAI.status = 'Error';
      }
    }
    
    const fullResponse = {
      ...apiStatus,
      usage: {
        googleAI: { used: 25, limit: 60 },
        openRouter: { used: 40, limit: 100 },
        serperAI: { used: 15, limit: 100 }
      },
      resetTime: "24 hours"
    };
    
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
