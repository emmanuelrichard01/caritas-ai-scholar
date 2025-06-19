
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionCarouselProps {
  onSelectSuggestion: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: <BookOpen className="h-4 w-4" />,
    text: "Available courses",
    query: "What are the available courses at Caritas University?"
  },
  {
    icon: <Search className="h-4 w-4" />,
    text: "Study techniques",
    query: "How can I improve my study habits?"
  },
  {
    icon: <Calendar className="h-4 w-4" />,
    text: "Academic calendar",
    query: "What's the current academic calendar?"
  },
  {
    icon: <MessageSquare className="h-4 w-4" />,
    text: "Assignment help",
    query: "Help me break down this research assignment"
  }
];

export const SuggestionCarousel = ({ onSelectSuggestion }: SuggestionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % suggestions.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % suggestions.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-sm font-medium mb-6 text-center text-slate-600 dark:text-slate-400">
        Try asking about:
      </p>
      
      <div className="relative">
        {/* Navigation buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md hover:bg-white dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md hover:bg-white dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Carousel container */}
        <div className="overflow-hidden mx-8">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {suggestions.map((suggestion, index) => (
              <div key={index} className="w-full flex-shrink-0 px-2">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full flex items-center gap-4 h-auto p-6 text-left transition-all duration-300",
                    "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20",
                    "hover:border-blue-200 dark:hover:border-blue-800",
                    "hover:shadow-lg hover:scale-[1.02]",
                    "group border-slate-200 dark:border-slate-700",
                    "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                  )}
                  onClick={() => onSelectSuggestion(suggestion.query)}
                >
                  <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    {suggestion.icon}
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">
                      {suggestion.text}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 text-left">
                      {suggestion.query}
                    </span>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {suggestions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-blue-500 w-6" 
                  : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
