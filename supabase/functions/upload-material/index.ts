
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Database client initialization
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { userId, title, files } = await req.json();
    
    if (!userId || !title || !files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new material record
    const { data: materialData, error: materialError } = await supabase
      .from('materials')
      .insert({
        user_id: userId,
        title: title
      })
      .select()
      .single();
    
    if (materialError) {
      console.error('Error creating material record:', materialError);
      throw new Error(`Failed to create material: ${materialError.message}`);
    }

    const materialId = materialData.id;
    
    // Generate presigned URLs for each file for direct upload
    const uploadUrls = await Promise.all(
      files.map(async (file: { name: string, type: string }) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${materialId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Get presigned URL
        const { data: urlData, error: urlError } = await supabase
          .storage
          .from('course-materials')
          .createSignedUploadUrl(filePath);
        
        if (urlError) {
          throw new Error(`Failed to create signed URL: ${urlError.message}`);
        }
        
        // Save file metadata
        const { error: fileError } = await supabase
          .from('uploads')
          .insert({
            user_id: userId,
            file_path: filePath,
            filename: file.name,
            content_type: file.type
          });
          
        if (fileError) {
          console.warn('Error saving file metadata:', fileError);
          // Continue despite metadata error
        }
        
        return urlData.signedUrl;
      })
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        materialId,
        uploadUrls
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in upload-material function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process upload request' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
