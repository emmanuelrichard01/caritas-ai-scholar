
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, title, userId, materialId, prompt = "" } = await req.json();

    if (!filePath || !title || !userId || !materialId) {
      throw new Error("Missing required parameters: filePath, title, userId, materialId");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    console.log(`Processing course material: ${title} for user ${userId}, material ${materialId}`);

    // Download file from storage
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from("course-materials")
      .download(filePath);

    if (fileError || !fileData) {
      console.error("Error downloading file:", fileError);
      throw new Error(`Failed to download file: ${fileError?.message || "No data returned"}`);
    }

    console.log("File downloaded successfully, converting to text");

    let text: string;
    try {
      text = await fileData.text();
    } catch (textError) {
      console.error("Error converting file to text:", textError);
      text = "Content could not be extracted properly. Please try a different file format.";
    }

    console.log(`Extracted ${text.length} characters from file`);
    
    // Save upload record
    const { error: uploadError } = await supabaseClient
      .from("uploads")
      .insert({
        user_id: userId,
        file_path: filePath,
        filename: title,
        content_type: fileData.type
      });
      
    if (uploadError) {
      console.error("Error saving upload record:", uploadError);
    }
    
    // Enhanced text processing with better segmentation
    const segments = processTextIntoSegments(text, materialId);

    console.log(`Created ${segments.length} segments from the document`);

    // Insert segments
    const { data: segmentsData, error: segmentsError } = await supabaseClient
      .from("segments")
      .insert(segments)
      .select();

    if (segmentsError) {
      console.error("Error creating segments:", segmentsError);
      throw new Error(`Failed to create segments: ${segmentsError.message}`);
    }

    console.log("Segments created successfully");

    return new Response(
      JSON.stringify({
        message: "Material processed successfully",
        materialId: materialId,
        segmentsCount: segments.length,
        segments: segmentsData,
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

function processTextIntoSegments(text: string, materialId: string) {
  const lines = text.split("\n").filter(line => line.trim().length > 0);
  const segments: { material_id: string, title: string, text: string }[] = [];
  
  let currentSegmentTitle = "Introduction";
  let currentSegmentText = "";
  let segmentCount = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Enhanced heading detection
    const isHeading = (
      trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5 && trimmedLine.length < 100
      || /^(chapter|section|part|unit|lesson|module)\s+\d+/i.test(trimmedLine)
      || /^[IVXivx]+\.\s+/i.test(trimmedLine)
      || /^\d+\.\d+\s+/i.test(trimmedLine)
      || /^#{1,6}\s+/.test(trimmedLine) // Markdown headers
      || trimmedLine.endsWith(':') && trimmedLine.length < 50
    );
    
    if (isHeading && currentSegmentText.trim().length > 50) {
      // Save current segment if it has substantial content
      segments.push({
        material_id: materialId,
        title: currentSegmentTitle,
        text: currentSegmentText.trim()
      });
      
      // Start new segment
      currentSegmentTitle = trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '');
      currentSegmentText = "";
      segmentCount++;
    } else if (isHeading && currentSegmentText.trim().length <= 50) {
      // Update title if we haven't collected much content yet
      currentSegmentTitle = trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '');
    } else {
      // Add to current segment
      currentSegmentText += trimmedLine + "\n";
    }
  }
  
  // Add the last segment if it has content
  if (currentSegmentText.trim().length > 0) {
    segments.push({
      material_id: materialId,
      title: currentSegmentTitle,
      text: currentSegmentText.trim()
    });
  }
  
  // If no segments were created, create at least one
  if (segments.length === 0) {
    segments.push({
      material_id: materialId,
      title: "Content",
      text: text.trim() || "No readable content could be extracted from this file."
    });
  }

  return segments;
}
