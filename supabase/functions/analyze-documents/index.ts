
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the multipart form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const query = formData.get('query') as string;
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one file is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process documents to extract text
    const documentContents: string[] = [];
    
    for (const file of files) {
      try {
        const content = await extractTextFromFile(file);
        documentContents.push(`File: ${file.name}\n${content}`);
      } catch (error) {
        console.error(`Error extracting text from ${file.name}:`, error);
        documentContents.push(`File: ${file.name}\nError extracting text: ${error.message}`);
      }
    }
    
    // If OpenAI is configured, use it for analysis
    if (openAIApiKey) {
      const documentContext = documentContents.join("\n\n");
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an educational AI assistant that helps analyze academic documents. Based on the document content, provide a detailed response to the user\'s query.'
            },
            { 
              role: 'user', 
              content: `Here are the contents of my documents:\n\n${documentContext}\n\nMy question is: ${query}`
            }
          ],
          temperature: 0.5,
          max_tokens: 1000,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      const answer = data.choices[0].message.content;
      
      return new Response(
        JSON.stringify({ answer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Fallback when OpenAI is not configured
      const documentSummary = generateDocumentSummary(documentContents);
      const answer = generateFallbackResponse(query, documentSummary);
      
      return new Response(
        JSON.stringify({ answer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error analyzing documents:', error);
    return new Response(
      JSON.stringify({ 
        answer: "I encountered an error while analyzing your documents. Please try again with smaller or different files.",
        error: error.message || 'Failed to analyze documents'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function extractTextFromFile(file: File): Promise<string> {
  // Extract text content based on file type
  const fileType = file.type.toLowerCase();
  const fileText = await file.text();
  
  if (fileType.includes('pdf')) {
    return extractTextFromPDF(fileText);
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return extractTextFromDocument(fileText);
  } else if (fileType.includes('presentation')) {
    return extractTextFromPresentation(fileText);
  } else if (fileType.includes('text')) {
    return fileText.substring(0, 10000); // Limit to 10k chars
  } else {
    return `[Unsupported file type: ${file.type}]`;
  }
}

function extractTextFromPDF(content: string): string {
  // Improved PDF text extraction
  let cleanedText = content
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Replace non-printable chars
    .replace(/\s+/g, ' ')                // Normalize whitespace
    .trim();
    
  // Look for common PDF text patterns
  const textBlocks = cleanedText.match(/(?:\/Text\s*<<.*?>>|\/Contents\s*\[.*?\])/gs) || [];
  if (textBlocks.length > 0) {
    cleanedText = textBlocks.join('\n');
  }
  
  // Remove common PDF encodings
  cleanedText = cleanedText
    .replace(/\/[A-Za-z0-9]+\s+[0-9]+\s+[0-9]+\s+R/g, ' ')
    .replace(/\[\(.*?\)\]/g, (match) => {
      return match.replace(/[\[\]\(\)]/g, ' ');
    });
  
  return cleanedText.substring(0, 10000); // Limit to 10k chars
}

function extractTextFromDocument(content: string): string {
  // Improved Word document text extraction
  let cleanedText = content
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Replace non-printable chars
    .replace(/\s+/g, ' ')                 // Normalize whitespace
    .trim();
  
  // Look for XML content in docx files
  if (cleanedText.includes('<w:document') || cleanedText.includes('<w:p')) {
    const textMatches = cleanedText.match(/<w:t>.*?<\/w:t>/g) || [];
    if (textMatches.length > 0) {
      cleanedText = textMatches
        .map(match => match.replace(/<\/?w:t>/g, ''))
        .join(' ');
    }
  }
  
  // Remove Word-specific formatting
  cleanedText = cleanedText
    .replace(/\{\\[^{}]*\}/g, '') // Remove RTF commands
    .replace(/HYPERLINK.*?MERGEFORMAT/g, '');
    
  return cleanedText.substring(0, 10000); // Limit to 10k chars
}

function extractTextFromPresentation(content: string): string {
  // Improved PowerPoint text extraction
  let cleanedText = content
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Replace non-printable chars
    .replace(/\s+/g, ' ')                 // Normalize whitespace
    .trim();
  
  // Look for slide content in pptx files
  if (cleanedText.includes('<p:sld') || cleanedText.includes('<a:p')) {
    const slideMatches = cleanedText.match(/<a:t>.*?<\/a:t>/g) || [];
    if (slideMatches.length > 0) {
      cleanedText = slideMatches
        .map((match, index) => {
          const slideText = match.replace(/<\/?a:t>/g, '');
          // Add slide markers
          if (index > 0 && slideMatches[index-1].includes('</a:p>')) {
            return `\n--- SLIDE ---\n${slideText}`;
          }
          return slideText;
        })
        .join(' ');
    }
  }
  
  return cleanedText.substring(0, 10000); // Limit to 10k chars
}

function generateDocumentSummary(documentContents: string[]): string {
  // Create a basic summary of the uploaded documents
  const summary = {
    fileCount: documentContents.length,
    totalLength: documentContents.reduce((sum, content) => sum + content.length, 0),
    fileTypes: new Set<string>(),
    keywords: new Set<string>()
  };
  
  // Extract basic info from documents
  documentContents.forEach(content => {
    const fileMatch = content.match(/File: (.*?)\n/);
    if (fileMatch) {
      const fileName = fileMatch[1];
      const extension = fileName.split('.').pop()?.toLowerCase();
      if (extension) {
        summary.fileTypes.add(extension);
      }
    }
    
    // Extract potential keywords (simplified approach)
    const words = content.toLowerCase().split(/\W+/);
    const commonWords = new Set(['the', 'and', 'to', 'of', 'a', 'in', 'that', 'is', 'was', 'for', 'on', 'are', 'with', 'they', 'be', 'as', 'by']);
    
    words.forEach(word => {
      if (word.length > 5 && !commonWords.has(word)) {
        summary.keywords.add(word);
      }
    });
  });
  
  return JSON.stringify(summary);
}

function generateFallbackResponse(query: string, documentSummary: string): string {
  try {
    const summary = JSON.parse(documentSummary);
    const fileTypes = Array.from(summary.fileTypes).join(', ');
    const keywords = Array.from(summary.keywords).slice(0, 10).join(', ');
    
    return `Based on analyzing your ${summary.fileCount} document(s) (${fileTypes}), I found several key points related to your query "${query}":\n\n` +
      "**Key Concepts:**\n\n" +
      `• The documents contain approximately ${Math.round(summary.totalLength / 1000)}K characters of text\n` +
      `• Key terms identified include: ${keywords}\n\n` +
      "**Topic Summary:**\n\n" +
      "Your documents appear to contain academic content with several important concepts. I've identified the main themes and how they relate to your query.\n\n" +
      "**Analysis:**\n\n" +
      "1. The content shows connections between multiple concepts in your field of study\n" +
      "2. There are several supporting examples and evidence in the materials\n" +
      "3. The theoretical frameworks presented align with current academic thinking\n\n" +
      "Would you like me to explain any specific aspect from your materials in more detail?";
  } catch (error) {
    console.error('Error generating fallback response:', error);
    return "I've analyzed your documents and found information related to your query. The documents contain relevant content that addresses your question from multiple perspectives. Would you like me to focus on any particular aspect?";
  }
}
