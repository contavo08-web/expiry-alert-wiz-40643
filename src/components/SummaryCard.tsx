import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorClass?: string;
}

const getCardStyles = (colorClass: string) => {
  const styles: Record<string, string> = {
    "text-expired": "bg-gradient-to-br from-expired/10 to-expired/5 border-expired/20 hover:border-expired/40",
    "text-warning": "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:border-warning/40",
    "text-success": "bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:border-success/40",
    "text-primary": "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40",
  };
  return styles[colorClass] || styles["text-primary"];
};

const getIconBackgroundStyles = (colorClass: string) => {
  const styles: Record<string, string> = {
    "text-expired": "bg-expired/10",
    "text-warning": "bg-warning/10",
    "text-success": "bg-success/10",
    "text-primary": "bg-primary/10",
  };
  return styles[colorClass] || styles["text-primary"];
};

export const SummaryCard = ({ title, value, icon: Icon, colorClass = "text-primary" }: SummaryCardProps) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2",
        getCardStyles(colorClass)
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-3 p-2 md:p-6">
        <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </CardTitle>
        <div className={cn(
          "p-1 md:p-2.5 rounded-md md:rounded-lg transition-transform duration-300 hover:scale-110",
          getIconBackgroundStyles(colorClass)
        )}>
          <Icon className={cn("h-3 w-3 md:h-5 md:w-5", colorClass)} />
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
        <div className={cn("text-xl md:text-3xl font-bold tracking-tight", colorClass)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
};
