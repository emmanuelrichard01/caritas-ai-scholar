
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Material, Segment, Summary, Flashcard, Quiz, QuizType } from '@/types/database';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all materials for the current user
  const fetchMaterials = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch materials');
      toast.error('Failed to fetch materials');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch segments for a specific material
  const fetchSegments = async (materialId: string) => {
    if (!materialId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('material_id', materialId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setSegments(data || []);
    } catch (err) {
      console.error('Error fetching segments:', err);
      toast.error('Failed to fetch segments');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch summaries for a specific segment
  const fetchSummaries = async (segmentId: string): Promise<Summary[]> => {
    try {
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('segment_id', segmentId);
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching summaries:', err);
      toast.error('Failed to fetch summaries');
      return [];
    }
  };

  // Fetch flashcards for a specific segment
  const fetchFlashcards = async (segmentId: string): Promise<Flashcard[]> => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('segment_id', segmentId);
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      toast.error('Failed to fetch flashcards');
      return [];
    }
  };

  // Fetch quizzes for a specific segment
  const fetchQuizzes = async (segmentId: string): Promise<Quiz[]> => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('segment_id', segmentId);
        
      if (error) throw error;
      
      // Type validation to ensure the 'type' field is either 'mcq' or 'short'
      const validatedData = data?.map(quiz => {
        // Ensure quiz.type is either 'mcq' or 'short'
        const validType: QuizType = quiz.type === 'mcq' || quiz.type === 'short' 
          ? quiz.type as QuizType
          : 'mcq'; // Default to 'mcq' if type is invalid
          
        return {
          ...quiz,
          type: validType
        } as Quiz;
      }) || [];
      
      return validatedData;
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      toast.error('Failed to fetch quizzes');
      return [];
    }
  };

  // Generate summary for a segment
  const generateSummary = async (segmentId: string): Promise<Summary | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-documents', {
        body: {
          segmentId,
          type: 'summary'
        }
      });
      
      if (error) throw error;
      return data?.result || null;
    } catch (err) {
      console.error('Error generating summary:', err);
      toast.error('Failed to generate summary');
      return null;
    }
  };

  // Generate flashcards for a segment
  const generateFlashcards = async (segmentId: string): Promise<Flashcard[] | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-study-aids', {
        body: {
          segmentId,
          type: 'flashcards'
        }
      });
      
      if (error) throw error;
      return data?.result || null;
    } catch (err) {
      console.error('Error generating flashcards:', err);
      toast.error('Failed to generate flashcards');
      return null;
    }
  };

  // Generate quiz for a segment
  const generateQuiz = async (segmentId: string): Promise<Quiz[] | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-study-aids', {
        body: {
          segmentId,
          type: 'quiz'
        }
      });
      
      if (error) throw error;
      
      // Validate and ensure correct typing for the returned quizzes
      const validatedQuizzes = data?.result?.map((quiz: any) => {
        const validType: QuizType = quiz.type === 'mcq' || quiz.type === 'short' 
          ? quiz.type as QuizType
          : 'mcq'; // Default to 'mcq' if type is invalid
          
        return {
          ...quiz,
          type: validType
        } as Quiz;
      }) || null;
      
      return validatedQuizzes;
    } catch (err) {
      console.error('Error generating quiz:', err);
      toast.error('Failed to generate quiz');
      return null;
    }
  };

  // Fetch materials on component mount
  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [user]);

  return {
    materials,
    segments,
    isLoading,
    error,
    fetchMaterials,
    fetchSegments,
    fetchSummaries,
    fetchFlashcards,
    fetchQuizzes,
    generateSummary,
    generateFlashcards,
    generateQuiz
  };
}
