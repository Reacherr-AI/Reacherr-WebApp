import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  options: { value: string | number; label: string }[];
  selectedValue: string | number | undefined;
  onValueChange: (value: string | number | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder,
  className,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onValueChange(value === '' ? undefined : value);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedValue ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full appearance-none bg-gray-800/60 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {placeholder && <option value="" className="bg-gray-900 text-gray-400">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-900 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

export default Dropdown;