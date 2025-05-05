import { InsertTask, UpdateTask } from "@shared/schema";

/**
 * A simple AI prioritization algorithm for tasks
 * In a real-world scenario, this would use machine learning based on user patterns,
 * but for this implementation we'll use a rule-based approach.
 */
export async function calculateTaskPriority(task: InsertTask | UpdateTask): Promise<number> {
  let score = 50; // Base score out of 100
  
  // Prioritize tasks with due dates
  if (task.dueDate) {
    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Higher priority for imminent deadlines
    if (daysUntilDue <= 0) {
      score += 30; // Due today or overdue
    } else if (daysUntilDue <= 1) {
      score += 25; // Due tomorrow
    } else if (daysUntilDue <= 3) {
      score += 20; // Due in next 3 days
    } else if (daysUntilDue <= 7) {
      score += 15; // Due this week
    } else {
      score += 5; // Due later
    }
  }
  
  // Prioritize based on description length (more detailed tasks are often more important)
  if (task.description) {
    const descriptionLength = task.description.length;
    if (descriptionLength > 200) {
      score += 10;
    } else if (descriptionLength > 100) {
      score += 5;
    } else if (descriptionLength > 50) {
      score += 2;
    }
  }
  
  // Prioritize mindful tasks (those marked with mindfulness reminders)
  if (task.isMindful) {
    score += 8;
  }
  
  // Adjust based on explicit priority if it's not 'ai'
  if (typeof task.priority === 'string' && task.priority !== 'ai') {
    switch (task.priority) {
      case 'high':
        score += 15;
        break;
      case 'medium':
        score += 5;
        break;
      case 'low':
        score -= 5;
        break;
    }
  }
  
  // Cap the score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * This function would normally consider:
 * - User's past completion patterns
 * - Time of day effectiveness
 * - Task category performance
 * - Relationships between tasks
 * - Energy levels throughout the day
 */
