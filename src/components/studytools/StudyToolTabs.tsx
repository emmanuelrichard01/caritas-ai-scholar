
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesDisplay } from "./NotesDisplay";
import { Flashcard, FlashcardItem } from "./Flashcard";
import { QuizComponent, QuizQuestion } from "./QuizComponent";
import { ChatbotComponent } from "./ChatbotComponent";
import { QuizComponent } from "./QuizComponent";

interface StudyToolTabsProps {
  notes: string | null;
  flashcards: FlashcardItem[] | null;
  quizQuestions: QuizQuestion[] | null;
  materialContext: string;
}

export const StudyToolTabs = ({ 
  notes, 
  flashcards, 
  quizQuestions, 
  materialContext 
}: StudyToolTabsProps) => {
  const [activeTab, setActiveTab] = useState("notes");
  
  if (!notes && !flashcards && !quizQuestions) return null;
  
  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-4 dark:text-white">Study Materials</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="chat">Ask Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes">
          <NotesDisplay notes={notes} title="Generated Notes" />
        </TabsContent>
        
        <TabsContent value="flashcards">
          {flashcards && flashcards.length > 0 ? (
            <Flashcard flashcards={flashcards} />
          ) : (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              No flashcards available yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="quiz">
          {quizQuestions && quizQuestions.length > 0 ? (
            <QuizComponent questions={quizQuestions} />
          ) : (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              No quiz questions available yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="chat">
          <ChatbotComponent materialContext={materialContext} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
