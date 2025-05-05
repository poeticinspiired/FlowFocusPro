import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CategoryProgressProps {
  userId: number;
}

export function CategoryProgress({ userId }: CategoryProgressProps) {
  // Fetch category progress data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/dashboard/category-progress', { userId }],
    queryFn: () => fetch(`/api/dashboard/category-progress?userId=${userId}`).then(res => res.json()),
  });
  
  const progressData = data?.data || [];
  
  if (isLoading) {
    return (
      <div className="p-5">
        <h3 className="text-xl font-bold tech-text-gradient mb-4">Category Analytics</h3>
        <div className="space-y-5">
          <div className="animate-pulse h-5 bg-muted rounded-full w-full"></div>
          <div className="animate-pulse h-5 bg-muted rounded-full w-4/5"></div>
          <div className="animate-pulse h-5 bg-muted rounded-full w-3/4"></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-5">
        <h3 className="text-xl font-bold tech-text-gradient mb-4">Category Analytics</h3>
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
          <p>Failed to load category data. Please try again.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-5">
      <h3 className="text-xl font-bold tech-text-gradient mb-4">Category Analytics</h3>
      
      {progressData.length === 0 ? (
        <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-center">No categories found.</p>
          <p className="text-sm text-muted-foreground/80 text-center mt-1">
            Create categories and tasks to visualize your progress.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {progressData.map((item: any) => (
            <div key={item.category.id} className="hover-lift p-3 rounded-xl bg-card/30 border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{item.category.name}</span>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground bg-muted/50 py-1 px-2.5 rounded-full">
                    {item.completedTasks}/{item.totalTasks}
                  </span>
                </div>
              </div>
              
              {/* Progress bar with glass morphism effect */}
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted backdrop-blur-sm">
                {/* Animated gradient progress */}
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out relative",
                    item.percentage > 90 ? "bg-gradient-to-r from-accent to-primary" :
                    item.percentage > 60 ? "bg-gradient-to-r from-primary to-secondary" :
                    item.percentage > 30 ? "bg-gradient-to-r from-secondary to-accent" :
                    "bg-gradient-to-r from-accent/80 to-primary/80"
                  )}
                  style={{ width: `${item.percentage}%` }}
                >
                  {/* Gleaming effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
                
                {/* Percentage label for significant progress */}
                {item.percentage >= 25 && (
                  <span 
                    className="absolute text-[10px] font-bold text-white top-1/2 transform -translate-y-1/2"
                    style={{ 
                      left: `${Math.min(Math.max(item.percentage - 5, 5), 93)}%`,
                      filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))"
                    }}
                  >
                    {item.percentage}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
