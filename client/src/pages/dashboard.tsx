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
    <div className="fade-in">
      {/* Silicon Valley Style Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tech-text-gradient">FlowFocus Dashboard</h1>
        <p className="text-muted-foreground mt-2">Your tech-powered productivity ecosystem</p>
      </div>

      {/* Insight Cards - with glass morphism and hover effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card rounded-2xl overflow-hidden hover-lift">
          <InsightCard
            title="Active Tasks"
            value={stats.activeTasks}
            icon={<ClipboardCheck className="h-6 w-6" />}
            iconBgColor="bg-primary"
            iconColor="text-primary-foreground"
          />
        </div>
        
        <div className="glass-card rounded-2xl overflow-hidden hover-lift">
          <InsightCard
            title="Completed Today"
            value={stats.completedToday}
            icon={<CheckCircle className="h-6 w-6" />}
            iconBgColor="bg-secondary"
            iconColor="text-secondary-foreground"
          />
        </div>
        
        <div className="glass-card rounded-2xl overflow-hidden hover-lift">
          <InsightCard
            title="Focus Score"
            value={`${stats.focusScore}%`}
            icon={<Zap className="h-6 w-6" />}
            iconBgColor="bg-accent"
            iconColor="text-accent-foreground"
          />
        </div>
        
        <div className="glass-card rounded-2xl overflow-hidden hover-lift">
          <InsightCard
            title="Mindfulness Minutes"
            value={stats.mindfulnessMinutes}
            icon={<Clock className="h-6 w-6" />}
            iconBgColor="bg-accent"
            iconColor="text-accent-foreground"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Insight with animated border */}
          <div className="relative p-[1px] bg-gradient-to-r from-primary to-secondary rounded-2xl overflow-hidden">
            <div className="bg-card rounded-2xl overflow-hidden">
              <AiInsight userId={userId} />
            </div>
          </div>
          
          {/* Glass-morphism effect for task form */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <TaskForm userId={userId} />
          </div>
          
          <div className="glass-card rounded-2xl overflow-hidden">
            <TaskList userId={userId} />
          </div>
        </div>
        
        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-8">
          <div className="glass-card rounded-2xl overflow-hidden hover-lift">
            <FocusChart userId={userId} />
          </div>
          
          <div className="glass-card rounded-2xl overflow-hidden hover-lift">
            <CategoryProgress userId={userId} />
          </div>
          
          <div className="glass-card rounded-2xl overflow-hidden hover-lift">
            <MindfulnessStreak userId={userId} />
          </div>
        </div>
      </div>
      
      {/* Connected Status Indicator */}
      <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-card px-3 py-1 rounded-full shadow-md">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-destructive'} ${isConnected ? 'pulse-animation' : ''}`}></div>
        <span className="text-xs text-muted-foreground">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
}
