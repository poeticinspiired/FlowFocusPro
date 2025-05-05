import { db } from "@db";
import { eq, and, desc, gte, sql, count, isNull, lt } from "drizzle-orm";
import {
  users,
  tasks,
  categories,
  mindfulnessActivities,
  mindfulnessSessions,
  mindfulnessTips,
  productivityData,
} from "@shared/schema";
import type { 
  InsertTask, 
  Task, 
  UpdateTask, 
  InsertCategory,
  Category,
  InsertMindfulnessActivity,
  InsertMindfulnessSession,
  InsertMindfulnessTip,
  MindfulnessTip,
  InsertProductivityData,
} from "@shared/schema";
import type { 
  DashboardStats, 
  CategoryProgress, 
  AiInsight, 
  TaskFilterOption,
  ChartTimeframe,
} from "@shared/types";

// User-related functions
export async function getUserById(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getUserByUsername(username: string) {
  return db.query.users.findFirst({
    where: eq(users.username, username),
  });
}

// Task-related functions
export async function createTask(taskData: InsertTask): Promise<Task> {
  const [newTask] = await db.insert(tasks).values(taskData).returning();
  return newTask;
}

export async function updateTask(taskData: UpdateTask): Promise<Task | null> {
  const [updatedTask] = await db
    .update(tasks)
    .set({ 
      ...taskData, 
      updatedAt: new Date() 
    })
    .where(eq(tasks.id, taskData.id))
    .returning();
  return updatedTask || null;
}

export async function deleteTask(taskId: number): Promise<boolean> {
  const [deletedTask] = await db
    .delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning();
  return !!deletedTask;
}

export async function getTaskById(taskId: number) {
  return db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      category: true,
    },
  });
}

export async function getTasksByUserId(userId: number, filter: TaskFilterOption = 'all', limit = 50, offset = 0) {
  let query = db.query.tasks;
  let whereClause;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (filter) {
    case 'today':
      whereClause = and(
        eq(tasks.userId, userId),
        gte(tasks.dueDate!, today)
      );
      break;
    case 'important':
      whereClause = and(
        eq(tasks.userId, userId),
        eq(tasks.priority, 'high')
      );
      break;
    case 'completed':
      whereClause = and(
        eq(tasks.userId, userId),
        eq(tasks.completed, true)
      );
      break;
    case 'all':
    default:
      whereClause = eq(tasks.userId, userId);
      break;
  }
  
  return query.findMany({
    where: whereClause,
    with: {
      category: true,
    },
    orderBy: [
      desc(tasks.aiPriority),
      desc(tasks.createdAt),
    ],
    limit,
    offset,
  });
}

// Category-related functions
export async function createCategory(categoryData: InsertCategory): Promise<Category> {
  const [newCategory] = await db.insert(categories).values(categoryData).returning();
  return newCategory;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | null> {
  const [updatedCategory] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return updatedCategory || null;
}

export async function deleteCategory(categoryId: number): Promise<boolean> {
  const [deletedCategory] = await db
    .delete(categories)
    .where(eq(categories.id, categoryId))
    .returning();
  return !!deletedCategory;
}

export async function getCategoryById(categoryId: number) {
  return db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });
}

export async function getCategoriesByUserId(userId: number) {
  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: categories.name,
  });
}

// Mindfulness-related functions
export async function createMindfulnessActivity(data: InsertMindfulnessActivity) {
  const [newActivity] = await db.insert(mindfulnessActivities).values(data).returning();
  return newActivity;
}

export async function getMindfulnessActivities() {
  return db.query.mindfulnessActivities.findMany({
    orderBy: desc(mindfulnessActivities.createdAt),
  });
}

export async function createMindfulnessSession(data: InsertMindfulnessSession) {
  const [newSession] = await db.insert(mindfulnessSessions).values(data).returning();
  return newSession;
}

