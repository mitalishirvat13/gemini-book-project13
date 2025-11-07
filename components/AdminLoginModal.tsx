
import React, { useState, useEffect } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setView('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
        setError('Passkey is required.');
        return;
    }
    setError('');
    onLogin(password);
  };
  
  const renderLoginView = () => (
    <>
      <h2 id="admin-login-title" className="text-xl font-bold text-gray-800 mb-4 text-center">Admin Access</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-2 text-center">
            Passkey
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[#D1AC62] focus:border-transparent text-gray-700 font-bold text-center text-lg tracking-[0.2em] p-2 transition-colors duration-200 ease-in-out"
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
        </div>

        <div className="text-center mb-6">
          <button
            type="button"
            onClick={() => setView('forgot')}
            className="text-sm text-gray-500 hover:text-[#D1AC62] hover:underline focus:outline-none"
          >
            Forgot Passkey?
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#D1AC62] text-white rounded-md hover:bg-[#b99551]"
          >
            Login
          </button>
        </div>
      </form>
    </>
  );

  const renderForgotView = () => (
    <>
      <h2 id="admin-login-title" className="text-xl font-bold text-gray-800 mb-4 text-center">Passkey Recovery</h2>
      <div className="text-center text-gray-700 space-y-4">
        <p>This is a demonstration application. The default admin passkey is:</p>
        <p className="bg-gray-100 p-2 rounded-md font-mono text-lg tracking-wider text-[#D1AC62]">
            admin123
        </p>
        <p className="text-xs text-gray-500">(This can be changed in the Admin Dashboard)</p>
      </div>
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={() => setView('login')}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back to Login
        </button>
      </div>
    </>
  );


  // This component can now be used standalone or inside another modal.
  // The outer div for the overlay is removed to allow embedding.
  return (
    <div 
      className="bg-white rounded-lg w-full"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
        {view === 'login' ? renderLoginView() : renderForgotView()}
    </div>
  );
};

export default AdminLoginModal;
