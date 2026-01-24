import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  // Define paths that trigger "Focus Mode" (hiding the main app sidebar)
  const isFocusMode = location.pathname.startsWith('/agents/create') || 
                      location.pathname.startsWith('/agents/configure');

  return (
    // Neutral background helps "floated" cards stand out
    <div className="h-screen flex bg-[#f9fafb] text-zinc-900 font-sans overflow-hidden">
      
      {/* 1. Main Sidebar: Completely hidden during focus mode */}
      {!isFocusMode && <Sidebar />}

      {/* 2. Main Content Area: Flexes to fill 100% width when sidebar is gone */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
        isFocusMode ? "ml-0" : "" // Ensure no left margin in Focus Mode
      )}>
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