
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

    // Initialize Supabase client first
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header found");
      return new Response(
        JSON.stringify({ 
          error: "Authentication required - no auth header",
          success: false
        }),
        {
          status: 401,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
        }
      );
    }

    // Verify the JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ 
          error: "Authentication failed",
          success: false
        }),
        {
          status: 401,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
        }
      );
    }

    console.log("User authenticated:", user.id);

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
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ 
          error: "Title and file are required",
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

    const userId = user.id;
    
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
      return new Response(
        JSON.stringify({ 
          error: `Failed to create material: ${materialError.message}`,
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
      return new Response(
        JSON.stringify({ 
          error: `File upload failed: ${uploadError.message}`,
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
    try {
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
      } else {
        console.log("File processed successfully:", processData);
      }
    } catch (processError) {
      console.error("Processing exception:", processError);
      // Don't fail - material is uploaded even if processing fails
    }

    return new Response(
      JSON.stringify({
        message: "Material uploaded successfully",
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
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
