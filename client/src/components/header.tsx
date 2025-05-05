import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings, Menu } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface HeaderProps {
  toggleSidebar: () => void;
  currentPath: string;
}

export default function Header({ toggleSidebar, currentPath }: HeaderProps) {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [currentDate, setCurrentDate] = useState<string>("");
  
  useEffect(() => {
    // Set current date
    setCurrentDate(format(new Date(), "EEEE, MMMM d, yyyy"));
    
    // Set page title based on current path
    switch (currentPath) {
      case "/":
        setPageTitle("Dashboard");
        break;
      case "/tasks":
        setPageTitle("Tasks");
        break;
      case "/categories":
        setPageTitle("Categories");
        break;
      case "/journals":
        setPageTitle("Journals");
        break;
      case "/focus-mode":
        setPageTitle("Focus Mode");
        break;
      case "/meditations":
        setPageTitle("Meditations");
        break;
      case "/affirmations":
        setPageTitle("Affirmations");
        break;
      default:
        setPageTitle("Dashboard");
    }
  }, [currentPath]);
  
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              type="button" 
              className="md:hidden bg-muted/50 hover:bg-muted text-foreground p-2 rounded-xl transition-colors duration-200"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-4 md:ml-0">
              <h2 className="text-xl font-bold tech-text-gradient">{pageTitle}</h2>
              <p className="text-sm text-muted-foreground">{currentDate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Notification button with animated indicator */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button" 
                  className="relative rounded-xl bg-card p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent pulse-animation"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-card">
                <DropdownMenuLabel className="tech-text-gradient font-bold">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover-lift space-y-1 py-2">
                  <p className="font-medium">Complete your morning meditation</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover-lift space-y-1 py-2">
                  <p className="font-medium">2 high priority tasks due today</p>
                  <p className="text-xs text-muted-foreground">20 minutes ago</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center tech-text-gradient font-medium">
                  See all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Settings button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button" 
                  className="rounded-xl bg-card p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 glass-card">
                <DropdownMenuLabel className="tech-text-gradient font-bold">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover-lift">Profile</DropdownMenuItem>
                <DropdownMenuItem className="hover-lift">Preferences</DropdownMenuItem>
                <DropdownMenuItem className="hover-lift">Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive hover-lift">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center px-1.5 py-1 rounded-xl hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">SJ</AvatarFallback>
                  </Avatar>
                  <div className="ml-2 hidden sm:block text-left">
                    <p className="text-sm font-semibold">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Premium Plan</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 glass-card">
                <div className="flex items-center p-2 space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">sarah.johnson@example.com</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover-lift">Profile</DropdownMenuItem>
                <DropdownMenuItem className="hover-lift">Account settings</DropdownMenuItem>
                <DropdownMenuItem className="hover-lift">Subscription</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive hover-lift">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
