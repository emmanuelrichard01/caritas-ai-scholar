
export const StatsSection = () => {
  const stats = [
    {
      number: "10K+",
      label: "Students Helped",
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
      number: "50+",
      label: "Study Tools",
      description: "Comprehensive toolkit"
    }
  ];

  return (
    <section className="py-16 bg-caritas/5 dark:bg-caritas/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-caritas mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
