
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Upload course material function called");

    // Parse request body 
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;
    
    console.log("Received data:", { title, hasFile: !!file, fileName: file?.name });
    
    // Validate inputs
    if (!title || !file) {
      throw new Error("Title and file are required");
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
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
      console.error("Authentication error:", sessionError);
      throw new Error("Authentication required");
    }

    const userId = session.user.id;
    console.log("User ID:", userId);
    
    // Create a storage path for the file
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}_${sanitizedFileName}`;
    
    console.log("Uploading file to path:", filePath);
    
    // Upload file to storage
    const { error: uploadError } = await supabaseClient.storage
      .from("course-materials")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    console.log("File uploaded successfully");

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
      console.error("Material creation error:", materialError);
      throw new Error(`Failed to create material: ${materialError.message}`);
    }

    console.log("Material created:", material);

    // Process the uploaded file
    const { error: processError } = await supabaseClient.functions.invoke('process-course-material', {
      body: {
        filePath,
        title: file.name,
        userId,
        materialId: material.id
      }
    });

    if (processError) {
      console.error("Processing error:", processError);
      throw new Error(`File processing failed: ${processError.message}`);
    }

    console.log("File processed successfully");

    return new Response(
      JSON.stringify({
        message: "Material uploaded and processed successfully",
        material,
        success: true
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
        success: false
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
