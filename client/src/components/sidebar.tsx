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
        "bg-white border-r border-neutral-200 flex-shrink-0 h-auto md:h-screen overflow-auto transition-all duration-300 z-20",
        isMobile ? (isOpen ? "w-full fixed inset-0" : "hidden") : "w-64"
      )}
    >
      <div className="p-5 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
          </svg>
          <h1 className="text-xl font-semibold text-neutral-900">FlowFocus</h1>
          
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="ml-auto p-2 rounded-md text-neutral-600 hover:text-neutral-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-neutral-500 mt-1">Spiritual Productivity</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
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
        
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mindfulness</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <NavLink to="/meditations" icon={<Moon className="w-5 h-5 mr-3" />} label="Meditations" />
            </li>
            <li>
              <NavLink to="/affirmations" icon={<MessageSquareText className="w-5 h-5 mr-3" />} label="Affirmations" />
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-neutral-200">
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
          "flex items-center p-3 rounded-lg cursor-pointer",
          isActive 
            ? "text-primary-500 bg-primary-50 font-medium" 
            : "text-neutral-700 hover:bg-neutral-100"
        )}
      >
        {icon}
        {label}
      </div>
    </Link>
  );
}
