
import { 
  GraduationCap, 
  Calculator, 
  Calendar, 
  Search, 
  BookOpen, 
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const FeaturesSection = () => {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Course Assistant",
      description: "Upload materials and generate comprehensive study aids including notes, flashcards, and quizzes tailored to your content.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "GPA Calculator",
      description: "Track and calculate your academic performance with our intelligent GPA calculator and grade management system.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Study Planner",
      description: "Create personalized study schedules and manage your academic timeline with AI-powered planning assistance.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Research Assistant",
      description: "Get help with academic research, find credible sources, and organize your research materials efficiently.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Chat Support",
      description: "Get instant answers to academic questions with our intelligent chatbot trained on educational content.",
      color: "from-caritas to-caritas-light"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Goal Tracking",
      description: "Set academic goals and track your progress with personalized insights and recommendations.",
      color: "from-teal-500 to-teal-600"
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for 
            <span className="bg-gradient-to-r from-caritas to-caritas-light bg-clip-text text-transparent"> Academic Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to excel in your academic journey, powered by cutting-edge AI technology.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-caritas transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
