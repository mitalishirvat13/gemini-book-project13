
import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import AdminIcon from './icons/AdminIcon';
import { User } from '../types';

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface TopSearchBarProps {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currentUser: User | null;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onDashboardClick: () => void;
  onMyHistoryClick: () => void;
}

const TopSearchBar: React.FC<TopSearchBarProps> = ({ 
    searchQuery, onSearchChange, currentUser, isAdmin, onLoginClick, onLogout, onDashboardClick, onMyHistoryClick 
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    if (searchQuery) {
        onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
    setIsSearchOpen(false);
  };
  
  const renderUserControls = () => {
    if (isAdmin) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Welcome, Admin</span>
           <button onClick={onDashboardClick} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#D1AC62] rounded-full hover:bg-[#b99551]">Dashboard</button>
           <button onClick={onLogout} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-full hover:bg-red-600">Logout</button>
        </div>
      );
    }
    if (currentUser) {
        return (
             <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">Hi, {currentUser.name.split(' ')[0]}</span>
                <button onClick={onMyHistoryClick} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300">My History</button>
                <button onClick={onLogout} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-full hover:bg-red-600">Logout</button>
            </div>
        );
    }
    return (
        <button onClick={onLoginClick} className="px-4 py-2 text-sm font-semibold text-white bg-[#D1AC62] rounded-lg hover:bg-[#b99551]">
            Login
        </button>
    );
  };

  return (
    <div className="flex items-center justify-between px-6 h-20 relative">
      <div className={`transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <h1 className="text-4xl font-['Georgia',_serif] font-medium text-gray-800 tracking-tight">
          Digital <span className="text-[#D1AC62]">Library</span>
        </h1>
      </div>

      <div className={`absolute top-0 left-0 w-full h-full flex items-center px-6 transition-opacity duration-300 bg-[#F8F8F8] ${isSearchOpen ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search by title, author, or category..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full bg-[#EBEBEB] text-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#D1AC62]"
            />
        </div>
        <button onClick={handleCloseSearch} className="ml-3 p-2 rounded-full hover:bg-gray-200 flex-shrink-0">
          <CloseIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      
      <div className={`flex items-center gap-4 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-200">
            <SearchIcon className="h-6 w-6 text-gray-600" />
        </button>
        {renderUserControls()}
      </div>
    </div>
  );
};

export default TopSearchBar;
