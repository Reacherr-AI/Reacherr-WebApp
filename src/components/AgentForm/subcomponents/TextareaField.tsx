import React from 'react'; // Added import

const TextareaField: React.FC<{
  icon?: React.ElementType,
  name: string,
  value: string,
  onChange: any,
  placeholder: string,
  required?: boolean,
  maxLength?: number, // <-- Added for counter
  className?: string // <-- Added to allow merging
}> = ({
  icon: Icon,
  className, // <-- Destructured
  maxLength, // <-- Destructured
  value, // <-- Destructured for counter
  ...props
}) => (
  // Use a parent div to hold the textarea and the counter
  <div>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-5 w-5 h-5 text-gray-400" />}
      <textarea
        {...props}
        value={value} // Pass value explicitly
        maxLength={maxLength} // Enforce the limit in the browser
        rows={15}
        // This combines the default classes with any you pass in (like "min-h-[300px]")
        className={`w-full bg-gray-800/60 border border-gray-700 rounded-lg ${Icon ? 'pl-12' : 'px-4'} pr-4 py-4 focus:border-blue-500 focus:outline-none transition-colors ${className || ''}`}
      />
    </div>
    
    {/* This is the counter. It only appears if you pass a maxLength prop. */}
    {maxLength && (
      <div className="text-right text-sm text-gray-500 mt-1">
        {value.length} / {maxLength}
      </div>
    )}
  </div>
);

export default TextareaField;