
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

    // Download file from storage with retry logic
    let fileData;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabaseClient
          .storage
          .from("course-materials")
          .download(filePath);

        if (error) throw error;
        fileData = data;
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error("Error downloading file after retries:", error);
          throw new Error(`Failed to download file: ${error?.message || "No data returned"}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    console.log("File downloaded successfully, converting to text");

    let text: string;
    try {
      text = await fileData.text();
      if (!text || text.trim().length === 0) {
        throw new Error("File appears to be empty or unreadable");
      }
    } catch (textError) {
      console.error("Error converting file to text:", textError);
      text = "Content could not be extracted properly. Please try a different file format.";
    }

    console.log(`Extracted ${text.length} characters from file`);
    
    // Save upload record with better error handling
    try {
      const { error: uploadError } = await supabaseClient
        .from("uploads")
        .insert({
          user_id: userId,
          file_path: filePath,
          filename: title,
          content_type: fileData.type || 'application/octet-stream'
        });
        
      if (uploadError) {
        console.warn("Error saving upload record:", uploadError);
      }
    } catch (uploadRecordError) {
      console.warn("Failed to save upload record:", uploadRecordError);
    }
    
    // Enhanced text processing with improved segmentation
    const segments = processTextIntoSegments(text, materialId);

    console.log(`Created ${segments.length} segments from the document`);

    if (segments.length === 0) {
      throw new Error("No valid segments could be created from the document");
    }

    // Insert segments with batch processing for better performance
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

function sanitizeText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove control characters
    .replace(/\uFFFD/g, '') // Remove replacement characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/[\r\n]+/g, '\n') // Normalize line breaks
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

function processTextIntoSegments(text: string, materialId: string) {
  const sanitizedText = sanitizeText(text);
  
  if (!sanitizedText || sanitizedText.length < 10) {
    return [{
      material_id: materialId,
      title: "Content",
      text: "No readable content could be extracted from this file."
    }];
  }

  const lines = sanitizedText.split("\n").filter(line => line.trim().length > 0);
  const segments: { material_id: string, title: string, text: string }[] = [];
  
  let currentSegmentTitle = "Introduction";
  let currentSegmentText = "";
  let segmentCount = 0;
  const minSegmentLength = 100; // Minimum characters per segment
  const maxSegmentLength = 5000; // Maximum characters per segment
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Enhanced heading detection with better patterns
    const isHeading = (
      // All caps heading (but not too long)
      (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5 && trimmedLine.length < 100 && /[A-Z]/.test(trimmedLine))
      // Numbered sections
      || /^(chapter|section|part|unit|lesson|module)\s+\d+/i.test(trimmedLine)
      // Roman numerals
      || /^[IVXivx]+\.\s+/i.test(trimmedLine)
      // Decimal numbering
      || /^\d+(\.\d+)*\s+/.test(trimmedLine)
      // Markdown headers
      || /^#{1,6}\s+/.test(trimmedLine)
      // Lines ending with colon (but not too long)
      || (trimmedLine.endsWith(':') && trimmedLine.length < 80 && trimmedLine.length > 5)
    );
    
    if (isHeading && currentSegmentText.trim().length >= minSegmentLength) {
      // Save current segment if it has substantial content
      segments.push({
        material_id: materialId,
        title: sanitizeText(currentSegmentTitle),
        text: sanitizeText(currentSegmentText.trim())
      });
      
      // Start new segment
      currentSegmentTitle = trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '').trim();
      currentSegmentText = "";
      segmentCount++;
    } else if (isHeading && currentSegmentText.trim().length < minSegmentLength) {
      // Update title if we haven't collected much content yet
      currentSegmentTitle = trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '').trim();
    } else {
      // Add to current segment, but check for length limits
      if (currentSegmentText.length + trimmedLine.length + 1 <= maxSegmentLength) {
        currentSegmentText += trimmedLine + "\n";
      } else if (currentSegmentText.trim().length >= minSegmentLength) {
        // Save current segment and start new one
        segments.push({
          material_id: materialId,
          title: sanitizeText(currentSegmentTitle),
          text: sanitizeText(currentSegmentText.trim())
        });
        
        currentSegmentTitle = `${currentSegmentTitle} (continued)`;
        currentSegmentText = trimmedLine + "\n";
        segmentCount++;
      }
    }
  }
  
  // Add the last segment if it has content
  if (currentSegmentText.trim().length >= minSegmentLength) {
    segments.push({
      material_id: materialId,
      title: sanitizeText(currentSegmentTitle),
      text: sanitizeText(currentSegmentText.trim())
    });
  }
  
  // If no segments were created or only very small ones, create a single segment
  if (segments.length === 0 || segments.every(s => s.text.length < minSegmentLength)) {
    return [{
      material_id: materialId,
      title: "Content",
      text: sanitizeText(sanitizedText)
    }];
  }

  // Filter out segments that are too small
  const validSegments = segments.filter(s => s.text.length >= minSegmentLength);
  
  return validSegments.length > 0 ? validSegments : [{
    material_id: materialId,
    title: "Content",
    text: sanitizeText(sanitizedText)
  }];
}
