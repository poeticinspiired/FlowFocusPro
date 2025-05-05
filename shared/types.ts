import { Task, Category, MindfulnessActivity, MindfulnessTip, ProductivityData } from "./schema";

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  activeTasks: number;
  completedToday: number;
  focusScore: number;
  mindfulnessMinutes: number;
}

// AI Insight Type
export interface AiInsight {
  message: string;
  type: 'productivity' | 'mindfulness' | 'recommendation';
}

// Category Progress Type
export interface CategoryProgress {
  category: Category;
  completedTasks: number;
  totalTasks: number;
  percentage: number;
}

// Mindfulness Streak
export interface MindfulnessStreak {
  days: number;
  message: string;
}

// Task with Category Info
export interface TaskWithCategory extends Task {
  category?: Category;
}

// WebSocket Message Types
export type WebSocketMessageType = 
  | 'TASK_CREATED' 
  | 'TASK_UPDATED' 
  | 'TASK_DELETED' 
  | 'MINDFULNESS_COMPLETED'
  | 'FOCUS_UPDATE';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: string;
}

// Focus Data For Charts
export interface FocusTimeData {
  hour: number;
  score: number;
}

// Task Filter Options
export type TaskFilterOption = 'all' | 'today' | 'important' | 'completed';

// Chart Timeframe Options
export type ChartTimeframe = 'day' | 'week' | 'month';
