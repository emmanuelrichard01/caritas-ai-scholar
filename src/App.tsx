
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CourseTutor from "./pages/CourseTutor";
import StudyPlanner from "./pages/StudyPlanner";
import AssignmentHelper from "./pages/AssignmentHelper";
import ResearchAssistant from "./pages/ResearchAssistant";
import History from "./pages/History";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/history" element={<History />} />
          <Route path="/course-tutor" element={<CourseTutor />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/assignment-helper" element={<AssignmentHelper />} />
          <Route path="/research" element={<ResearchAssistant />} />
          <Route path="/settings" element={<div className="pl-[70px] md:pl-[260px] p-8 dark:bg-slate-950 dark:text-white min-h-screen">Settings page (Coming soon)</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
