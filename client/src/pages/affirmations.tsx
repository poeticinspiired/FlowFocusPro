import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, RefreshCw, Heart, Edit, Trash2, Share2 } from "lucide-react";

export default function Affirmations() {
  const [affirmationText, setAffirmationText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Sample affirmations
  const [affirmations, setAffirmations] = useState([
    {
      id: 1,
      text: "I am capable of creating positive change in my life and work",
      isFavorite: true,
    },
    {
      id: 2,
      text: "My neurodivergent mind gives me unique perspectives and creative solutions",
      isFavorite: false,
    },
    {
      id: 3,
      text: "I embrace my authentic self and honor my natural rhythms",
      isFavorite: true,
    },
    {
      id: 4,
      text: "I am present in this moment, aware and accepting",
      isFavorite: false,
    },
    {
      id: 5,
      text: "Each task I complete is a meaningful step toward my goals",
      isFavorite: false,
    },
  ]);
  
  // Sample recommended affirmations
  const recommendedAffirmations = [
    "I trust my intuition and inner wisdom",
    "I am worthy of success and happiness",
    "My focus improves each day",
    "I celebrate my progress, no matter how small",
    "I am exactly where I need to be on my journey",
    "My productivity flows naturally when I honor my needs",
  ];
  
  // Add a new affirmation
  const handleAddAffirmation = () => {
    if (affirmationText.trim()) {
      setAffirmations([
        ...affirmations,
        {
          id: Date.now(),
          text: affirmationText,
          isFavorite: false,
        },
      ]);
      setAffirmationText("");
      setIsDialogOpen(false);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setAffirmations(
      affirmations.map((affirmation) =>
        affirmation.id === id
          ? { ...affirmation, isFavorite: !affirmation.isFavorite }
          : affirmation
      )
    );
  };
  
  // Delete an affirmation
  const deleteAffirmation = (id: number) => {
    setAffirmations(affirmations.filter((affirmation) => affirmation.id !== id));
  };
  
  // Get a random affirmation
  const getRandomAffirmation = () => {
    // Implementation for daily affirmation feature
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex]?.text || "I am capable and worthy";
  };
  
  // Add recommended affirmation
  const addRecommendedAffirmation = (text: string) => {
    setAffirmations([
      ...affirmations,
      {
        id: Date.now(),
        text,
        isFavorite: false,
      },
    ]);
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-neutral-900">Daily Affirmation</h2>
            <p className="text-xl font-medium text-primary-700 italic">
              "{getRandomAffirmation()}"
            </p>
            <Button 
              variant="outline"
              className="mt-2 bg-white"
              onClick={() => setAffirmations([...affirmations])} // Trigger re-render
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Affirmation
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Affirmations</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Affirmation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Affirmation</DialogTitle>
              <DialogDescription>
                Add a positive affirmation to support your well-being and mindfulness practice.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={affirmationText}
              onChange={(e) => setAffirmationText(e.target.value)}
              placeholder="Enter your affirmation..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button onClick={handleAddAffirmation}>Save Affirmation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {affirmations.map((affirmation) => (
          <Card key={affirmation.id}>
            <CardContent className="p-5">
              <div className="flex justify-between">
                <p className="text-neutral-800">{affirmation.text}</p>
                <div className="flex ml-4 space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-auto ${
                      affirmation.isFavorite ? "text-red-500" : "text-neutral-400"
                    }`}
                    onClick={() => toggleFavorite(affirmation.id)}
                  >
                    <Heart className="h-4 w-4" fill={affirmation.isFavorite ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto text-neutral-400 hover:text-neutral-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto text-neutral-400 hover:text-red-600"
                    onClick={() => deleteAffirmation(affirmation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recommended Affirmations</CardTitle>
          <CardDescription>
            Positive statements designed for neurodivergent minds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendedAffirmations.map((text, index) => (
              <div 
                key={index} 
                className="flex items-start p-3 border rounded-lg hover:bg-neutral-50"
              >
                <div className="flex-1">
                  <p className="text-neutral-800">{text}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 p-1 h-auto text-neutral-400 hover:text-primary-600"
                  onClick={() => addRecommendedAffirmation(text)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
