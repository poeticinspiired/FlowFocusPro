import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MoreHorizontal, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiInsightProps {
  userId: number;
}

export function AiInsight({ userId }: AiInsightProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  
  // Fetch AI insight
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/ai/insight', { userId }],
    queryFn: () => fetch(`/api/ai/insight?userId=${userId}`).then(res => res.json()),
  });
  
  const insight = data?.data || {
    message: "Based on your patterns, your most productive time is between 9 AM and 11 AM. I've prioritized your creative tasks during this window.",
    type: "productivity"
  };
  
  // Handle feedback
  const handleFeedback = (value: 'helpful' | 'not-helpful') => {
    setFeedback(value);
    // In a real app, we would send the feedback to the server
    // For now, just wait 1 second and then refetch to simulate
    setTimeout(() => {
      refetch();
      setFeedback(null);
    }, 1000);
  };
  
  return (
    <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-500 p-2 rounded-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-neutral-900">AI Insight</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-500 -mt-1 -mr-1">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="animate-pulse h-4 bg-white bg-opacity-60 rounded w-full mb-2"></div>
          ) : (
            <p className="text-neutral-700">{insight.message}</p>
          )}
          
          <div className="mt-3 flex items-center">
            <div className="text-sm text-primary-700 font-medium mr-3">Is this helpful?</div>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-primary-600 hover:text-primary-800 mr-2 p-1 h-auto",
                feedback === 'helpful' && "bg-primary-100"
              )}
              onClick={() => handleFeedback('helpful')}
              disabled={feedback !== null}
            >
              <ThumbsUp className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-neutral-400 hover:text-neutral-600 p-1 h-auto",
                feedback === 'not-helpful' && "bg-neutral-200"
              )}
              onClick={() => handleFeedback('not-helpful')}
              disabled={feedback !== null}
            >
              <ThumbsDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
