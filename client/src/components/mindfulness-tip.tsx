import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MindfulnessModal } from "./mindfulness-modal";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MindfulnessTip() {
  const [modalOpen, setModalOpen] = useState(false);
  const userId = 1; // Default to user ID 1 for demo

  // Fetch a random mindfulness tip
  const { data, isLoading } = useQuery({
    queryKey: ['/api/mindfulness/tips'],
    queryFn: () => fetch(`/api/mindfulness/tips?type=daily`).then(res => res.json()),
  });

  const tip = data?.data?.content || "Before starting your next task, take three deep breaths. Inhale peace, exhale tension. Notice how your body feels in this moment.";

  return (
    <>
      <div className="bg-secondary-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-secondary-400 rounded-full mr-2"></div>
          <p className="text-sm font-medium text-secondary-700">Mindfulness Reminder</p>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          {isLoading ? "Loading mindfulness tip..." : tip}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-xs font-medium text-secondary-600 hover:text-secondary-800 px-0"
          onClick={() => setModalOpen(true)}
        >
          <Play className="h-3 w-3 mr-1" />
          Start 2-min meditation
        </Button>
      </div>

      <MindfulnessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        duration={120} // 2 minutes in seconds
      />
    </>
  );
}
