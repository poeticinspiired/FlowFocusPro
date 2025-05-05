import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Calendar, Edit, Plus } from "lucide-react";

export default function Journals() {
  const [activeTab, setActiveTab] = useState("daily");
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  
  // Handle journal submission
  const handleSubmitJournal = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we would save the journal entry
    // For now, just reset the form
    setJournalTitle("");
    setJournalContent("");
    alert("Journal feature is coming soon! This is a placeholder implementation.");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Journals</CardTitle>
              <CardDescription>
                Record your thoughts, reflections, and spiritual journey
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
              <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Journal</CardTitle>
                  <CardDescription>
                    Reflect on your day and capture your thoughts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitJournal}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Entry Title</Label>
                        <Input 
                          id="title" 
                          placeholder="Today's reflection" 
                          value={journalTitle}
                          onChange={(e) => setJournalTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="content">Your thoughts</Label>
                        <Textarea 
                          id="content" 
                          placeholder="Write about your day, feelings, and thoughts..." 
                          className="min-h-[200px]"
                          value={journalContent}
                          onChange={(e) => setJournalContent(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Save Entry
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Recent Entries</h3>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">Finding balance</CardTitle>
                        <div className="text-sm text-neutral-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>May 15, 2024</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-600 line-clamp-3">
                        Today I practiced mindfulness during my morning routine. I noticed how rushing creates unnecessary stress. Taking those extra moments to be present actually made me more effective throughout the day.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">Creative breakthrough</CardTitle>
                        <div className="text-sm text-neutral-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>May 12, 2024</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-600 line-clamp-3">
                        I struggled with a design problem for days. After a short meditation session, the solution came to me effortlessly. There's something powerful about giving the mind space to process.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="gratitude" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gratitude Journal</CardTitle>
                  <CardDescription>
                    Record things you're thankful for each day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-neutral-600">
                      The gratitude journal feature is still in development. 
                      Check back soon for updates!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="spiritual" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spiritual Journal</CardTitle>
                  <CardDescription>
                    Document your spiritual growth and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-neutral-600">
                      The spiritual journal feature is still in development. 
                      Check back soon for updates!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
