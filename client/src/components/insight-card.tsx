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
  iconBgColor = "bg-primary",
  iconColor = "text-primary-foreground"
}: InsightCardProps) {
  return (
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <p className="text-3xl font-bold tech-text-gradient">{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl", iconBgColor)}>
          <div className={cn("h-6 w-6", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </CardContent>
  );
}
