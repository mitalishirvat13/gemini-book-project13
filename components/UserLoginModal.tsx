
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import AdminLoginModal from './AdminLoginModal';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLogin: (password: string) => void;
  onStudentLogin: (user: User) => void;
}

const UserLoginModal: React.FC<UserLoginModalProps> = ({ isOpen, onClose, onAdminLogin, onStudentLogin }) => {
  const [view, setView] = useState<'selection' | 'student' | 'admin'>('selection');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state every time the modal is opened to ensure a clean form
      setView('selection');
      setName('');
      setEmail('');
      setError('');
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    setError('');

    const newUser: User = {
        id: email, // Use email as the unique ID for the session
        name: name,
        email: email
    };
    onStudentLogin(newUser);
    handleClose();
  };

  const handleAdminLogin = (password: string) => {
    onAdminLogin(password);
    // The parent will handle closing the modal on successful login
  };

  const handleClose = () => {
    // Rely on the useEffect to reset the state when reopening,
    // just call onClose here.
    onClose();
  };

  const renderSelection = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Login As</h2>
      <div className="space-y-4">
        <button
          onClick={() => setView('student')}
          className="w-full px-4 py-3 bg-[#D1AC62] text-white font-semibold rounded-md hover:bg-[#b99551] transition-colors"
        >
          Student
        </button>
        <button
          onClick={() => setView('admin')}
          className="w-full px-4 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
        >
          Admin
        </button>
      </div>
       <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
    </div>
  );
  
  const renderStudentLogin = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Student Login</h2>
       <form onSubmit={handleStudentSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name:
              </label>
              <input
                type="text"
                id="student-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62] p-2"
                placeholder="e.g. Alice Smith"
                autoFocus
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="student-email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email:
              </label>
              <input
                type="email"
                id="student-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62] p-2"
                placeholder="e.g. alice@example.com"
                autoComplete="off"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
          <div className="flex justify-between items-center gap-3 mt-6">
             <button
                type="button"
                onClick={() => setView('selection')}
                className="text-sm text-gray-500 hover:underline"
            >
                Back
            </button>
            <div className="flex gap-3">
                 <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#D1AC62] text-white rounded-md hover:bg-[#b99551] disabled:bg-gray-400"
                >
                    Login
                </button>
            </div>
          </div>
       </form>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {view === 'selection' && renderSelection()}
        {view === 'student' && renderStudentLogin()}
        {view === 'admin' && (
            // Re-use the existing AdminLoginModal component for a consistent experience
            <AdminLoginModal isOpen={true} onClose={handleClose} onLogin={handleAdminLogin} />
        )}
      </div>
    </div>
  );
};

export default UserLoginModal;
