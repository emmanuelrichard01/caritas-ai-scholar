
import { 
  GraduationCap, 
  Calculator, 
  Calendar, 
  Search, 
  Brain,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const FeaturesSection = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "Course Assistant",
      description: "Upload materials and generate comprehensive study aids including notes, flashcards, and quizzes tailored to your content.",
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Calculator,
      title: "GPA Calculator",
      description: "Track and calculate your academic performance with our intelligent GPA calculator and grade management system.",
      gradient: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: Calendar,
      title: "Study Planner",
      description: "Create personalized study schedules and manage your academic timeline with AI-powered planning assistance.",
      gradient: "from-violet-500/20 to-violet-600/20",
      iconColor: "text-violet-600 dark:text-violet-400"
    },
    {
      icon: Search,
      title: "Research Assistant",
      description: "Get help with academic research, find credible sources, and organize your research materials efficiently.",
      gradient: "from-amber-500/20 to-amber-600/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      icon: Brain,
      title: "AI Chat Support",
      description: "Get instant answers to academic questions with our intelligent chatbot trained on educational content.",
      gradient: "from-caritas/20 to-caritas-light/20",
      iconColor: "text-caritas"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set academic goals and track your progress with personalized insights and recommendations.",
      gradient: "from-teal-500/20 to-teal-600/20",
      iconColor: "text-teal-600 dark:text-teal-400"
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 gradient-subtle" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <p className="caption uppercase tracking-widest text-caritas mb-4 animate-fade-in">
            Features
          </p>
          <h2 className="heading-2 mb-6 animate-fade-in-up">
            Everything you need for{' '}
            <span className="text-gradient-brand">academic success</span>
          </h2>
          <p className="body-large animate-fade-in-up delay-200">
            Powerful AI-driven tools designed to help you excel in your academic journey.
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                variant="interactive"
                className="group"
              >
                <CardHeader className="pb-4">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg group-hover:text-caritas transition-colors duration-200">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
