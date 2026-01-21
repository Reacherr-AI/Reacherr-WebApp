import React from 'react';
import { Plus, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PhoneNumberDropdown: React.FC<{
  value: number | null;
  onChange: (value: number | null) => void;
  options: Record<string, string>;
}> = ({ value, onChange, options }) => {
  const navigate = useNavigate();
  const noNumbers = Object.keys(options).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '0' || selectedValue === '') {
      onChange(null);
    } else {
      onChange(parseInt(selectedValue, 10));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-gray-300 flex items-center gap-2 text-sm font-medium">
        <Phone size={16} />
        Phone Number
      </label>
      <div className="relative flex items-center gap-2">
        <select
          value={value || ''}
          onChange={handleChange}
          className="flex-1 w-full bg-gray-800/60 text-gray-100 border border-gray-700 rounded-lg py-3 pl-4 pr-10
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none 
                     appearance-none transition-all cursor-pointer"
        >
          <option value="">None</option>
          {noNumbers && <option value="0" disabled>No numbers available</option>}
          {Object.entries(options).map(([id, number]) => (
            <option key={id} value={id} className="bg-gray-800 text-gray-100">
              {number}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => navigate('/phone-numbers')}
          className="text-gray-300 hover:text-white"
          title="Buy Number"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default PhoneNumberDropdown;