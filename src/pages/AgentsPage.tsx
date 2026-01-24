import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Play, Pause } from 'lucide-react';
import { AgentResponseDto } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAppContext } from '../context/AppContext';
import Table, { ColumnDef } from '../components/Table';
import CreateAgentModal from '../components/modals/CreateAgentModal';

const AgentsPage: React.FC = () => {
  const { agents, loading, error, fetchAgents } = useAppContext();
  const { playing, playingId, togglePlay } = useAudioPlayer();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const truncateDescription = (text: string, wordLimit: number) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) {
      return text;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const columns: ColumnDef<AgentResponseDto>[] = [
    { header: () => <div className="text-center">Name</div>, accessorKey: 'name', cell: info => <div className="text-center">{info.getValue()}</div> },
    {
      header: () => <div className="text-center">Description</div>,
      accessorKey: 'description',
      cell: info => <div className="text-center">{truncateDescription(info.getValue(), 10)}</div>,
    },
    {
      header: () => <div className="text-center">Voice</div>,
      accessorKey: 'voice',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => togglePlay(row.original.voice, row.original.id)}
            className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!row.original.voice?.voiceId}
          >
            {playing && playingId === row.original.id ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>
        </div>
      ),
    },
    { header: () => <div className="text-center">Phone Number</div>, accessorKey: 'number', cell: info => <div className="text-center">{info.getValue() || '—'}</div> },
    {
      header: () => <div className="text-center">Actions</div>,
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Link to={`/agents/edit/${row.original.id}`} className="flex items-center space-x-2 text-gray-400 hover:text-white">
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Agents</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Agent
        </button>
      </div>

      <Table
        columns={columns}
        data={agents}
        isLoading={loading}
        error={error}
        emptyMessage="You haven't created any agents yet."
      />
      <CreateAgentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AgentsPage;