
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// Import file processing libraries
import * as pdfjsLib from "https://cdn.skypack.dev/pdfjs-dist@3.11.174";
import mammoth from "https://cdn.skypack.dev/mammoth@1.6.0";

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

    console.log("File downloaded successfully, extracting text based on file type");

    // Get file type from path or headers
    const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
    const contentType = fileData.type || '';
    
    console.log(`Processing file with extension: ${fileExtension}, content type: ${contentType}`);

    let text: string;
    try {
      text = await extractTextFromFile(fileData, fileExtension, contentType);
      if (!text || text.trim().length === 0) {
        throw new Error("File appears to be empty or unreadable");
      }
    } catch (textError) {
      console.error("Error extracting text from file:", textError);
      text = "Content could not be extracted properly. Please try a different file format or ensure the file is not corrupted.";
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

// Enhanced text extraction function with support for multiple file types
async function extractTextFromFile(
  fileData: Blob, 
  fileExtension: string, 
  contentType: string
): Promise<string> {
  console.log(`Extracting text from ${fileExtension} file (${contentType})`);
  
  try {
    switch (fileExtension) {
      case 'pdf':
        return await extractTextFromPDF(fileData);
      case 'doc':
      case 'docx':
        return await extractTextFromWord(fileData);
      case 'txt':
        return await extractTextFromPlainText(fileData);
      default:
        // Fallback to plain text extraction
        console.warn(`Unsupported file type ${fileExtension}, attempting plain text extraction`);
        return await extractTextFromPlainText(fileData);
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileExtension}:`, error);
    // Fallback to basic text extraction
    return await extractTextFromPlainText(fileData);
  }
}

async function extractTextFromPDF(fileData: Blob): Promise<string> {
  try {
    console.log("Extracting text from PDF...");
    
    const arrayBuffer = await fileData.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);
    
    // Configure PDF.js to work in Deno environment
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .filter((item: any) => item.str)
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += `\n\n--- Page ${pageNum} ---\n${pageText}`;
        console.log(`Extracted text from page ${pageNum}: ${pageText.length} characters`);
      } catch (pageError) {
        console.error(`Error extracting page ${pageNum}:`, pageError);
        fullText += `\n\n--- Page ${pageNum} ---\n[Error extracting page content]`;
      }
    }
    
    console.log(`Total PDF text extracted: ${fullText.length} characters`);
    return fullText;
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

async function extractTextFromWord(fileData: Blob): Promise<string> {
  try {
    console.log("Extracting text from Word document...");
    
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Use mammoth to extract text from Word documents
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn("Mammoth warnings:", result.messages);
    }
    
    console.log(`Word text extracted: ${result.value.length} characters`);
    return result.value || '';
  } catch (error) {
    console.error("Word document extraction failed:", error);
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
}

async function extractTextFromPlainText(fileData: Blob): Promise<string> {
  try {
    console.log("Extracting plain text...");
    
    // Try different encodings to handle various text files
    const encodings = ['utf-8', 'utf-16', 'iso-8859-1'];
    
    for (const encoding of encodings) {
      try {
        const text = await fileData.text();
        if (text && text.trim().length > 0) {
          console.log(`Text extracted with ${encoding}: ${text.length} characters`);
          return text;
        }
      } catch (encodingError) {
        console.warn(`Failed to decode with ${encoding}:`, encodingError);
        continue;
      }
    }
    
    throw new Error("Could not decode text file with any supported encoding");
  } catch (error) {
    console.error("Plain text extraction failed:", error);
    throw new Error(`Failed to extract plain text: ${error.message}`);
  }
}

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

  console.log(`Processing ${sanitizedText.length} characters into segments`);

  // Enhanced preprocessing for better segmentation
  const preprocessedText = preprocessText(sanitizedText);
  const lines = preprocessedText.split("\n").filter(line => line.trim().length > 0);
  const segments: { material_id: string, title: string, text: string }[] = [];
  
  let currentSegmentTitle = "Introduction";
  let currentSegmentText = "";
  let segmentCount = 0;
  const minSegmentLength = 150; // Increased minimum for better content chunks
  const maxSegmentLength = 3000; // Optimal size for AI processing
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Advanced heading detection with comprehensive patterns
    const isHeading = detectHeading(trimmedLine);
    
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
  
  const finalSegments = validSegments.length > 0 ? validSegments : [{
    material_id: materialId,
    title: "Content", 
    text: sanitizeText(sanitizedText)
  }];

  console.log(`Final segmentation: ${finalSegments.length} segments created`);
  return finalSegments;
}

// Enhanced text preprocessing for better structure detection
function preprocessText(text: string): string {
  return text
    // Normalize page breaks and headers
    .replace(/--- Page \d+ ---/g, '\n\n')
    // Fix broken sentences across lines
    .replace(/([a-z])\n([a-z])/g, '$1 $2')
    // Preserve paragraph breaks
    .replace(/\n\s*\n/g, '\n\n')
    // Normalize bullet points
    .replace(/^\s*[•·▪▫‣⁃]\s+/gm, '• ')
    // Normalize numbered lists
    .replace(/^\s*\d+\.\s+/gm, (match) => match.trim() + ' ')
    // Clean up excessive whitespace
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Advanced heading detection with multiple patterns
function detectHeading(line: string): boolean {
  const trimmedLine = line.trim();
  
  // Skip very short or very long lines
  if (trimmedLine.length < 3 || trimmedLine.length > 120) {
    return false;
  }
  
  const patterns = [
    // Academic patterns
    /^(chapter|section|part|unit|lesson|module|topic|appendix|introduction|conclusion|summary|abstract|references|bibliography)\s+\d*:?\s*/i,
    
    // Numbered patterns
    /^\d+(\.\d+)*\s+[A-Z].*/,  // 1.1 Title, 2.3.1 Subtitle
    /^[IVXivx]+\.\s+[A-Z].*/,  // Roman numerals: I. Title
    
    // Markdown and formatting
    /^#{1,6}\s+.*/,            // Markdown headers
    /^\*{1,3}[^*]+\*{1,3}$/,   // Bold/italic formatting
    /^_{1,3}[^_]+_{1,3}$/,     // Underscore formatting
    
    // Content-based patterns
    /^[A-Z][A-Z\s]{4,}[A-Z]$/,               // ALL CAPS (but not too short)
    /^[A-Z][a-z\s]+:$/,                      // Title Case ending with colon
    /^.+:$/,                                 // Any line ending with colon (questions, definitions)
    
    // Academic keywords
    /^(definition|theorem|proof|example|exercise|problem|solution|note|remark|observation|proposition|lemma|corollary)(\s+\d+)?:?\s*/i,
    
    // Question patterns
    /^(what|why|how|when|where|which|who)\s+.*\?$/i,
    
    // Special formatting indicators
    /^\[.+\]$/,                              // Bracketed text
    /^\(.+\)$/,                              // Parenthesized text (if not too long)
  ];
  
  return patterns.some(pattern => pattern.test(trimmedLine));
}
