
import { useState } from "react";
import { useAIProcessor } from "./useAIProcessor";
import { FlashcardItem } from "@/components/studytools/Flashcard";
import { QuizQuestion } from "@/components/studytools/QuizComponent";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Combine segments efficiently
      const fullContent = materialWithSegments.segments
        .map(segment => `## ${segment.title}\n${segment.text}`)
        .join('\n\n');
      
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
        // Generate default 10 questions if AI generation fails
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
    
    return await processQuery(prompt, 'course-tutor');
  };
  
  const generateFlashcards = async (title: string, content: string) => {
    const prompt = `Based on the study material "${title}", create exactly 15 flashcards for key concepts.

Material Content:
${content}

Create flashcards that test understanding of important concepts. Format as JSON:
[
  {"question": "What is...", "answer": "..."},
  {"question": "Define...", "answer": "..."}
]

Make sure to create exactly 15 flashcards covering different aspects of the material.`;
    
    const response = await processQuery(prompt, 'course-tutor');
    if (!response) return null;
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      return null;
    }
  };
  
  const generateQuiz = async (title: string, content: string) => {
    const prompt = `Based on the study material "${title}", create exactly 10 multiple-choice quiz questions that thoroughly test understanding of the material.

Material Content:
${content}

Create 10 comprehensive quiz questions that cover different aspects of the material. Each question should have 4 options with only one correct answer.

Format as JSON:
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct..."
  }
]

Make sure to:
1. Create exactly 10 questions
2. Cover different topics from the material
3. Include variety in question difficulty
4. Provide clear explanations for each answer
5. Ensure all questions are answerable from the provided content`;
    
    const response = await processQuery(prompt, 'course-tutor');
    if (!response) return generateDefaultQuiz(title);
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const questions = parsed.map((q: any, index: number) => ({
          question: q.question || `Question ${index + 1} about ${title}`,
          options: Array.isArray(q.options) && q.options.length === 4 
            ? q.options 
            : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
            ? q.correctAnswer 
            : 0,
          explanation: q.explanation || "Review the material for more details."
        }));
        
        // Ensure we have at least 10 questions
        if (questions.length >= 10) {
          return questions.slice(0, 10); // Take first 10 if more than 10
        } else {
          // Pad with default questions if less than 10
          const defaultQuestions = generateDefaultQuiz(title);
          return [...questions, ...defaultQuestions.slice(questions.length)];
        }
      }
    } catch {
      return generateDefaultQuiz(title);
    }
    
    return generateDefaultQuiz(title);
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
