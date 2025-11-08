import React, { useState } from 'react';

interface BrandInputFormProps {
  onGenerate: (mission: string) => void;
  isLoading: boolean;
}

const BrandInputForm: React.FC<BrandInputFormProps> = ({ onGenerate, isLoading }) => {
  const [mission, setMission] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(mission);
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 rounded-lg shadow-2xl shadow-black/30 sticky top-8">
      <h2 className="text-2xl font-bold mb-4 text-white">1. Your Mission</h2>
      <p className="text-gray-300 mb-6">Describe your company's purpose, values, and what you aim to achieve. The more detail, the better the result.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="e.g., To empower small businesses with accessible and user-friendly financial tools, helping them grow and succeed."
          className="w-full h-40 p-3 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all text-gray-200 placeholder:text-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !mission}
          className="mt-4 w-full bg-green-400 text-black font-bold py-3 px-4 rounded-md hover:bg-green-500 disabled:bg-green-900 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 80 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Brand Bible'
          )}
        </button>
      </form>
    </div>
  );
};

export default BrandInputForm;