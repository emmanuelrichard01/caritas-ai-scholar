
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
}

export const QuizComponent = ({ questions }: QuizComponentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  if (!questions || questions.length === 0) return null;
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleOptionSelect = (optionIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optionIndex);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };
  
  if (quizCompleted) {
    return (
      <Card className="p-4 md:p-6 dark:bg-slate-900">
        <h3 className="text-lg font-medium mb-3 dark:text-white">Quiz Results</h3>
        <div className="text-center p-6">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="text-xl font-medium dark:text-white mb-2">
            You scored {score} out of {questions.length}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {score === questions.length ? "Perfect score! Great job!" : score > questions.length / 2 ? "Good job! Keep studying to improve further." : "Keep practicing to improve your score."}
          </p>
          <Button onClick={resetQuiz} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h3 className="text-lg font-medium mb-3 dark:text-white">Quiz</h3>
      
      <div className="mb-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-medium mb-4 dark:text-white">{currentQuestion.question}</h4>
        
        <RadioGroup value={selectedOption?.toString()} className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className={`flex items-center space-x-2 rounded-lg p-2 ${
              isAnswerSubmitted && index === currentQuestion.correctAnswer ? 'bg-green-50 dark:bg-green-900/20' :
              isAnswerSubmitted && index === selectedOption ? 'bg-red-50 dark:bg-red-900/20' :
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}>
              <RadioGroupItem 
                value={index.toString()} 
                id={`option-${index}`} 
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswerSubmitted}
              />
              <Label 
                htmlFor={`option-${index}`}
                className={`flex-grow cursor-pointer ${
                  isAnswerSubmitted && index === currentQuestion.correctAnswer ? 'text-green-700 dark:text-green-400' :
                  isAnswerSubmitted && index === selectedOption ? 'text-red-700 dark:text-red-400' :
                  'dark:text-slate-300'
                }`}
              >
                {option}
                {isAnswerSubmitted && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600 dark:text-green-400" />
                )}
                {isAnswerSubmitted && index === selectedOption && index !== currentQuestion.correctAnswer && (
                  <XCircle className="inline-block ml-2 h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {isAnswerSubmitted && currentQuestion.explanation && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">{currentQuestion.explanation}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        {!isAnswerSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </Card>
  );
};
