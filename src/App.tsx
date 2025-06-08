
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import GPACalculator from "./pages/GPACalculator";
import StudyPlanner from "./pages/StudyPlanner";
import CourseTutor from "./pages/CourseTutor";
import StudyTools from "./pages/StudyTools";
import ResearchAssistant from "./pages/ResearchAssistant";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/gpa-calculator" element={<GPACalculator />} />
              <Route path="/study-planner" element={<StudyPlanner />} />
              <Route path="/course-tutor" element={<CourseTutor />} />
              <Route path="/study-tools" element={<StudyTools />} />
              <Route path="/research-assistant" element={<ResearchAssistant />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
