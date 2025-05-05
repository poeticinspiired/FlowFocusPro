import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CheckCircle, 
  Grid3X3, 
  BookOpen, 
  Zap, 
  Moon, 
  MessageSquareText 
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { MindfulnessTip } from "./mindfulness-tip";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const isMobile = useMobile();
  
  // If on mobile and sidebar is closed, don't render the sidebar
  if (isMobile && !isOpen) {
    return null;
  }
  
  return (
    <aside 
      className={cn(
        "bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 h-auto md:h-screen overflow-auto transition-all duration-300 z-20",
        isMobile ? (isOpen ? "w-full fixed inset-0" : "hidden") : "w-72"
      )}
    >
      <div className="p-6 border-b border-sidebar-border relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-3">
          {/* Logo with gradient effect */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
            </svg>
          </div>
          {/* Gradient text for logo */}
          <h1 className="text-2xl font-bold tech-text-gradient">FlowFocus</h1>
          
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="ml-auto p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:bg-opacity-10 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">Next-gen Productivity</p>
        
        {/* Decorative orb - Silicon Valley style */}
        <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-primary opacity-10 blur-xl"></div>
      </div>
      
      <nav className="p-5">
        <ul className="space-y-2">
          <li>
            <NavLink to="/" icon={<LayoutDashboard className="w-5 h-5 mr-3" />} label="Dashboard" />
          </li>
          <li>
            <NavLink to="/tasks" icon={<CheckCircle className="w-5 h-5 mr-3" />} label="Tasks" />
          </li>
          <li>
            <NavLink to="/categories" icon={<Grid3X3 className="w-5 h-5 mr-3" />} label="Categories" />
          </li>
          <li>
            <NavLink to="/journals" icon={<BookOpen className="w-5 h-5 mr-3" />} label="Journals" />
          </li>
          <li>
            <NavLink to="/focus-mode" icon={<Zap className="w-5 h-5 mr-3" />} label="Focus Mode" />
          </li>
        </ul>
        
        <div className="mt-10">
          <h3 className="px-3 text-xs font-semibold text-sidebar-accent uppercase tracking-wider mb-3">Mindfulness</h3>
          <ul className="space-y-2">
            <li>
              <NavLink to="/meditations" icon={<Moon className="w-5 h-5 mr-3" />} label="Meditations" />
            </li>
            <li>
              <NavLink to="/affirmations" icon={<MessageSquareText className="w-5 h-5 mr-3" />} label="Affirmations" />
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-5 mt-auto border-t border-sidebar-border bg-gradient-to-br from-transparent to-sidebar-accent to-5%">
        <MindfulnessTip />
      </div>
    </aside>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavLink({ to, icon, label }: NavLinkProps) {
  // Get current location to determine if the link is active
  const [location] = useLocation();
  const isActive = location === to;
  
  return (
    <Link href={to}>
      <div 
        className={cn(
          "flex items-center py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 relative group",
          isActive 
            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:bg-opacity-10"
        )}
      >
        {/* Icon with animation */}
        <div className={cn(
          "flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
          isActive ? "text-sidebar-primary-foreground" : "text-sidebar-accent"
        )}>
          {icon}
        </div>
        
        {/* Label with possible gradient effect on active */}
        <span className={cn(
          "transition-colors duration-200",
          isActive && "tech-text-gradient font-semibold"
        )}>
          {label}
        </span>
        
        {/* Active indicator - pill */}
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-r-full"></div>
        )}
      </div>
    </Link>
  );
}
