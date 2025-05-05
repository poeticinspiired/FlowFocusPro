import { db } from "./index";
import * as schema from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Define category colors
const categoryColors = [
  "#4F46E5", // Primary blue
  "#A78BFA", // Soft purple
  "#34D399", // Gentle green
  "#EC4899", // Pink
  "#F59E0B", // Amber
];

async function seed() {
  try {
    console.log("Starting seed process...");

    // Seed users first (if not already present)
    const existingUsers = await db.select().from(schema.users).where(
      eq(schema.users.username, 'demo')
    );

    let userId: number;

    if (existingUsers.length === 0) {
      console.log("Creating demo user...");
      const [newUser] = await db.insert(schema.users).values({
        username: "demo",
        password: "password", // In a real app, we would hash this
      }).returning();
      
      userId = newUser.id;
      console.log(`Created demo user with ID: ${userId}`);
    } else {
      userId = existingUsers[0].id;
      console.log(`Using existing user with ID: ${userId}`);
    }

    // Seed categories
    console.log("Seeding categories...");
    const categoryNames = ["Work", "Personal", "Health & Wellness", "Learning", "Spiritual"];
    
    for (let i = 0; i < categoryNames.length; i++) {
      const existingCategories = await db.select().from(schema.categories).where(
        and(
          eq(schema.categories.name, categoryNames[i]),
          eq(schema.categories.userId, userId)
        )
      );

      if (existingCategories.length === 0) {
        await db.insert(schema.categories).values({
          name: categoryNames[i],
          color: categoryColors[i % categoryColors.length],
          userId,
        });
        console.log(`Created category: ${categoryNames[i]}`);
      } else {
        console.log(`Category ${categoryNames[i]} already exists, skipping`);
      }
    }

    // Fetch the created categories
    const categories = await db.select().from(schema.categories).where(
      eq(schema.categories.userId, userId)
    );

    // Create a mapping of category name to ID
    const categoryMap = categories.reduce((map, category) => {
      map[category.name] = category.id;
      return map;
    }, {} as Record<string, number>);

    // Seed tasks
    console.log("Seeding tasks...");
    const tasks = [
      {
        title: "Finalize project proposal",
        description: "Complete the final draft with all client feedback incorporated.",
        priority: "high",
        categoryId: categoryMap["Work"],
        isMindful: true,
        dueDate: new Date(new Date().setHours(15, 0, 0, 0)), // Today at 3:00 PM
        completed: false,
        userId,
      },
      {
        title: "Morning meditation session",
        description: "15-minute guided meditation to start the day with intention.",
        priority: "medium",
        categoryId: categoryMap["Spiritual"],
        isMindful: true,
        dueDate: new Date(new Date().setHours(9, 0, 0, 0)), // Today at 9:00 AM
        completed: false,
        userId,
      },
      {
        title: "Review team feedback",
        description: "Go through team feedback for the latest design iteration.",
        priority: "low",
        categoryId: categoryMap["Work"],
        isMindful: false,
        dueDate: new Date(new Date().setHours(10, 0, 0, 0)), // Today at 10:00 AM
        completed: true,
        userId,
      },
      {
        title: "Weekly grocery shopping",
        description: "Buy fresh produce and meal prep ingredients.",
        priority: "medium",
        categoryId: categoryMap["Personal"],
        isMindful: false,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        completed: false,
        userId,
      },
      {
        title: "30-minute yoga practice",
        description: "Focus on stretching and mindful movement.",
        priority: "medium",
        categoryId: categoryMap["Health & Wellness"],
        isMindful: true,
        dueDate: new Date(new Date().setHours(17, 0, 0, 0)), // Today at 5:00 PM
        completed: false,
        userId,
      },
      {
        title: "Read chapter on mindfulness",
        description: "Continue reading the book on mindfulness practices.",
        priority: "low",
        categoryId: categoryMap["Learning"],
        isMindful: true,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Day after tomorrow
        completed: false,
        userId,
      },
      {
        title: "Schedule doctor appointment",
        description: "Annual check-up and wellness visit.",
        priority: "high",
        categoryId: categoryMap["Health & Wellness"],
        isMindful: false,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // In 5 days
        completed: false,
        userId,
      },
      {
        title: "Journal reflection",
        description: "Write about progress and insights from the week.",
        priority: "medium",
        categoryId: categoryMap["Spiritual"],
        isMindful: true,
        dueDate: new Date(new Date().setHours(20, 0, 0, 0)), // Today at 8:00 PM
        completed: false,
        userId,
      },
    ];

    for (const task of tasks) {
      const existingTasks = await db.select().from(schema.tasks).where(
        and(
          eq(schema.tasks.title, task.title),
          eq(schema.tasks.userId, userId)
        )
      );

      if (existingTasks.length === 0) {
        await db.insert(schema.tasks).values(task);
        console.log(`Created task: ${task.title}`);
      } else {
        console.log(`Task ${task.title} already exists, skipping`);
      }
    }

    // Seed mindfulness activities
    console.log("Seeding mindfulness activities...");
    const mindfulnessActivities = [
      {
        type: "meditation",
        title: "Morning Clarity",
        description: "Start your day with clear intentions and focused awareness",
        duration: 300, // 5 minutes in seconds
      },
      {
        type: "meditation",
        title: "Quick Centering",
        description: "A brief reset for busy moments during the day",
        duration: 120, // 2 minutes in seconds
      },
      {
        type: "breathing",
        title: "Deep Breathing",
        description: "Focus on breath to restore calm and balance",
        duration: 480, // 8 minutes in seconds
      },
      {
        type: "meditation",
        title: "Evening Wind Down",
        description: "Release the day's tensions and prepare for restful sleep",
        duration: 600, // 10 minutes in seconds
      },
      {
        type: "reflection",
        title: "Body Scan Relaxation",
        description: "Progressive relaxation through mindful body awareness",
        duration: 900, // 15 minutes in seconds
      },
    ];

    for (const activity of mindfulnessActivities) {
      const existingActivities = await db.select().from(schema.mindfulnessActivities).where(
        eq(schema.mindfulnessActivities.title, activity.title)
      );

      if (existingActivities.length === 0) {
        await db.insert(schema.mindfulnessActivities).values(activity);
        console.log(`Created mindfulness activity: ${activity.title}`);
      } else {
        console.log(`Mindfulness activity ${activity.title} already exists, skipping`);
      }
    }

    // Seed mindfulness tips
    console.log("Seeding mindfulness tips...");
    const mindfulnessTips = [
      {
        content: "Before starting your next task, take three deep breaths. Inhale peace, exhale tension. Notice how your body feels in this moment.",
        type: "daily",
      },
      {
        content: "Between tasks, pause for 30 seconds to feel your feet on the ground and notice three things you can see, hear, and feel.",
        type: "task-related",
      },
      {
        content: "Notice when your mind wanders during focused work. Gently acknowledge the thought, then return to your task without judgment.",
        type: "task-related",
      },
      {
        content: "Take one mindful bite during your next meal. Notice the texture, temperature, and flavors without distraction.",
        type: "daily",
      },
      {
        content: "When you feel overwhelmed, place a hand on your heart and offer yourself words of kindness.",
        type: "general",
      },
      {
        content: "As you transition between tasks, take a moment to celebrate what you've accomplished before moving on.",
        type: "task-related",
      },
      {
        content: "Your worth isn't measured by your productivity. Take a moment to appreciate yourself exactly as you are.",
        type: "general",
      },
      {
        content: "Pause right now and feel the weight of your body being supported. Let yourself be held.",
        type: "daily",
      },
    ];

    for (const tip of mindfulnessTips) {
      const existingTips = await db.select().from(schema.mindfulnessTips).where(
        eq(schema.mindfulnessTips.content, tip.content)
      );

      if (existingTips.length === 0) {
        await db.insert(schema.mindfulnessTips).values(tip);
        console.log(`Created mindfulness tip: ${tip.content.substring(0, 30)}...`);
      } else {
        console.log(`Mindfulness tip already exists, skipping`);
      }
    }

    // Seed productivity data for the user
    console.log("Seeding productivity data...");
    const today = new Date();

    // Generate hourly data
    const generateHourlyData = () => {
      const hourlyData = [];
      for (let hour = 8; hour <= 18; hour++) {
        hourlyData.push({
          hour,
          score: Math.floor(Math.random() * 100), // Random score between 0-100
        });
      }
      return hourlyData;
    };

    const productivityData = {
      userId,
      date: today,
      focusScore: 85,
      completedTasks: 3,
      mindfulnessMinutes: 15,
      hourlyData: generateHourlyData(),
    };

    const existingProductivityData = await db.select().from(schema.productivityData).where(
      and(
        eq(schema.productivityData.userId, userId),
        sql`DATE(${schema.productivityData.date}) = DATE(${today})`
      )
    );

    if (existingProductivityData.length === 0) {
      await db.insert(schema.productivityData).values(productivityData);
      console.log("Created productivity data for today");
    } else {
      console.log("Productivity data for today already exists, skipping");
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seed process:", error);
  }
}

seed();
