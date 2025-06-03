
import { MessageSquare, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { ChatContainer } from '@/components/chat/ChatContainer';

const Index = () => {
  return (
    <PageLayout 
      title="AI Chat Assistant"
      subtitle="Your intelligent companion for academic support and learning guidance"
      icon={
        <div className="relative">
          <MessageSquare className="h-6 w-6" />
          <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-blue-500 animate-pulse" />
        </div>
      }
    >
      <div className="flex flex-col h-full w-full max-w-6xl mx-auto">
        <div className="flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
          <ChatContainer />
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
