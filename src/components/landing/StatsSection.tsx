import { useEffect, useRef, useState } from 'react';

const stats = [
  {
    number: "10K+",
    label: "Students Empowered",
    description: "Academic success stories"
  },
  {
    number: "95%",
    label: "Improvement Rate", 
    description: "In study efficiency"
  },
  {
    number: "24/7",
    label: "AI Availability",
    description: "Always ready to help"
  },
  {
    number: "15+",
    label: "Study Tools",
    description: "Comprehensive toolkit"
  }
];

const AnimatedNumber = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          // Parse the numeric part
          const numericPart = value.replace(/[^0-9]/g, '');
          const targetNum = parseInt(numericPart) || 0;
          const duration = 2000;
          const steps = 60;
          const stepDuration = duration / steps;
          
          let current = 0;
          const increment = targetNum / steps;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= targetNum) {
              setDisplayValue(value);
              clearInterval(timer);
            } else {
              // Keep the format (e.g., "10K+" or "95%")
              const formatted = Math.floor(current).toString();
              if (value.includes('K')) {
                setDisplayValue(formatted + 'K+');
              } else if (value.includes('%')) {
                setDisplayValue(formatted + '%');
              } else if (value.includes('/')) {
                setDisplayValue(value); // For 24/7
              } else if (value.includes('+')) {
                setDisplayValue(formatted + '+');
              } else {
                setDisplayValue(formatted);
              }
            }
          }, stepDuration);
          
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return <div ref={ref}>{displayValue}</div>;
};

export const StatsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-brand/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-brand/10 bg-background/40">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Subtle divider for grid (except last item) */}
                {index < stats.length - 1 && (
                  <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-px h-16 bg-border/50" />
                )}
                
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-brand mb-2 transition-transform group-hover:scale-105">
                  <AnimatedNumber value={stat.number} />
                </div>
                <div className="text-base sm:text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
