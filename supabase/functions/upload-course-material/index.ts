
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
    
    console.log("Received data:", { 
      title, 
      description,
      hasFile: !!file, 
      fileName: file?.name,
      fileSize: file?.size 
    });
    
    // Validate inputs
    if (!title || !file) {
      throw new Error("Title and file are required");
    }

    // Initialize Supabase client
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
    
    // Create material record first
    const { data: material, error: materialError } = await supabaseClient
      .from("materials")
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (materialError) {
      console.error("Material creation error:", materialError);
      throw new Error(`Failed to create material: ${materialError.message}`);
    }

    console.log("Material created:", material);

    // Create a storage path for the file
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${material.id}/${timestamp}_${sanitizedFileName}`;
    
    console.log("Uploading file to path:", filePath);
    
    // Upload file to storage
    const { error: uploadError } = await supabaseClient.storage
      .from("course-materials")
      .upload(filePath, file, {
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Try to clean up the material record
      await supabaseClient.from("materials").delete().eq("id", material.id);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    console.log("File uploaded successfully");

    // Save upload record
    const { error: uploadRecordError } = await supabaseClient
      .from("uploads")
      .insert({
        user_id: userId,
        file_path: filePath,
        filename: sanitizedFileName,
        content_type: file.type || "application/octet-stream"
      });
      
    if (uploadRecordError) {
      console.error("Error saving upload record:", uploadRecordError);
      // Don't fail the whole process for this
    }

    // Process the uploaded file
    console.log("Starting file processing...");
    const { data: processData, error: processError } = await supabaseClient.functions.invoke('process-course-material', {
      body: {
        filePath,
        title: file.name,
        userId,
        materialId: material.id
      }
    });

    if (processError) {
      console.error("Processing error:", processError);
      // Don't fail - material is uploaded even if processing fails
      console.log("File uploaded but processing failed - material still available");
    } else {
      console.log("File processed successfully:", processData);
    }

    return new Response(
      JSON.stringify({
        message: "Material uploaded successfully",
        material,
        processedSuccessfully: !processError,
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
