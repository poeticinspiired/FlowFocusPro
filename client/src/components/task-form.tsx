import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTaskSchema, UpdateTask } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Create a form schema that extends the insert task schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low", "ai"]),
  categoryId: z.coerce.number().optional(),
  isMindful: z.boolean().default(false),
  dueDate: z.string().optional(),
  userId: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  userId: number;
  taskToEdit?: any;
  onSuccess?: () => void;
}

export function TaskForm({ userId, taskToEdit, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!taskToEdit;
  
  // Fetch categories for the dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories', { userId }],
    queryFn: () => fetch(`/api/categories?userId=${userId}`).then(res => res.json()),
  });
  
  const categories = categoriesData?.data || [];
  
  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: taskToEdit?.title || "",
      description: taskToEdit?.description || "",
      priority: taskToEdit?.priority || "medium",
      categoryId: taskToEdit?.categoryId,
      isMindful: taskToEdit?.isMindful || false,
      dueDate: taskToEdit?.dueDate ? new Date(taskToEdit.dueDate).toISOString().slice(0, 16) : "",
      userId,
    },
  });
  
  // Update form when taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        priority: taskToEdit.priority,
        categoryId: taskToEdit.categoryId,
        isMindful: taskToEdit.isMindful,
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().slice(0, 16) : "",
        userId,
      });
    }
  }, [taskToEdit, form, userId]);
  
  // Set up mutation for creating a task
  const createTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/tasks', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the tasks query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/category-progress'] });
      
      // Show success toast
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
        duration: 3000,
      });
      
      // Reset the form
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        isMindful: false,
        userId,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error creating task:", error);
    },
  });
  
  // Set up mutation for updating a task
  const updateTaskMutation = useMutation({
    mutationFn: async (data: UpdateTask) => {
      const response = await apiRequest('PUT', `/api/tasks/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the tasks query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/category-progress'] });
      
      // Show success toast
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
        duration: 3000,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error updating task:", error);
    },
  });
  
  // Handle form submission
  function onSubmit(data: FormValues) {
    // Convert string dueDate to Date if it exists
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    };
    
    if (isEditing) {
      updateTaskMutation.mutate({
        id: taskToEdit.id,
        ...formattedData,
      });
    } else {
      createTaskMutation.mutate(formattedData);
    }
  }
  
  return (
    <div className={isEditing ? "" : "bg-white rounded-lg shadow-sm border border-neutral-200 p-5"}>
      {!isEditing && <h3 className="text-lg font-medium text-neutral-900 mb-4">Create New Task</h3>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="What needs to be done?" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value !== "" ? parseInt(value) : undefined)}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_category">Select category</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="ai">Let AI decide</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add more details about this task..." 
                    {...field} 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <FormField
              control={form.control}
              name="isMindful"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 mb-4 sm:mb-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Add mindfulness reminder for this task</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="inline-flex justify-center items-center"
              disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {isEditing ? (
                "Update Task"
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
