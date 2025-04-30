
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
      JSON.stringify({ error: 'Failed to process query' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processCourseQuery(query: string, userId: string, additionalData: any) {
  // Handle processing course materials if files are provided
  if (additionalData?.files?.length > 0) {
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

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      throw new Error(data.error.message || 'OpenAI API error');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
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
          // For non-text files (like PDFs, DOCs), we could use external APIs to extract text
          // But for now, just include the file name
          content = `[Content from ${file.filename} - ${file.contentType}]\n`;
        }
        
        allContent += `--- START OF ${file.filename} ---\n${content}\n--- END OF ${file.filename} ---\n\n`;
      } catch (fileError) {
        console.error(`Error processing file ${file.filename}:`, fileError);
      }
    }
    
    return allContent;
  } catch (error) {
    console.error('Error extracting file contents:', error);
    return '';
  }
}
