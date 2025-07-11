
export type AICategory = 
  | 'default' 
  | 'google-ai' 
  | 'openrouter' 
  | 'course-tutor'
  | 'material-tutor'
  | 'process-course-material'
  | 'study-planner' 
  | 'generate-study-aids' 
  | 'research';

export interface AIProcessorOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface AIQueryData {
  answer: string;
  [key: string]: any;
}

export interface AIUploadedFile {
  filename: string;
  filePath: string;
  contentType: string;
  size: number;
}
