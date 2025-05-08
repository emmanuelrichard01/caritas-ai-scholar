
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { NavigationItems } from '@/components/ui/NavigationItems';
import ChatHeader from '@/components/ChatHeader';
import { ChatContainer } from '@/components/chat/ChatContainer';

const Index = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="flex h-16 items-center px-4">
            <div className="w-full flex justify-between items-center">
              {!isCollapsed && <span className="font-bold">CARITAS AI</span>}
              <SidebarTrigger onClick={() => setIsCollapsed(!isCollapsed)} />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavigationItems isCollapsed={isCollapsed} />
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col w-full">
          <ChatHeader />
          <div className="flex-grow overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
