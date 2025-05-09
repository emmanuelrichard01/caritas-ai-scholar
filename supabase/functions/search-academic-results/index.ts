
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing research search request');
    let requestData;
    
    try {
      requestData = await req.json();
    } catch (jsonError) {
      console.error('Error parsing request JSON:', jsonError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { query } = requestData;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.error('Invalid or missing search query');
      return new Response(
        JSON.stringify({ error: 'Invalid search query' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.error('API key not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Sending search request to Serper API for query:', query);
    
    // Make a search request to the search engine API
    const searchResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query + ' academic research journals papers',
        gl: 'us',
        hl: 'en',
        num: 10
      })
    });

    // Check if the response is okay
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search API error:', errorText);
      throw new Error(`Search API responded with status ${searchResponse.status}`);
    }

    // Try to parse the response as JSON
    let data;
    const contentType = searchResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await searchResponse.json();
    } else {
      // If not JSON, get the text and try to parse it
      const text = await searchResponse.text();
      try {
        // Check if the response contains HTML
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.error('Received HTML instead of JSON data');
          throw new Error('Received HTML instead of JSON data');
        }
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid response format from search API');
      }
    }

    console.log('Search API returned data, processing results');

    // Process and filter results to academic sources
    const organicResults = data?.organic || [];
    console.log(`Found ${organicResults.length} organic results`);
    
    const academicResults = organicResults.filter((result: any) => {
      const title = result.title?.toLowerCase() || '';
      const snippet = result.snippet?.toLowerCase() || '';
      const link = result.link?.toLowerCase() || '';
      
      // Check for academic indicators in the link
      const academicDomains = ['.edu', '.ac.', 'scholar.', 'research.', 'jstor.', 'sciencedirect.', 
                             'researchgate.', 'academia.edu', 'arxiv.org', 'ncbi.nlm.nih.gov',
                             'pubmed', 'ieee.', 'springer.', 'wiley.', 'tandfonline.', 'ssrn.com',
                             'nature.com'];
                             
      // Check for academic words in title or snippet
      const academicWords = ['journal', 'research', 'study', 'paper', 'article', 'publication',
                           'thesis', 'dissertation', 'proceedings', 'conference', 'academic',
                           'peer-reviewed', 'science', 'scientific'];
                           
      // Check domains
      const hasDomain = academicDomains.some(domain => link.includes(domain));
      
      // Check words
      const hasTitle = academicWords.some(word => title.includes(word));
      const hasSnippet = academicWords.some(word => snippet.includes(word));
      
      return hasDomain || hasTitle || hasSnippet;
    }) || [];
    
    console.log(`Filtered to ${academicResults.length} academic results`);

    // Transform the results to match the ResearchResultItem interface
    const formattedResults = academicResults.slice(0, 5).map((result: any) => {
      const authors = result.authors || 'Unknown Authors';
      const journal = result.source || 'Academic Journal';
      const year = result.date || new Date().getFullYear().toString();
      const abstract = result.snippet || 'No abstract available';
      const relevance = Math.floor(Math.random() * 30) + 70; // Mock relevance score between 70-99%
      
      return {
        title: result.title || 'Untitled Research',
        authors,
        journal,
        year,
        abstract,
        link: result.link,
        relevance
      };
    });

    console.log('Successfully processed research results, returning data');
    
    return new Response(
      JSON.stringify({ 
        results: formattedResults,
        query: query,
        total: academicResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing research query:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error processing research query', 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
