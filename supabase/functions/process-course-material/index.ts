
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
};

serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Parse request body
    const { filePath, title, userId } = await req.json();

    // Initialize Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Create a new material entry
    const { data: material, error: materialError } = await supabaseClient
      .from("materials")
      .insert({
        user_id: userId,
        title,
      })
      .select()
      .single();

    if (materialError) {
      throw new Error(`Failed to create material: ${materialError.message}`);
    }

    // Get file content from storage
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from("course-materials")
      .download(filePath);

    if (fileError || !fileData) {
      throw new Error(`Failed to download file: ${fileError?.message}`);
    }

    // Convert file to text depending on the type
    const text = await fileData.text();
    
    // For a real implementation, you would process the text more intelligently
    // Here we're making a simple version that creates segments by splitting on double line breaks
    const segments = text
      .split("\n\n")
      .filter(segment => segment.trim().length > 0)
      .map((segment, index) => {
        const title = `Segment ${index + 1}`;
        return {
          material_id: material.id,
          title,
          text: segment.trim(),
        };
      });

    // Insert segments
    if (segments.length > 0) {
      const { error: segmentsError } = await supabaseClient
        .from("segments")
        .insert(segments);

      if (segmentsError) {
        throw new Error(`Failed to create segments: ${segmentsError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Material processed successfully",
        materialId: material.id,
        segmentsCount: segments.length,
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    );
  } catch (error) {
    console.error("Error processing course material:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
