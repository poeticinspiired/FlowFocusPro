import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Task, Category } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { getPriorityColor, cn } from "@/lib/utils";

export default function Tasks() {
  const userId = 1; // Default user ID for demo purposes
  const [view, setView] = useState<"list" | "board" | "table">("list");

  // Fetch tasks data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/tasks', { userId, filter: 'all' }],
    queryFn: () => fetch(`/api/tasks?userId=${userId}&filter=all`).then(res => res.json()),
  });

  const tasks = data?.data || [];

  // Columns for table view
  const columns = [
    {
      accessorKey: "title",
      header: "Task",
      cell: (row: Task & { category?: Category }) => (
        <div className="font-medium">{row.title}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (row: Task & { category?: Category }) => (
        <Badge variant="outline" className="bg-primary-100 text-primary-800 hover:bg-primary-100">
          {row.category?.name || "Uncategorized"}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: (row: Task & { category?: Category }) => (
        <Badge variant="outline" className={getPriorityColor(row.priority)}>
          {row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: (row: Task & { category?: Category }) => (
        <div>
          {row.dueDate 
            ? formatDistanceToNow(new Date(row.dueDate), { addSuffix: true }) 
            : "No due date"}
        </div>
      ),
    },
    {
      accessorKey: "completed",
      header: "Status",
      cell: (row: Task & { category?: Category }) => (
        <Badge className={row.completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {row.completed ? "Completed" : "Active"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Create, organize, and prioritize your tasks
              </CardDescription>
            </div>
            <Tabs defaultValue="list" className="w-full md:w-auto" onValueChange={(value) => setView(value as any)}>
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <TaskForm userId={userId} />
        </CardContent>
      </Card>

      {view === "list" && (
        <TaskList userId={userId} />
      )}

      {view === "board" && (
        <Card>
          <CardHeader>
            <CardTitle>Task Board</CardTitle>
            <CardDescription>
              Visualize your tasks in a kanban-style board
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* To Do Column */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm mb-3 text-neutral-600">To Do</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="animate-pulse h-20 bg-neutral-100 rounded-lg"></div>
                  ) : (
                    tasks
                      .filter((task: Task) => !task.completed)
                      .map((task: Task & { category?: Category }) => (
                        <div 
                          key={task.id} 
                          className="p-3 bg-white border border-neutral-200 rounded-lg shadow-sm"
                        >
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="flex items-center mt-2 gap-2">
                            {task.category && (
                              <Badge variant="outline" className="bg-primary-100 text-primary-800 hover:bg-primary-100 text-xs">
                                {task.category.name}
                              </Badge>
                            )}
                            <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm mb-3 text-neutral-600">In Progress</h3>
                <div className="text-center p-6 text-neutral-500 text-sm">
                  This view is still in development
                </div>
              </div>

              {/* Completed Column */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-sm mb-3 text-neutral-600">Completed</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="animate-pulse h-20 bg-neutral-100 rounded-lg"></div>
                  ) : (
                    tasks
                      .filter((task: Task) => task.completed)
                      .map((task: Task & { category?: Category }) => (
                        <div 
                          key={task.id} 
                          className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm"
                        >
                          <div className="font-medium text-sm line-through text-neutral-500">{task.title}</div>
                          <div className="flex items-center mt-2 gap-2">
                            {task.category && (
                              <Badge variant="outline" className="bg-primary-100 text-primary-800 hover:bg-primary-100 text-xs opacity-70">
                                {task.category.name}
                              </Badge>
                            )}
                            <Badge variant="outline" className={cn("text-xs opacity-70", getPriorityColor(task.priority))}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {view === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>Task Table</CardTitle>
            <CardDescription>
              View all your tasks in a table format
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-neutral-100 rounded"></div>
                <div className="h-20 bg-neutral-100 rounded"></div>
              </div>
            ) : (
              <DataTable 
                data={tasks} 
                columns={columns}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
