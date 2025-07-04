
import { MessageSquare } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { EnhancedChatContainer } from "@/components/chat/EnhancedChatContainer";

const Chat = () => {
  return (
    <PageLayout
      title="AI Chat"
      subtitle="Your intelligent academic companion"
      icon={<MessageSquare className="h-6 w-6" />}
    >
      <div className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] -mx-3 sm:-mx-6 -mb-4 sm:-mb-8">
        <EnhancedChatContainer />
      </div>
    </PageLayout>
  );
};

export default Chat;
