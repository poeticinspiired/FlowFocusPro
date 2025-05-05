import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, Category } from "@shared/schema";
import { TaskFilterOption } from "@shared/types";
import { TaskItem } from "./task-item";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./task-form";

interface TaskListProps {
  userId: number;
}

export function TaskList({ userId }: TaskListProps) {
  const [filter, setFilter] = useState<TaskFilterOption>("all");
  const [editingTask, setEditingTask] = useState<(Task & { category?: Category }) | null>(null);
  
  // Fetch tasks
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/tasks', { userId, filter }],
    queryFn: () => fetch(`/api/tasks?userId=${userId}&filter=${filter}`).then(res => res.json()),
  });
  
  const tasks = data?.data || [];
  
  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value as TaskFilterOption);
  };
  
  // Handle edit task
  const handleEditTask = (task: Task & { category?: Category }) => {
    setEditingTask(task);
  };
  
  // Close edit dialog
  const closeEditDialog = () => {
    setEditingTask(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-neutral-900">AI-Prioritized Tasks</h3>
        <div className="relative">
          <Select 
            value={filter} 
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center mt-4">
            <div className="loader ease-linear rounded-full border-2 border-t-2 border-neutral-200 h-8 w-8"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-4 text-neutral-600">
            Error loading tasks. Please try again.
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            No tasks found. Create a new task to get started.
          </div>
        ) : (
          tasks.map((task: Task & { category?: Category }) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onEdit={handleEditTask}
            />
          ))
        )}
      </div>
      
      {tasks.length > 10 && (
        <div className="mt-4 text-center">
          <button type="button" className="text-sm text-primary-600 hover:text-primary-800 font-medium focus:outline-none focus:underline">
            Load more tasks
          </button>
        </div>
      )}
      
      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm userId={userId} taskToEdit={editingTask} onSuccess={closeEditDialog} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
