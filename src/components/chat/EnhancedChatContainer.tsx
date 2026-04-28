import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  MessageSquare,
  Brain,
  BookOpen,
  Calculator,
  Users,
  Lightbulb,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnhancedChatInput } from "./EnhancedChatInput";
import { EnhancedChatMessage } from "./EnhancedChatMessage";
import { Skeleton } from "@/components/ui/skeleton";

export interface Message {
  role: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp?: Date;
  id?: string;
  tokens?: number;
  responseTime?: number;
}

const quickSuggestions = [
  { icon: Brain, title: "Study Help", prompt: "Help me understand complex calculus concepts with step-by-step explanations" },
  { icon: BookOpen, title: "Research Paper", prompt: "Guide me through writing a research paper on quantum physics" },
  { icon: Calculator, title: "Problem Solving", prompt: "Help me solve advanced mathematics problems with detailed solutions" },
  { icon: Users, title: "Study Group", prompt: "Create a collaborative study plan for my upcoming finals" },
  { icon: Lightbulb, title: "Creative Ideas", prompt: "Suggest innovative project ideas for my computer science course" },
];

export const EnhancedChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { processQuery, isProcessing } = useAIProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadChatHistory = useCallback(async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const { data: history, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", "google-ai")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;

      if (history && history.length > 0) {
        const loaded: Message[] = history.flatMap((r) => [
          { role: "user" as const, content: r.title, timestamp: new Date(r.created_at), id: `${r.id}-q` },
          { role: "assistant" as const, content: r.content, timestamp: new Date(r.created_at), id: `${r.id}-a` },
        ]);
        setMessages(loaded);
        setIsFirstMessage(false);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isFirstMessage) loadChatHistory();
  }, [user, isFirstMessage, loadChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isProcessing) return;
      const startTime = Date.now();
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date(),
        id: `${messageId}-user`,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsFirstMessage(false);
      setRetryCount(0);

      try {
        const response = await processQuery(message, "google-ai");
        const responseTime = Date.now() - startTime;
        if (response) {
          setMessages([
            ...newMessages,
            {
              role: "assistant",
              content: response,
              timestamp: new Date(),
              id: `${messageId}-assistant`,
              responseTime,
            },
          ]);
        } else {
          throw new Error("Empty response received");
        }
      } catch (error) {
        console.error("Error processing message:", error);
        setMessages([
          ...newMessages,
          {
            role: "error",
            content: "I encountered an error processing your message. Please try again.",
            timestamp: new Date(),
            id: `${messageId}-error`,
          },
        ]);
      }
    },
    [messages, isProcessing, processQuery]
  );

  const clearHistory = useCallback(async () => {
    if (!user) return;
    try {
      await supabase
        .from("chat_history")
        .delete()
        .eq("user_id", user.id)
        .eq("category", "google-ai");
      setMessages([]);
      setIsFirstMessage(true);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear chat history");
    }
  }, [user]);

  const refreshChat = useCallback(async () => {
    if (isProcessing) return;
    setMessages([]);
    setIsFirstMessage(true);
    await loadChatHistory();
  }, [isProcessing, loadChatHistory]);

  const retryLastMessage = useCallback(async () => {
    if (messages.length === 0 || isProcessing) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) return;
    setRetryCount((p) => p + 1);
    if (retryCount >= 3) {
      toast.error("Maximum retry attempts reached");
      return;
    }
    const filtered = messages.filter(
      (m) => !(m.role === "assistant" || m.role === "error") || m.timestamp! < lastUserMessage.timestamp!
    );
    setMessages(filtered);
    await handleSendMessage(lastUserMessage.content);
  }, [messages, isProcessing, retryCount, handleSendMessage]);

  const chatStats = useMemo(() => {
    const userMessages = messages.filter((m) => m.role === "user").length;
    const assistantMessages = messages.filter((m) => m.role === "assistant").length;
    return { userMessages, assistantMessages };
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-card rounded-[2rem] border border-border/40 shadow-3d overflow-hidden">
      {/* Header — minimal */}
      <header className="flex-shrink-0 border-b border-border/40 bg-card/80 backdrop-blur-md px-5 sm:px-8 py-5 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center shadow-sm border border-brand/20">
              <Sparkles className="h-5 w-5" />
              {isProcessing && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-card animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold tracking-tight text-foreground leading-tight truncate">
                CARITAS AI
              </h1>
              <p className="text-xs text-muted-foreground">
                {chatStats.userMessages > 0
                  ? `${chatStats.userMessages} message${chatStats.userMessages === 1 ? "" : "s"}`
                  : "Your academic companion"}
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="iconSm" onClick={refreshChat} disabled={isProcessing} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="iconSm" onClick={clearHistory} disabled={isProcessing} title="Clear">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
          {isLoadingHistory ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-12 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isFirstMessage && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare className="h-7 w-7 text-brand" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                What can I help with?
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Ask anything about your studies, research, or coursework.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {quickSuggestions.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => handleSendMessage(s.prompt)}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="group text-left p-5 rounded-2xl border border-border/40 bg-card hover:border-brand/30 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 focus-ring animate-fade-in-up opacity-0 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand transition-smooth group-hover:bg-brand group-hover:text-white flex-shrink-0 shadow-sm border border-brand/10">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <div className="text-[15px] font-bold text-foreground">{s.title}</div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.prompt}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <EnhancedChatMessage key={message.id || index} message={message} isUser={message.role === "user"} />
              ))}

              {isProcessing && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-border/60 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: "200ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border/40 bg-card/80 backdrop-blur-md px-4 sm:px-6 py-5 z-10">
        <div className="max-w-4xl mx-auto">
          <EnhancedChatInput
            onSendMessage={handleSendMessage}
            disabled={isProcessing || isLoadingHistory}
            onRetry={retryLastMessage}
            showRetry={messages.length > 0 && messages[messages.length - 1]?.role === "error"}
          />
        </div>
      </div>
    </div>
  );
};
