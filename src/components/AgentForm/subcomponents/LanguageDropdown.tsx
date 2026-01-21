import React from 'react';
import { Globe } from 'lucide-react';
import { LanguageDropdownProps } from '../AgentForm.types';
const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ value, onChange, options }) => {
  return (
    <div className="space-y-2">
      <label className="text-gray-300 flex items-center gap-2 text-sm font-medium">
        <Globe size={16} />
        Language
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800/60 text-gray-100 border border-gray-700 rounded-lg py-3 pl-4 pr-10
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none 
                     appearance-none transition-all cursor-pointer"
        >
          <option value="" disabled>
            Select a language
          </option>
          {options.map((lang) => (
            <option key={lang} value={lang} className="bg-gray-800 text-gray-100">
              {lang}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m6 9 6 6 6-6"
          />
        </svg>
      </div>
    </div>
  );
};

export default LanguageDropdown;