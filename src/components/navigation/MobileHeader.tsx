import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const MobileHeader = ({ isMobileMenuOpen, onToggleMobileMenu }: MobileHeaderProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-border/60 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-foreground text-background flex items-center justify-center shadow-subtle">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="font-semibold text-foreground tracking-tight">CARITAS AI</span>
      </div>
      <Button variant="ghost" size="iconSm" onClick={onToggleMobileMenu}>
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>
  );
};
