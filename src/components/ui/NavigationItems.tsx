
import { 
  Home, 
  GraduationCap, 
  Calculator, 
  Calendar, 
  Book, 
  Brain,
  Search, 
  History,
  User
} from "lucide-react";

export interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Dashboard",
    description: "Overview and quick actions"
  },
  {
    href: "/gpa-calculator", 
    icon: Calculator,
    label: "GPA Calculator",
    description: "Calculate and track your GPA"
  },
  {
    href: "/study-planner",
    icon: Calendar, 
    label: "Study Planner",
    description: "Plan and organize your study sessions"
  },
  {
    href: "/course-tutor",
    icon: Book,
    label: "Course Tutor", 
    description: "Upload and manage course materials"
  },
  {
    href: "/study-tools",
    icon: Brain,
    label: "Study Tools",
    description: "Generate AI-powered study aids"
  },
  {
    href: "/research-assistant",
    icon: Search,
    label: "Research Assistant", 
    description: "AI-powered academic research"
  },
  {
    href: "/history",
    icon: History,
    label: "History",
    description: "View your past interactions"
  }
];

export const profileItems = [
  {
    href: "/auth",
    icon: User,
    label: "Account"
  }
];