export async function getMindfulnessSessionsByUserId(userId: number) {
  return db.query.mindfulnessSessions.findMany({
    where: eq(mindfulnessSessions.userId, userId),
    with: {
      activity: true,
    },
    orderBy: desc(mindfulnessSessions.createdAt),
  });
}

export async function getMindfulnessStreak(userId: number): Promise<number> {
  // Get all completed mindfulness sessions for the user, ordered by date
  const sessions = await getMindfulnessSessionsByUserId(userId);
  
  if (sessions.length === 0) return 0;
  
  // Check if there's a session today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let hasSessionToday = false;
  let streakCount = 0;
  let currentDate = new Date();
  
  // Sort sessions by date in descending order
  const sortedSessions = sessions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Check if there was a session today
  const latestSession = sortedSessions[0];
  const latestSessionDate = new Date(latestSession.createdAt);
  latestSessionDate.setHours(0, 0, 0, 0);
  
  if (latestSessionDate.getTime() === today.getTime()) {
    hasSessionToday = true;
    streakCount = 1;
    currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1); // Start checking from yesterday
  } else {
    // No session today, check if there was one yesterday to continue the streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (latestSessionDate.getTime() === yesterday.getTime()) {
      streakCount = 1;
      currentDate = new Date(yesterday);
      currentDate.setDate(currentDate.getDate() - 1); // Start checking from the day before yesterday
    } else {
      // Streak is broken
      return 0;
    }
  }
  
  // Count consecutive days
  let i = 1; // Start from the second session if we already counted today
  if (hasSessionToday) i = 1;
  
  while (i < sortedSessions.length) {
    const sessionDate = new Date(sortedSessions[i].createdAt);
    sessionDate.setHours(0, 0, 0, 0);
    
    currentDate.setHours(0, 0, 0, 0);
    
    if (sessionDate.getTime() === currentDate.getTime()) {
      streakCount++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (sessionDate.getTime() < currentDate.getTime()) {
      // Skip sessions from the same day
      currentDate = new Date(sessionDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Gap in the streak
      break;
    }
    
    i++;
  }
  
  return streakCount;
}

export async function createMindfulnessTip(data: InsertMindfulnessTip) {
  const [newTip] = await db.insert(mindfulnessTips).values(data).returning();
  return newTip;
}

export async function getRandomMindfulnessTip(type?: string): Promise<MindfulnessTip | null> {
  let query = db.select().from(mindfulnessTips);
  
  if (type) {
    query = query.where(eq(mindfulnessTips.type, type));
  }
  
  // Use SQL ordering by random to get a random tip
  query = query.orderBy(sql`RANDOM()`).limit(1);
  
  const tips = await query;
  return tips.length > 0 ? tips[0] : null;
}

// Productivity data functions
export async function createOrUpdateProductivityData(data: InsertProductivityData) {
  // Check if we already have data for this user and date
  const existingData = await db.query.productivityData.findFirst({
    where: and(
      eq(productivityData.userId, data.userId),
      eq(sql`DATE(${productivityData.date})`, sql`DATE(${data.date || new Date()})`)
    ),
  });
  
  if (existingData) {
    // Update existing record
    const [updated] = await db
      .update(productivityData)
      .set(data)
      .where(eq(productivityData.id, existingData.id))
      .returning();
    return updated;
  } else {
    // Create new record
    const [newData] = await db.insert(productivityData).values(data).returning();
    return newData;
  }
}

export async function getProductivityDataByUserIdAndTimeframe(
  userId: number, 
  timeframe: ChartTimeframe
): Promise<any[]> {
  let startDate: Date;
  const now = new Date();
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
  }
  
  return db.query.productivityData.findMany({
    where: and(
      eq(productivityData.userId, userId),
      gte(productivityData.date, startDate)
    ),
    orderBy: productivityData.date,
  });
}

