import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Wrench, Zap, Snowflake, Tv, Brush, Sparkles } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string | null;
}

interface ServiceCategoriesProps {
  categories: ServiceCategory[];
  onCategorySelect: (category: ServiceCategory) => void;
  className?: string;
}

const iconMap: Record<string, any> = {
  'fas fa-faucet': Wrench,
  'fas fa-bolt': Zap,
  'fas fa-snowflake': Snowflake,
  'fas fa-tv': Tv,
  // Emoji to Lucide icon mappings
  '🚰': Wrench,
  '⚡': Zap,
  '❄️': Snowflake,
  '📺': Tv,
  '🧹': Sparkles,
  '🎨': Brush,
};

export function ServiceCategories({ 
  categories, 
  onCategorySelect, 
  className 
}: ServiceCategoriesProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {categories.map((category) => {
        const IconComponent = iconMap[category.icon];
        
        return (
          <Card 
            key={category.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCategorySelect(category)}
            data-testid={`card-category-${category.id}`}
          >
            <CardContent className="p-4 text-center">
              {IconComponent ? (
                <IconComponent 
                  className="h-8 w-8 mx-auto mb-2" 
                  style={{ color: category.color }}
                />
              ) : (
                <div 
                  className="h-8 w-8 mx-auto mb-2 flex items-center justify-center text-2xl"
                  style={{ color: category.color }}
                >
                  {category.icon}
                </div>
              )}
              <h4 className="font-medium text-gray-800 mb-1">
                {category.name}
              </h4>
              {category.description && (
                <p className="text-xs text-gray-500">
                  {category.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
