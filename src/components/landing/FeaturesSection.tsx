
import { 
  GraduationCap, 
  Calculator, 
  Calendar, 
  Search, 
  Brain,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const FeaturesSection = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "Course Assistant",
      description: "Upload materials and generate comprehensive study aids including notes, flashcards, and quizzes tailored to your content.",
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      className: "md:col-span-2 lg:col-span-2 row-span-2",
    },
    {
      icon: Calculator,
      title: "GPA Calculator",
      description: "Track and calculate your academic performance with our intelligent GPA calculator.",
      gradient: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      className: "md:col-span-1 lg:col-span-1",
    },
    {
      icon: Calendar,
      title: "Study Planner",
      description: "Create personalized study schedules and manage your academic timeline.",
      gradient: "from-violet-500/20 to-violet-600/20",
      iconColor: "text-violet-600 dark:text-violet-400",
      className: "md:col-span-1 lg:col-span-1",
    },
    {
      icon: Search,
      title: "Research Assistant",
      description: "Get help with academic research, find credible sources, and organize your research materials efficiently.",
      gradient: "from-amber-500/20 to-amber-600/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      className: "md:col-span-2 lg:col-span-2",
    },
    {
      icon: Brain,
      title: "AI Chat Support",
      description: "Get instant answers to academic questions with our intelligent chatbot.",
      gradient: "from-brand/20 to-brand-light/20",
      iconColor: "text-brand",
      className: "md:col-span-1 lg:col-span-1",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set academic goals and track your progress with personalized insights.",
      gradient: "from-teal-500/20 to-teal-600/20",
      iconColor: "text-teal-600 dark:text-teal-400",
      className: "md:col-span-1 lg:col-span-2 md:row-span-2 lg:row-span-1",
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 relative bg-background">
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <p className="caption uppercase tracking-widest text-brand font-semibold mb-4 animate-fade-in">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-foreground mb-6 animate-fade-in-up">
            Everything you need for{' '}
            <span className="text-foreground">academic success</span>
          </h2>
          <p className="body-large animate-fade-in-up delay-200">
            Powerful AI-driven tools designed to help you excel in your academic journey.
          </p>
        </div>
        
        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 auto-rows-min stagger-children">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                variant="interactive"
                className={cn("group flex flex-col justify-between overflow-hidden relative bg-card border-border/40 shadow-soft hover:shadow-3d transition-all duration-500 rounded-3xl", feature.className)}
              >
                <CardHeader className="pb-4 relative z-10">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/50`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
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
