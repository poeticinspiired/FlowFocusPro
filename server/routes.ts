import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as storage from "./storage";
import { z } from "zod";
import {
  tasks,
  insertTaskSchema,
  updateTaskSchema,
  insertCategorySchema,
  insertMindfulnessSessionSchema,
} from "@shared/schema";
import { WebSocketMessage } from "@shared/types";
import { calculateTaskPriority } from "./utils/task-prioritizer";

const activeConnections = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message to associate websocket with user
        if (data.type === 'AUTH' && data.userId) {
          userId = data.userId;
          activeConnections.set(userId, ws);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'AUTH_SUCCESS',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        activeConnections.delete(userId);
      }
    });
  });
  
  // Helper function to broadcast messages to a specific user
  const broadcastToUser = (userId: number, message: WebSocketMessage) => {
    const connection = activeConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  };
  
  // API routes
  const apiPrefix = '/api';
  
  // Task routes
  app.get(`${apiPrefix}/tasks`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const filter = (req.query.filter as string) || 'all';
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const tasks = await storage.getTasksByUserId(userId, filter as any);
      return res.json({ data: tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/tasks`, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      
      // If AI priority is requested, calculate it
      if (validatedData.priority === 'ai') {
        const aiPriority = await calculateTaskPriority(validatedData);
        validatedData.aiPriority = aiPriority;
      }
      
      const newTask = await storage.createTask(validatedData);
      
      // Broadcast the new task to the user
      broadcastToUser(validatedData.userId, {
        type: 'TASK_CREATED',
        payload: newTask,
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json({ data: newTask });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.put(`${apiPrefix}/tasks/:id`, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }
      
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const validatedData = updateTaskSchema.parse({
        ...req.body,
        id: taskId
      });
      
      // If priority is changing to AI, calculate it
      if (validatedData.priority === 'ai' && task.priority !== 'ai') {
        const aiPriority = await calculateTaskPriority(validatedData);
        validatedData.aiPriority = aiPriority;
      }
      
      const updatedTask = await storage.updateTask(validatedData);
      
      // Broadcast the updated task
      if (updatedTask) {
        broadcastToUser(updatedTask.userId, {
          type: 'TASK_UPDATED',
          payload: updatedTask,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.json({ data: updatedTask });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.delete(`${apiPrefix}/tasks/:id`, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }
      
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const success = await storage.deleteTask(taskId);
      
      if (success) {
        // Broadcast the deletion
        broadcastToUser(task.userId, {
          type: 'TASK_DELETED',
          payload: { id: taskId },
          timestamp: new Date().toISOString()
        });
        
        return res.json({ data: { success: true } });
      } else {
        return res.status(500).json({ error: 'Failed to delete task' });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Category routes
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const categories = await storage.getCategoriesByUserId(userId);
      return res.json({ data: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(validatedData);
      return res.status(201).json({ data: newCategory });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Mindfulness routes
  app.get(`${apiPrefix}/mindfulness/tips`, async (req, res) => {
    try {
      const type = req.query.type as string;
      const tip = await storage.getRandomMindfulnessTip(type);
      return res.json({ data: tip });
    } catch (error) {
      console.error('Error fetching mindfulness tip:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/mindfulness/activities`, async (req, res) => {
    try {
      const activities = await storage.getMindfulnessActivities();
      return res.json({ data: activities });
    } catch (error) {
      console.error('Error fetching mindfulness activities:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/mindfulness/sessions`, async (req, res) => {
    try {
      const validatedData = insertMindfulnessSessionSchema.parse(req.body);
      const newSession = await storage.createMindfulnessSession(validatedData);
      
      // Broadcast mindfulness completion
      broadcastToUser(validatedData.userId, {
        type: 'MINDFULNESS_COMPLETED',
        payload: newSession,
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json({ data: newSession });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating mindfulness session:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/mindfulness/streak`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const streak = await storage.getMindfulnessStreak(userId);
      return res.json({ 
        data: { 
          days: streak,
          message: streak > 0 
            ? `Keep going! You're building a great habit.` 
            : `Start your mindfulness journey today!`
        } 
      });
    } catch (error) {
      console.error('Error fetching mindfulness streak:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Dashboard stats routes
  app.get(`${apiPrefix}/dashboard/stats`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const stats = await storage.getDashboardStats(userId);
      return res.json({ data: stats });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/dashboard/category-progress`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const progress = await storage.getCategoryProgress(userId);
      return res.json({ data: progress });
    } catch (error) {
      console.error('Error fetching category progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/dashboard/productivity`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const timeframe = (req.query.timeframe as string) || 'day';
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const data = await storage.getProductivityDataByUserIdAndTimeframe(
        userId, 
        timeframe as any
      );
      
      return res.json({ data });
    } catch (error) {
      console.error('Error fetching productivity data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get(`${apiPrefix}/ai/insight`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const insight = await storage.generateAiInsight(userId);
      return res.json({ data: insight });
    } catch (error) {
      console.error('Error generating AI insight:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return httpServer;
}
