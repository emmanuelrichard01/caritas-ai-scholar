
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { FormEvent, useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background sticky bottom-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 max-w-4xl mx-auto"
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about Caritas University, study tips, or academic guidance..."
          className="flex-1"
          disabled={disabled}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={disabled || !inputValue.trim()}
          className="bg-caritas hover:bg-caritas-light"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
