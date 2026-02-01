import { AgentSummary } from '@/types/agentList';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { getAllAgentsData } from '../api/client';
import { useAuth } from './AuthContext';

interface PaginationState {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

interface AppContextType {
  // Updated from [] to AgentSummary[]
  agents: AgentSummary[]; 
  loading: boolean;
  error: string | null;
  fetchAgents: (page?: number, size?: number) => Promise<void>;
  pagination: PaginationState;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  // Refactored state initialization
  const [agents, setAgents] = useState<AgentSummary[]>([]); 
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  const fetchAgents = useCallback(async (page: number = 0, size: number = 10) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getAllAgentsData(page, size);
      
      // Handle potential Page<T> vs List<T> response
      if (Array.isArray(response.data)) {
        setAgents(response.data);
        // Fallback for raw list response - we don't know total pages
        setPagination({ page, size, totalPages: 0, totalElements: 0 });
      } else if (response.data && response.data.content) {
        // Standard Spring Page response
        setAgents(response.data.content);
        setPagination({
          page: response.data.number ?? page,
          size: response.data.size ?? size,
          totalPages: response.data.totalPages ?? 0,
          totalElements: response.data.totalElements ?? 0
        });
      } else {
        // Fallback if structure is unexpected
        setAgents([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch agents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);
  return (
    <AppContext.Provider
      value={{
        agents,
        loading,
        error,
        fetchAgents,
        pagination,
        isProfileModalOpen,
        setIsProfileModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};