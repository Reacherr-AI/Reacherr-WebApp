import React, { useContext } from 'react';
import {
  CreditCard,
  KeyRound,
  LogOut,
  Moon
} from 'lucide-react';

// Shadcn UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { AuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// Define the interface to accept the isCollapsed prop
interface UserMenuProps {
  isCollapsed: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ isCollapsed }) => {
  const auth = useContext(AuthContext);
  
  const handleLogout = () => {
    if (auth) auth.logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-all text-left group",
          isCollapsed ? "justify-center px-0" : "px-2"
        )}>
          {/* Avatar Circle */}
          <div className="h-9 w-9 rounded bg-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            R
            {/* {auth?.user?.name?.charAt(0) || 'R'} */}
          </div>
          
          {/* Hide text details when collapsed */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="text-sm font-semibold text-zinc-200 truncate">
                Raj Gudimetla
                {/* {auth?.user?.name || 'Raj Gudimetla'} */}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {auth?.user?.email || 'No active session'}
             </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-64 mb-2 ml-4 bg-white border-zinc-200" 
        align="end" 
        side="right"
      >
        <DropdownMenuLabel className="text-xs font-medium text-zinc-500 px-3 py-2">
          Account Settings
        </DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
            <Moon size={16} className="text-zinc-500" />
            <span className="text-sm">Dark Mode</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
            <CreditCard size={16} className="text-zinc-500" />
            <span className="text-sm">Billing</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
            <KeyRound size={16} className="text-zinc-500" />
            <span className="text-sm">Change Password</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-zinc-100" />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut size={16} />
          <span className="text-sm font-semibold">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;