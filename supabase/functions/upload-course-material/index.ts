
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
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;
    
    // Validate inputs
    if (!title || !file) {
      throw new Error("Title and file are required");
    }

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

    // Get user ID from session
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Authentication required");
    }

    const userId = session.user.id;
    
    // Create a storage path for the file
    const filePath = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabaseClient.storage
      .from("course-materials")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Create material record
    const { data: material, error: materialError } = await supabaseClient
      .from("materials")
      .insert({
        user_id: userId,
        title,
        description: description || null,
      })
      .select()
      .single();

    if (materialError) {
      throw new Error(`Failed to create material: ${materialError.message}`);
    }

    // Process file content and create segments (simplified here)
    const fileContent = await file.text();
    
    // Simple text segmentation - in a real app, this would be more sophisticated
    const segments = fileContent
      .split("\n\n")
      .filter(segment => segment.trim().length > 0)
      .map((segment, index) => {
        return {
          material_id: material.id,
          title: `Segment ${index + 1}`,
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
        message: "Material uploaded and processed successfully",
        material,
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
    console.error("Error uploading course material:", error);
    
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
