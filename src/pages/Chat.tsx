
import { MessageSquare } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ModernChatContainer } from "@/components/chat/ModernChatContainer";

const Chat = () => {
  return (
    <PageLayout
      title="AI Chat"
      subtitle="Your intelligent academic companion"
      icon={<MessageSquare className="h-6 w-6" />}
    >
      <div className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] -mx-4 sm:-mx-6 -mb-6 sm:-mb-8 rounded-t-xl overflow-hidden">
        <ModernChatContainer />
      </div>
    </PageLayout>
  );
};

export default Chat;
