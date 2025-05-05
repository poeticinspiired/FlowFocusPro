import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task, Category } from "@shared/schema";
import { formatDistanceToNow, isPast, isToday } from "date-fns";
import { CheckCircle, Edit, Trash2, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TaskItemProps {
  task: Task & { category?: Category };
  onEdit: (task: Task & { category?: Category }) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Format the due date
  const formatDueDate = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return <span className="text-destructive">Overdue</span>;
    }
    
    if (isToday(dueDate)) {
      return `Due today`;
    }
    
    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };
  
  // Get priority badge color
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">High Priority</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Low Priority</Badge>;
      case 'ai':
        return <Badge variant="outline" className="bg-primary-100 text-primary-800 hover:bg-primary-100">AI Priority</Badge>;
      default:
        return null;
    }
  };
  
  // Toggle task completion mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', `/api/tasks/${task.id}`, {
        ...task,
        completed: !task.completed,
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/category-progress'] });
      
      // Show toast
      toast({
        title: task.completed ? "Task reopened" : "Task completed",
        description: task.completed 
          ? "The task has been marked as incomplete." 
          : "The task has been marked as complete.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error updating task:", error);
    },
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      setIsDeleting(true);
      const response = await apiRequest('DELETE', `/api/tasks/${task.id}`, null);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/category-progress'] });
      
      // Show toast
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
        duration: 3000,
      });
      
      setIsDeleting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error deleting task:", error);
      setIsDeleting(false);
    },
  });
  
  // Handle toggle complete
  const handleToggleComplete = () => {
    toggleCompleteMutation.mutate();
  };
  
  // Handle edit
  const handleEdit = () => {
    onEdit(task);
  };
  
  // Handle delete
  const handleDelete = () => {
    deleteTaskMutation.mutate();
  };
  
  return (
    <div className={cn(
      "group p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors fade-in",
      task.completed && "bg-neutral-50"
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "p-0 h-auto",
              task.completed ? "text-accent-500 hover:text-accent-700" : "text-primary-500 hover:text-primary-700"
            )}
            onClick={handleToggleComplete}
            disabled={toggleCompleteMutation.isPending}
          >
            {task.completed ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-sm font-medium",
              task.completed 
                ? "text-neutral-500 line-through" 
                : "text-neutral-900"
            )}>
              {task.title}
            </p>
            <div className="flex items-center">
              {task.category && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "bg-primary-100 text-primary-800 hover:bg-primary-100 mr-2",
                    task.completed && "opacity-70"
                  )}
                >
                  {task.category.name}
                </Badge>
              )}
              <div className="flex-shrink-0 flex">
                {getPriorityBadge()}
              </div>
            </div>
          </div>
          
          {task.description && (
            <div className={cn(
              "mt-1 text-sm",
              task.completed 
                ? "text-neutral-500 line-through" 
                : "text-neutral-600"
            )}>
              <p>{task.description}</p>
            </div>
          )}
          
          <div className="mt-2 flex items-center text-xs text-neutral-500">
            {task.dueDate && (
              <>
                <Clock className="h-4 w-4 mr-1" />
                {formatDueDate()}
              </>
            )}
            
            {task.isMindful && (
              <>
                <span className="mx-1">•</span>
                <Zap className="h-4 w-4 mr-1 text-secondary-500" />
                <span>Mindfulness task</span>
              </>
            )}
            
            {task.completed && (
              <>
                <span className="mx-1">•</span>
                <span>Completed</span>
              </>
            )}
          </div>
        </div>
        
        <div className="ml-3 flex-shrink-0 flex items-start space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto text-neutral-400 hover:text-neutral-600"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-auto text-neutral-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this task? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
