import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { AgentResponseDto } from '../components/AgentForm/AgentForm.types';
import { getAllAgentsData } from '../api/client';
import { useAuth } from './AuthContext';
import { Message } from '../types/chat';

interface ChatHistories {
  [agentId: string]: Message[];
}

interface ChatSessions {
  [agentId: string]: string;
}

interface AppContextType {
  agents: AgentResponseDto[];
  loading: boolean;
  error: string | null;
  fetchAgents: () => void;
  chatHistories: ChatHistories;
  chatSessions: ChatSessions;
  addMessageToHistory: (agentId: string, message: Message) => void;
  updateLastMessageInHistory: (agentId: string, chunk: string) => void;
  setSessionIdForAgent: (agentId: string, sessionId: string) => void;
  clearChatForAgent: (agentId: string) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});
  const [chatSessions, setChatSessions] = useState<ChatSessions>({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getAllAgentsData();
      setAgents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch agents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);


  const addMessageToHistory = (agentId: string, message: Message) => {
    setChatHistories(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), message],
    }));
  };

  const updateLastMessageInHistory = (agentId: string, chunk: string) => {
    setChatHistories(prev => {
      const history = prev[agentId] || [];
      if (history.length === 0) return prev;
      const lastMessage = history[history.length - 1];
      const updatedLastMessage = { ...lastMessage, text: lastMessage.text + chunk };
      return {
        ...prev,
        [agentId]: [...history.slice(0, -1), updatedLastMessage],
      };
    });
  };

  const setSessionIdForAgent = (agentId: string, sessionId: string) => {
    setChatSessions(prev => ({ ...prev, [agentId]: sessionId }));
  };

  const clearChatForAgent = (agentId: string) => {
    setChatSessions(prev => {
      const newSessions = { ...prev };
      delete newSessions[agentId];
      return newSessions;
    });
    setChatHistories(prev => {
      const newHistories = { ...prev };
      delete newHistories[agentId];
      return newHistories;
    });
  };

  return (
    <AppContext.Provider
      value={{
        agents,
        loading,
        error,
        fetchAgents,
        chatHistories,
        chatSessions,
        addMessageToHistory,
        updateLastMessageInHistory,
        setSessionIdForAgent,
        clearChatForAgent,
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
