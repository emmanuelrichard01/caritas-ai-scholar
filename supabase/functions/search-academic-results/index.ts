
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!SERPER_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'Please configure SERPER_API_KEY in the Supabase Edge Function Secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results = await searchSerper(query);
    
    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in academic search:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process search', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function searchSerper(query: string) {
  try {
    // Add academic focus to the search query
    const scholarQuery = `${query} site:scholar.google.com OR site:arxiv.org OR site:researchgate.net OR site:academia.edu OR site:sciencedirect.com`;
    
    console.log(`Searching Serper API with query: "${scholarQuery}"`);
    
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: scholarQuery,
        num: 5
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serper API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    // Log success and results count
    console.log(`Serper search successful, found ${data.organic?.length || 0} results`);
    
    // Map Serper response to our format
    return data.organic.map((item: any, index: number) => ({
      title: item.title,
      authors: extractAuthors(item.snippet || ""),
      journal: extractJournal(item.title, item.snippet || ""),
      year: extractYear(item.snippet || ""),
      abstract: item.snippet || "",
      link: item.link,
      relevance: Math.floor(95 - (index * 3))
    }));
  } catch (error) {
    console.error('Serper API error:', error);
    throw error;
  }
}

// Helper functions to extract metadata from search results
function extractAuthors(text: string): string {
  // Look for patterns like "A Author, B Author, C Author"
  const authorMatch = text.match(/([A-Z][a-z]+\s+[A-Z][a-z]+(?:,\s*[A-Z][a-z]+\s+[A-Z][a-z]+)*)/);
  if (authorMatch) return authorMatch[0];
  
  // Look for patterns like "by Author1, Author2"
  const byMatch = text.match(/by\s+([^.]+)/i);
  if (byMatch) return byMatch[1];
  
  return "Various Authors";
}

function extractJournal(title: string, text: string): string {
  // Common journals
  const journals = ["Journal of", "Proceedings of", "Transactions on", "Review of"];
  
  for (const journal of journals) {
    if (title.includes(journal)) {
      const journalName = title.substring(title.indexOf(journal));
      return journalName.split("-")[0].trim();
    }
  }
  
  // Look for text in brackets which often contains journal info
  const bracketsMatch = text.match(/\[(.*?)\]/);
  if (bracketsMatch) return bracketsMatch[1];
  
  return "Academic Journal";
}

function extractYear(text: string): string {
  // Look for a 4-digit year
  const yearMatch = text.match(/(19|20)\d{2}/);
  return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
}
