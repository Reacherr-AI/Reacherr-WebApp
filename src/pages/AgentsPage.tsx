import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, Pencil, Play, Pause, Search, 
  MoreVertical, Phone, Mic, ChevronRight, 
  Download, Copy, Trash2 
} from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAppContext } from '../context/AppContext';
import CreateAgentModal from '../components/modals/CreateAgentModal';
import { AgentSummary } from '@/types/agentList';

const AgentsPage: React.FC = () => {
  const { agents, loading, error, fetchAgents } = useAppContext();
  const { playing, playingId, togglePlay } = useAudioPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  /**
   * UPDATED: Formats timestamp to include Date and Time as shown in Retell
   */
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const filteredAgents = useMemo(() => {
    return (agents || []).filter(agent => 
      agent.agentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agents, searchQuery]);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-300">
      {/* 1. Header with expanded minimal buttons */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ChevronRight size={16} className="text-zinc-300" />
          <span className="text-zinc-900 text-base">All Agents</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input 
              type="text"
              placeholder="Search..."
              className="w-64 bg-white border border-zinc-200 text-zinc-900 pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-zinc-300 transition-all placeholder:text-zinc-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* INCREASED: Button size and hit area for Import */}
          <button className="h-9 px-5 border border-zinc-200 text-zinc-700 rounded-md text-xs font-bold hover:bg-zinc-50 transition-colors shadow-sm">
            Import
          </button>
          
          {/* INCREASED: Button size for Create Agent */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-md flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <PlusCircle size={15} />
            Create Agent
          </button>
        </div>
      </div>

      <div className="px-6 pt-4">
        {/* Table Headings */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          <div className="col-span-4">Agent Name</div>
          <div className="col-span-2 text-center">Agent Type</div>
          <div className="col-span-2 text-center">Voice</div>
          <div className="col-span-2 text-center">Phone</div>
          <div className="col-span-2 text-right pr-14">Edited by</div>
        </div>

        {/* Floating Card List with Row Hover */}
        <div className="space-y-[1px] border border-zinc-100 rounded-lg overflow-hidden shadow-sm">
          {filteredAgents.map((agent) => (
            <div 
              key={agent.agentId}
              className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-white hover:bg-zinc-50/80 transition-colors group relative border-b border-zinc-50 last:border-0"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-50 flex items-center justify-center border border-zinc-100 text-emerald-500">
                  <Mic size={15} />
                </div>
                {/* INCREASED: Agent name font weight and size */}
                <h3 className="font-bold text-[14px] text-zinc-900 truncate">
                  {agent.agentName}
                </h3>
              </div>

              <div className="col-span-2 flex justify-center">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-50 text-zinc-500 border border-zinc-100 capitalize">
                  {agent.agentType?.replace('-', ' ')}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-center gap-2">
                <img 
                  src={agent.voiceAvatarUrl || '/default-avatar.png'} 
                  className="w-5 h-5 rounded-full border border-zinc-200" 
                  alt="" 
                />
                <span className="text-[12px] text-zinc-600 font-medium">Cimo</span>
                <button
                  onClick={() => togglePlay(agent.voiceAvatarUrl, agent.agentId)}
                  className="text-zinc-300 hover:text-zinc-600 transition-colors"
                >
                  {playing && playingId === agent.agentId ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                </button>
              </div>

              <div className="col-span-2 text-[12px] text-zinc-400 text-center">
                {agent.phoneNumbers?.[0] || '—'}
              </div>

              {/* Timestamp and Action Menu */}
              <div className="col-span-2 flex items-center justify-end">
                <span className="text-[12px] text-zinc-500 tabular-nums font-medium mr-4">
                  {formatDateTime(agent.lastUpdatedAt)}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/agents/edit/${agent.agentId}`} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <Pencil size={16} />
                  </Link>
                  
                  <div className="relative">
                    {/* INCREASED: Action button hit area and icon size */}
                    <button 
                      onClick={() => setActiveMenu(activeMenu === agent.agentId ? null : agent.agentId)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-md hover:bg-zinc-100"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {activeMenu === agent.agentId && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-zinc-200 rounded-lg shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                        {/* INCREASED: Dropdown option text size and padding */}
                        <button className="w-full px-4 py-2 text-left text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5">
                          <Download size={14} className="text-zinc-400" /> Export
                        </button>
                        <button className="w-full px-4 py-2 text-left text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5">
                          <Copy size={14} className="text-zinc-400" /> Duplicate
                        </button>
                        <div className="my-1 border-t border-zinc-100" />
                        <button className="w-full px-4 py-2 text-left text-[12px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2.5">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateAgentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AgentsPage;