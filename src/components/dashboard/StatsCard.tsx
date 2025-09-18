import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant: "revenue" | "profit" | "warning" | "success";
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({ title, value, icon, variant, trend }: StatsCardProps) {
  const variantStyles = {
    revenue: "bg-gradient-to-br from-revenue to-blue-600 text-revenue-foreground shadow-[var(--shadow-revenue)]",
    profit: "bg-gradient-to-br from-profit to-green-600 text-profit-foreground shadow-[var(--shadow-profit)]",
    warning: "bg-gradient-to-br from-warning to-orange-500 text-warning-foreground shadow-[var(--shadow-warning)]",
    success: "bg-gradient-to-br from-success to-emerald-600 text-success-foreground shadow-[var(--shadow-profit)]",
  };

  return (
    <Card className={cn(
      "p-6 border-0 transition-all duration-300 hover:scale-105",
      variantStyles[variant]
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className="text-sm opacity-75 mt-2">
              <span className={cn(
                "font-medium",
                trend.value > 0 ? "text-green-200" : "text-red-200"
              )}>
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
              {" "}{trend.label}
            </p>
          )}
        </div>
        <div className="ml-4 opacity-90">
          {icon}
        </div>
      </div>
    </Card>
  );
}