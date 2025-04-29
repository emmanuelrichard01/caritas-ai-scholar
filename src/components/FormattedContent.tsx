
import React from 'react';

interface FormattedContentProps {
  content: string;
}

export const FormattedContent = ({ content }: FormattedContentProps) => {
  if (!content) return null;
  
  const lines = content.split('\n');
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
  
  return <>{renderedContent}</>;
};
