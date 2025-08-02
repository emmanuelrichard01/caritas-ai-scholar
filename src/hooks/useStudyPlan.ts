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
  "#DC2626", "#EF4444", "#F97316", "#F59E0B", 
  "#EAB308", "#84CC16", "#22C55E", "#10B981"
];

// Helper function to ensure date conversion
const ensureDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return undefined;
};

// Helper function to serialize dates for storage
const serializeSubjects = (subjects: StudySubject[]) => {
  return subjects.map(subject => ({
    ...subject,
    deadline: subject.deadline ? subject.deadline.toISOString() : undefined
  }));
};

// Helper function to deserialize dates from storage
const deserializeSubjects = (subjects: any[]): StudySubject[] => {
  return subjects.map(subject => ({
    ...subject,
    deadline: subject.deadline ? new Date(subject.deadline) : undefined
  }));
};

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
        subjects: deserializeSubjects((plan.subjects as unknown) as any[]),
        preferences: (plan.preferences as unknown) as StudyPreferences,
        sessions: (plan.sessions as unknown) as StudySession[],
        analytics: (plan.analytics as unknown) as any,
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
          subjects: deserializeSubjects((data.subjects as unknown) as any[]),
          preferences: (data.preferences as unknown) as StudyPreferences,
          sessions: (data.sessions as unknown) as StudySession[],
          analytics: (data.analytics as unknown) as any,
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
        subjects: serializeSubjects(plan.subjects) as unknown as any,
        preferences: plan.preferences as unknown as any,
        sessions: plan.sessions as unknown as any,
        analytics: plan.analytics as unknown as any,
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
      deadline: deadline ? ensureDate(deadline) : undefined,
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
        subject.id === id ? { 
          ...subject, 
          ...updates,
          deadline: updates.deadline ? ensureDate(updates.deadline) : subject.deadline
        } : subject
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
    
    // Enhanced streak calculation with performance optimization
    const today = new Date();
    let streak = 0;
    const sessionsByDate = new Map<string, StudySession>();
    
    // Pre-index sessions by date for O(1) lookup
    sessions.forEach(session => {
      const dateStr = new Date(session.date).toDateString();
      sessionsByDate.set(dateStr, session);
    });
    
    // Calculate streak more efficiently
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      const daySession = sessionsByDate.get(dateStr);
      if (daySession && daySession.tasks.some(task => task.completed)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return {
      totalHours,
      completedTasks: completedTasks.length,
      streak,
      efficiency,
      productivityScore: Math.round((efficiency + (streak * 5)) / 2),
      averageSessionDuration: sessions.length > 0 ? totalHours / sessions.length : 0
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

// Smart session generation algorithm with deadline-aware scheduling
function generateSmartSessions(
  subjects: StudySubject[], 
  preferences: StudyPreferences, 
  planDuration: number
): StudySession[] {
  const sessions: StudySession[] = [];
  const workingDays = getWorkingDays(preferences.studyDays, planDuration);
  
  // Calculate total available hours and hours needed per subject
  const totalAvailableHours = workingDays.length * preferences.dailyStudyHours;
  const totalNeededHours = subjects.reduce((sum, subject) => sum + subject.estimatedHours, 0);
  
  // Create a schedule that respects deadlines
  const subjectSchedule = createDeadlineAwareSchedule(subjects, workingDays, totalAvailableHours);

  workingDays.forEach((date, index) => {
    const timeSlots = generateTimeSlots(preferences);
    const dayTasks = distributeDailyTasksWithDeadlines(subjectSchedule, preferences, index, date);
    
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

// Create a deadline-aware schedule that ensures all tasks are completed before their deadlines
function createDeadlineAwareSchedule(
  subjects: StudySubject[], 
  workingDays: Date[], 
  totalAvailableHours: number
): Map<number, StudySubject[]> {
  const schedule = new Map<number, StudySubject[]>();
  
  // Initialize each day with an empty array
  workingDays.forEach((_, index) => {
    schedule.set(index, []);
  });
  
  // Sort subjects by deadline urgency and priority
  const sortedSubjects = [...subjects].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    
    // Calculate days until deadline
    const now = new Date();
    const daysUntilA = a.deadline ? Math.ceil((a.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 365;
    const daysUntilB = b.deadline ? Math.ceil((b.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 365;
    
    // Prioritize by deadline first, then by priority
    if (daysUntilA !== daysUntilB) {
      return daysUntilA - daysUntilB;
    }
    
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
  
  // Distribute subjects across days, respecting deadlines
  sortedSubjects.forEach(subject => {
    const maxDayIndex = subject.deadline 
      ? Math.min(
          workingDays.findIndex(day => day >= subject.deadline!) - 1,
          workingDays.length - 1
        )
      : workingDays.length - 1;
    
    // Ensure we don't schedule beyond the deadline
    const validMaxDay = Math.max(0, maxDayIndex);
    
    // Distribute the subject's hours across available days before deadline
    const hoursPerDay = subject.estimatedHours / Math.max(1, validMaxDay + 1);
    const sessionsPerDay = Math.ceil(hoursPerDay);
    
    for (let dayIndex = 0; dayIndex <= validMaxDay; dayIndex++) {
      const currentDaySubjects = schedule.get(dayIndex) || [];
      currentDaySubjects.push(subject);
      schedule.set(dayIndex, currentDaySubjects);
    }
  });
  
  return schedule;
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

function distributeDailyTasksWithDeadlines(
  subjectSchedule: Map<number, StudySubject[]>,
  preferences: StudyPreferences, 
  dayIndex: number,
  currentDate: Date
): StudyTask[] {
  const tasks: StudyTask[] = [];
  const totalMinutes = preferences.dailyStudyHours * 60;
  const sessionDuration = preferences.sessionDuration;
  const breakDuration = preferences.breakDuration;
  
  let remainingTime = totalMinutes;
  let taskId = 0;
  
  // Get subjects scheduled for this day
  const daySubjects = subjectSchedule.get(dayIndex) || [];
  const uniqueSubjects = Array.from(new Set(daySubjects));
  
  if (uniqueSubjects.length === 0) return tasks;
  
  // Distribute time among subjects based on priority and deadline urgency
  uniqueSubjects.forEach((subject, subjectIndex) => {
    if (remainingTime <= 0) return;
    
    // Calculate time allocation based on deadline urgency
    const daysUntilDeadline = subject.deadline 
      ? Math.ceil((subject.deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    
    // More time for subjects with closer deadlines
    const urgencyMultiplier = subject.deadline 
      ? Math.max(0.5, Math.min(2, 8 / Math.max(1, daysUntilDeadline)))
      : 1;
    
    const priorityMultiplier = { high: 1.5, medium: 1, low: 0.7 }[subject.priority];
    const timeAllocation = Math.min(
      sessionDuration * urgencyMultiplier * priorityMultiplier,
      remainingTime
    );
    
    const studyTime = Math.max(30, Math.min(sessionDuration, timeAllocation));
    
    // Determine task type based on deadline proximity and day pattern
    let taskType: string;
    if (daysUntilDeadline <= 3) {
      taskType = "review"; // Focus on review when deadline is close
    } else if (daysUntilDeadline <= 7) {
      taskType = "practice"; // Practice when deadline is approaching
    } else {
      const taskTypes = ["study", "review", "practice"];
      taskType = taskTypes[dayIndex % taskTypes.length];
    }
    
    // Determine difficulty based on deadline and priority
    let difficulty: "easy" | "medium" | "hard";
    if (subject.priority === "high" && daysUntilDeadline <= 7) {
      difficulty = "hard";
    } else if (subject.priority === "medium" || daysUntilDeadline <= 14) {
      difficulty = "medium";
    } else {
      difficulty = "easy";
    }
    
    tasks.push({
      id: `task-${dayIndex}-${taskId++}`,
      subjectId: subject.id,
      title: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} ${subject.name}`,
      description: generateTaskDescription(subject.name, taskType, subject.deadline),
      duration: Math.round(studyTime),
      type: taskType as any,
      completed: false,
      scheduledAt: currentDate,
      difficulty
    });
    
    remainingTime -= studyTime;
    
    // Add break if there's more time and it's not the last subject
    if (remainingTime > breakDuration && subjectIndex < uniqueSubjects.length - 1) {
      tasks.push({
        id: `break-${dayIndex}-${taskId++}`,
        subjectId: "break",
        title: "Break Time",
        description: "Rest and recharge for better focus",
        duration: breakDuration,
        type: "break",
        completed: false,
        scheduledAt: currentDate,
        difficulty: "easy"
      });
      remainingTime -= breakDuration;
    }
  });
  
  return tasks;
}

function generateTaskDescription(subjectName: string, taskType: string, deadline?: Date): string {
  const isUrgent = deadline && deadline.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days
  
  const descriptions = {
    study: isUrgent ? [
      `Intensive study of ${subjectName} key concepts`,
      `Focus on essential ${subjectName} topics`,
      `Master critical ${subjectName} fundamentals`
    ] : [
      `Learn new concepts in ${subjectName}`,
      `Read and understand ${subjectName} materials`,
      `Explore advanced topics in ${subjectName}`
    ],
    review: isUrgent ? [
      `Final review of ${subjectName} for upcoming deadline`,
      `Quick recap of all ${subjectName} topics`,
      `Last-minute ${subjectName} knowledge consolidation`
    ] : [
      `Review previous ${subjectName} lessons`,
      `Consolidate ${subjectName} knowledge`,
      `Go over ${subjectName} notes and examples`
    ],
    practice: isUrgent ? [
      `Intensive ${subjectName} practice session`,
      `Focus on challenging ${subjectName} problems`,
      `Final ${subjectName} skill reinforcement`
    ] : [
      `Solve ${subjectName} practice problems`,
      `Work on ${subjectName} exercises`,
      `Apply ${subjectName} concepts through practice`
    ]
  };
  
  const typeDescriptions = descriptions[taskType] || descriptions.study;
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
}
