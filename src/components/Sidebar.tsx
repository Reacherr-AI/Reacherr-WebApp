
import {
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Users
} from 'lucide-react';
import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';

import UserMenu from '@/components/userMenu';
import { AuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type SidebarProps = {
  isMobileOpen: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const auth = useContext(AuthContext);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Dynamic classes for NavLinks
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 overflow-hidden whitespace-nowrap",
      isActive
        ? "bg-gray-700 text-white"
        : "text-gray-400 hover:bg-gray-800 hover:text-white",
      isCollapsed ? "lg:justify-center lg:px-0" : "px-4"
    );

  // Helper for Section Headers
  const SectionHeader = ({ title }: { title: string }) => (
    <h4 className={cn(
      "px-4 mb-2 mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-opacity duration-300",
      isCollapsed ? "lg:opacity-0 lg:h-0 lg:mt-0" : "opacity-100"
    )}>
      {title}
    </h4>
  );

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col bg-[#0f1115] min-h-screen border-r border-gray-800 transition-all duration-300 ease-in-out z-50",
          "lg:static lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-64 lg:w-20" : "w-64"
        )}
      >
      {/* 1. TOP HEADER: Brand & Toggle */}
      <div className={cn(
        "flex items-center justify-between px-6 py-6 border-b border-gray-800/50",
        isCollapsed && "lg:px-0 lg:justify-center"
      )}>
        {(!isCollapsed || isMobileOpen) && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">Reacherr AI</h1>
            <p className="text-[10px] font-medium text-gray-500 mt-1 uppercase tracking-wider">
              V 1.0.2
            </p>
          </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={cn(
            "hidden lg:inline-flex p-2 rounded-md text-gray-500 hover:text-white hover:bg-gray-800 transition-colors",
            isCollapsed ? "mt-2" : ""
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* 2. NAVIGATION AREA */}
      <nav className="flex-1 px-3 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* BUILD SECTION */}
        <div className="mb-4">
          <SectionHeader title="Build" />
          <NavLink to="/agents" className={navLinkClasses} onClick={onClose}>
            <Users className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span className="animate-in slide-in-from-left-2">Agents</span>}
          </NavLink>
        </div>

        {/* DEPLOY SECTION */}
        <div className="mb-4">
          <SectionHeader title="Deploy" />
          <NavLink to="/phoneNumbers" className={navLinkClasses} onClick={onClose}>
            <Phone className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span className="animate-in slide-in-from-left-2">Phone Numbers</span>}
          </NavLink>
        </div>

      </nav>
      
      {/* 3. FOOTER: User Menu & Help */}
      <div className="mt-auto border-t border-gray-800 bg-[#0f1115]">
        <div className={cn("p-2", isCollapsed ? "flex justify-center" : "px-3 py-4")}>
          <UserMenu isCollapsed={isCollapsed} />
        </div>

        <div className="border-t border-gray-800 p-2">
          <a
            href="mailto:support@callie.in"
            className={navLinkClasses({ isActive: false })}
          >
            <HelpCircle className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Help & Feedback</span>}
          </a>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
