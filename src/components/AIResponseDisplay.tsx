
interface AIResponseDisplayProps {
  isProcessing: boolean;
  results: string | null;
}

export const AIResponseDisplay = ({ isProcessing, results }: AIResponseDisplayProps) => {
  if (isProcessing) {
    return (
      <div className="mt-6 text-center">
        <div className="inline-flex gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:0.2s]"></div>
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:0.4s]"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2 dark:text-slate-400">Analyzing course materials...</p>
      </div>
    );
  }
  
  if (!results) return null;
  
  return (
    <div className="mt-6 bg-slate-50 p-4 rounded-lg dark:bg-slate-800">
      <h3 className="font-medium mb-2 dark:text-white">Results:</h3>
      <div className="prose prose-slate max-w-none dark:prose-invert">
        {results.split('\n').map((paragraph, index) => (
          <p 
            key={index} 
            className={paragraph.startsWith('•') ? 'ml-4 mb-2' : 'mb-2'}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};
