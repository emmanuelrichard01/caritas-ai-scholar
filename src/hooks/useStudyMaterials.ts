
import { useState } from "react";
import { useAIProcessor } from "./useAIProcessor";
import { FlashcardItem } from "@/components/studytools/Flashcard";
import { QuizQuestion } from "@/components/studytools/QuizComponent";
import { toast } from "sonner";

export const useStudyMaterials = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardItem[] | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [materialContext, setMaterialContext] = useState<string>("");
  
  const { processDocuments } = useAIProcessor();
  
  const generateStudyMaterials = async (files: File[], query: string) => {
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // First, get the notes
      const notesResponse = await processDocuments(
        files, 
        `Create comprehensive study notes from these materials. Include headings, bullet points, and important concepts. Focus on: ${query || "creating a complete overview"}`
      );
      
      if (notesResponse) {
        setNotes(notesResponse);
        setMaterialContext(notesResponse);
        
        // Next, generate flashcards
        const flashcardsResponse = await processDocuments(
          files,
          "Generate 10 flashcards with questions and answers based on the most important concepts in these materials. Format as JSON."
        );
        
        if (flashcardsResponse) {
          try {
            // Extract JSON from the response
            const jsonMatch = flashcardsResponse.match(/```json\n([\s\S]*?)\n```/) || 
                          flashcardsResponse.match(/\[([\s\S]*?)\]/) ||
                          flashcardsResponse.match(/{[\s\S]*?}/);
                          
            if (jsonMatch) {
              const jsonStr = jsonMatch[0];
              const parsedFlashcards = JSON.parse(jsonStr);
              
              // Handle different possible formats
              const formattedFlashcards = Array.isArray(parsedFlashcards) 
                ? parsedFlashcards 
                : parsedFlashcards.flashcards || [];
                
              setFlashcards(formattedFlashcards);
            } else {
              console.error("Could not extract JSON from flashcards response");
              // Create a simple fallback flashcard
              setFlashcards([
                { question: "What are the main topics covered in this material?", answer: "Review the notes tab for a comprehensive overview of all topics." }
              ]);
            }
          } catch (error) {
            console.error("Error parsing flashcards JSON:", error);
            setFlashcards([
              { question: "What are the main topics covered in this material?", answer: "Review the notes tab for a comprehensive overview of all topics." }
            ]);
          }
        }
        
        // Finally, generate quiz questions
        const quizResponse = await processDocuments(
          files,
          "Create 5 multiple-choice quiz questions with 4 options each, including the correct answer and explanations. Format as JSON."
        );
        
        if (quizResponse) {
          try {
            // Extract JSON from the response
            const jsonMatch = quizResponse.match(/```json\n([\s\S]*?)\n```/) || 
                          quizResponse.match(/\[([\s\S]*?)\]/) ||
                          quizResponse.match(/{[\s\S]*?}/);
                          
            if (jsonMatch) {
              const jsonStr = jsonMatch[0];
              const parsedQuestions = JSON.parse(jsonStr);
              
              // Handle different possible formats
              const formattedQuestions = Array.isArray(parsedQuestions) 
                ? parsedQuestions 
                : parsedQuestions.questions || [];
                
              // Ensure questions have the correct format
              const validQuestions = formattedQuestions.map((q: any) => ({
                question: q.question || "Question missing",
                options: q.options || ["Option 1", "Option 2", "Option 3", "Option 4"],
                correctAnswer: q.correctAnswer || q.correctOption || 0,
                explanation: q.explanation || "Explanation not provided"
              }));
              
              setQuizQuestions(validQuestions);
            } else {
              console.error("Could not extract JSON from quiz response");
              // Create a fallback quiz question
              setQuizQuestions([
                {
                  question: "What is the best way to understand this material?",
                  options: [
                    "Review the generated notes",
                    "Skip directly to the quiz",
                    "Ignore the material completely",
                    "Only read the first page"
                  ],
                  correctAnswer: 0,
                  explanation: "The generated notes provide a comprehensive overview of the material."
                }
              ]);
            }
          } catch (error) {
            console.error("Error parsing quiz JSON:", error);
            setQuizQuestions([
              {
                question: "What is the best way to understand this material?",
                options: [
                  "Review the generated notes",
                  "Skip directly to the quiz",
                  "Ignore the material completely",
                  "Only read the first page"
                ],
                correctAnswer: 0,
                explanation: "The generated notes provide a comprehensive overview of the material."
              }
            ]);
          }
        }
        
        toast.success("Study materials generated successfully!");
      }
    } catch (error) {
      console.error("Error generating study materials:", error);
      toast.error("Failed to generate study materials. Please try again.");
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
    generateStudyMaterials
  };
};
