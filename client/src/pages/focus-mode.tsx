import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Zap
} from "lucide-react";
import { MindfulnessTip } from "@/components/mindfulness-tip";

export default function FocusMode() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = 1; // Default user ID for demo purposes
  
  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds (Pomodoro)
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionType, setSessionType] = useState<"focus" | "break">("focus");
  const countRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sound states
  const [isMuted, setIsMuted] = useState(false);
  const [ambientSound, setAmbientSound] = useState<"rain" | "forest" | "cafe" | "none">("none");
  
  // Record focus session mutation
  const recordFocusSessionMutation = useMutation({
    mutationFn: async (duration: number) => {
      const response = await apiRequest('POST', '/api/mindfulness/sessions', {
        userId,
        duration,
        type: "focus",
        completed: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Focus session recorded",
        description: "Your focus session has been recorded successfully.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record focus session. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error recording focus session:", error);
    },
  });
  
  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const total = sessionType === "focus" ? 25 * 60 : 5 * 60;
    const remaining = time;
    return 100 - Math.round((remaining / total) * 100);
  };
  
  // Start timer
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    countRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          // Timer finished
          clearInterval(countRef.current!);
          handleTimerComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Pause timer
  const handlePause = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
      countRef.current = null;
    }
    setIsPaused(true);
  };
  
  // Resume timer
  const handleResume = () => {
    setIsPaused(false);
    countRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countRef.current!);
          handleTimerComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Reset timer
  const handleReset = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
      countRef.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
    setTime(sessionType === "focus" ? 25 * 60 : 5 * 60);
  };
  
  // Skip current session
  const handleSkip = () => {
    if (sessionType === "focus") {
      // Record partial focus session
      if (isActive && !isPaused) {
        const focusDuration = 25 * 60 - time;
        if (focusDuration >= 60) { // Only record if at least 1 minute
          recordFocusSessionMutation.mutate(focusDuration);
        }
      }
      
      // Switch to break
      setSessionType("break");
      setTime(5 * 60); // 5-minute break
    } else {
      // Switch to focus
      setSessionType("focus");
      setTime(25 * 60); // 25-minute focus
    }
    
    // Reset timer state
    if (countRef.current) {
      clearInterval(countRef.current);
      countRef.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
  };
  
  // Handle timer completion
  const handleTimerComplete = () => {
    if (sessionType === "focus") {
      // Record focus session
      recordFocusSessionMutation.mutate(25 * 60);
      setSessionCount(prev => prev + 1);
      
      // Play sound
      if (!isMuted) {
        const audio = new Audio('/sounds/complete.mp3');
        audio.play();
      }
      
      // Show notification
      toast({
        title: "Focus session complete!",
        description: "Great job! Take a short break before your next focus session.",
        duration: 5000,
      });
      
      // Switch to break
      setSessionType("break");
      setTime(5 * 60); // 5-minute break
    } else {
      // Switch back to focus
      setSessionType("focus");
      setTime(25 * 60); // 25-minute focus
      
      // Show notification
      toast({
        title: "Break complete!",
        description: "Time to focus again!",
        duration: 3000,
      });
    }
    
    setIsActive(false);
    setIsPaused(false);
  };
  
  // Toggle mute
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Set ambient sound
  const handleSetAmbientSound = (sound: "rain" | "forest" | "cafe" | "none") => {
    setAmbientSound(sound);
    // In a real implementation, we would play the sound here
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (countRef.current) {
        clearInterval(countRef.current);
      }
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Focus Mode</CardTitle>
          <CardDescription className="text-center">
            Enhance productivity with timed focus sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200 mb-6">
              <div className="text-center mb-6">
                <Badge className={sessionType === "focus" ? "bg-primary-100 text-primary-800" : "bg-secondary-100 text-secondary-800"}>
                  {sessionType === "focus" ? "Focus Session" : "Break Time"}
                </Badge>
                <div className="text-6xl font-bold mt-4 font-mono">
                  {formatTime()}
                </div>
                <div className="mt-4">
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mb-6">
                {!isActive && !isPaused ? (
                  <Button onClick={handleStart} className="px-8">
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                ) : isPaused ? (
                  <Button onClick={handleResume} className="px-8">
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={handlePause} variant="outline" className="px-8">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button onClick={handleSkip} variant="outline">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-neutral-600 mb-2">
                  Sessions completed today: <span className="font-semibold">{sessionCount}</span>
                </div>
                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleToggleMute}
                    className="text-neutral-500"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Ambient Sounds */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
              <h3 className="text-lg font-medium mb-4">Ambient Sounds</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant={ambientSound === "rain" ? "default" : "outline"} 
                  className="h-auto py-2"
                  onClick={() => handleSetAmbientSound("rain")}
                >
                  Rain
                </Button>
                <Button 
                  variant={ambientSound === "forest" ? "default" : "outline"} 
                  className="h-auto py-2"
                  onClick={() => handleSetAmbientSound("forest")}
                >
                  Forest
                </Button>
                <Button 
                  variant={ambientSound === "cafe" ? "default" : "outline"} 
                  className="h-auto py-2"
                  onClick={() => handleSetAmbientSound("cafe")}
                >
                  Café
                </Button>
                <Button 
                  variant={ambientSound === "none" ? "default" : "outline"} 
                  className="h-auto py-2"
                  onClick={() => handleSetAmbientSound("none")}
                >
                  None
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Focus Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Zap className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                <span>Start with a clear intention for each focus session</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                <span>Remove distractions from your environment before starting</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                <span>Take deep breaths before each session to center yourself</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                <span>Use the 5-minute breaks to stretch and reset your mind</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                <span>Consider journaling insights that arise during focus time</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mindfulness Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <MindfulnessTip />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
