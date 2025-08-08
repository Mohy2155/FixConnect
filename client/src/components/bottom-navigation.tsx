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
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-surface border-t border-gray-100 shadow-lg z-50">
      <div className="grid grid-cols-5 py-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location === path;
          
          return (
            <Link key={path} href={path}>
              <button 
                className={cn(
                  "relative flex flex-col items-center justify-center py-2 transition-colors",
                  isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                )}
                data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
                
                {badge && badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  </div>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
