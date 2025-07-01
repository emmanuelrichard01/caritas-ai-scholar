
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StudySubject {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  deadline?: Date;
  estimatedHours: number;
  color: string;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: "study" | "review" | "practice" | "break" | "exam";
  completed: boolean;
  scheduledAt: Date;
  difficulty: "easy" | "medium" | "hard";
}

export interface StudySession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  tasks: StudyTask[];
  totalDuration: number;
  completionRate: number;
}

export interface StudyPreferences {
  dailyStudyHours: number;
  preferredTimeSlots: string[];
  breakDuration: number;
  sessionDuration: number;
  studyDays: string[];
  focusMode: "pomodoro" | "timeboxing" | "flexible";
  difficultyDistribution: "balanced" | "hard-first" | "easy-first";
}

export interface StudyPlan {
  id?: string;
  title: string;
  description?: string;
  subjects: StudySubject[];
  preferences: StudyPreferences;
  sessions: StudySession[];
  analytics: {
    totalHours: number;
    completedTasks: number;
    streak: number;
    efficiency: number;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const defaultPreferences: StudyPreferences = {
  dailyStudyHours: 4,
  preferredTimeSlots: ["morning"],
  breakDuration: 15,
  sessionDuration: 45,
  studyDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  focusMode: "pomodoro",
  difficultyDistribution: "balanced"
};

const subjectColors = [
  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", 
  "#EF4444", "#06B6D4", "#84CC16", "#F97316"
];

export const useStudyPlan = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<StudyPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved study plans
  useEffect(() => {
    if (user) {
      loadSavedPlans();
      loadActivePlan();
    }
  }, [user]);

  const loadSavedPlans = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const plans = data?.map(plan => ({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        subjects: plan.subjects as StudySubject[],
        preferences: plan.preferences as StudyPreferences,
        sessions: plan.sessions as StudySession[],
        analytics: plan.analytics as any,
        isActive: plan.is_active,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at
      })) || [];

      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    }
  };

  const loadActivePlan = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const plan: StudyPlan = {
          id: data.id,
          title: data.title,
          description: data.description,
          subjects: data.subjects as StudySubject[],
          preferences: data.preferences as StudyPreferences,
          sessions: data.sessions as StudySession[],
          analytics: data.analytics as any,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        setCurrentPlan(plan);
      }
    } catch (error) {
      console.error('Error loading active plan:', error);
    }
  };

  const createNewPlan = useCallback(() => {
    const newPlan: StudyPlan = {
      title: "New Study Plan",
      subjects: [],
      preferences: defaultPreferences,
      sessions: [],
      analytics: { totalHours: 0, completedTasks: 0, streak: 0, efficiency: 0 },
      isActive: false
    };
    setCurrentPlan(newPlan);
  }, []);

  const savePlan = async (plan: StudyPlan, makeActive = false) => {
    if (!user) {
      toast.error("Please sign in to save your study plan");
      return;
    }

    try {
      setIsLoading(true);

      if (makeActive) {
        // Deactivate all other plans first
        await supabase
          .from('study_plans')
          .update({ is_active: false })
          .eq('user_id', user.id);
      }

      const planData = {
        user_id: user.id,
        title: plan.title,
        description: plan.description,
        subjects: plan.subjects,
        preferences: plan.preferences,
        sessions: plan.sessions,
        analytics: plan.analytics,
        is_active: makeActive
      };

      let result;
      if (plan.id) {
        result = await supabase
          .from('study_plans')
          .update(planData)
          .eq('id', plan.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('study_plans')
          .insert(planData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const updatedPlan = {
        ...plan,
        id: result.data.id,
        isActive: result.data.is_active,
        createdAt: result.data.created_at,
        updatedAt: result.data.updated_at
      };

      setCurrentPlan(updatedPlan);
      await loadSavedPlans();
      
      toast.success(plan.id ? "Study plan updated!" : "Study plan saved!");
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error("Failed to save study plan");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlan = (plan: StudyPlan) => {
    setCurrentPlan(plan);
  };

  const deletePlan = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadSavedPlans();
      if (currentPlan?.id === planId) {
        setCurrentPlan(null);
      }
      
      toast.success("Study plan deleted");
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error("Failed to delete study plan");
    }
  };

  // Helper functions for current plan manipulation
  const addSubject = (name: string, estimatedHours: number, deadline?: Date) => {
    if (!currentPlan) return;

    const newSubject: StudySubject = {
      id: `subject-${Date.now()}`,
      name,
      priority: "medium",
      deadline,
      estimatedHours,
      color: subjectColors[currentPlan.subjects.length % subjectColors.length]
    };

    setCurrentPlan({
      ...currentPlan,
      subjects: [...currentPlan.subjects, newSubject]
    });
  };

  const updateSubject = (id: string, updates: Partial<StudySubject>) => {
    if (!currentPlan) return;

    setCurrentPlan({
      ...currentPlan,
      subjects: currentPlan.subjects.map(subject => 
        subject.id === id ? { ...subject, ...updates } : subject
      )
    });
  };

  const removeSubject = (id: string) => {
    if (!currentPlan) return;

    setCurrentPlan({
      ...currentPlan,
      subjects: currentPlan.subjects.filter(subject => subject.id !== id)
    });
  };

  const updatePreferences = (updates: Partial<StudyPreferences>) => {
    if (!currentPlan) return;

    setCurrentPlan({
      ...currentPlan,
      preferences: { ...currentPlan.preferences, ...updates }
    });
  };

  const generateOptimalPlan = async () => {
    if (!currentPlan || currentPlan.subjects.length === 0) {
      toast.error("Please add at least one subject to study");
      return;
    }

    setIsGenerating(true);
    
    try {
      const sessions = generateSmartSessions(currentPlan.subjects, currentPlan.preferences, 14);
      
      const updatedPlan = {
        ...currentPlan,
        sessions,
        analytics: calculateAnalytics(sessions)
      };

      setCurrentPlan(updatedPlan);
      toast.success("Study plan generated successfully!");
    } catch (error) {
      console.error("Error generating study plan:", error);
      toast.error("Failed to generate study plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskCompletion = async (sessionId: string, taskId: string) => {
    if (!currentPlan) return;

    const updatedSessions = currentPlan.sessions.map(session => 
      session.id === sessionId
        ? {
            ...session,
            tasks: session.tasks.map(task =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : session
    );

    const updatedPlan = {
      ...currentPlan,
      sessions: updatedSessions,
      analytics: calculateAnalytics(updatedSessions)
    };

    setCurrentPlan(updatedPlan);

    // Auto-save if plan is already saved
    if (updatedPlan.id) {
      await savePlan(updatedPlan);
    }
  };

  const calculateAnalytics = (sessions: StudySession[]) => {
    const allTasks = sessions.flatMap(session => session.tasks);
    const completedTasks = allTasks.filter(task => task.completed);
    const totalHours = allTasks.reduce((sum, task) => sum + task.duration, 0) / 60;
    const efficiency = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    
    return {
      totalHours,
      completedTasks: completedTasks.length,
      streak: 0, // Could be enhanced with date-based calculation
      efficiency
    };
  };

  return {
    currentPlan,
    savedPlans,
    isGenerating,
    isLoading,
    createNewPlan,
    savePlan,
    loadPlan,
    deletePlan,
    addSubject,
    updateSubject,
    removeSubject,
    updatePreferences,
    generateOptimalPlan,
    toggleTaskCompletion
  };
};

// Smart session generation algorithm
function generateSmartSessions(
  subjects: StudySubject[], 
  preferences: StudyPreferences, 
  planDuration: number
): StudySession[] {
  const sessions: StudySession[] = [];
  const workingDays = getWorkingDays(preferences.studyDays, planDuration);
  
  // Sort subjects by priority and deadline urgency
  const prioritizedSubjects = [...subjects].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const urgencyA = a.deadline ? Math.max(0, 7 - Math.ceil((a.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
    const urgencyB = b.deadline ? Math.max(0, 7 - Math.ceil((b.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
    
    return (priorityWeight[b.priority] + urgencyB) - (priorityWeight[a.priority] + urgencyA);
  });

  workingDays.forEach((date, index) => {
    const timeSlots = generateTimeSlots(preferences);
    const dayTasks = distributeDailyTasks(prioritizedSubjects, preferences, index);
    
    const session: StudySession = {
      id: `session-${index}`,
      date: date.toDateString(),
      startTime: timeSlots.start,
      endTime: timeSlots.end,
      tasks: dayTasks,
      totalDuration: dayTasks.reduce((sum, task) => sum + task.duration, 0),
      completionRate: 0
    };
    
    sessions.push(session);
  });
  
  return sessions;
}

function getWorkingDays(studyDays: string[], duration: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  let currentDate = new Date(today);
  
  while (days.length < duration) {
    const dayName = currentDate.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
    if (studyDays.includes(dayName)) {
      days.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

function generateTimeSlots(preferences: StudyPreferences) {
  const timeSlotMap = {
    morning: { start: "08:00", end: "12:00" },
    afternoon: { start: "13:00", end: "17:00" },
    evening: { start: "18:00", end: "22:00" }
  };
  
  const primarySlot = preferences.preferredTimeSlots[0] || "morning";
  return timeSlotMap[primarySlot] || timeSlotMap.morning;
}

function distributeDailyTasks(
  subjects: StudySubject[], 
  preferences: StudyPreferences, 
  dayIndex: number
): StudyTask[] {
  const tasks: StudyTask[] = [];
  const totalMinutes = preferences.dailyStudyHours * 60;
  const sessionDuration = preferences.sessionDuration;
  const breakDuration = preferences.breakDuration;
  
  let remainingTime = totalMinutes;
  let taskId = 0;
  
  // Cycle through subjects
  subjects.forEach((subject, subjectIndex) => {
    if (remainingTime <= 0) return;
    
    const studyTime = Math.min(sessionDuration, remainingTime);
    const taskTypes = ["study", "review", "practice"];
    const taskType = taskTypes[dayIndex % taskTypes.length];
    
    tasks.push({
      id: `task-${dayIndex}-${taskId++}`,
      subjectId: subject.id,
      title: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} ${subject.name}`,
      description: generateTaskDescription(subject.name, taskType),
      duration: studyTime,
      type: taskType as any,
      completed: false,
      scheduledAt: new Date(),
      difficulty: "medium"
    });
    
    remainingTime -= studyTime;
    
    // Add break if there's more time and it's not the last subject
    if (remainingTime > breakDuration && subjectIndex < subjects.length - 1) {
      tasks.push({
        id: `break-${dayIndex}-${taskId++}`,
        subjectId: "break",
        title: "Break Time",
        description: "Rest and recharge",
        duration: breakDuration,
        type: "break",
        completed: false,
        scheduledAt: new Date(),
        difficulty: "easy"
      });
      remainingTime -= breakDuration;
    }
  });
  
  return tasks;
}

function generateTaskDescription(subjectName: string, taskType: string): string {
  const descriptions = {
    study: [
      `Learn new concepts in ${subjectName}`,
      `Read and understand ${subjectName} materials`,
      `Explore advanced topics in ${subjectName}`
    ],
    review: [
      `Review previous ${subjectName} lessons`,
      `Consolidate ${subjectName} knowledge`,
      `Go over ${subjectName} notes and examples`
    ],
    practice: [
      `Solve ${subjectName} practice problems`,
      `Work on ${subjectName} exercises`,
      `Apply ${subjectName} concepts through practice`
    ]
  };
  
  const typeDescriptions = descriptions[taskType] || descriptions.study;
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
}
