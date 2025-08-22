import { cn } from "@/lib/utils";
import { Home, Search, List, MessageCircle, User } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

interface BottomNavigationProps {
  unreadCount?: number;
}

export function BottomNavigation({ unreadCount = 0 }: BottomNavigationProps) {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/jobs", icon: List, label: "My Jobs" },
    { path: "/messages", icon: MessageCircle, label: "Messages", badge: unreadCount },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-2 left-2 right-2 flex justify-center z-navigation">
      <nav className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 px-3 py-2 max-w-sm w-full">
        <div className="grid grid-cols-5 gap-0">
          {navItems.map(({ path, icon: Icon, label, badge }) => {
            const isActive = location === path;
            
            return (
              <Link key={path} href={path}>
                <button 
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ease-in-out",
                    isActive 
                      ? "text-primary bg-primary/10 dark:bg-primary/20 scale-105" 
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className={cn(
                    "h-4 w-4 mb-1 transition-transform duration-200",
                    isActive ? "scale-110" : "scale-100"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-all duration-200",
                    isActive ? "font-semibold" : "font-normal"
                  )}>
                    {label}
                  </span>
                  
                  {badge && badge > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-bold leading-none">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    </div>
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
