import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface MindfulnessModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  duration?: number; // in seconds
  activityId?: number;
}

export function MindfulnessModal({
  open,
  onClose,
  userId,
  duration = 60, // default 1 minute
  activityId,
}: MindfulnessModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create mindfulness session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (completedDuration: number) => {
      const response = await apiRequest('POST', '/api/mindfulness/sessions', {
        userId,
        activityId,
        duration: completedDuration,
        completed: true,
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mindfulness/streak'] });
      
      // Show success toast
      toast({
        title: "Mindfulness session completed",
        description: "Great job! You've completed your mindfulness practice.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record mindfulness session. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error recording mindfulness session:", error);
    },
  });
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start timer
  const startTimer = () => {
    setIsActive(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Timer completed
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Pause timer
  const pauseTimer = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  // Complete session
  const completeSession = () => {
    pauseTimer();
    
    // Calculate completed duration
    const completedDuration = duration - timeLeft;
    
    // Only record if at least 3 seconds completed
    if (completedDuration >= 3) {
      createSessionMutation.mutate(completedDuration);
    }
    
    onClose();
  };
  
  // Reset timer when modal is opened
  useEffect(() => {
    if (open) {
      setTimeLeft(duration);
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [open, duration]);
  
  // Clean up interval on unmount or close
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-secondary-100 sm:mx-0 sm:h-10 sm:w-10">
              <Sparkles className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <DialogTitle>Mindfulness Break</DialogTitle>
              <DialogDescription>
                Take a moment to center yourself. Focus on your breath and release any tension in your body.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-5 text-center">
          <div className="text-4xl font-bold text-secondary-600">
            {formatTime(timeLeft)}
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            {isActive ? (
              <Button 
                variant="outline" 
                onClick={pauseTimer}
              >
                Pause
              </Button>
            ) : (
              <Button 
                variant="default" 
                onClick={startTimer}
              >
                Start
              </Button>
            )}
          </div>
          <p className="mt-3 text-sm text-neutral-600">
            Close your eyes and follow your breath.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={completeSession}
            disabled={duration - timeLeft < 3} // Require at least 3 seconds of practice
          >
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
