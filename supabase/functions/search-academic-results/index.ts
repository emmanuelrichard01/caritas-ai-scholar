
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleAIKey = Deno.env.get('GOOGLE_AI_KEY') || '';
const serperApiKey = Deno.env.get('SERPER_API_KEY') || '';

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

    // Use Serper.dev for academic search results
    const searchResults = await fetchSearchResults(query);
    
    // Process and enhance results
    const enhancedResults = await enhanceResultsWithAI(query, searchResults);
    
    return new Response(
      JSON.stringify(enhancedResults),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing research query:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error processing research query: ' + (error instanceof Error ? error.message : String(error)) 
      }),
      { 
        status: 200, // Sending 200 instead of 500 to prevent CORS issues in browser
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function fetchSearchResults(query: string) {
  try {
    if (!serperApiKey) {
      // Return mock data if no API key
      return mockSearchResults();
    }
    
    const searchResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query + " academic research",
        num: 10
      })
    });
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search API error:', errorText);
      throw new Error('Failed to fetch search results');
    }
    
    const data = await searchResponse.json();
    return data;
    
  } catch (error) {
    console.error('Search API error:', error);
    // Fall back to mock data
    return mockSearchResults();
  }
}

async function enhanceResultsWithAI(query: string, searchResults: any) {
  try {
    // Extract relevant information from search results
    const organicResults = searchResults.organic || [];
    const snippets = searchResults.knowledgeGraph || {};
    
    const searchSnippets = organicResults.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet
    }));
    
    if (!googleAIKey) {
      return {
        results: searchSnippets,
        summary: "Here are some academic resources related to your query.",
        query: query
      };
    }
    
    // Format results for the LLM
    const resultsText = searchSnippets.map((r: any, i: number) => 
      `[${i+1}] ${r.title}\nURL: ${r.link}\nSummary: ${r.snippet}`
    ).join('\n\n');
    
    // Use Gemini to summarize and enhance results
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleAIKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful academic research assistant. Analyze these search results for the query "${query}" and create a summary of the main findings, themes, and key resources:

${resultsText}

Provide a concise summary of these resources, including the most relevant papers or findings. Format your response as JSON with a "summary" field and a "keyInsights" array with 3-5 bullet points.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          topP: 0.8
        }
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const geminiText = geminiData.candidates[0].content.parts[0].text;
    
    // Parse the JSON response from Gemini
    let enhancedData;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = geminiText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                      geminiText.match(/\{[\s\S]*?\}/);
                      
      if (jsonMatch) {
        enhancedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        enhancedData = {
          summary: geminiText,
          keyInsights: ["Research results found", "Multiple sources available", "Explore links for more information"]
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      enhancedData = {
        summary: "Here are research results related to your query.",
        keyInsights: ["Research results found", "Multiple sources available", "Explore links for more information"]
      };
    }
    
    return {
      results: searchSnippets,
      summary: enhancedData.summary,
      keyInsights: enhancedData.keyInsights || [],
      query: query
    };
    
  } catch (error) {
    console.error('Error enhancing results with AI:', error);
    
    // Return basic results without enhancement
    const organicResults = searchResults.organic || [];
    const searchSnippets = organicResults.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet
    }));
    
    return {
      results: searchSnippets,
      summary: "Here are some research results related to your query.",
      query: query
    };
  }
}

function mockSearchResults() {
  return {
    organic: [
      {
        title: "Academic Research on the Topic",
        link: "https://example.org/research/topic",
        snippet: "This academic paper explores the key aspects of the subject with comprehensive analysis and peer-reviewed methodology."
      },
      {
        title: "Journal of Academic Studies - Related Research",
        link: "https://example.org/journal/studies",
        snippet: "A collection of academic studies and scholarly articles examining various dimensions of this research area."
      },
      {
        title: "University Research Database - Findings",
        link: "https://example.org/university/database",
        snippet: "Access to university research findings, papers, and scholarly materials on the requested topic."
      }
    ]
  };
}
