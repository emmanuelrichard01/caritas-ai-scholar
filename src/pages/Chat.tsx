
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
      <div className="h-[calc(100vh-12rem)] -m-6 -mt-8">
        <ChatContainer />
      </div>
    </PageLayout>
  );
};

export default Chat;
