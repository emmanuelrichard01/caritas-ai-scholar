
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Database client initialization
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { materialId, userId } = await req.json();
    
    if (!materialId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get material details
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .eq('user_id', userId)
      .single();
    
    if (materialError || !material) {
      console.error('Error retrieving material:', materialError);
      throw new Error('Material not found or access denied');
    }

    // Get associated file uploads for this material
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (uploadsError) {
      console.error('Error retrieving uploads:', uploadsError);
      throw new Error('Failed to retrieve file information');
    }

    // Extract text content from the uploaded files
    let extractedText = "";
    for (const upload of uploads) {
      try {
        // Get file download URL
        const { data: fileData, error: fileError } = await supabase
          .storage
          .from('course-materials')
          .createSignedUrl(upload.file_path, 3600); // 1 hour expiry
        
        if (fileError || !fileData) {
          console.error('Error creating signed URL:', fileError);
          continue;
        }
        
        // Extract text based on file type
        const downloadUrl = fileData.signedUrl;
        let fileContent = "";
        
        if (upload.content_type.includes('pdf')) {
          // For PDFs, we'd normally use pdf-parse, but in this edge function
          // we'll use a simplified approach and just extract text directly when possible
          // or rely on AI to process the file
          fileContent = `[PDF Content would be extracted here from ${upload.filename}]`;
        } else if (upload.content_type.includes('docx') || upload.content_type.includes('doc')) {
          fileContent = `[DOCX Content would be extracted here from ${upload.filename}]`;
        } else if (upload.content_type.includes('ppt')) {
          fileContent = `[PowerPoint Content would be extracted here from ${upload.filename}]`;
        } else if (upload.content_type.includes('text/plain')) {
          // For text files, download and add content directly
          const textResponse = await fetch(downloadUrl);
          fileContent = await textResponse.text();
        } else {
          fileContent = `[Unsupported file type for ${upload.filename}]`;
        }
        
        extractedText += `\n\n--- START OF ${upload.filename} ---\n\n${fileContent}\n\n--- END OF ${upload.filename} ---\n\n`;
      } catch (extractError) {
        console.error('Error extracting content from file:', extractError);
        // Continue with other files
      }
    }

    // Use AI to segment the material into logical chunks
    const segmentResults = await segmentContent(extractedText, material.title);
    
    // Save segments to the database
    for (const segment of segmentResults) {
      try {
        const { error: segmentError } = await supabase
          .from('segments')
          .insert({
            material_id: materialId,
            title: segment.title,
            text: segment.text
          });
          
        if (segmentError) {
          console.error('Error creating segment:', segmentError);
        }
      } catch (segmentSaveError) {
        console.error('Error saving segment:', segmentSaveError);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Material processed successfully',
        segmentCount: segmentResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in process-material function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process material' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to segment content using AI
async function segmentContent(text: string, title: string) {
  // For demo purposes, create simple segments
  // In a production environment, we would use OpenAI or another AI to create better segments
  const chunks = text.split('\n\n--- START OF');
  
  // Generate at least one segment even if there's no text
  if (chunks.length <= 1) {
    return [{
      title: title || "Introduction",
      text: text || "No content available"
    }];
  }
  
  return chunks.map((chunk, index) => {
    // Simple title extraction
    const chunkTitle = chunk.includes('---') 
      ? chunk.split('---')[0].trim() 
      : `Section ${index + 1}`;
      
    return {
      title: index === 0 ? title : chunkTitle,
      text: chunk.trim()
    };
  });
}
