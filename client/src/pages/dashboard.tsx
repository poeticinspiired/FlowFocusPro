import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, CheckCircle, Zap, Clock } from "lucide-react";
import { InsightCard } from "@/components/insight-card";
import { AiInsight } from "@/components/ai-insight";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { FocusChart } from "@/components/focus-chart";
import { CategoryProgress } from "@/components/category-progress";
import { MindfulnessStreak } from "@/components/mindfulness-streak";
import { useWebSocket } from "@/hooks/use-web-socket";

export default function Dashboard() {
  const userId = 1; // Default user ID for demo purposes
  const { isConnected, lastMessage } = useWebSocket(userId);
  
  // Fetch dashboard stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['/api/dashboard/stats', { userId }],
    queryFn: () => fetch(`/api/dashboard/stats?userId=${userId}`).then(res => res.json()),
  });
  
  const stats = statsData?.data || {
    activeTasks: 0,
    completedToday: 0,
    focusScore: 0,
    mindfulnessMinutes: 0
  };

  // Refetch data when receiving WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'TASK_CREATED':
        case 'TASK_UPDATED':
        case 'TASK_DELETED':
          refetchStats();
          break;
        case 'MINDFULNESS_COMPLETED':
          refetchStats();
          break;
      }
    }
  }, [lastMessage, refetchStats]);
  
  return (
    <div>
      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InsightCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon={<ClipboardCheck className="h-6 w-6" />}
          iconBgColor="bg-primary-100"
          iconColor="text-primary-600"
        />
        
        <InsightCard
          title="Completed Today"
          value={stats.completedToday}
          icon={<CheckCircle className="h-6 w-6" />}
          iconBgColor="bg-secondary-100"
          iconColor="text-secondary-600"
        />
        
        <InsightCard
          title="Focus Score"
          value={`${stats.focusScore}%`}
          icon={<Zap className="h-6 w-6" />}
          iconBgColor="bg-accent-100"
          iconColor="text-accent-600"
        />
        
        <InsightCard
          title="Mindfulness Minutes"
          value={stats.mindfulnessMinutes}
          icon={<Clock className="h-6 w-6" />}
          iconBgColor="bg-neutral-100"
          iconColor="text-neutral-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <AiInsight userId={userId} />
          <TaskForm userId={userId} />
          <TaskList userId={userId} />
        </div>
        
        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          <FocusChart userId={userId} />
          <CategoryProgress userId={userId} />
          <MindfulnessStreak userId={userId} />
        </div>
      </div>
    </div>
  );
}
