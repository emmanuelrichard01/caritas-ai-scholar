
import { useState } from "react";
import { toast } from "sonner";

// Default API key from the user input
const OPENAI_API_KEY = "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";

export const useApiConfig = () => {
  const [apiKey] = useState(OPENAI_API_KEY);

  const getAiResponse = async (message: string) => {
    try {
      // For now, mock AI response with static data
      // In a real application, this would be an actual API call to OpenAI
      // This is a simulated delay and response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample response based on different query types
      if (message.toLowerCase().includes("course") || message.toLowerCase().includes("class")) {
        return "Caritas University offers various courses including:\n\n• Business Administration\n• Computer Science\n• Nursing\n• Economics\n• Psychology\n• Law\n• Engineering\n\nEach program has specific requirements. Would you like more details about any specific course?";
      } else if (message.toLowerCase().includes("study") || message.toLowerCase().includes("learn")) {
        return "**Effective Study Techniques**:\n\n1. **Pomodoro Method**: Study for 25 mins, break for 5 mins\n2. **Active Recall**: Test yourself instead of rereading\n3. **Spaced Repetition**: Review material at increasing intervals\n4. **Feynman Technique**: Explain concepts in simple terms\n5. **Mind Mapping**: Create visual connections between ideas\n\nWould you like me to elaborate on any of these techniques?";
      } else if (message.toLowerCase().includes("library")) {
        return "Caritas University Library offers:\n\n• Over 50,000 physical books\n• Access to major academic databases (JSTOR, ProQuest, etc.)\n• 24/7 online resources\n• Study rooms bookable through the student portal\n• Research assistance from librarians\n• Interlibrary loan services\n\nThe main library is open 8am-10pm weekdays and 9am-5pm on weekends.";
      } else if (message.toLowerCase().includes("calendar")) {
        return "**Current Academic Calendar**:\n\n• Spring Semester: January 15 - May 10\n• Summer Session: June 1 - August 15\n• Fall Semester: September 5 - December 20\n• Winter Break: December 21 - January 14\n\n*Important Dates:*\n• Midterms: March 1-5 (Spring), October 15-19 (Fall)\n• Final Exams: May 3-10 (Spring), December 15-20 (Fall)\n• Registration for next semester: April 1 (Fall), November 1 (Spring)";
      } else if (message.toLowerCase().includes("plan") || message.toLowerCase().includes("schedule")) {
        return "**Personalized Study Plan**\n\nBased on typical exam preparation needs:\n\n**Week 1-2: Foundation**\n• Review core concepts daily (30 min)\n• Create summary notes by topic\n• Identify knowledge gaps\n\n**Week 3-4: Practice**\n• Complete practice problems (45 min/day)\n• Form study group for difficult topics\n• Review flashcards during breaks\n\n**Final Week:**\n• Take full practice exams\n• Focus on weak areas\n• Ensure proper sleep and nutrition\n\nWould you like me to customize this plan further for your specific needs?";
      } else if (message.toLowerCase().includes("assignment") || message.toLowerCase().includes("research")) {
        return "**Assignment Breakdown**\n\nAssuming this is a typical research assignment:\n\n**1. Understanding the Prompt**\n• Identify key requirements and assessment criteria\n• Note word count and formatting guidelines\n\n**2. Research Phase**\n• Start with general background from reliable sources\n• Find scholarly articles using Google Scholar, JSTOR\n• Take structured notes with proper citations\n\n**3. Planning**\n• Create an outline with main points and supporting evidence\n• Develop a clear thesis statement\n\n**4. Writing & Revision**\n• Draft introduction, body paragraphs, conclusion\n• Ensure logical flow between sections\n• Revise for clarity, coherence, and citation accuracy\n\nFor specific assignments, please provide more details.";
      } else {
        return "I'm your academic assistant at Caritas University. I can help with:\n\n• Course information and selection\n• Study techniques and resources\n• Library services and research guidance\n• Academic planning and organization\n• Assignment breakdown and strategies\n\nWhat academic topic would you like assistance with today?";
      }
    } catch (error) {
      toast.error("Failed to get AI response");
      console.error("Error in getAiResponse:", error);
      throw error;
    }
  };

  const analyzeDocuments = async (files: File[], query: string) => {
    try {
      // In a production environment, this would upload files to a server,
      // extract text, and send to OpenAI for analysis
      toast.info("Analyzing documents...");
      
      // Simulate processing time based on number and size of files
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      const processingTime = Math.min(3000, 1000 + (totalSize / 100000));
      
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Generate response based on file types and query
      let response = `Based on your ${files.length} course material(s), here's what I found about "${query}":\n\n`;
      
      // Generate a more specific response based on file types
      const fileTypes = files.map(file => file.name.split('.').pop()?.toLowerCase());
      const hasPdf = fileTypes.includes('pdf');
      const hasDoc = fileTypes.includes('doc') || fileTypes.includes('docx');
      const hasPpt = fileTypes.includes('ppt') || fileTypes.includes('pptx');
      
      response += "**Key Concepts:**\n\n";
      
      if (hasPdf) {
        response += "• Found detailed information in your PDF documents\n";
      }
      if (hasDoc) {
        response += "• Your Word documents contain relevant text on this topic\n";
      }
      if (hasPpt) {
        response += "• Your presentation slides highlight important points\n";
      }
      
      response += "• The topic appears in multiple uploaded materials\n";
      response += "• Key terms include: " + generateRelevantTerms(query) + "\n\n";
      
      response += "**Topic Summary:**\n\n";
      response += generateTopicSummary(query) + "\n\n";
      
      response += "**Related Topics:**\n";
      response += "• " + generateRelatedTopics(query).join("\n• ") + "\n\n";
      
      response += "Would you like me to explain any specific aspect in more detail?";
      
      return response;
    } catch (error) {
      toast.error("Failed to analyze documents");
      console.error("Error in analyzeDocuments:", error);
      throw error;
    }
  };
  
  const analyzeAssignment = async (prompt: string) => {
    try {
      toast.info("Analyzing assignment prompt...");
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract potential assignment parameters
      const wordCount = prompt.toLowerCase().includes("word") ? 
        extractWordCount(prompt) : "1500-2000";
      
      const deadline = prompt.toLowerCase().includes("due") || prompt.toLowerCase().includes("deadline") ?
        extractDeadline(prompt) : "Approximately 2 weeks from now";
      
      const references = prompt.toLowerCase().includes("reference") || prompt.toLowerCase().includes("source") ?
        extractReferences(prompt) : "min. 5 scholarly references";
        
      const assignmentType = determineAssignmentType(prompt);
      
      // Generate response
      return `# Assignment Breakdown

## Understanding the Requirements
• This appears to be a ${assignmentType} assignment
• Required word count: ${wordCount}
• Deadline: ${deadline}
• Requires ${references}

## Suggested Approach
1. **Research Phase (Days 1-5)**
   • Gather background information on the topic
   • Identify key scholarly articles and books
   • Take structured notes with citation information

2. **Planning Phase (Days 6-7)**
   • Develop thesis statement and main arguments
   • Create outline with supporting evidence
   • Plan introduction and conclusion

3. **Writing Phase (Days 8-12)**
   • Draft introduction with thesis statement
   • Write body paragraphs with topic sentences
   • Ensure logical flow between sections
   • Craft conclusion that reinforces thesis

4. **Revision Phase (Days 13-14)**
   • Check for clarity, coherence, and conciseness
   • Review citations and formatting
   • Proofread for grammar and spelling errors

## Potential Research Sources
• JSTOR, Google Scholar, Academic Search Complete
• University library databases
• Course readings and lecture notes

Need any specific help with one of these phases?`;
    } catch (error) {
      toast.error("Failed to analyze assignment");
      console.error("Error in analyzeAssignment:", error);
      throw error;
    }
  };
  
  // Helper functions for document analysis
  function generateRelevantTerms(query: string): string {
    const queryWords = query.toLowerCase().split(' ');
    
    // Sample academic terms by domain
    const scienceTerms = ["hypothesis", "experiment", "theory", "data", "analysis", "methodology"];
    const humanitiesTerms = ["analysis", "critique", "interpretation", "perspective", "framework", "context"];
    const businessTerms = ["strategy", "market", "analysis", "implementation", "assessment", "framework"];
    
    let domainTerms = [...scienceTerms, ...humanitiesTerms, ...businessTerms];
    
    // Select terms that seem relevant to the query
    const relevantTerms = domainTerms.filter(term => 
      !queryWords.includes(term) && Math.random() > 0.7
    ).slice(0, 3);
    
    // Always include some query words
    const queryTerms = queryWords
      .filter(word => word.length > 4)
      .slice(0, 2);
    
    return [...queryTerms, ...relevantTerms].join(", ");
  }
  
  function generateTopicSummary(query: string): string {
    const summaries = [
      "This topic explores the fundamental principles and practical applications within the field. The materials provide both theoretical frameworks and case studies.",
      "The concept is examined through multiple perspectives, with particular emphasis on recent developments and historical context.",
      "Your course materials present a comprehensive overview, covering both basic principles and advanced applications.",
      "The topic is addressed across several chapters, with connections drawn to related fields and practical implementations."
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  }
  
  function generateRelatedTopics(query: string): string[] {
    const baseTopics = [
      "Theoretical frameworks",
      "Practical applications",
      "Historical context",
      "Current research trends",
      "Methodological approaches",
      "Key case studies",
      "Ethical considerations"
    ];
    
    // Shuffle and take first 3-4
    return baseTopics
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 2));
  }
  
  // Helper functions for assignment analysis
  function extractWordCount(prompt: string): string {
    // Try to find word count requirements
    const wordCountRegex = /(\d{3,4})[\s-]*(\d{3,4})?\s*words?/i;
    const match = prompt.match(wordCountRegex);
    
    if (match) {
      return match[2] ? `${match[1]}-${match[2]}` : `${match[1]}`;
    }
    
    return "1500-2000";
  }
  
  function extractDeadline(prompt: string): string {
    const deadlineRegex = /(due|deadline|submit by|before)\s(\w+\s\d{1,2}|\d{1,2}\s\w+)/i;
    const match = prompt.match(deadlineRegex);
    
    if (match) {
      return match[2];
    }
    
    const weekRegex = /(\d+)\s*weeks?/i;
    const weekMatch = prompt.match(weekRegex);
    
    if (weekMatch) {
      return `${weekMatch[1]} weeks from now`;
    }
    
    return "2 weeks from now";
  }
  
  function extractReferences(prompt: string): string {
    const refRegex = /(\d+)[\s-]*(\d+)?\s*(references|sources|citations)/i;
    const match = prompt.match(refRegex);
    
    if (match) {
      return `${match[1]}${match[2] ? '-' + match[2] : ''} references`;
    }
    
    return "min. 5 references";
  }
  
  function determineAssignmentType(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("essay") || lowerPrompt.includes("write an essay")) {
      return "analytical essay";
    } else if (lowerPrompt.includes("research") || lowerPrompt.includes("research paper")) {
      return "research paper";
    } else if (lowerPrompt.includes("report")) {
      return "report";
    } else if (lowerPrompt.includes("review") || lowerPrompt.includes("literature review")) {
      return "literature review";
    } else if (lowerPrompt.includes("case study")) {
      return "case study analysis";
    } else if (lowerPrompt.includes("presentation")) {
      return "presentation";
    } else {
      return "academic writing";
    }
  }

  return {
    apiKey,
    getAiResponse,
    analyzeDocuments,
    analyzeAssignment
  };
};
