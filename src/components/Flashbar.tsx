import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface FlashbarProps {
  message: string;
  onClose: () => void;
}

export function Flashbar({ message, onClose }: FlashbarProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 pr-12 relative">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          <p className="text-green-800 font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-600 hover:text-green-800"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}