
import { useState } from "react";
import { useAIProcessor } from "./useAIProcessor";
import { FlashcardItem } from "@/components/studytools/Flashcard";
import { QuizQuestion } from "@/components/studytools/QuizComponent";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { jsonrepair } from 'jsonrepair';

export const useStudyMaterials = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardItem[] | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [materialContext, setMaterialContext] = useState<string>("");
  
  const { processQuery } = useAIProcessor();
  
  const generateStudyMaterialsFromUploaded = async (materialId: string, query?: string) => {
    setIsGenerating(true);
    
    try {
      console.log("Fetching material and segments for:", materialId);
      
      // Single optimized query to fetch material with segments
      const { data: materialWithSegments, error } = await supabase
        .from('materials')
        .select(`
          *,
          segments (
            id,
            title,
            text
          )
        `)
        .eq('id', materialId)
        .single();
      
      if (error) {
        console.error("Material fetch error:", error);
        throw new Error("Failed to fetch material: " + error.message);
      }
      
      if (!materialWithSegments.segments || materialWithSegments.segments.length === 0) {
        const uploadTime = new Date(materialWithSegments.uploaded_at);
        const now = new Date();
        const timeDiff = now.getTime() - uploadTime.getTime();
        
        if (timeDiff < 30000) {
          throw new Error("Material is still being processed. Please wait a moment and try again.");
        } else {
          throw new Error("No content found for this material. The file may not have been processed correctly.");
        }
      }
      
      // Combine segments efficiently with better structure
      const fullContent = materialWithSegments.segments
        .map(segment => {
          // Clean and structure the content better
          const cleanTitle = segment.title?.trim() || "Section";
          const cleanText = segment.text?.trim() || "";
          return `## ${cleanTitle}\n${cleanText}`;
        })
        .filter(segment => segment.length > 10) // Remove empty segments
        .join('\n\n');
      
      if (!fullContent || fullContent.length < 50) {
        throw new Error("Insufficient content found in the material. The document may not have been processed correctly or may be empty.");
      }
      
      setMaterialContext(fullContent);
      
      // Generate all study materials concurrently for better performance
      const [notesResponse, flashcardsResponse, quizResponse] = await Promise.allSettled([
        generateNotes(materialWithSegments.title, fullContent, query),
        generateFlashcards(materialWithSegments.title, fullContent),
        generateQuiz(materialWithSegments.title, fullContent)
      ]);
      
      // Handle notes
      if (notesResponse.status === 'fulfilled' && notesResponse.value) {
        setNotes(notesResponse.value);
      }
      
      // Handle flashcards with better error recovery
      if (flashcardsResponse.status === 'fulfilled' && flashcardsResponse.value) {
        setFlashcards(flashcardsResponse.value);
      } else {
        setFlashcards([{
          question: `What are the main topics covered in "${materialWithSegments.title}"?`,
          answer: "Review the notes section for a comprehensive overview of all key concepts and topics."
        }]);
      }
      
      // Handle quiz with better error recovery
if (quizResponse.status === 'fulfilled' && quizResponse.value) {
  setQuizQuestions(quizResponse.value);
} else {
  toast.warning("AI-generated quiz failed. Showing default questions.");
  setQuizQuestions(generateDefaultQuiz(materialWithSegments.title));
}
      
      toast.success("Study materials generated successfully!");
      
    } catch (error) {
      console.error("Error generating study materials:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate study materials";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateNotes = async (title: string, content: string, query?: string) => {
    const prompt = `Based on the course material titled "${title}", create comprehensive study notes with clear headings, bullet points, and key concepts.

Material Content:
${content}

${query ? `Focus specifically on: ${query}` : 'Cover all important topics comprehensively.'}

Format the response with clear headings and bullet points for easy studying.`;
    
    return await processQuery(prompt, 'generate-study-aids');
  };
  
  const generateFlashcards = async (title: string, content: string) => {
    const prompt = `Create flashcards ONLY from the provided study material content. Do not use external knowledge.

Study Material: "${title}"

MATERIAL CONTENT (Use ONLY this):
${content}

INSTRUCTIONS:
- Analyze the material content above carefully
- Create exactly 15 flashcards that test key concepts, definitions, facts, and important details found in this specific material
- Questions should be direct and answerable from the material
- Answers should be concise but informative, based on the material content

FORMAT (JSON only):
[
  {"question": "What is [concept from material]?", "answer": "According to the material: [specific answer]"},
  {"question": "Define [term from material]", "answer": "[definition from material]"}
]

REQUIREMENTS:
- Exactly 15 flashcards
- Questions and answers must come from the provided material only
- Cover different topics/sections from the material
- Include key concepts, definitions, facts, and important details`;
    
    const response = await processQuery(prompt, 'generate-study-aids');
    if (!response) return null;
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      return null;
    }
  };
  
  const generateQuiz = async (title: string, content: string) => {
    // Enhanced prompt with better content analysis
    const prompt = `IMPORTANT: You are generating quiz questions ONLY from the provided study material content. Do not use external knowledge.

Study Material Title: "${title}"

ACTUAL MATERIAL CONTENT (Use ONLY this content):
${content}

INSTRUCTIONS:
- Read and analyze the material content above carefully
- Create exactly 10 multiple-choice quiz questions that test understanding of concepts, facts, and details found SPECIFICALLY in this material
- Each question must be directly answerable from the provided content
- Questions should cover different sections/topics from the material
- Include a mix of factual recall, comprehension, and application questions
- Provide 4 realistic options with only one correct answer
- Write detailed explanations that reference the material content

OUTPUT FORMAT (JSON only):
[
  {
        question: \`Based on the material, what is...?\`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "According to the material content: [specific reference to the text]..."
      }
]

REQUIREMENTS:
1. Exactly 10 questions
2. Questions must be answerable ONLY from the provided material
3. Reference specific parts of the material in explanations
4. Vary question difficulty and type
5. Ensure all 4 options are plausible but only one is correct from the material`;
    
    const response = await processQuery(prompt, 'course-tutor');
    const jsonBlock = response.match(/```json\s*([\s\S]*?)```/);
    const rawJson = jsonBlock ? jsonBlock[1].trim() : response.trim();
  let questions;

try {
  const repaired = jsonrepair(rawJson);
  const parsed = JSON.parse(repaired);

  questions = parsed.map((q: any, index: number) => ({
    question: q.question || `Question ${index + 1} about ${title}`,
    options: Array.isArray(q.options) && q.options.length === 4 
      ? q.options 
      : ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4 
      ? q.correctAnswer 
      : 0,
    explanation: q.explanation || "Review the material for more details."
  }));

  if (questions.length < 10) {
    const fallback = generateDefaultQuiz(title);
    questions = [...questions, ...fallback.slice(questions.length)];
  }

  console.log("✅ Final quiz questions:", questions);
  return questions;
} catch (err) {
  console.error("❌ Failed to parse or process AI response:", err);
  console.log("📄 Raw AI response:\n", rawJson);
  return generateDefaultQuiz(title);
}
  };

  const generateDefaultQuiz = (title: string): QuizQuestion[] => {
    return [
      {
        question: `What is the primary focus of the material "${title}"?`,
        options: ["Core concepts and fundamentals", "Advanced applications only", "Historical background only", "Practical exercises only"],
        correctAnswer: 0,
        explanation: "Educational materials typically focus on core concepts and fundamentals as the foundation for learning."
      },
      {
        question: `How should you approach studying "${title}"?`,
        options: ["Skip to the end", "Read thoroughly and take notes", "Memorize without understanding", "Only read the summary"],
        correctAnswer: 1,
        explanation: "Effective studying involves reading thoroughly and taking notes to ensure comprehension."
      },
      {
        question: `What is the best way to retain information from "${title}"?`,
        options: ["Read once quickly", "Active learning and practice", "Passive reading only", "Ignore difficult sections"],
        correctAnswer: 1,
        explanation: "Active learning and practice are proven methods for better information retention."
      },
      {
        question: `When reviewing "${title}", you should:`,
        options: ["Focus only on easy topics", "Review all sections systematically", "Skip the introduction", "Only read conclusions"],
        correctAnswer: 1,
        explanation: "Systematic review of all sections ensures comprehensive understanding of the material."
      },
      {
        question: `What makes "${title}" valuable for learning?`,
        options: ["It's short", "It provides structured knowledge", "It has pictures", "It's entertaining"],
        correctAnswer: 1,
        explanation: "Educational materials are valuable because they provide structured, organized knowledge."
      },
      {
        question: `To master the concepts in "${title}", you should:`,
        options: ["Read it once", "Practice and apply concepts", "Memorize definitions only", "Skip difficult parts"],
        correctAnswer: 1,
        explanation: "Mastery comes from practicing and applying concepts, not just reading or memorizing."
      },
      {
        question: `The key to understanding "${title}" is:`,
        options: ["Speed reading", "Careful analysis and reflection", "Skipping details", "Reading summaries only"],
        correctAnswer: 1,
        explanation: "Deep understanding requires careful analysis and reflection on the material."
      },
      {
        question: `When studying "${title}", it's important to:`,
        options: ["Rush through it", "Take breaks and pace yourself", "Study only at night", "Avoid taking notes"],
        correctAnswer: 1,
        explanation: "Effective studying requires pacing yourself and taking breaks to maintain focus and retention."
      },
      {
        question: `The best learning outcome from "${title}" comes from:`,
        options: ["Passive consumption", "Active engagement and questioning", "Quick scanning", "Memorizing headings"],
        correctAnswer: 1,
        explanation: "Active engagement and questioning lead to deeper understanding and better learning outcomes."
      },
      {
        question: `To get the most from "${title}", you should:`,
        options: ["Read in poor lighting", "Create a distraction-free environment", "Multitask while reading", "Skip preparation"],
        correctAnswer: 1,
        explanation: "A distraction-free environment optimizes focus and comprehension while studying."
      }
    ];
  };
  
  return {
    isGenerating,
    notes,
    flashcards,
    quizQuestions,
    materialContext,
    generateStudyMaterialsFromUploaded
  };
};
