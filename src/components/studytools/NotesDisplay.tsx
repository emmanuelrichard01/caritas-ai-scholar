
import { Card } from "@/components/ui/card";

interface NotesDisplayProps {
  notes: string | null;
  title: string;
}

export const NotesDisplay = ({ notes, title }: NotesDisplayProps) => {
  if (!notes) return null;
  
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h3 className="text-lg font-medium mb-3 dark:text-white">{title}</h3>
      <div className="prose prose-slate max-w-none dark:prose-invert">
        {notes.split('\n').map((paragraph, index) => {
          // Handle bullet points and other formatting
          if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
            return (
              <p key={index} className="ml-4 mb-2">
                {paragraph}
              </p>
            );
          } else if (paragraph.startsWith('##')) {
            return (
              <h3 key={index} className="text-lg font-medium mt-4 mb-2">
                {paragraph.replace('##', '').trim()}
              </h3>
            );
          } else if (paragraph.startsWith('#')) {
            return (
              <h2 key={index} className="text-xl font-medium mt-4 mb-2">
                {paragraph.replace('#', '').trim()}
              </h2>
            );
          } else if (paragraph.trim() === '') {
            return <div key={index} className="h-2"></div>;
          } else {
            return <p key={index} className="mb-2">{paragraph}</p>;
          }
        })}
      </div>
    </Card>
  );
};
