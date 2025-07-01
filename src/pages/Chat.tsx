
import { MessageSquare } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Chat = () => {
  return (
    <PageLayout
      title="CARITAS AI Chat"
      subtitle="Your intelligent study companion for instant help and guidance"
      icon={<MessageSquare className="h-6 w-6" />}
    >
      <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] -mx-4 sm:-mx-6 -mb-6 sm:-mb-8">
        <ChatContainer />
      </div>
    </PageLayout>
  );
};

export default Chat;
