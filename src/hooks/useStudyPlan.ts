
import { useState, useCallback } from "react";
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
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [preferences, setPreferences] = useState<StudyPreferences>(defaultPreferences);
  const [generatedPlan, setGeneratedPlan] = useState<StudySession[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalHours: 0,
    completedTasks: 0,
    streak: 0,
    efficiency: 0
  });

  const addSubject = useCallback((name: string, estimatedHours: number, deadline?: Date) => {
    const newSubject: StudySubject = {
      id: `subject-${Date.now()}`,
      name,
      priority: "medium",
      deadline,
      estimatedHours,
      color: subjectColors[subjects.length % subjectColors.length]
    };
    setSubjects(prev => [...prev, newSubject]);
  }, [subjects.length]);

  const updateSubject = useCallback((id: string, updates: Partial<StudySubject>) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === id ? { ...subject, ...updates } : subject
    ));
  }, []);

  const removeSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(subject => subject.id !== id));
  }, []);

  const updatePreferences = useCallback((updates: Partial<StudyPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const generateOptimalPlan = useCallback(async () => {
    if (subjects.length === 0) {
      toast.error("Please add at least one subject to study");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Calculate optimal distribution
      const totalEstimatedHours = subjects.reduce((sum, subject) => sum + subject.estimatedHours, 0);
      const dailyCapacity = preferences.dailyStudyHours;
      const planDuration = Math.ceil(totalEstimatedHours / dailyCapacity);
      
      const sessions = generateSmartSessions(subjects, preferences, planDuration);
      setGeneratedPlan(sessions);
      
      // Save to database if user is authenticated
      if (user) {
        await saveStudyPlan(sessions);
      }
      
      toast.success("Study plan generated successfully!");
    } catch (error) {
      console.error("Error generating study plan:", error);
      toast.error("Failed to generate study plan");
    } finally {
      setIsGenerating(false);
    }
  }, [subjects, preferences, user]);

  const toggleTaskCompletion = useCallback((sessionId: string, taskId: string) => {
    setGeneratedPlan(prev => 
      prev.map(session => 
        session.id === sessionId
          ? {
              ...session,
              tasks: session.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              )
            }
          : session
      )
    );
    
    // Update analytics
    updateAnalytics();
  }, []);

  const updateAnalytics = useCallback(() => {
    const allTasks = generatedPlan.flatMap(session => session.tasks);
    const completedTasks = allTasks.filter(task => task.completed);
    const totalHours = allTasks.reduce((sum, task) => sum + task.duration, 0) / 60;
    const efficiency = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    
    setAnalytics({
      totalHours,
      completedTasks: completedTasks.length,
      streak: calculateStreak(),
      efficiency
    });
  }, [generatedPlan]);

  const calculateStreak = () => {
    // Simple streak calculation - can be enhanced
    return 0;
  };

  const saveStudyPlan = async (sessions: StudySession[]) => {
    try {
      await supabase
        .from('chat_history')
        .insert({
          user_id: user!.id,
          title: 'Study Plan Generated',
          category: 'study-planner',
          content: JSON.stringify({ sessions, subjects, preferences })
        });
    } catch (error) {
      console.error('Error saving study plan:', error);
    }
  };

  return {
    subjects,
    preferences,
    generatedPlan,
    isGenerating,
    analytics,
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
