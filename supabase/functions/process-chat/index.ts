import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleAIKey = Deno.env.get('GOOGLE_AI_KEY') || 'AIzaSyDHnnACtYYBHf3Y1FMVv2jp-8l12MK7RUw';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

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
    
    // Try Google AI first as the primary option
    try {
      console.log('Using Google AI Studio API');
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + googleAIKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an educational AI assistant that helps students with their academic needs. Provide helpful, accurate, and concise answers to their questions.\n\nUser query: ${query}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.9
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Google AI API error:', errorData);
        throw new Error(`Google AI API error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.candidates[0].content.parts[0].text;
      
      return new Response(
        JSON.stringify({ answer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (googleError) {
      console.error('Google AI error, falling back to OpenAI:', googleError.message);
      
      // Fall back to OpenAI if configured
      if (openAIApiKey) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are an educational AI assistant that helps students with their academic needs. Provide helpful, accurate, and concise answers to their questions.' 
                },
                { role: 'user', content: query }
              ],
              temperature: 0.7,
              max_tokens: 800,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            throw new Error("OpenAI API error");
          }
          
          const data = await response.json();
          const answer = data.choices[0].message.content;
          
          return new Response(
            JSON.stringify({ answer }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (openaiError) {
          console.error('OpenAI fallback failed:', openaiError.message);
          // Continue to fallback response
        }
      }
      
      // Fallback to in-function response when both APIs fail
      const fallbackResponse = handleFallbackResponse(query);
      return new Response(
        JSON.stringify({ answer: fallbackResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing chat query:', error);
    return new Response(
      JSON.stringify({ 
        answer: "I encountered an error when generating a response. Please try again later.",
        error: error.message || 'Failed to process query' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate meaningful responses when API integration is unavailable
function handleFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('course') || lowerQuery.includes('class')) {
    return "Our university offers various courses including Business Administration, Computer Science, Nursing, Economics, Psychology, Law, and Engineering. Each program has specific requirements. Would you like more details about any specific course?";
  } else if (lowerQuery.includes('study') || lowerQuery.includes('learn')) {
    return "**Effective Study Techniques**:\n\n1. **Pomodoro Method**: Study for 25 mins, break for 5 mins\n2. **Active Recall**: Test yourself instead of rereading\n3. **Spaced Repetition**: Review material at increasing intervals\n4. **Feynman Technique**: Explain concepts in simple terms\n5. **Mind Mapping**: Create visual connections between ideas\n\nWould you like me to elaborate on any of these techniques?";
  } else if (lowerQuery.includes('library')) {
    return "Our University Library offers:\n\n• Over 50,000 physical books\n• Access to major academic databases (JSTOR, ProQuest, etc.)\n• 24/7 online resources\n• Study rooms bookable through the student portal\n• Research assistance from librarians\n• Interlibrary loan services\n\nThe main library is open 8am-10pm weekdays and 9am-5pm on weekends.";
  } else if (lowerQuery.includes('calendar')) {
    return "**Current Academic Calendar**:\n\n• Spring Semester: January 15 - May 10\n• Summer Session: June 1 - August 15\n• Fall Semester: September 5 - December 20\n• Winter Break: December 21 - January 14\n\n*Important Dates:*\n• Midterms: March 1-5 (Spring), October 15-19 (Fall)\n• Final Exams: May 3-10 (Spring), December 15-20 (Fall)\n• Registration for next semester: April 1 (Fall), November 1 (Spring)";
  } else if (lowerQuery.includes('plan') || lowerQuery.includes('schedule')) {
    return "**Personalized Study Plan**\n\nBased on typical exam preparation needs:\n\n**Week 1-2: Foundation**\n• Review core concepts daily (30 min)\n• Create summary notes by topic\n• Identify knowledge gaps\n\n**Week 3-4: Practice**\n• Complete practice problems (45 min/day)\n• Form study group for difficult topics\n• Review flashcards during breaks\n\n**Final Week:**\n• Take full practice exams\n• Focus on weak areas\n• Ensure proper sleep and nutrition\n\nWould you like me to customize this plan further for your specific needs?";
  } else if (lowerQuery.includes('research')) {
    return "**Research Process Guide**\n\n**1. Topic Selection**\n• Choose a specific, focused research question\n• Ensure sufficient resources are available\n• Consider the relevance and impact of your topic\n\n**2. Literature Review**\n• Use academic databases: JSTOR, Google Scholar, PubMed\n• Take structured notes with citation information\n• Identify gaps in existing research\n\n**3. Methodology Planning**\n• Select appropriate research methods\n• Determine data collection and analysis techniques\n• Address potential limitations and ethical considerations\n\n**4. Writing & Revision**\n• Create a clear outline with logical structure\n• Support arguments with evidence from credible sources\n• Revise for clarity, coherence, and citation accuracy\n\nFor specific research guidance, please provide more details about your area of interest.";
  } else {
    return "I'm your academic assistant. I can help with:\n\n• Course information and selection\n• Study techniques and resources\n• Library services and research guidance\n• Academic planning and organization\n• Research strategies and methodologies\n\nWhat academic topic would you like assistance with today?";
  }
}
