import { Suspense, lazy, ErrorInfo, Component } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

// Error boundary component
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("UI Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md w-full">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Application Error</AlertTitle>
            <AlertDescription>
              <p>An unexpected error has occurred in the application.</p>
              <p className="text-sm mt-2 font-mono overflow-auto max-h-24">
                {this.state.error?.message || "Unknown error"}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Reload Application
              </button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy loaded components for improved performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CourseTutor = lazy(() => import("./pages/CourseTutor"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const ResearchAssistant = lazy(() => import("./pages/ResearchAssistant"));
const History = lazy(() => import("./pages/History"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const GPACalculator = lazy(() => import("./pages/GPACalculator"));

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
    <div className="h-16 w-16 rounded-full bg-caritas animate-pulse"></div>
  </div>
);

// Configure QueryClient with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton theme="light" richColors />
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <ErrorBoundary>
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
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
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
                  path="/research"
                  element={
                    <PrivateRoute>
                      <ResearchAssistant />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/gpa-calculator"
                  element={
                    <PrivateRoute>
                      <GPACalculator />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
