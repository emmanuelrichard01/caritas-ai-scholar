
import { supabase } from '@/integrations/supabase/client';
import { AICategory } from '@/types/ai';
import { toast } from 'sonner';

/**
 * Save AI interactions to history
 */
export const saveToHistory = async (
  userId: string | undefined,
  query: string, 
  answer: string, 
  category: AICategory, 
  metadata?: string
) => {
  if (!userId) return;
  
  try {
    const title = query.length > 50 ? `${query.substring(0, 47)}...` : query;
    const content = `Q: ${query}\n\nA: ${answer}${metadata ? `\n\nContext: ${metadata}` : ''}`;
    
    await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        title,
        content,
        category
      });
  } catch (error) {
    console.error('Error saving to history:', error);
    // Non-blocking error - don't show to user as it's not critical
  }
};

/**
 * Validate file types and sizes
 */
export const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
  // Calculate total size of files for validation
  const totalSizeMB = files.reduce((sum, file) => sum + file.size / (1024 * 1024), 0);
  if (totalSizeMB > 20) { // 20MB limit
    return { valid: false, error: "Total file size exceeds 20MB limit" };
  }

  // Validate file types
  const validTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    'text/plain'
  ];
  
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  if (invalidFiles.length > 0) {
    return { 
      valid: false, 
      error: `Unsupported file format: ${invalidFiles[0].name}. Please use PDF, DOC, DOCX, PPT, PPTX or TXT files.` 
    };
  }

  return { valid: true };
};
