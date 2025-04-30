
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export interface FlashcardItem {
  question: string;
  answer: string;
}

interface FlashcardProps {
  flashcards: FlashcardItem[];
}

export const Flashcard = ({ flashcards }: FlashcardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  
  if (!flashcards || flashcards.length === 0) return null;
  
  const currentCard = flashcards[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h3 className="text-lg font-medium mb-3 dark:text-white">Flashcards</h3>
      
      <div 
        className={`relative w-full h-56 mb-4 cursor-pointer ${flipped ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-800'} border border-slate-200 dark:border-slate-700 rounded-lg`}
        onClick={handleFlip}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p className="text-lg dark:text-white">
            {flipped ? currentCard.answer : currentCard.question}
          </p>
        </div>
        
        <div className="absolute bottom-2 right-2">
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation();
            handleFlip();
          }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
