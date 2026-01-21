// subcomponents/InputField.tsx
import React from 'react';

const InputField: React.FC<{
  icon?: React.ElementType;
  name: string;
  value: string;
  onChange: any;
  placeholder: string;
  required?: boolean;
  className?: string;
}> = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
    <input
      {...props}
      className={`w-full bg-white text-black border border-gray-700 rounded-lg ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3 focus:border-blue-500 focus:outline-none transition-colors ${className || ''}`}
    />
  </div>
);

export default InputField;
