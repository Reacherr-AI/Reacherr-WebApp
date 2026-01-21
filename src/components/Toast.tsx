import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  onDismiss: (id: number) => void;
}

const icons = {
  success: <CheckCircle className="text-green-400" />,
  error: <XCircle className="text-red-400" />,
  info: <Info className="text-blue-400" />,
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300); // Allow time for fade out animation
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  const baseClasses =
    'flex items-center p-4 mb-4 text-gray-200 border-l-4 rounded-lg shadow-lg transition-all duration-300';
  const typeClasses = {
    success: 'bg-gray-800 border-green-500',
    error: 'bg-gray-800 border-red-500',
    info: 'bg-gray-800 border-blue-500',
  };
  const animationClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-full';

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${animationClasses}`}
      role="alert"
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {icons[type]}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 p-1.5 inline-flex items-center justify-center h-8 w-8"
        onClick={handleDismiss}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
