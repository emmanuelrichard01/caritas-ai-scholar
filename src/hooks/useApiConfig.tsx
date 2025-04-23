
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

  return {
    apiKey,
    getAiResponse,
  };
};
