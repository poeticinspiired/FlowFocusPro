import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (provided by the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.min(1, "Category name is required"),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // high, medium, low, ai
  categoryId: integer("category_id").references(() => categories.id),
  completed: boolean("completed").default(false).notNull(),
  isMindful: boolean("is_mindful").default(false).notNull(),
  dueDate: timestamp("due_date"),
  userId: integer("user_id").references(() => users.id).notNull(),
  aiPriority: integer("ai_priority"), // AI calculated priority score
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks, {
  title: (schema) => schema.min(1, "Task title is required"),
  priority: (schema) => schema.refine(val => ['high', 'medium', 'low', 'ai'].includes(val), {
    message: "Priority must be high, medium, low, or ai"
  }),
});

export const updateTaskSchema = createInsertSchema(tasks).partial().required({
  id: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Mindfulness activities table
export const mindfulnessActivities = pgTable("mindfulness_activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // meditation, breathing, reflection
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMindfulnessActivitySchema = createInsertSchema(mindfulnessActivities, {
  title: (schema) => schema.min(1, "Activity title is required"),
  duration: (schema) => schema.min(1, "Duration must be at least 1 second"),
});

export type InsertMindfulnessActivity = z.infer<typeof insertMindfulnessActivitySchema>;
export type MindfulnessActivity = typeof mindfulnessActivities.$inferSelect;

// User mindfulness sessions table
export const mindfulnessSessions = pgTable("mindfulness_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityId: integer("activity_id").references(() => mindfulnessActivities.id),
  duration: integer("duration").notNull(), // actual duration in seconds
  completed: boolean("completed").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMindfulnessSessionSchema = createInsertSchema(mindfulnessSessions, {
  duration: (schema) => schema.min(1, "Duration must be at least 1 second"),
});

export type InsertMindfulnessSession = z.infer<typeof insertMindfulnessSessionSchema>;
export type MindfulnessSession = typeof mindfulnessSessions.$inferSelect;

// Mindfulness quotes/tips table
export const mindfulnessTips = pgTable("mindfulness_tips", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  type: text("type").notNull(), // daily, task-related, general
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMindfulnessTipSchema = createInsertSchema(mindfulnessTips, {
  content: (schema) => schema.min(1, "Tip content is required"),
});

export type InsertMindfulnessTip = z.infer<typeof insertMindfulnessTipSchema>;
export type MindfulnessTip = typeof mindfulnessTips.$inferSelect;

// User productivity data
export const productivityData = pgTable("productivity_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  focusScore: integer("focus_score"), // 0-100
  completedTasks: integer("completed_tasks").default(0).notNull(),
  mindfulnessMinutes: integer("mindfulness_minutes").default(0).notNull(),
  hourlyData: json("hourly_data").$type<{hour: number, score: number}[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductivityDataSchema = createInsertSchema(productivityData);

export type InsertProductivityData = z.infer<typeof insertProductivityDataSchema>;
export type ProductivityData = typeof productivityData.$inferSelect;

// Define relationships between tables
export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const mindfulnessActivitiesRelations = relations(mindfulnessActivities, ({ many }) => ({
  sessions: many(mindfulnessSessions),
}));

export const mindfulnessSessionsRelations = relations(mindfulnessSessions, ({ one }) => ({
  activity: one(mindfulnessActivities, {
    fields: [mindfulnessSessions.activityId],
    references: [mindfulnessActivities.id],
  }),
  user: one(users, {
    fields: [mindfulnessSessions.userId],
    references: [users.id],
  }),
}));

export const productivityDataRelations = relations(productivityData, ({ one }) => ({
  user: one(users, {
    fields: [productivityData.userId],
    references: [users.id],
  }),
}));
