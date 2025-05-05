import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export function InsightCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-100",
  iconColor = "text-primary-600"
}: InsightCardProps) {
  return (
    <Card className="border border-neutral-200">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("p-3 rounded-lg", iconBgColor)}>
            <div className={cn("h-6 w-6", iconColor)}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
            <p className="text-2xl font-semibold text-neutral-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
