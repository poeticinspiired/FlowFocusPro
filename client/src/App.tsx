import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Categories from "@/pages/categories";
import Journals from "@/pages/journals";
import FocusMode from "@/pages/focus-mode";
import Meditations from "@/pages/meditations";
import Affirmations from "@/pages/affirmations";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useState } from "react";

function Router() {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Toggle sidebar function for mobile view
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} currentPath={location} />
        
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Add a decorative gradient orb - Silicon Valley design element */}
          <div className="fixed top-[15%] right-[10%] w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-secondary opacity-5 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/tasks" component={Tasks} />
              <Route path="/categories" component={Categories} />
              <Route path="/journals" component={Journals} />
              <Route path="/focus-mode" component={FocusMode} />
              <Route path="/meditations" component={Meditations} />
              <Route path="/affirmations" component={Affirmations} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [userId, setUserId] = useState<number>(1); // Default to user ID 1 for demo
  
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
