
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
      // Fetch material and its segments
      const { data: material, error: materialError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', materialId)
        .single();
      
      if (materialError) {
        throw new Error("Failed to fetch material");
      }
      
      const { data: segments, error: segmentsError } = await supabase
        .from('segments')
        .select('*')
        .eq('material_id', materialId);
      
      if (segmentsError) {
        throw new Error("Failed to fetch material content");
      }
      
      if (!segments || segments.length === 0) {
        throw new Error("No content found for this material");
      }
      
      // Combine all segments into comprehensive content
      const fullContent = segments.map(segment => 
        `## ${segment.title}\n${segment.text}`
      ).join('\n\n');
      
      const materialTitle = material.title;
      setMaterialContext(fullContent);
      
      // Generate comprehensive study notes
      const notesPrompt = `Based on the following course material titled "${materialTitle}", create comprehensive study notes with clear headings, bullet points, and key concepts. Make it well-structured and easy to review.

Material Content:
${fullContent}

${query ? `Focus specifically on: ${query}` : 'Cover all important topics comprehensively.'}

Format the response with clear headings and bullet points for easy studying.`;
      
      const notesResponse = await processQuery(notesPrompt, 'course-tutor');
      
      if (notesResponse) {
        setNotes(notesResponse);
        
        // Generate flashcards
        const flashcardsPrompt = `Based on the study material "${materialTitle}", create exactly 10 flashcards for key concepts. 

Material Content:
${fullContent}

Create flashcards that test understanding of the most important concepts. Format your response as a JSON array like this:
[
  {"question": "What is...", "answer": "..."},
  {"question": "Define...", "answer": "..."}
]

Make sure each flashcard tests a different important concept from the material.`;
        
        const flashcardsResponse = await processQuery(flashcardsPrompt, 'course-tutor');
        
        if (flashcardsResponse) {
          try {
            // Extract JSON from the response
            const jsonMatch = flashcardsResponse.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
              const parsedFlashcards = JSON.parse(jsonMatch[0]);
              setFlashcards(parsedFlashcards);
            } else {
              // Fallback if JSON parsing fails
              setFlashcards([
                { 
                  question: `What are the main topics covered in "${materialTitle}"?`, 
                  answer: "Review the notes section for a comprehensive overview of all key concepts and topics." 
                }
              ]);
            }
          } catch (error) {
            console.error("Error parsing flashcards:", error);
            setFlashcards([
              { 
                question: `What are the main topics covered in "${materialTitle}"?`, 
                answer: "Review the notes section for a comprehensive overview of all key concepts and topics." 
              }
            ]);
          }
        }
        
        // Generate quiz questions
        const quizPrompt = `Based on the study material "${materialTitle}", create exactly 5 multiple-choice quiz questions.

Material Content:
${fullContent}

Create questions that test understanding of key concepts. Format your response as a JSON array like this:
[
  {
    "question": "What is the main purpose of...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this is correct..."
  }
]

Make sure each question tests different important concepts from the material.`;
        
        const quizResponse = await processQuery(quizPrompt, 'course-tutor');
        
        if (quizResponse) {
          try {
            // Extract JSON from the response
            const jsonMatch = quizResponse.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
              const parsedQuestions = JSON.parse(jsonMatch[0]);
              
              // Validate and format questions
              const validQuestions = parsedQuestions.map((q: any, index: number) => ({
                question: q.question || `Question ${index + 1} about ${materialTitle}`,
                options: Array.isArray(q.options) && q.options.length === 4 
                  ? q.options 
                  : ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
                  ? q.correctAnswer 
                  : 0,
                explanation: q.explanation || "Review the material for more details on this topic."
              }));
              
              setQuizQuestions(validQuestions);
            } else {
              // Fallback quiz question
              setQuizQuestions([
                {
                  question: `What is the best way to study the material "${materialTitle}"?`,
                  options: [
                    "Review the generated notes thoroughly",
                    "Skip the reading completely",
                    "Only memorize the first paragraph",
                    "Ignore all the details"
                  ],
                  correctAnswer: 0,
                  explanation: "The generated notes provide a comprehensive and structured overview of all the important concepts."
                }
              ]);
            }
          } catch (error) {
            console.error("Error parsing quiz questions:", error);
            setQuizQuestions([
              {
                question: `What is the best way to study the material "${materialTitle}"?`,
                options: [
                  "Review the generated notes thoroughly",
                  "Skip the reading completely", 
                  "Only memorize the first paragraph",
                  "Ignore all the details"
                ],
                correctAnswer: 0,
                explanation: "The generated notes provide a comprehensive and structured overview of all the important concepts."
              }
            ]);
          }
        }
        
        toast.success("Study materials generated successfully!");
      } else {
        throw new Error("Failed to generate study notes");
      }
    } catch (error) {
      console.error("Error generating study materials:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate study materials";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
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
