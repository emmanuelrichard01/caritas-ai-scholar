
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
    const { filePath, title, userId, prompt = "" } = await req.json();

    if (!filePath || !title || !userId) {
      throw new Error("Missing required parameters: filePath, title, userId");
    }

    // Initialize Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    console.log(`Processing course material: ${title} for user ${userId}`);

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
      console.error("Error creating material:", materialError);
      throw new Error(`Failed to create material: ${materialError.message}`);
    }

    console.log(`Created material record with ID: ${material.id}`);

    // Get file content from storage
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from("course-materials")
      .download(filePath);

    if (fileError || !fileData) {
      console.error("Error downloading file:", fileError);
      throw new Error(`Failed to download file: ${fileError?.message || "No data returned"}`);
    }

    console.log("File downloaded successfully, converting to text");

    // Convert file to text depending on the type
    let text: string;
    try {
      text = await fileData.text();
    } catch (textError) {
      console.error("Error converting file to text:", textError);
      text = "Content could not be extracted properly. Please try a different file format.";
    }

    console.log(`Extracted ${text.length} characters from file`);
    
    // Process the text more intelligently by splitting on paragraphs and headings
    // This is a simple segmentation algorithm that can be improved
    const lines = text.split("\n").filter(line => line.trim().length > 0);
    
    const segments: { material_id: string, title: string, text: string }[] = [];
    let currentSegmentTitle = "Introduction";
    let currentSegmentText = "";
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line looks like a heading (all caps, starts with Chapter, etc.)
      const isHeading = (
        trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5
        || /^(chapter|section|part|unit)\s+\d+/i.test(trimmedLine)
        || /^[IVXivx]+\.\s+/i.test(trimmedLine)  // Roman numerals with period
        || /^\d+\.\d+\s+/i.test(trimmedLine)     // Numbered sections like 1.1, 2.3
      );
      
      if (isHeading || segments.length === 0) {
        // If we have accumulated text for a segment, save it
        if (currentSegmentText.trim().length > 0) {
          segments.push({
            material_id: material.id,
            title: currentSegmentTitle,
            text: currentSegmentText.trim()
          });
        }
        
        // Start a new segment
        currentSegmentTitle = isHeading ? trimmedLine : "Introduction";
        currentSegmentText = isHeading ? "" : trimmedLine + "\n";
      } else {
        // Add to current segment
        currentSegmentText += trimmedLine + "\n";
      }
    }
    
    // Add the last segment if it has content
    if (currentSegmentText.trim().length > 0) {
      segments.push({
        material_id: material.id,
        title: currentSegmentTitle,
        text: currentSegmentText.trim()
      });
    }
    
    // If we still didn't get any segments, create at least one
    if (segments.length === 0) {
      segments.push({
        material_id: material.id,
        title: "Content",
        text: text.trim() || "No readable content could be extracted from this file."
      });
    }

    console.log(`Created ${segments.length} segments from the document`);

    // Insert segments
    const { error: segmentsError } = await supabaseClient
      .from("segments")
      .insert(segments);

    if (segmentsError) {
      console.error("Error creating segments:", segmentsError);
      throw new Error(`Failed to create segments: ${segmentsError.message}`);
    }

    console.log("Segments created successfully");

    return new Response(
      JSON.stringify({
        message: "Material processed successfully",
        materialId: material.id,
        segmentsCount: segments.length,
        result: `Successfully processed "${title}" into ${segments.length} segments`
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