// Dashboard stats
export async function getDashboardStats(userId: number): Promise<DashboardStats> {
  // Get active tasks count
  const activeTasksPromise = db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.completed, false)
      )
    );
  
  // Get completed tasks count for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedTodayPromise = db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.completed, true),
        gte(tasks.updatedAt, today)
      )
    );
  
  // Get latest productivity data
  const productivityDataPromise = db.query.productivityData.findFirst({
    where: eq(productivityData.userId, userId),
    orderBy: desc(productivityData.date),
  });
  
  // Get total mindfulness minutes for today
  const mindfulnessMinutesPromise = db
    .select({
      totalMinutes: sql<number>`COALESCE(SUM(${mindfulnessSessions.duration}), 0) / 60`,
    })
    .from(mindfulnessSessions)
    .where(
      and(
        eq(mindfulnessSessions.userId, userId),
        gte(mindfulnessSessions.createdAt, today)
      )
    );
  
  const [
    activeTasks,
    completedToday,
    userData,
    mindfulnessData,
  ] = await Promise.all([
    activeTasksPromise,
    completedTodayPromise,
    productivityDataPromise,
    mindfulnessMinutesPromise,
  ]);
  
  return {
    activeTasks: activeTasks[0]?.count ?? 0,
    completedToday: completedToday[0]?.count ?? 0,
    focusScore: userData?.focusScore ?? 0,
    mindfulnessMinutes: Math.round(mindfulnessData[0]?.totalMinutes ?? 0),
  };
}

// Category progress
export async function getCategoryProgress(userId: number): Promise<CategoryProgress[]> {
  // Get all categories for the user
  const userCategories = await getCategoriesByUserId(userId);
  
  if (userCategories.length === 0) {
    return [];
  }
  
  const result: CategoryProgress[] = [];
  
  // For each category, get completed and total tasks
  for (const category of userCategories) {
    const totalTasksCount = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.categoryId, category.id)
        )
      );
    
    const completedTasksCount = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.categoryId, category.id),
          eq(tasks.completed, true)
        )
      );
    
    const totalTasks = totalTasksCount[0]?.count ?? 0;
    const completedTasks = completedTasksCount[0]?.count ?? 0;
    
    result.push({
      category,
      totalTasks,
      completedTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    });
  }
  
  return result;
}

// AI Insights
export async function generateAiInsight(userId: number): Promise<AiInsight> {
  // Get productivity data
  const productivityDataPromise = getProductivityDataByUserIdAndTimeframe(userId, 'week');
  
  // Get recent tasks
  const recentTasksPromise = getTasksByUserId(userId, 'all', 10, 0);
  
  // Get mindfulness sessions
  const mindfulnessSessionsPromise = getMindfulnessSessionsByUserId(userId);
  
  const [productivityData, recentTasks, mindfulnessSessions] = await Promise.all([
    productivityDataPromise,
    recentTasksPromise,
    mindfulnessSessionsPromise,
  ]);
  
  // Sample insights based on data patterns
  const insights = [
    {
      message: "Based on your patterns, your most productive time is between 9 AM and 11 AM. I've prioritized your creative tasks during this window.",
      type: 'productivity' as const,
    },
    {
      message: "You complete more tasks when you take short mindfulness breaks. Consider adding more 2-minute meditations between tasks.",
      type: 'mindfulness' as const,
    },
    {
      message: "I've noticed you tend to postpone tasks in the 'Work' category. Would breaking them into smaller steps help?",
      type: 'recommendation' as const,
    },
    {
      message: "Your focus score increases on days when you complete a morning meditation. Consider making this a daily habit.",
      type: 'mindfulness' as const,
    },
    {
      message: "Tasks with detailed descriptions are completed 30% faster. Try adding more details to your high-priority tasks.",
      type: 'productivity' as const,
    },
  ];
  
  // In a real implementation, we would analyze the data and generate insights
  // For now, return a random insight
  const randomIndex = Math.floor(Math.random() * insights.length);
  return insights[randomIndex];
}
