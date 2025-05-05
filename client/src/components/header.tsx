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
    <header className="bg-white shadow-sm border-b border-neutral-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              type="button" 
              className="md:hidden text-neutral-600 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 md:ml-0">
              <h2 className="text-lg font-medium text-neutral-900">{pageTitle}</h2>
              <p className="text-sm text-neutral-500">{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button" 
                  className="rounded-full bg-white p-1 text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Bell className="h-6 w-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Complete your morning meditation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  2 high priority tasks due today
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary-600">
                  See all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button" 
                  className="rounded-full bg-white p-1 text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Settings className="h-6 w-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-neutral-700 hidden sm:block">
                    Sarah Johnson
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sarah Johnson</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Account settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
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
