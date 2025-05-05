import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChartTimeframe } from "@shared/types";

interface FocusChartProps {
  userId: number;
}

export function FocusChart({ userId }: FocusChartProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("day");
  
  // Fetch productivity data for the chart
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/productivity', { userId, timeframe }],
    queryFn: () => fetch(`/api/dashboard/productivity?userId=${userId}&timeframe=${timeframe}`).then(res => res.json()),
  });
  
  // Sample data for chart visualization
  // In a real implementation, this would come from the API
  const sampleData = [
    { hour: 8, score: 20 },
    { hour: 9, score: 40 },
    { hour: 10, score: 80 },
    { hour: 11, score: 65 },
    { hour: 12, score: 45 },
    { hour: 13, score: 30 },
    { hour: 14, score: 50 },
  ];
  
  const chartData = data?.data?.hourlyData || sampleData;
  
  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as ChartTimeframe);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Focus Patterns</h3>
        <div className="relative">
          <Select 
            value={timeframe} 
            onValueChange={handleTimeframeChange}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-40 w-full animate-pulse bg-neutral-100 rounded"></div>
      ) : (
        <div className="h-40 w-full">
          {/* Simplified Chart Visualization */}
          <div className="h-full flex items-end justify-between space-x-1 px-2">
            {chartData.map((item: any, index: number) => (
              <div key={index} className="w-full h-full flex flex-col justify-end">
                <div className="text-xs text-neutral-500 text-center mb-1">
                  {item.hour} {item.hour < 12 ? "AM" : item.hour === 12 ? "PM" : (item.hour - 12) + " PM"}
                </div>
                <div
                  className={`rounded-t w-full ${
                    item.score > 70
                      ? "bg-primary-600"
                      : item.score > 50
                      ? "bg-primary-500"
                      : item.score > 30
                      ? "bg-primary-400"
                      : "bg-primary-300"
                  }`}
                  style={{ height: `${item.score}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 flex items-center text-xs text-neutral-500 justify-center">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-primary-500 rounded-full mr-1"></div>
          <span>Focus Level</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-200 rounded-full mr-1"></div>
          <span>Rest Period</span>
        </div>
      </div>
    </div>
  );
}
