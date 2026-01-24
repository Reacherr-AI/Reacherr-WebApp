import React from 'react';
import { Settings, Trash2 } from 'lucide-react';

interface PhoneNumberCardProps {
  phoneNumber: string;
  status: string;
  assignedAgentName?: string;
  subscribedAt: string;
  expiresAt: string;
  onEdit: () => void;
  onDelete: () => void;
}

const PhoneNumberCard: React.FC<PhoneNumberCardProps> = ({ 
  phoneNumber, 
  status, 
  assignedAgentName, 
  subscribedAt, 
  expiresAt, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 flex items-center justify-between hover:bg-gray-700/50 transition-colors duration-300">
      <div className="flex flex-col">
        <p className="text-2xl font-bold text-white">{phoneNumber}</p>
        <div className="text-sm text-gray-400 mt-2">
          <p>Assigned to: {assignedAgentName || 'N/A'}</p>
          <p>Subscribed: {new Date(subscribedAt).toLocaleDateString()}</p>
          <p>Expires: {new Date(expiresAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium mr-6 px-3 py-1 rounded-full bg-green-500/20 text-green-300">{status}</span>
        <div className="flex items-center space-x-2">
          <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-600 transition-colors">
            <Settings className="text-gray-400" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-full hover:bg-gray-600 transition-colors">
            <Trash2 className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberCard;