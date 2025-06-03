
import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedContentProps {
  content: string;
  className?: string;
  variant?: 'default' | 'chat' | 'research';
}

export const FormattedContent = ({ content, className, variant = 'default' }: FormattedContentProps) => {
  if (!content) return null;
  
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    
    let currentList: JSX.Element[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let inCodeBlock = false;
    let codeContent = '';
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${index}`} className="bg-muted p-4 rounded-lg overflow-x-auto text-sm my-4 border">
              <code className="text-foreground font-mono">{codeContent}</code>
            </pre>
          );
          codeContent = '';
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
          flushList();
        }
        return;
      }
      
      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }
      
      // Handle headers
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3 leading-tight">
            {trimmedLine.substring(4)}
          </h3>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3 leading-tight">
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-foreground mt-6 mb-4 leading-tight">
            {trimmedLine.substring(2)}
          </h1>
        );
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        const content = trimmedLine.replace(/^\d+\.\s/, '');
        currentList.push(
          <li key={`li-${index}`} className="mb-2 leading-relaxed">
            {formatInlineText(content)}
          </li>
        );
      }
      // Handle bullet points
      else if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        const content = trimmedLine.substring(2);
        currentList.push(
          <li key={`li-${index}`} className="mb-2 leading-relaxed flex items-start">
            <span className="text-primary mr-2 mt-1 text-sm">•</span>
            <span className="flex-1">{formatInlineText(content)}</span>
          </li>
        );
      }
      // Handle blockquotes
      else if (trimmedLine.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-primary/20 pl-4 py-2 my-4 italic text-foreground/80 bg-muted/30 rounded-r">
            {formatInlineText(trimmedLine.substring(2))}
          </blockquote>
        );
      }
      // Handle empty lines
      else if (trimmedLine === '') {
        flushList();
        elements.push(<div key={index} className="h-3" />);
      }
      // Handle regular paragraphs
      else if (trimmedLine.length > 0) {
        flushList();
        elements.push(
          <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
            {formatInlineText(trimmedLine)}
          </p>
        );
      }
    });
    
    flushList();
    
    function flushList() {
      if (currentList.length > 0) {
        const ListComponent = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListComponent key={`list-${elements.length}`} className={cn(
            "mb-4 space-y-1",
            listType === 'ol' ? "list-decimal list-inside" : ""
          )}>
            {currentList}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    }
    
    return elements;
  };
  
  const formatInlineText = (text: string) => {
    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    // Handle inline code
    text = text.replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">$1</code>');
    // Handle underlined text
    text = text.replace(/_(.*?)_/g, '<u class="underline">$1</u>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };
  
  const variantClasses = {
    default: 'prose-enhanced',
    chat: 'prose-enhanced text-sm md:text-base',
    research: 'prose-enhanced text-sm'
  };
  
  return (
    <div className={cn(variantClasses[variant], className)}>
      {parseContent(content)}
    </div>
  );
};
