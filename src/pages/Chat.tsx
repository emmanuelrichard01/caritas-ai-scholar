
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
      <div className="h-[calc(100vh-16rem)] -mx-4 sm:-mx-6 -mb-6 sm:-mb-8">
        <EnhancedChatContainer />
      </div>
    </PageLayout>
  );
};

export default Chat;
