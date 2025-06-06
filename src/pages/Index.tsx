
import { MessageSquare, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { ChatContainer } from '@/components/chat/ChatContainer';

const Index = () => {
  return (
    <PageLayout 
      title="CARITAS AI"
      subtitle="Your intelligent academic companion"
      icon={
        <div className="relative">
          <MessageSquare className="h-5 w-5" />
          <Sparkles className="h-2 w-2 absolute -top-0.5 -right-0.5 text-blue-500 animate-pulse" />
        </div>
      }
    >
      <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
        <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-lg">
          <ChatContainer />
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
