
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request validation schema
const RequestSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  title: z.string().min(1, "Title is required"),
  userId: z.string().uuid("Invalid user ID format"),
  materialId: z.string().uuid("Invalid material ID format"),
  prompt: z.string().optional().default("")
});

// Constants for processing
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Method validation
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        expectedMethod: 'POST' 
      }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Invalid JSON in request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate using Zod schema
    const validation = RequestSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Request validation failed:', validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request parameters',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { filePath, title, userId, materialId, prompt } = validation.data;

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

    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        message: "Material processed successfully",
        materialId: materialId,
        segmentsCount: segments.length,
        segments: segmentsData,
        result: `Successfully processed "${title}" into ${segments.length} segments`,
        metadata: {
          userId,
          materialId,
          originalTitle: title,
          processingTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
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
    console.error(`Error processing course material (${responseTime}ms):`, error);
    
    const isClientError = error instanceof Error && (
      error.message.includes('Missing required parameters') ||
      error.message.includes('Invalid') ||
      error.message.includes('not found') ||
      error.message.includes('File appears to be empty')
    );
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        processingTime: `${responseTime}ms`
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
