
import { MessageSquare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const MobileHeader = ({ isMobileMenuOpen, onToggleMobileMenu }: MobileHeaderProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-lg border-b flex items-center justify-between px-4" style={{ zIndex: 10 }}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-foreground">CARITAS AI</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMobileMenu}
        className="h-8 w-8"
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
    </div>
  );
};
