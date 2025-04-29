
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NavbarProfileProps {
  isCollapsed: boolean;
}

export function NavbarProfile({ isCollapsed }: NavbarProfileProps) {
  const { user, profile, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "transition-colors mt-2 w-full flex",
            isCollapsed ? "justify-center p-0 h-10" : "justify-start gap-2"
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? user.email} />
            <AvatarFallback>
              {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <span className="truncate">{profile?.full_name ?? user.email}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{profile?.full_name ?? "User"}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
