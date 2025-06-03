
import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueDate: Date;
  type: "study" | "review" | "practice" | "break";
}

export interface StudySession {
  id: string;
  date: string;
  timeSlot: string;
  tasks: StudyTask[];
}

export interface StudyPlanData {
  subjects: string[];
  dailyHours: number;
  preferredTime: string;
  breakInterval: number;
  studyDays: string[];
  goals: string[];
}

export const useStudyPlan = () => {
  const [planData, setPlanData] = useState<StudyPlanData>({
    subjects: [],
    dailyHours: 4,
    preferredTime: "morning",
    breakInterval: 25,
    studyDays: [],
    goals: []
  });
  
  const [generatedPlan, setGeneratedPlan] = useState<StudySession[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const updatePlanData = useCallback((data: Partial<StudyPlanData>) => {
    setPlanData(prev => ({ ...prev, ...data }));
  }, []);

  const generateStudyPlan = useCallback(() => {
    if (planData.subjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }

    setIsGenerating(true);
    
    // Simulate plan generation
    setTimeout(() => {
      const sessions = generateWeeklyPlan(planData);
      setGeneratedPlan(sessions);
      setIsGenerating(false);
      toast.success("Study plan generated successfully!");
    }, 2000);
  }, [planData]);

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
  }, []);

  return {
    planData,
    generatedPlan,
    isGenerating,
    updatePlanData,
    generateStudyPlan,
    toggleTaskCompletion
  };
};

function generateWeeklyPlan(data: StudyPlanData): StudySession[] {
  const sessions: StudySession[] = [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  days.forEach((day, index) => {
    if (data.studyDays.length === 0 || data.studyDays.includes(day.toLowerCase())) {
      const timeSlot = getTimeSlot(data.preferredTime);
      const tasks = generateDailyTasks(data, day);
      
      sessions.push({
        id: `session-${index}`,
        date: day,
        timeSlot,
        tasks
      });
    }
  });
  
  return sessions;
}

function getTimeSlot(preferredTime: string): string {
  switch (preferredTime) {
    case "morning": return "8:00 AM - 12:00 PM";
    case "afternoon": return "1:00 PM - 5:00 PM";
    case "evening": return "6:00 PM - 10:00 PM";
    default: return "8:00 AM - 12:00 PM";
  }
}

function generateDailyTasks(data: StudyPlanData, day: string): StudyTask[] {
  const tasks: StudyTask[] = [];
  const totalMinutes = data.dailyHours * 60;
  const breakDuration = 15;
  const studyBlockDuration = data.breakInterval;
  
  let timeAllocated = 0;
  let taskId = 0;
  
  data.subjects.forEach((subject, index) => {
    if (timeAllocated < totalMinutes) {
      const duration = Math.min(studyBlockDuration, totalMinutes - timeAllocated);
      
      tasks.push({
        id: `task-${day}-${taskId++}`,
        subject,
        topic: getTopicForSubject(subject, day),
        duration,
        priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
        completed: false,
        dueDate: new Date(),
        type: "study"
      });
      
      timeAllocated += duration;
      
      // Add break if not the last task and there's time
      if (timeAllocated < totalMinutes && timeAllocated + breakDuration <= totalMinutes) {
        tasks.push({
          id: `break-${day}-${taskId++}`,
          subject: "Break",
          topic: "Rest and recharge",
          duration: breakDuration,
          priority: "low",
          completed: false,
          dueDate: new Date(),
          type: "break"
        });
        timeAllocated += breakDuration;
      }
    }
  });
  
  return tasks;
}

function getTopicForSubject(subject: string, day: string): string {
  const topics = {
    "Mathematics": ["Algebra", "Calculus", "Geometry", "Statistics"],
    "Physics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics"],
    "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry"],
    "Biology": ["Cell Biology", "Genetics", "Ecology", "Evolution"],
    "History": ["Ancient History", "Modern History", "World Wars", "Cultural History"],
    "Literature": ["Poetry Analysis", "Novel Study", "Literary Criticism", "Creative Writing"]
  };
  
  const subjectTopics = topics[subject] || ["Review", "Practice", "Theory", "Applications"];
  const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(day);
  
  return subjectTopics[dayIndex % subjectTopics.length];
}
