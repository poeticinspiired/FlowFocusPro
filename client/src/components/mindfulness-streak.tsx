import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface MindfulnessStreakProps {
  userId: number;
}

export function MindfulnessStreak({ userId }: MindfulnessStreakProps) {
  // Fetch mindfulness streak data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/mindfulness/streak', { userId }],
    queryFn: () => fetch(`/api/mindfulness/streak?userId=${userId}`).then(res => res.json()),
  });
  
  const streakData = data?.data || { days: 7, message: "Keep going! You're building a great habit." };
  
  return (
    <Card className="bg-gradient-to-r from-secondary-100 to-primary-100 border-secondary-200">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="bg-white p-3 rounded-full">
            <Star className="h-6 w-6 text-secondary-500" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-neutral-900">Mindfulness Streak</h3>
            <div className="flex items-baseline">
              {isLoading ? (
                <div className="animate-pulse h-8 w-10 bg-white bg-opacity-60 rounded"></div>
              ) : (
                <>
                  <span className="text-3xl font-bold text-secondary-700">{streakData.days}</span>
                  <span className="ml-1 text-sm text-secondary-600">days</span>
                </>
              )}
            </div>
            <p className="text-sm text-neutral-700 mt-1">{streakData.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
