import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

export function Stars({
  rating,
  size = "md",
  showNumber = false,
  reviewCount,
  className,
}: StarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const stars = Array.from({ length: 5 }, (_, i) => {
    const starNumber = i + 1;
    const isFilled = starNumber <= Math.floor(rating);
    const isHalfFilled = starNumber === Math.ceil(rating) && rating % 1 !== 0;

    return (
      <Star
        key={i}
        className={cn(
          sizeClasses[size],
          isFilled || isHalfFilled
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        )}
      />
    );
  });

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex">{stars}</div>
      {showNumber && (
        <div className={cn("flex items-center space-x-1", textSizeClasses[size])}>
          <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className="text-gray-500">({reviewCount})</span>
          )}
        </div>
      )}
    </div>
  );
}