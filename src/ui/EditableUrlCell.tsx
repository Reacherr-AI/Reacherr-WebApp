import React from 'react';

interface EditableUrlCellProps {
  // Allow value to be null/undefined, as confirmed from your API
  value: string | null | undefined; 
  isEditing: boolean;
  onSave: (newValue: string) => void;
}

const EditableUrlCell: React.FC<EditableUrlCellProps> = ({ value, isEditing, onSave }) => {
  // 1. REMOVED: Internal state (`useState`) and `useEffect` are gone.
  //    This component now fully relies on its parent for data.

  // 2. If we are in editing mode, render the input field.
  if (isEditing) {
    return (
      <input 
        type="text" 
        // The input's displayed value is now DIRECTLY from the parent's state via props.
        // `|| ''` is a safeguard to prevent passing null/undefined to the input.
        value={value || ''}
        // CRITICAL FIX: When the user types, call the onSave prop immediately.
        // This tells the parent component to update its state.
        onChange={(e) => onSave(e.target.value)}
        placeholder="Enter WebSocket URL"
        className="bg-gray-700 border border-gray-600 text-white p-1 rounded w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
        data-testid="editable-url-input"
        autoFocus
      />
    );
  }

  // 3. If not editing, display the text. `|| 'N/A'` handles the empty state.
  return <span className="block max-w-xs truncate">{value || 'N/A'}</span>;
};

export default EditableUrlCell;