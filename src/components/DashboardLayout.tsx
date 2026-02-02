import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Define paths that trigger "Focus Mode" (hiding the main app sidebar)
  const isFocusMode = location.pathname.startsWith('/agents/create') || 
                      location.pathname.startsWith('/agents/configure');

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    // Neutral background helps "floated" cards stand out
    <div className="h-screen flex bg-[#f9fafb] text-zinc-900 font-sans overflow-hidden">
      
      {/* 1. Main Sidebar: Completely hidden during focus mode */}
      {!isFocusMode && (
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Main Content Area: Flexes to fill 100% width when sidebar is gone */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
        isFocusMode ? "ml-0" : "" // Ensure no left margin in Focus Mode
      )}>
        {!isFocusMode && (
          <div className="lg:hidden sticky top-0 z-40 bg-[#f9fafb] border-b border-zinc-200/80 px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700"
            >
              <Menu size={18} />
              Menu
            </button>
          </div>
        )}
        {/* max-w-[1600px] allows the 7/5 grid in AgentForm to breathe */}
        <div className={cn(
          "mx-auto w-full",
          isFocusMode ? "max-w-full px-0" : "max-w-[1600px] p-6"
        )}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
