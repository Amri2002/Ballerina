import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  variant?: "default" | "highlight";
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className,
  variant = "default" 
}: FeatureCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        variant === "highlight" && "bg-accent-gradient border-accent/20",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
          variant === "highlight" 
            ? "bg-white/20 text-white" 
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        )}>
          {icon}
        </div>
        <CardTitle className={cn(
          "text-lg font-semibold",
          variant === "highlight" && "text-white"
        )}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className={cn(
          "text-sm leading-relaxed",
          variant === "highlight" && "text-white/80"
        )}>
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}