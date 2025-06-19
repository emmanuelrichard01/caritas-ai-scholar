
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
        setQuizQuestions([{
          question: `What is the best way to study the material "${materialWithSegments.title}"?`,
          options: [
            "Review the generated notes thoroughly",
            "Skip the reading completely",
            "Only memorize the first paragraph",
            "Ignore all the details"
          ],
          correctAnswer: 0,
          explanation: "The generated notes provide a comprehensive overview of all important concepts."
        }]);
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
    const prompt = `Based on the study material "${title}", create exactly 10 flashcards for key concepts.

Material Content:
${content}

Create flashcards that test understanding of important concepts. Format as JSON:
[
  {"question": "What is...", "answer": "..."},
  {"question": "Define...", "answer": "..."}
]`;
    
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
    const prompt = `Based on the study material "${title}", create exactly 5 multiple-choice quiz questions.

Material Content:
${content}

Format as JSON:
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation..."
  }
]`;
    
    const response = await processQuery(prompt, 'course-tutor');
    if (!response) return null;
    
    try {
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((q: any, index: number) => ({
          question: q.question || `Question ${index + 1} about ${title}`,
          options: Array.isArray(q.options) && q.options.length === 4 
            ? q.options 
            : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
            ? q.correctAnswer 
            : 0,
          explanation: q.explanation || "Review the material for more details."
        }));
      }
    } catch {
      return null;
    }
    
    return null;
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
