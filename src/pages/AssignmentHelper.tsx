
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { useIsMobile } from "@/hooks/use-mobile";

const AssignmentHelper = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { processQuery, isProcessing } = useAIProcessor();

  const handleAnalyze = async () => {
    const response = await processQuery(prompt, 'assignment-helper');
    if (response) {
      setResult(response);
    }
  };

  // Function to render markdown-like content
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const renderedContent: JSX.Element[] = [];
    
    let currentListItems: JSX.Element[] = [];
    let inList = false;
    
    lines.forEach((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        if (inList) {
          renderedContent.push(<ul key={`ul-${index}`} className="mb-4">{currentListItems}</ul>);
          currentListItems = [];
          inList = false;
        }
        renderedContent.push(<h2 key={index} className="text-xl font-bold mt-6 mb-3 dark:text-white">{line.substring(2)}</h2>);
      } 
      else if (line.startsWith('## ')) {
        if (inList) {
          renderedContent.push(<ul key={`ul-${index}`} className="mb-4">{currentListItems}</ul>);
          currentListItems = [];
          inList = false;
        }
        renderedContent.push(<h3 key={index} className="text-lg font-medium mt-5 mb-2 dark:text-white">{line.substring(3)}</h3>);
      } 
      else if (line.startsWith('• ')) {
        inList = true;
        currentListItems.push(
          <li key={`li-${index}`} className="ml-2 flex gap-2 my-1">
            <span className="text-emerald-500">•</span>
            <span className="dark:text-slate-300">{line.substring(2)}</span>
          </li>
        );
      }
      else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        if (inList && !line.match(/^\d+\./)) {
          renderedContent.push(<ul key={`ul-${index}`} className="mb-4">{currentListItems}</ul>);
          currentListItems = [];
          inList = false;
        }
        
        if (line.match(/^\d+\./)) {
          inList = true;
          const content = line.replace(/^\d+\.\s/, '');
          
          // Check if it has a nested bold title
          const boldMatch = content.match(/\*\*(.*?)\*\*\s(.*)/);
          
          if (boldMatch) {
            currentListItems.push(
              <li key={`li-${index}`} className="ml-2 my-2 dark:text-slate-300">
                <strong>{boldMatch[1]}:</strong> {boldMatch[2]}
              </li>
            );
          } else {
            currentListItems.push(
              <li key={`li-${index}`} className="ml-2 my-2 dark:text-slate-300">{content}</li>
            );
          }
        }
      }
      else if (line.trim() === '') {
        if (inList) {
          renderedContent.push(<ul key={`ul-${index}`} className="mb-4">{currentListItems}</ul>);
          currentListItems = [];
          inList = false;
        }
        renderedContent.push(<div key={index} className="h-2"></div>);
      }
      else {
        if (inList) {
          renderedContent.push(<ul key={`ul-${index}`} className="mb-4">{currentListItems}</ul>);
          currentListItems = [];
          inList = false;
        }
        renderedContent.push(<p key={index} className="mb-2 dark:text-slate-300">{line}</p>);
      }
    });
    
    // Don't forget any remaining list items
    if (inList) {
      renderedContent.push(<ul key="final-list" className="mb-4">{currentListItems}</ul>);
    }
    
    return renderedContent;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
            <div className="h-12 w-12 rounded-full bg-amber-600 flex items-center justify-center text-white md:mr-4">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold dark:text-white">Assignment Decomposer</h1>
              <p className="text-muted-foreground dark:text-slate-400">Break down complex assignments into manageable steps</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border mb-4 md:mb-6 dark:bg-slate-900 dark:border-slate-800">
                <h2 className="text-lg font-medium mb-4 dark:text-white">Enter Your Assignment Prompt</h2>
                
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Paste your assignment description or prompt here..."
                  className="min-h-[200px] mb-4 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className={`${isMobile && result ? 'hidden' : ''}`}>
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border h-full dark:bg-slate-900 dark:border-slate-800">
                <h2 className="text-lg font-medium mb-4 dark:text-white">Assignment Tips</h2>
                <ul className="space-y-3">
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Break down large assignments into smaller tasks</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Start research early to find quality sources</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Create an outline before writing your first draft</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Allocate time for editing and proofreading</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Avoid plagiarism by citing all sources properly</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Schedule backwards from the due date</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {result && (
            <div className="mt-4 md:mt-6 bg-white rounded-xl p-4 md:p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-lg font-medium mb-4 dark:text-white">Assignment Analysis</h2>
              <div className="prose prose-slate max-w-none dark:prose-invert">
                {renderFormattedText(result)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentHelper;
