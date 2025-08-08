import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

export function Stars({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showNumber = false, 
  reviewCount,
  className 
}: StarsProps) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.floor(rating) 
                ? "fill-accent text-accent" 
                : "fill-none text-gray-300"
            )}
          />
        ))}
      </div>
      {showNumber && (
        <>
          <span className={cn("font-medium", textSizes[size])}>{rating}</span>
          {reviewCount !== undefined && (
            <span className={cn("text-gray-500", textSizes[size])}>
              ({reviewCount})
            </span>
          )}
        </>
      )}
    </div>
  );
}
