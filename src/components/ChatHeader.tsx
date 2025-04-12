
import { GraduationCap } from "lucide-react";

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between border-b border-border p-4 bg-white/95 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-caritas flex items-center justify-center text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">CARITAS AI</h1>
          <p className="text-xs text-muted-foreground">Your university assistant</p>
        </div>
      </div>
      <div className="text-sm font-medium text-muted-foreground">
        Caritas University
      </div>
    </div>
  );
};

export default ChatHeader;
