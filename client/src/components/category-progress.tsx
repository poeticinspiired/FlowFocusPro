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
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Category Progress</h3>
        <div className="space-y-4">
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-full"></div>
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-full"></div>
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Category Progress</h3>
        <p className="text-neutral-600">Failed to load category progress.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
      <h3 className="text-lg font-medium text-neutral-900 mb-4">Category Progress</h3>
      
      {progressData.length === 0 ? (
        <p className="text-neutral-600">No categories found. Create categories and tasks to track progress.</p>
      ) : (
        <div className="space-y-4">
          {progressData.map((item: any) => (
            <div key={item.category.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-neutral-700">{item.category.name}</span>
                <span className="text-sm text-neutral-500">
                  {item.completedTasks}/{item.totalTasks} tasks
                </span>
              </div>
              <div 
                className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className={cn(
                    "h-full flex-1 transition-all",
                    item.category.name.toLowerCase().includes('work') ? "bg-primary-500" :
                    item.category.name.toLowerCase().includes('personal') ? "bg-secondary-400" :
                    item.category.name.toLowerCase().includes('spiritual') ? "bg-accent-400" :
                    item.category.name.toLowerCase().includes('health') ? "bg-red-400" :
                    "bg-primary-500"
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
