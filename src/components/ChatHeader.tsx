
import { GraduationCap, BookOpen } from "lucide-react";

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between border-b border-border p-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10 dark:bg-slate-900/95 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-caritas flex items-center justify-center text-white shadow-md">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl dark:text-white">CARITAS AI</h1>
            <span className="bg-caritas/10 text-caritas text-xs px-2 py-1 rounded-full font-medium">Academic Assistant</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 dark:text-slate-400">
            <BookOpen className="h-3 w-3" />
            Your personalized learning companion
          </p>
        </div>
      </div>
      <div className="text-sm font-medium text-muted-foreground hidden md:block dark:text-slate-400">
        Caritas University
      </div>
    </div>
  );
};

export default ChatHeader;
