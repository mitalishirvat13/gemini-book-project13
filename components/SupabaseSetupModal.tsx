import React, { useState } from 'react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onConnect: (url: string, anonKey: string) => void;
  initialError?: string;
}

const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onConnect, initialError }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [error, setError] = useState(initialError || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) {
      setError('Both Supabase URL and Anon Key are required.');
      return;
    }
    // Basic validation for URL format
    try {
        new URL(url);
    } catch (_) {
        setError('Please enter a valid Supabase URL.');
        return;
    }
    setError('');
    onConnect(url, anonKey);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
      >
        <h2 id="setup-title" className="text-xl font-bold text-gray-800 mb-2">Connect to Supabase</h2>
        <p className="text-sm text-gray-600 mb-4">
            Please provide your Supabase Project URL and Anon Key to load the library data. You can find these in your Supabase project's API settings.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700 mb-1">
                Project URL
              </label>
              <input
                type="text"
                id="supabase-url"
                placeholder="https://<your-project-ref>.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62]"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-700 mb-1">
                Anon (Public) Key
              </label>
              <input
                type="text"
                id="supabase-key"
                placeholder="eyJhbGciOi..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62]"
              />
            </div>
             {error && <p className="text-red-500 text-xs mt-1 whitespace-pre-wrap">{error}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#D1AC62] text-white rounded-md hover:bg-[#b99551] font-semibold"
            >
              Save & Connect
            </button>
          </div>
        </form>
         <p className="text-xs text-gray-500 mt-4 text-center">
            Your credentials will be stored in your browser's local storage.
        </p>
      </div>
    </div>
  );
};

export default SupabaseSetupModal;