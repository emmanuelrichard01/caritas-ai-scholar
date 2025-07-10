
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

// Rate limiting map (simple in-memory store)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // uploads per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getRateLimitKey(userId: string): string {
  return `upload_${userId}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (50MB)` };
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` };
  }
  
  return { valid: true };
}

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Method validation
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        expectedMethod: 'POST',
        success: false 
      }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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

    // Rate limiting
    const rateLimitKey = getRateLimitKey(user.id);
    if (isRateLimited(rateLimitKey)) {
      console.warn(`Upload rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: 'Upload rate limit exceeded',
          retryAfter: '1 hour',
          success: false
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body 
    let formData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error("Error parsing form data:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid form data",
          details: parseError.message,
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

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;
    
    console.log("Received data:", { 
      title, 
      description,
      hasFile: !!file, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    // Validate inputs
    if (!title?.trim()) {
      console.error("Missing or empty title");
      return new Response(
        JSON.stringify({ 
          error: "Title is required and cannot be empty",
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

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      console.error("File validation failed:", fileValidation.error);
      return new Response(
        JSON.stringify({ 
          error: fileValidation.error,
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

    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        message: "Material uploaded successfully",
        material,
        success: true,
        metadata: {
          userId: user.id,
          uploadTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        }
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Error uploading course material (${responseTime}ms):`, error);
    
    const isClientError = error instanceof Error && (
      error.message.includes('Authentication') ||
      error.message.includes('required') ||
      error.message.includes('validation') ||
      error.message.includes('Invalid')
    );
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      }),
      {
        status: isClientError ? 400 : 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
