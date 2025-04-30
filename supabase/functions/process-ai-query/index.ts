
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, userId, category, additionalData } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({ 
          answer: "I'm sorry, but the AI service is not properly configured. Please contact the administrator to set up the OpenAI API key.",
          error: "API_KEY_MISSING" 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Different handling based on category
    switch (category) {
      case 'course-tutor':
        return await processCourseQuery(query, userId, additionalData);
      case 'research':
        return await processResearchQuery(query);
      case 'study-planner':
        return await processStudyPlannerQuery(query, additionalData);
      case 'assignment-helper':
        return await processAssignmentQuery(query, additionalData);
      default:
        return await processDefaultQuery(query);
    }
  } catch (error) {
    console.error('Error processing query:', error);
    return new Response(
      JSON.stringify({ 
        answer: "I encountered an error while processing your request. Please try again later.",
        error: error.message || 'Failed to process query' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processCourseQuery(query: string, userId: string, additionalData: any) {
  // Handle processing course materials if files are provided
  if (additionalData?.files?.length > 0) {
    try {
      const fileContents = await extractFileContents(additionalData.files, userId);
      let systemPrompt = "You are an educational AI assistant that helps students understand course materials. ";
      
      if (fileContents.length > 0) {
        systemPrompt += "Analyze the following content from the uploaded materials and provide a comprehensive, well-structured response.";
      } else {
        systemPrompt += "The user has uploaded files but their content couldn't be extracted properly. Try to help based on the query alone.";
      }

      const response = await callOpenAI(
        systemPrompt,
        `${fileContents}\n\nUser Query: ${query}`,
        1500
      );
      
      return new Response(
        JSON.stringify({ answer: response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error processing file content:', error);
      return new Response(
        JSON.stringify({ 
          answer: "I had trouble analyzing your documents. Could you try uploading them again or rephrasing your question?",
          error: error.message  
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } else {
    // Handle direct questions about course concepts
    const systemPrompt = "You are an educational AI assistant that helps students understand course materials and academic concepts.";
    const response = await callOpenAI(systemPrompt, query, 800);
    
    return new Response(
      JSON.stringify({ answer: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function processResearchQuery(query: string) {
  const systemPrompt = "You are a research assistant AI that helps find scholarly sources and academic information. Provide relevant research information, potential sources, and insights. Format your response in a way that's easy to parse into research results.";
  const response = await callOpenAI(systemPrompt, query, 800);
  
  return new Response(
    JSON.stringify({ answer: response }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processStudyPlannerQuery(query: string, additionalData: any) {
  const systemPrompt = "You are an AI study planner that creates personalized study schedules and learning plans. Take into account the user's preferences, deadlines, and learning style.";
  const response = await callOpenAI(systemPrompt, `${JSON.stringify(additionalData)}\n\nUser Request: ${query}`, 800);
  
  return new Response(
    JSON.stringify({ answer: response }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processAssignmentQuery(query: string, additionalData: any) {
  const systemPrompt = "You are an AI assignment helper that assists with academic tasks. Provide guidance, suggestions, and help with structuring assignments. You do not write complete assignments but offer constructive assistance.";
  const response = await callOpenAI(systemPrompt, query, 800);
  
  return new Response(
    JSON.stringify({ answer: response }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processDefaultQuery(query: string) {
  const systemPrompt = "You are a helpful AI assistant for students. Answer questions concisely and accurately.";
  const response = await callOpenAI(systemPrompt, query, 500);
  
  return new Response(
    JSON.stringify({ answer: response }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens = 800) {
  try {
    console.log(`Calling OpenAI with system prompt: ${systemPrompt.substring(0, 50)}...`);
    console.log(`User prompt length: ${userPrompt.length} characters`);
    
    if (!openAIApiKey) {
      return "I apologize, but the AI service is not properly configured. Please contact the administrator to set up the OpenAI API key.";
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return "I encountered an error when generating a response. Please try again later.";
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return `I encountered an error: ${data.error.message || 'Unknown error'}. Please try again later.`;
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return "I encountered an error when generating a response. Please try again later.";
  }
}

async function extractFileContents(files: any[], userId: string) {
  try {
    console.log(`Extracting content from ${files.length} files for user ${userId}`);
    
    let allContent = '';
    
    for (const file of files) {
      try {
        // Download file from Supabase storage
        console.log(`Downloading file: ${file.filePath}`);
        
        const downloadResponse = await fetch(`${supabaseUrl}/storage/v1/object/public/course-materials/${file.filePath}`, {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });
        
        if (!downloadResponse.ok) {
          console.error(`Failed to download file ${file.filename}:`, await downloadResponse.text());
          continue;
        }

        // Get file content based on type
        let content = '';
        const fileBlob = await downloadResponse.blob();
        
        if (file.contentType.includes('text/plain')) {
          content = await fileBlob.text();
        } else {
          // For non-text files, we'll include basic metadata
          content = `[File: ${file.filename} - ${file.contentType} - Size: ${(file.size / 1024).toFixed(2)} KB]\n`;
          
          // Add a note about processing limitations
          if (file.contentType.includes('pdf') || file.contentType.includes('doc') || file.contentType.includes('presentation')) {
            content += "Note: Full document content extraction for this file type is limited in the current system.\n";
          }
        }
        
        allContent += `--- START OF ${file.filename} ---\n${content}\n--- END OF ${file.filename} ---\n\n`;
      } catch (fileError) {
        console.error(`Error processing file ${file.filename}:`, fileError);
      }
    }
    
    return allContent || "No content could be extracted from the uploaded files.";
  } catch (error) {
    console.error('Error extracting file contents:', error);
    return 'Error: Could not extract file contents.';
  }
}
