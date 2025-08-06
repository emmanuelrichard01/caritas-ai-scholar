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
  completedHours?: number;
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
    totalTasks: number;
    completedTasks: number;
    totalHours: number;
    completedHours: number;
    streak: number;
    efficiency: number;
    productivityScore?: number;
    averageSessionDuration?: number;
  };
  duration: number; // Dynamic duration based on deadlines
  totalHours: number;
  daysUntilEarliestDeadline?: number;
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
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"
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
        duration: (plan as any).duration || 14,
        totalHours: (plan as any).totalHours || 0,
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
          duration: (data as any).duration || 14,
          totalHours: (data as any).totalHours || 0,
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
      analytics: { 
        totalTasks: 0, 
        completedTasks: 0, 
        totalHours: 0, 
        completedHours: 0,
        streak: 0,
        efficiency: 0,
        productivityScore: 0,
        averageSessionDuration: 0
      },
      duration: 14,
      totalHours: 0,
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
      const planData = {
        user_id: user.id,
        title: plan.title,
        description: plan.description,
        subjects: JSON.parse(JSON.stringify(serializeSubjects(plan.subjects))),
        preferences: JSON.parse(JSON.stringify(plan.preferences)),
        sessions: JSON.parse(JSON.stringify(plan.sessions)),
        analytics: JSON.parse(JSON.stringify(plan.analytics)),
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

      if (makeActive && result.data) {
        await supabase
          .from('study_plans')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .neq('id', result.data.id);
      }

      toast.success("Study plan saved successfully!");
      await loadSavedPlans();
      
      return result.data;
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error("Failed to save study plan");
    }
  };

  const loadPlan = useCallback((plan: StudyPlan) => {
    setCurrentPlan(plan);
  }, []);

  const deletePlan = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Study plan deleted successfully!");
      await loadSavedPlans();
      
      if (currentPlan?.id === planId) {
        setCurrentPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error("Failed to delete study plan");
    }
  };

  const addSubject = useCallback((name: string, hours: number, deadline?: Date) => {
    if (!currentPlan) return;
    
    const newSubject: StudySubject = {
      id: `subject-${Date.now()}`,
      name,
      estimatedHours: hours,
      priority: "medium",
      color: subjectColors[currentPlan.subjects.length % subjectColors.length],
      deadline,
      completedHours: 0
    };
    
    const newTotalHours = currentPlan.subjects.reduce((sum, s) => sum + s.estimatedHours, 0) + hours;
    
    // Calculate earliest deadline
    const deadlines = [...currentPlan.subjects.filter(s => s.deadline).map(s => s.deadline!), deadline].filter(d => d);
    const earliestDeadline = deadlines.length > 0 ? 
      Math.min(...deadlines.map(d => d.getTime())) : undefined;
    
    const daysUntilEarliestDeadline = earliestDeadline ? 
      Math.ceil((earliestDeadline - Date.now()) / (1000 * 60 * 60 * 24)) : undefined;
    
    setCurrentPlan(prev => prev ? {
      ...prev,
      subjects: [...prev.subjects, newSubject],
      totalHours: newTotalHours,
      daysUntilEarliestDeadline,
      updatedAt: new Date().toISOString()
    } : null);
  }, [currentPlan]);

  const updateSubject = useCallback((id: string, updates: Partial<StudySubject>) => {
    if (!currentPlan) return;
    
    setCurrentPlan(prev => {
      if (!prev) return null;
      
      const updatedSubjects = prev.subjects.map(subject =>
        subject.id === id ? { ...subject, ...updates } : subject
      );
      
      const newTotalHours = updatedSubjects.reduce((sum, s) => sum + s.estimatedHours, 0);
      
      // Recalculate earliest deadline
      const deadlines = updatedSubjects.filter(s => s.deadline).map(s => s.deadline!);
      const earliestDeadline = deadlines.length > 0 ? 
        Math.min(...deadlines.map(d => d.getTime())) : undefined;
      
      const daysUntilEarliestDeadline = earliestDeadline ? 
        Math.ceil((earliestDeadline - Date.now()) / (1000 * 60 * 60 * 24)) : undefined;
      
      return {
        ...prev,
        subjects: updatedSubjects,
        totalHours: newTotalHours,
        daysUntilEarliestDeadline,
        updatedAt: new Date().toISOString()
      };
    });
  }, [currentPlan]);

  const removeSubject = useCallback((id: string) => {
    if (!currentPlan) return;
    
    setCurrentPlan(prev => {
      if (!prev) return null;
      
      const filteredSubjects = prev.subjects.filter(subject => subject.id !== id);
      const newTotalHours = filteredSubjects.reduce((sum, s) => sum + s.estimatedHours, 0);
      
      // Recalculate earliest deadline
      const deadlines = filteredSubjects.filter(s => s.deadline).map(s => s.deadline!);
      const earliestDeadline = deadlines.length > 0 ? 
        Math.min(...deadlines.map(d => d.getTime())) : undefined;
      
      const daysUntilEarliestDeadline = earliestDeadline ? 
        Math.ceil((earliestDeadline - Date.now()) / (1000 * 60 * 60 * 24)) : undefined;
      
      return {
        ...prev,
        subjects: filteredSubjects,
        totalHours: newTotalHours,
        daysUntilEarliestDeadline,
        updatedAt: new Date().toISOString()
      };
    });
  }, [currentPlan]);

  const updatePreferences = useCallback((updates: Partial<StudyPreferences>) => {
    if (!currentPlan) return;
    
    setCurrentPlan(prev => prev ? {
      ...prev,
      preferences: { ...prev.preferences, ...updates },
      updatedAt: new Date().toISOString()
    } : null);
  }, [currentPlan]);

  const generateOptimalPlan = useCallback(async () => {
    if (!currentPlan || currentPlan.subjects.length === 0) {
      toast.error("Please add at least one subject to generate a plan");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulate AI processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Calculate dynamic duration based on earliest deadline and workload
      const dynamicDuration = calculateOptimalDuration(currentPlan.subjects, currentPlan.preferences);
      
      const sessions = generateSmartSessions(
        currentPlan.subjects,
        currentPlan.preferences,
        dynamicDuration
      );
      
      const analytics = calculateAnalytics(sessions, currentPlan.subjects);
      
      setCurrentPlan(prev => prev ? {
        ...prev,
        sessions,
        analytics,
        duration: dynamicDuration,
        updatedAt: new Date().toISOString()
      } : null);
      
      toast.success(`Generated ${dynamicDuration}-day study plan with ${sessions.length} sessions`);
      
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error("Failed to generate study plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [currentPlan]);

  const toggleTaskCompletion = useCallback((sessionId: string, taskId: string) => {
    if (!currentPlan) return;
    
    setCurrentPlan(prev => {
      if (!prev) return null;
      
      const updatedSessions = prev.sessions.map(session => {
        if (session.id === sessionId) {
          const updatedTasks = session.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          
          const completionRate = updatedTasks.filter(t => t.completed).length / updatedTasks.length;
          
          return {
            ...session,
            tasks: updatedTasks,
            completionRate
          };
        }
        return session;
      });
      
      const analytics = calculateAnalytics(updatedSessions, prev.subjects);
      
      return {
        ...prev,
        sessions: updatedSessions,
        analytics,
        updatedAt: new Date().toISOString()
      };
    });
  }, [currentPlan]);

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

// ============= Study Plan Generation Algorithms =============

function calculateOptimalDuration(subjects: StudySubject[], preferences: StudyPreferences): number {
  if (subjects.length === 0) return 14; // Default fallback
  
  // Find all unique deadlines
  const deadlines = subjects.filter(s => s.deadline).map(s => s.deadline!);
  
  if (deadlines.length === 0) {
    // No deadlines set, use total hours estimation
    const totalHours = subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
    const dailyCapacity = preferences.dailyStudyHours;
    const estimatedDays = Math.ceil(totalHours / dailyCapacity);
    // Add 20% buffer and ensure reasonable bounds
    const bufferDays = Math.ceil(estimatedDays * 1.2);
    return Math.min(Math.max(bufferDays, 7), 90); // Between 7-90 days
  }
  
  // Find the latest deadline to ensure we cover all subjects
  const latestDeadline = new Date(Math.max(...deadlines.map(d => d.getTime())));
  const earliestDeadline = new Date(Math.min(...deadlines.map(d => d.getTime())));
  
  // Calculate days until latest deadline (to cover all subjects)
  const now = new Date();
  const daysUntilLatestDeadline = Math.ceil((latestDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilEarliestDeadline = Math.ceil((earliestDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Ensure minimum planning period
  const minDays = 5;
  const maxDays = 120; // Maximum 4 months
  
  // Calculate workload-based duration
  const totalHours = subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
  const workloadDays = Math.ceil(totalHours / preferences.dailyStudyHours);
  
  // Determine optimal duration considering both deadlines and workload
  let optimalDuration;
  
  if (daysUntilEarliestDeadline <= minDays) {
    // Very urgent - use time until earliest deadline but ensure minimum coverage
    optimalDuration = Math.max(daysUntilEarliestDeadline, minDays);
  } else if (workloadDays > daysUntilLatestDeadline) {
    // Insufficient time - warn user but use available time until latest deadline
    console.warn('Insufficient time for planned workload');
    optimalDuration = Math.max(daysUntilLatestDeadline - 1, minDays);
  } else {
    // Normal case - use the greater of workload-based duration or time until latest deadline
    // This ensures we have enough time for all subjects and respect all deadlines
    const bufferDays = Math.ceil(workloadDays * 0.2); // 20% buffer
    const workloadWithBuffer = workloadDays + bufferDays;
    
    // Use the time until latest deadline if it's reasonable, otherwise use workload estimation
    if (daysUntilLatestDeadline <= workloadWithBuffer * 1.5) {
      optimalDuration = Math.max(daysUntilLatestDeadline - 1, workloadWithBuffer);
    } else {
      optimalDuration = workloadWithBuffer;
    }
  }
  
  const finalDuration = Math.min(Math.max(optimalDuration, minDays), maxDays);
  console.log(`Calculated study plan duration: ${finalDuration} days for ${subjects.length} subjects`);
  
  return finalDuration;
}

function generateSmartSessions(
  subjects: StudySubject[], 
  preferences: StudyPreferences,
  duration?: number
): StudySession[] {
  const effectiveDuration = duration || calculateOptimalDuration(subjects, preferences);
  const sessions: StudySession[] = [];
  
  const workingDays = getWorkingDays(preferences.studyDays, effectiveDuration);
  const timeSlots = generateTimeSlots(preferences);
  
  // Create balanced distribution of subjects across all working days
  const totalHours = subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
  const hoursPerDay = Math.min(totalHours / workingDays.length, preferences.dailyStudyHours);
  
  workingDays.forEach((day, index) => {
    const tasks = generateBalancedDailyTasks(
      subjects, 
      preferences, 
      index, 
      day,
      hoursPerDay,
      workingDays.length
    );
    
    const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
    const completedTasks = tasks.filter(task => task.completed).length;
    
    sessions.push({
      id: `session-${index}`,
      date: day.toISOString().split('T')[0],
      startTime: timeSlots.start,
      endTime: timeSlots.end,
      tasks,
      totalDuration,
      completionRate: tasks.length > 0 ? completedTasks / tasks.length : 0
    });
  });
  
  return sessions;
}

function createDeadlineAwareSchedule(
  subjects: StudySubject[], 
  workingDays: Date[]
): Map<number, StudySubject[]> {
  const schedule = new Map<number, StudySubject[]>();
  
  // Initialize empty schedule
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
    const availableDays = validMaxDay + 1;
    const sessionsNeeded = Math.ceil(subject.estimatedHours * 60 / 45); // 45-min sessions
    const distributionDays = Math.min(sessionsNeeded, availableDays);
    
    for (let i = 0; i < distributionDays; i++) {
      const dayIndex = Math.floor((i * availableDays) / distributionDays);
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
    
    // Prevent infinite loop
    if (currentDate.getTime() - today.getTime() > 365 * 24 * 60 * 60 * 1000) {
      break;
    }
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

function generateBalancedDailyTasks(
  subjects: StudySubject[],
  preferences: StudyPreferences,
  dayIndex: number,
  currentDate: Date,
  targetHoursPerDay: number,
  totalDays: number
): StudyTask[] {
  const tasks: StudyTask[] = [];
  const totalMinutes = preferences.dailyStudyHours * 60;
  const sessionDuration = preferences.sessionDuration;
  const breakDuration = preferences.breakDuration;
  
  if (subjects.length === 0) return tasks;
  
  let remainingTime = totalMinutes;
  let taskId = 0;
  
  // Create a balanced distribution of subjects across all days
  // Each subject should appear on multiple days based on its importance and deadline
  const subjectsForToday = getSubjectsForDay(subjects, dayIndex, totalDays);
  
  if (subjectsForToday.length === 0) return tasks;
  
  // Distribute time among subjects based on priority and deadline urgency
  subjectsForToday.forEach((subject, subjectIndex) => {
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
    const baseTime = Math.floor(remainingTime / (subjectsForToday.length - subjectIndex));
    const timeAllocation = Math.min(
      baseTime * urgencyMultiplier * priorityMultiplier,
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
    if (remainingTime > breakDuration && subjectIndex < subjectsForToday.length - 1) {
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

function getSubjectsForDay(subjects: StudySubject[], dayIndex: number, totalDays: number): StudySubject[] {
  if (subjects.length === 0) return [];
  
  // Sort subjects by deadline urgency and priority for consistent distribution
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
  
  const subjectsForToday: StudySubject[] = [];
  
  // Better distribution algorithm: ensure each subject appears across multiple days
  sortedSubjects.forEach((subject, subjectIndex) => {
    // Calculate how many days this subject needs based on its estimated hours
    const totalHoursForSubject = subject.estimatedHours;
    const hoursPerDay = 2; // Target 2 hours per subject per day
    const daysNeeded = Math.max(1, Math.ceil(totalHoursForSubject / hoursPerDay));
    
    // Calculate spread: how often this subject should appear
    const spreadDays = Math.max(1, Math.floor(totalDays / Math.min(daysNeeded, totalDays)));
    
    // Check if this subject should appear today using multiple distribution strategies
    const basicDistribution = dayIndex % spreadDays === subjectIndex % spreadDays;
    const rotationPattern = (dayIndex + subjectIndex) % subjects.length === subjectIndex;
    const intensivePattern = dayIndex < daysNeeded; // Appear in early days for intensive study
    
    // Special handling for urgent subjects (deadline within 7 days)
    const daysUntilDeadline = subject.deadline 
      ? Math.ceil((subject.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 365;
    
    const isUrgent = daysUntilDeadline <= 7;
    const isHighPriority = subject.priority === "high";
    
    // Urgent subjects appear more frequently
    const urgentPattern = isUrgent && (dayIndex % 2 === 0 || dayIndex < daysUntilDeadline);
    
    // High priority subjects appear more frequently  
    const priorityPattern = isHighPriority && dayIndex % Math.max(1, Math.floor(totalDays / 3)) === 0;
    
    // Subject should appear if any pattern matches
    const shouldAppear = basicDistribution || rotationPattern || intensivePattern || urgentPattern || priorityPattern;
    
    if (shouldAppear) {
      subjectsForToday.push(subject);
    }
  });
  
  // Ensure we have at least one subject per day and don't have too many
  if (subjectsForToday.length === 0 && sortedSubjects.length > 0) {
    // Fallback: round-robin assignment
    const subjectIndex = dayIndex % sortedSubjects.length;
    subjectsForToday.push(sortedSubjects[subjectIndex]);
  } else if (subjectsForToday.length > 3) {
    // Limit to maximum 3 subjects per day for better focus
    const urgent = subjectsForToday.filter(s => s.deadline && 
      Math.ceil((s.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7);
    const highPriority = subjectsForToday.filter(s => s.priority === "high");
    const others = subjectsForToday.filter(s => !urgent.includes(s) && !highPriority.includes(s));
    
    // Keep urgent + high priority + some others
    const finalSelection = [
      ...urgent.slice(0, 2),
      ...highPriority.filter(s => !urgent.includes(s)).slice(0, 2),
      ...others.slice(0, Math.max(1, 3 - urgent.length - highPriority.filter(s => !urgent.includes(s)).length))
    ];
    
    return finalSelection.slice(0, 3);
  }
  
  return subjectsForToday;
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

function calculateAnalytics(sessions: StudySession[], subjects: StudySubject[]) {
  const totalTasks = sessions.reduce((sum, session) => sum + session.tasks.length, 0);
  const completedTasks = sessions.reduce((sum, session) => 
    sum + session.tasks.filter(task => task.completed).length, 0);
  
  const totalHours = sessions.reduce((sum, session) => sum + (session.totalDuration / 60), 0);
  const completedHours = sessions.reduce((sum, session) => 
    sum + (session.tasks.filter(task => task.completed).reduce((taskSum, task) => taskSum + task.duration, 0) / 60), 0);
  
  // Calculate streak (consecutive days with completed tasks)
  let streak = 0;
  for (let i = sessions.length - 1; i >= 0; i--) {
    const hasCompletedTasks = sessions[i].tasks.some(task => task.completed);
    if (hasCompletedTasks) {
      streak++;
    } else {
      break;
    }
  }
  
  // Calculate productivity score (0-100)
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const hourEfficiency = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;
  const productivityScore = Math.round((completionRate + hourEfficiency) / 2);
  
  // Calculate average session duration
  const completedSessions = sessions.filter(s => s.tasks.some(t => t.completed));
  const averageSessionDuration = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((sum, s) => sum + s.totalDuration, 0) / completedSessions.length)
    : 0;
  
  return {
    totalTasks,
    completedTasks,
    totalHours: Math.round(totalHours * 10) / 10,
    completedHours: Math.round(completedHours * 10) / 10,
    streak,
    efficiency: Math.round(hourEfficiency),
    productivityScore,
    averageSessionDuration
  };
}