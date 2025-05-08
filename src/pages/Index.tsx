
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import ChatHeader from '@/components/ChatHeader';
import { ChatContainer } from '@/components/chat/ChatContainer';

const Index = () => {
  return (
    <PageLayout 
      title="Chat"
      subtitle="Ask me anything about your academic journey"
      icon={<MessageSquare className="h-6 w-6" />}
    >
      <div className="flex flex-col w-full">
        <div className="flex-grow overflow-hidden">
          <ChatContainer />
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
