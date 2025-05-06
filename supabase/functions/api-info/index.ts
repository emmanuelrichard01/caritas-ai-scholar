
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const googleAIKey = Deno.env.get("GOOGLE_AI_KEY") || "AIzaSyDHnnACtYYBHf3Y1FMVv2jp-8l12MK7RUw";
const openRouterKey = Deno.env.get("OPENROUTER_KEY") || "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch OpenRouter credits info
    const openRouterInfo = await fetchOpenRouterInfo();
    
    // We don't fetch Google AI limits directly as they require more complex authentication
    // Instead, return known information about the API limits
    const googleAIInfo = {
      available: true,
      dailyLimit: "1000 requests per day (estimated)",
      remainingRequests: "Unknown (requires project-specific monitoring)",
      status: "API key is configured"
    };

    return new Response(
      JSON.stringify({
        openRouter: openRouterInfo,
        googleAI: googleAIInfo
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching API info:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch API information',
        openRouter: { available: false, error: "Could not fetch information" },
        googleAI: { available: false, error: "Could not fetch information" }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function fetchOpenRouterInfo() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API returned ${response.status}`);
    }

    const data = await response.json();
    
    return {
      available: true,
      rateLimit: data.rate_limit_requests || "Unknown",
      rateLimitRemaining: data.rate_limit_remaining || "Unknown",
      creditsGranted: data.credits_granted || 0,
      creditsUsed: data.credits_used || 0,
      creditsRemaining: data.credits_remaining || 0
    };
  } catch (error) {
    console.error('Error fetching OpenRouter info:', error);
    return {
      available: false,
      error: error.message || "Failed to fetch OpenRouter information"
    };
  }
}
