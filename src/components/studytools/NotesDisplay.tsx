
import { Card } from "@/components/ui/card";
import { FormattedContent } from "@/components/FormattedContent";

interface NotesDisplayProps {
  notes: string | null;
  title: string;
}

export const NotesDisplay = ({ notes, title }: NotesDisplayProps) => {
  if (!notes) return null;
  
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h3 className="text-lg font-medium mb-3 dark:text-white">{title}</h3>
      <FormattedContent content={notes} variant="default" />
    </Card>
  );
};
