import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MindfulnessModal } from "@/components/mindfulness-modal";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Heart, Moon, Sun } from "lucide-react";
import { MindfulnessStreak } from "@/components/mindfulness-streak";

interface MeditationProps {
  id: number;
  title: string;
  duration: number;
  description: string;
  type: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export default function Meditations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = 1; // Default user ID for demo purposes
  
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationProps | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Fetch meditations
  const { data, isLoading } = useQuery({
    queryKey: ['/api/mindfulness/activities'],
    queryFn: () => fetch('/api/mindfulness/activities').then(res => res.json()),
  });
  
  // Sample meditations data
  const meditations = data?.data || [
    {
      id: 1,
      title: "Morning Clarity",
      duration: 300, // 5 minutes
      description: "Start your day with clear intentions and focused awareness",
      type: "morning",
      difficulty: "beginner"
    },
    {
      id: 2,
      title: "Quick Centering",
      duration: 120, // 2 minutes
      description: "A brief reset for busy moments during the day",
      type: "anytime",
      difficulty: "beginner"
    },
    {
      id: 3,
      title: "Deep Breathing",
      duration: 480, // 8 minutes
      description: "Focus on breath to restore calm and balance",
      type: "anytime",
      difficulty: "intermediate"
    },
    {
      id: 4,
      title: "Evening Wind Down",
      duration: 600, // 10 minutes
      description: "Release the day's tensions and prepare for restful sleep",
      type: "evening",
      difficulty: "intermediate"
    },
    {
      id: 5,
      title: "Body Scan Relaxation",
      duration: 900, // 15 minutes
      description: "Progressive relaxation through mindful body awareness",
      type: "anytime",
      difficulty: "advanced"
    }
  ];
  
  // Open mindfulness modal for a specific meditation
  const startMeditation = (meditation: MeditationProps) => {
    setSelectedMeditation(meditation);
    setModalOpen(true);
  };
  
  // Close mindfulness modal
  const closeMeditationModal = () => {
    setModalOpen(false);
    setSelectedMeditation(null);
  };
  
  // Format duration in minutes
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };
  
  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "morning":
        return <Sun className="h-4 w-4 mr-1" />;
      case "evening":
        return <Moon className="h-4 w-4 mr-1" />;
      case "anytime":
      default:
        return <Heart className="h-4 w-4 mr-1" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Mindfulness Meditations</CardTitle>
              <CardDescription>
                Guided practices to calm your mind and improve focus
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-40 bg-neutral-100 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meditations.map((meditation: MeditationProps) => (
                <Card key={meditation.id} className="border-2 hover:border-primary-200 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg mb-1">{meditation.title}</h3>
                        <p className="text-neutral-600 text-sm mb-2">{meditation.description}</p>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center text-sm text-neutral-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(meditation.duration)}
                          </div>
                          <Badge className={getDifficultyColor(meditation.difficulty || 'beginner')}>
                            {meditation.difficulty ? meditation.difficulty.charAt(0).toUpperCase() + meditation.difficulty.slice(1) : 'Beginner'}
                          </Badge>
                          <Badge variant="outline" className="flex items-center">
                            {getTypeIcon(meditation.type || 'anytime')}
                            {meditation.type ? meditation.type.charAt(0).toUpperCase() + meditation.type.slice(1) : 'Anytime'}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="flex-shrink-0"
                        onClick={() => startMeditation(meditation)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Begin
                      </Button>
                    </div>
                    <Progress value={33} className="h-1" />
                    <div className="text-xs text-neutral-500 mt-1">
                      Last practiced 2 days ago
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <MindfulnessStreak userId={userId} />
      
      {selectedMeditation && (
        <MindfulnessModal
          open={modalOpen}
          onClose={closeMeditationModal}
          userId={userId}
          duration={selectedMeditation.duration}
          activityId={selectedMeditation.id}
        />
      )}
    </div>
  );
}
