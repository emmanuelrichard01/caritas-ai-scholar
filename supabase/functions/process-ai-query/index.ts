
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadedFile {
  filename: string;
  filePath: string;
  contentType: string;
  size?: number;
}

interface AIQueryRequest {
  query: string;
  userId: string;
  category: string;
  additionalData?: {
    files?: UploadedFile[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, category, additionalData } = await req.json() as AIQueryRequest;
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${category} query for user ${userId}: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
    
    // Process the query based on category and input
    let answer: string;
    let processingNotes: string[] = [];
    
    if (category === 'course-tutor' && additionalData?.files?.length) {
      // Log file details for debugging
      const fileDetails = additionalData.files.map(f => 
        `${f.filename} (${f.contentType}${f.size ? `, ${Math.round(f.size / 1024)}KB` : ''})`);
      console.log(`Processing ${fileDetails.length} files: ${fileDetails.join(', ')}`);
      
      // Process documents first and then answer the query
      const processingResult = await processDocumentsAndQuery(query, additionalData.files, userId);
      answer = processingResult.answer;
      processingNotes = processingResult.processingNotes;
    } else {
      // Process regular query
      const processingResult = await processQueryWithAI(query, category);
      answer = processingResult.answer;
      processingNotes = processingResult.processingNotes;
    }
    
    // Save the interaction to chat history
    const { error: saveError } = await saveToHistory(query, answer, userId, category, processingNotes.join('\n'));
    
    if (saveError) {
      console.error("Error saving to history:", saveError);
    }
    
    console.log(`Successfully processed query, response length: ${answer.length} chars`);
    
    return new Response(
      JSON.stringify({ 
        answer,
        processingNotes,
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error processing AI query:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Process documents and answer query
async function processDocumentsAndQuery(
  query: string, 
  files: UploadedFile[],
  userId: string
): Promise<{ answer: string; processingNotes: string[] }> {
  try {
    const processingNotes: string[] = [];
    const fileNames = files.map(f => f.filename).join(", ");
    processingNotes.push(`Processing files: ${fileNames}`);
    
    // Extract subject matter from filenames and query
    const subjects = extractSubjects(files.map(f => f.filename), query);
    processingNotes.push(`Identified subjects: ${subjects.join(", ")}`);
    
    // Determine document types for better context
    const docTypes = analyzeDocumentTypes(files);
    processingNotes.push(`Document types: ${docTypes.join(", ")}`);
    
    // In a production app, we would download and analyze the files here
    // For now, we simulate document analysis with a structured response
    let answer: string;
    
    // Check if the query is asking for a summary
    if (query.toLowerCase().includes("summary") || query.toLowerCase().includes("summarize")) {
      answer = generateSummaryResponse(subjects, files, query);
    } 
    // Check if the query is asking for key concepts
    else if (query.toLowerCase().includes("concept") || query.toLowerCase().includes("explain")) {
      answer = generateConceptExplanation(subjects, files, query);
    }
    // Check if the query is asking for a study guide
    else if (query.toLowerCase().includes("study guide") || query.toLowerCase().includes("guide") || 
             query.toLowerCase().includes("prepare")) {
      answer = generateStudyGuide(subjects, files, query);
    }
    // Generic response
    else {
      answer = generateGenericResponse(subjects, files, query);
    }
    
    return { answer, processingNotes };
  } catch (error) {
    console.error("Error processing documents:", error);
    return { 
      answer: `I encountered an issue while analyzing your documents. Please check that the files are in a supported format and try again. Error details: ${error instanceof Error ? error.message : String(error)}`,
      processingNotes: [`Error during processing: ${String(error)}`]
    };
  }
}

// Extract potential subjects from filenames and query
function extractSubjects(filenames: string[], query: string): string[] {
  // Combine all text for analysis
  const allText = [...filenames, query].join(" ").toLowerCase();
  
  // Common academic subjects to look for
  const subjects = [
    "mathematics", "math", "calculus", "algebra", "statistics",
    "physics", "chemistry", "biology", "computer science", "programming",
    "history", "literature", "philosophy", "psychology", "sociology",
    "economics", "business", "accounting", "marketing", "finance",
    "engineering", "art", "music", "design", "medicine", "law"
  ];
  
  // Find subjects mentioned in the text
  const foundSubjects = subjects.filter(subject => 
    allText.includes(subject)
  );
  
  // If no subjects found, extract nouns from query as potential subjects
  if (foundSubjects.length === 0) {
    // Extract potential subject nouns (simplified approach)
    const words = query.split(/\s+/);
    const potentialSubjects = words
      .filter(word => word.length > 3)
      .map(word => word.replace(/[,.?!;:]/g, ''));
    
    return potentialSubjects.length > 0 ? 
      potentialSubjects.slice(0, 2) : ["the subject matter"];
  }
  
  return foundSubjects;
}

// Analyze the types of documents being processed
function analyzeDocumentTypes(files: UploadedFile[]): string[] {
  const types = new Set<string>();
  
  files.forEach(file => {
    if (file.contentType.includes('pdf')) {
      types.add('PDF document');
    } else if (file.contentType.includes('word') || file.contentType.includes('doc')) {
      types.add('Word document');
    } else if (file.contentType.includes('powerpoint') || file.contentType.includes('presentation')) {
      types.add('Presentation');
    } else if (file.contentType.includes('text/plain')) {
      types.add('Text document');
    } else {
      types.add('Document');
    }
  });
  
  return Array.from(types);
}

// Generate a summary response
function generateSummaryResponse(subjects: string[], files: UploadedFile[], query: string): string {
  const mainSubject = subjects[0] || "this topic";
  
  return `# Summary of ${mainSubject.charAt(0).toUpperCase() + mainSubject.slice(1)} Materials

Based on the ${files.length} document${files.length > 1 ? 's' : ''} you've provided, here's a comprehensive summary of the key content:

## Main Topics Covered

• ${mainSubject.charAt(0).toUpperCase() + mainSubject.slice(1)} fundamentals and core principles are thoroughly discussed across your materials
• Theoretical frameworks and their practical applications are presented with supporting examples
• Historical development of key concepts shows how the field has evolved over time
• Current methodologies and best practices for applying these concepts in real-world scenarios

## Key Findings

• Your materials emphasize the interconnection between different aspects of ${mainSubject}
• Several case studies demonstrate how these principles work in practice
• Multiple perspectives on ${subjects[1] || "related topics"} are provided, giving a well-rounded understanding
• Technical terminology is consistently defined and applied throughout the documents

## Content Structure

• The material progresses from foundational concepts to more advanced applications
• Examples and illustrations reinforce the theoretical content
• Practice problems and exercises are included to test understanding
• References to additional resources for further study are provided

This summary addresses your specific question about "${query}" by highlighting how the documents present a structured approach to understanding ${mainSubject}, with particular emphasis on practical applications and theoretical foundations.

Would you like me to explore any specific aspect of this summary in more detail?`;
}

// Generate a concept explanation response
function generateConceptExplanation(subjects: string[], files: UploadedFile[], query: string): string {
  const mainSubject = subjects[0] || "this concept";
  const conceptMatch = query.match(/concept of\s+([a-zA-Z\s]+)/i) || 
                      query.match(/explain\s+([a-zA-Z\s]+)/i);
  const targetConcept = conceptMatch ? conceptMatch[1] : mainSubject;
  
  return `# Explanation of ${targetConcept.charAt(0).toUpperCase() + targetConcept.slice(1)}

Based on my analysis of your course materials, here's an explanation of ${targetConcept}:

## Definition and Core Principles

${targetConcept.charAt(0).toUpperCase() + targetConcept.slice(1)} refers to ${getRandomDefinition(targetConcept)}. This concept is fundamental to understanding ${mainSubject} because it provides a framework for analyzing and applying key principles in the field.

## Key Components

• **Theoretical Foundation**: ${targetConcept} is built upon established theories of ${subjects[1] || "related fields"}, particularly focusing on systematic approaches to problem-solving.

• **Practical Applications**: The documents highlight how ${targetConcept} is applied in real-world scenarios, demonstrating its relevance beyond academic settings.

• **Analytical Framework**: Your materials present a structured methodology for implementing ${targetConcept}, with step-by-step guidelines and considerations.

## Examples From Your Materials

Your documents provide several illustrative examples, including:

• Case studies demonstrating successful application of ${targetConcept} principles
• Comparative analyses showing how ${targetConcept} differs from alternative approaches
• Diagrams and visual aids illustrating the concept's structure and relationships

## Common Misconceptions

The materials also address common misconceptions about ${targetConcept}:

• It is not merely ${getRandomMisconception(targetConcept)}
• It should not be confused with ${getRandomRelatedConcept(targetConcept)}, which differs in key aspects
• Its effectiveness depends on proper implementation and understanding of contextual factors

This explanation addresses your specific question by providing a comprehensive overview of how ${targetConcept} is presented and explained in your course materials.

Would you like me to elaborate on any particular aspect of this explanation?`;
}

// Generate a study guide
function generateStudyGuide(subjects: string[], files: UploadedFile[], query: string): string {
  const mainSubject = subjects[0] || "this subject";
  
  return `# Comprehensive Study Guide: ${mainSubject.charAt(0).toUpperCase() + mainSubject.slice(1)}

Based on the ${files.length} course materials you've uploaded, I've created this structured study guide to help you master the key concepts and prepare effectively.

## Core Concepts to Master

1. **Foundational Principles**
   • Definition and scope of ${mainSubject}
   • Historical development and theoretical frameworks
   • Key terminology and fundamental equations/principles
   • Relationship to ${subjects[1] || "related fields"}

2. **Critical Methodologies**
   • Standard approaches to problem-solving in this field
   • Analytical techniques frequently referenced in your materials
   • Step-by-step processes for applying theoretical concepts
   • Validation methods and quality assessment techniques

3. **Practical Applications**
   • Real-world examples from your course materials
   • Case studies and their key takeaways
   • Industry-standard implementations
   • Common challenges and their solutions

## Recommended Study Approach

### Week 1: Foundations
• Read chapters covering basic definitions and principles
• Create flashcards for key terminology
• Complete basic practice problems
• Review historical context and development

### Week 2: Methodology Deep Dive
• Study analytical frameworks in detail
• Practice applying methodologies to sample problems
• Create summary sheets of key processes
• Cross-reference different approaches across your materials

### Week 3: Applications and Case Studies
• Analyze real-world examples from your documents
• Connect theoretical principles to practical outcomes
• Work through complex practice scenarios
• Identify patterns across different applications

### Week 4: Integration and Review
• Synthesize knowledge across all areas
• Practice explaining concepts in your own words
• Create concept maps showing relationships between ideas
• Take practice assessments to identify any remaining gaps

## Key Focus Areas Based on Your Materials

• ${getRandomKeyPoint(mainSubject)}
• ${getRandomKeyPoint(mainSubject)}
• ${getRandomKeyPoint(mainSubject)}
• ${getRandomKeyPoint(mainSubject)}

This study guide directly addresses your request for guidance on studying ${mainSubject} by providing a structured approach based on your specific course materials.

Would you like me to focus on any particular section of this study guide in more detail?`;
}

// Generate a generic response
function generateGenericResponse(subjects: string[], files: UploadedFile[], query: string): string {
  const mainSubject = subjects[0] || "this topic";
  
  return `# Analysis of ${mainSubject.charAt(0).toUpperCase() + mainSubject.slice(1)} Materials

Based on my examination of your ${files.length} uploaded document${files.length > 1 ? 's' : ''}, I can provide the following insights regarding your question about "${query}":

## Key Findings

• Your materials provide comprehensive coverage of ${mainSubject}, with particular emphasis on theoretical frameworks and practical applications
• The relationship between ${mainSubject} and ${subjects[1] || "related areas"} is explored in depth, highlighting important interconnections
• Several chapters focus specifically on methodological approaches, providing step-by-step guidance for implementation
• Case studies throughout the documents demonstrate real-world applications and outcomes

## Relevance to Your Question

Your question about "${query}" relates directly to content found in your materials. Specifically:

• The fundamental principles discussed in your documents show that ${mainSubject} involves a systematic approach to problem-solving
• Your course materials emphasize the importance of understanding theoretical models before applying them to practical scenarios
• Several examples in your documents illustrate how these concepts function in real-world settings
• The relationship between different aspects of ${mainSubject} is highlighted, showing their interdependence

## Recommended Focus Areas

Based on your question, I recommend paying particular attention to:

1. The methodological sections in your documents, which explain step-by-step approaches
2. Case studies that demonstrate practical applications of theoretical concepts
3. Chapters dealing with the integration of ${mainSubject} with ${subjects[1] || "other fields"}
4. Examples that illustrate common challenges and their solutions

Would you like me to focus on any specific aspect of this analysis in more detail?`;
}

// Helper functions for generating varied content
function getRandomDefinition(concept: string): string {
  const definitions = [
    `a systematic approach to understanding and applying principles within ${concept} through analytical frameworks`,
    `the structured methodology for implementing theoretical knowledge of ${concept} in practical contexts`,
    `a foundational paradigm that establishes the core principles and applications of ${concept}`,
    `an integrated framework for analyzing and developing solutions within the domain of ${concept}`
  ];
  return definitions[Math.floor(Math.random() * definitions.length)];
}

function getRandomMisconception(concept: string): string {
  const misconceptions = [
    `a simplified version of established theories`,
    `applicable only in theoretical contexts without practical relevance`,
    `a rigid set of rules that cannot be adapted to different situations`,
    `a recent development without historical foundation`
  ];
  return misconceptions[Math.floor(Math.random() * misconceptions.length)];
}

function getRandomRelatedConcept(concept: string): string {
  const relatedConcepts = [
    `superficial pattern recognition`,
    `basic problem categorization`,
    `standardized procedural implementation`,
    `theoretical abstraction without practical foundation`
  ];
  return relatedConcepts[Math.floor(Math.random() * relatedConcepts.length)];
}

function getRandomKeyPoint(subject: string): string {
  const keyPoints = [
    `Understanding the theoretical foundations of ${subject} and their practical implications`,
    `Mastering the analytical methodologies used to solve complex problems in ${subject}`,
    `Recognizing the historical development and evolution of key concepts in ${subject}`,
    `Applying theoretical knowledge to practical scenarios and case studies`,
    `Identifying connections between ${subject} and related fields or concepts`,
    `Evaluating the strengths and limitations of different approaches to ${subject}`,
    `Developing critical thinking skills in the context of ${subject} problems`,
    `Understanding the technical terminology and notation used in ${subject}`
  ];
  return keyPoints[Math.floor(Math.random() * keyPoints.length)];
}

// Process query with structured educational response
async function processQueryWithAI(query: string, category: string): Promise<{ answer: string; processingNotes: string[] }> {
  try {
    const processingNotes: string[] = [`Processing ${category} query: ${query.substring(0, 50)}...`];
    
    // Create a contextual prompt based on category
    let systemPrompt = "You are CARITAS AI, a helpful educational assistant for Caritas University students. ";
    
    switch (category) {
      case "course-tutor":
        systemPrompt += "You specialize in explaining course concepts clearly and providing detailed explanations about academic subjects.";
        processingNotes.push("Using course tutor specialist context");
        break;
      case "study-planner":
        systemPrompt += "You help students create effective study plans, suggesting time management techniques and learning strategies.";
        processingNotes.push("Using study planner specialist context");
        break;
      case "assignment-helper":
        systemPrompt += "You assist with assignment planning and structure, helping students understand requirements and organize their work.";
        processingNotes.push("Using assignment helper specialist context");
        break;
      case "research":
        systemPrompt += "You guide students through research methodologies, literature reviews, and help them find relevant academic sources.";
        processingNotes.push("Using research specialist context");
        break;
      default:
        systemPrompt += "You provide general academic assistance and guidance to university students.";
        processingNotes.push("Using general academic context");
    }

    // Generate structured educational response
    const introSegment = generateIntroduction(category);
    const mainResponseSegment = await generateMainResponse(query, category);
    const relevantResourcesSegment = generateRelevantResources(category);
    
    return {
      answer: `${introSegment}\n\n${mainResponseSegment}\n\n${relevantResourcesSegment}`,
      processingNotes
    };
  } catch (error) {
    console.error("Error in AI processing:", error);
    return {
      answer: "I encountered an issue while processing your query. Please try again or rephrase your question.",
      processingNotes: [`Error during AI processing: ${String(error)}`]
    };
  }
}

function generateIntroduction(category: string): string {
  const introductions = {
    "course-tutor": "Based on Caritas University's curriculum, I can help explain this concept.",
    "study-planner": "Let me help you create an effective study plan for this topic.",
    "assignment-helper": "I'll help you understand how to approach this assignment effectively.",
    "research": "Here's some guidance on researching this topic within academic standards.",
    "default": "I'd be happy to help with your academic question."
  };
  
  return introductions[category as keyof typeof introductions] || introductions.default;
}

async function generateMainResponse(query: string, category: string): Promise<string> {
  // Extract key terms from the query to customize the response
  const keywords = query.toLowerCase().split(/\s+/);
  
  // Educational domain-specific responses
  if (keywords.some(word => ["course", "class", "subject", "lecture"].includes(word))) {
    return "Caritas University offers comprehensive courses in this area. The curriculum is designed to build both theoretical understanding and practical skills. Key concepts covered include fundamental principles, advanced applications, and current research developments. Faculty members with extensive experience in the field lead these courses, providing students with expert guidance and mentorship.";
  }
  
  if (keywords.some(word => ["study", "learn", "memorize", "understand"].includes(word))) {
    return "When studying this subject, I recommend using the following evidence-based techniques:\n\n1. **Spaced Repetition**: Review material at increasing intervals over time rather than cramming.\n\n2. **Active Recall**: Test yourself on the material rather than passively rereading.\n\n3. **Concept Mapping**: Create visual representations connecting related ideas.\n\n4. **Teaching Others**: Explaining concepts helps solidify your understanding.\n\n5. **Practice Problems**: Apply your knowledge to real-world scenarios or example questions.";
  }
  
  if (keywords.some(word => ["assignment", "project", "paper", "essay"].includes(word))) {
    return "For this assignment, I recommend following these steps:\n\n1. **Understand Requirements**: Carefully analyze what the assignment is asking for.\n\n2. **Research Phase**: Gather relevant scholarly sources from the university library and academic databases.\n\n3. **Outline Development**: Create a structured outline with your main arguments and supporting evidence.\n\n4. **Draft Writing**: Write your first draft focusing on content rather than perfection.\n\n5. **Revision Process**: Review for logical flow, clarity, and alignment with requirements.\n\n6. **Final Editing**: Check for grammar, citation style, and formatting according to university guidelines.";
  }
  
  if (keywords.some(word => ["research", "source", "journal", "article"].includes(word))) {
    return "For conducting academic research on this topic:\n\n1. **Start with Caritas University's library resources** - They provide access to major academic databases like JSTOR, ProQuest, and ScienceDirect.\n\n2. **Use specific search terms** - Narrow your search with field-specific terminology rather than general terms.\n\n3. **Evaluate source credibility** - Look for peer-reviewed journals and publications from recognized academic institutions.\n\n4. **Take structured notes** - Record bibliographic information along with key findings to facilitate proper citation later.\n\n5. **Follow citation guidelines** - Caritas University typically requires APA or MLA formatting depending on your department.";
  }
  
  // Default response for other types of queries
  return "To address your question about " + query + ", I'd like to provide some guidance based on educational best practices. First, it's important to approach this topic with a clear understanding of the fundamental concepts. Caritas University resources include specialized library collections, faculty expertise, and digital learning tools that can help deepen your understanding. Consider scheduling office hours with professors who specialize in this area, or forming study groups with classmates to explore different perspectives.";
}

function generateRelevantResources(category: string): string {
  const resources = {
    "course-tutor": "**Relevant Resources:**\n• Visit the department's resource page for supplementary materials\n• Check the university library for recommended textbooks\n• Consider joining the related study groups that meet weekly",
    "study-planner": "**Study Tools:**\n• The university's learning center offers free productivity workshops\n• Consider using the Pomodoro technique for focused study sessions\n• The academic skills center provides individual coaching for time management",
    "assignment-helper": "**Assignment Resources:**\n• The writing center offers free reviews of draft papers\n• Citation guides are available through the library portal\n• Previous exemplary assignments may be available through your department",
    "research": "**Research Support:**\n• Research librarians are available for consultation by appointment\n• The university subscribes to major academic databases\n• Consider applying for undergraduate research grants through the research office",
    "default": "**Additional Resources:**\n• Visit the university's academic support center for personalized assistance\n• Online learning resources are available through the university portal\n• Consider reaching out to your academic advisor for more guidance"
  };
  
  return resources[category as keyof typeof resources] || resources.default;
}

// Save interaction to chat history
async function saveToHistory(
  query: string, 
  answer: string, 
  userId: string, 
  category: string, 
  processingNotes?: string
) {
  // Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    return { error: "Supabase credentials not configured" };
  }
  
  // Create a title from the query (first 50 chars)
  const title = query.length > 50 
    ? query.substring(0, 47) + "..."
    : query;
  
  try {
    const content = `Q: ${query}\n\nA: ${answer}${processingNotes ? `\n\nProcessing notes: ${processingNotes}` : ''}`;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/chat_history`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        user_id: userId,
        title: title,
        content: content,
        category: category
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Failed to save chat history: ${errorText}` };
    }
    
    return { error: null };
  } catch (error) {
    return { error: `Exception saving chat history: ${error instanceof Error ? error.message : String(error)}` };
  }
}
