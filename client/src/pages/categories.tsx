import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CategoryProgress } from "@/components/category-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";

// Form schema for category creation/editing
const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().min(1, "Color is required"),
  userId: z.number(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function Categories() {
  const userId = 1; // Default user ID for demo purposes
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);

  // Fetch categories
  const { data, isLoading } = useQuery({
    queryKey: ['/api/categories', { userId }],
    queryFn: () => fetch(`/api/categories?userId=${userId}`).then(res => res.json()),
  });

  const categories = data?.data || [];

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: "#4F46E5", // Default to primary color
      userId,
    },
  });

  // Reset form when editing category changes
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        color: editingCategory.color,
        userId,
      });
    } else {
      form.reset({
        name: "",
        color: "#4F46E5",
        userId,
      });
    }
  }, [editingCategory, form, userId]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest('POST', '/api/categories', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category created",
        description: "Your category has been created successfully.",
        duration: 3000,
      });
      setIsDialogOpen(false);
      form.reset({
        name: "",
        color: "#4F46E5",
        userId,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error creating category:", error);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues & { id: number }) => {
      const { id, ...categoryData } = data;
      const response = await apiRequest('PUT', `/api/categories/${id}`, categoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category updated",
        description: "Your category has been updated successfully.",
        duration: 3000,
      });
      setIsDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error updating category:", error);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/categories/${id}`, null);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
        duration: 3000,
      });
      setDeletingCategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error deleting category:", error);
    },
  });

  // Handle form submission
  function onSubmit(data: CategoryFormValues) {
    if (editingCategory) {
      updateCategoryMutation.mutate({
        ...data,
        id: editingCategory.id,
      });
    } else {
      createCategoryMutation.mutate(data);
    }
  }

  // Open dialog for creating a new category
  const openCreateDialog = () => {
    setEditingCategory(null);
    form.reset({
      name: "",
      color: "#4F46E5",
      userId,
    });
    setIsDialogOpen(true);
  };

  // Open dialog for editing a category
  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  // Confirm category deletion
  const confirmDeleteCategory = (category: any) => {
    setDeletingCategory(category);
  };

  // Delete the category
  const deleteCategory = () => {
    if (deletingCategory) {
      deleteCategoryMutation.mutate(deletingCategory.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Organize your tasks with categories
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Create Category"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Update your category details below."
                      : "Add a new category to organize your tasks."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter category name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-full border"
                              style={{ backgroundColor: field.value }}
                            ></div>
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                        {editingCategory ? "Update Category" : "Create Category"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-32 bg-neutral-100 rounded-lg"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-600">No categories found. Create your first category to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category: any) => (
                <Card key={category.id}>
                  <div
                    className="h-2 rounded-t-lg"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => confirmDeleteCategory(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this category? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={deleteCategory}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Progress */}
      <CategoryProgress userId={userId} />
    </div>
  );
}
