import React from 'react';

interface DatePickerProps {
  selectedDate: string | undefined;
  onDateChange: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  placeholder,
  className,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(event.target.value || undefined);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="date"
        value={selectedDate ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-gray-800/60 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
};

export default DatePicker;