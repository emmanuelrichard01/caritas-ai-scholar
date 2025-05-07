
import { useState } from 'react';
import ChatHeader from '@/components/ChatHeader';
import { ChatContainer } from '@/components/chat/ChatContainer';

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader />
      <div className="flex-grow overflow-hidden">
        <ChatContainer />
      </div>
    </div>
  );
};

export default Index;
