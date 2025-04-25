
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CourseTutor from "./pages/CourseTutor";
import StudyPlanner from "./pages/StudyPlanner";
import AssignmentHelper from "./pages/AssignmentHelper";
import ResearchAssistant from "./pages/ResearchAssistant";
import History from "./pages/History";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="pl-[70px] md:pl-[260px] p-8 dark:bg-slate-950 min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Index />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/course-tutor"
            element={
              <PrivateRoute>
                <CourseTutor />
              </PrivateRoute>
            }
          />
          <Route
            path="/study-planner"
            element={
              <PrivateRoute>
                <StudyPlanner />
              </PrivateRoute>
            }
          />
          <Route
            path="/assignment-helper"
            element={
              <PrivateRoute>
                <AssignmentHelper />
              </PrivateRoute>
            }
          />
          <Route
            path="/research"
            element={
              <PrivateRoute>
                <ResearchAssistant />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
