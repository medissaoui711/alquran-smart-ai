import React from 'react';

interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 text-center flex-col">
      <p className="text-red-500 mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        إعادة المحاولة
      </button>
    </div>
  );
};
