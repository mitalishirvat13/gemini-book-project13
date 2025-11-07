
import React, { useState, useEffect } from 'react';
import { HistoryEntry, Category } from '../types';
import { getFullHistory } from '../services/historyService';
import { getPasskey, setPasskey } from '../services/adminService';
import Spinner from './Spinner';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (bookData: { title: string; author: string; category: string }) => void;
  categories: Category[];
}

type Tab = 'borrow' | 'return' | 'add' | 'settings';

const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose, onAddBook, categories }) => {
  const [activeTab, setActiveTab] = useState<Tab>('borrow');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for passkey change
  const [oldPasskey, setOldPasskey] = useState('');
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [passkeyMessage, setPasskeyMessage] = useState({ text: '', type: '' });

  // State for Add Book form
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [addBookError, setAddBookError] = useState('');
  const [addBookSuccess, setAddBookSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setActiveTab('borrow'); // Reset to default tab
      getFullHistory()
        .then(data => setHistory(data))
        .finally(() => setLoading(false));
      
      // Reset passkey form when modal opens
      setOldPasskey('');
      setNewPasskey('');
      setConfirmPasskey('');
      setPasskeyMessage({ text: '', type: '' });
      
      // Reset add book form
      setTitle('');
      setAuthor('');
      // Default to first real category if available
      const firstCategory = categories.find(c => c.id !== 'all');
      setSelectedCat(firstCategory ? firstCategory.name : 'new');
      setNewCategory('');
      setAddBookError('');
      setAddBookSuccess('');
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handlePasskeyChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyMessage({ text: '', type: '' });

    if (newPasskey !== confirmPasskey) {
      setPasskeyMessage({ text: 'New passkeys do not match.', type: 'error' });
      return;
    }
    if (newPasskey.length < 6) {
      setPasskeyMessage({ text: 'New passkey must be at least 6 characters long.', type: 'error' });
      return;
    }
    const currentPasskey = getPasskey();
    if (oldPasskey !== currentPasskey) {
      setPasskeyMessage({ text: 'Old passkey is incorrect.', type: 'error' });
      return;
    }

    setPasskey(newPasskey);
    setPasskeyMessage({ text: 'Passkey updated successfully!', type: 'success' });
    setOldPasskey('');
    setNewPasskey('');
    setConfirmPasskey('');
  };


  const renderHistoryTable = (data: HistoryEntry[], showPenalty: boolean) => {
    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (data.length === 0) return <div className="text-center text-gray-500 py-10">No history records found.</div>;
    
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                 {showPenalty && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty Paid</th>}
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {data.map(entry => (
                <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.bookTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.timestamp.toLocaleString()}</td>
                    {showPenalty && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.penaltyPaid != null && entry.penaltyPaid > 0 ? (
                                <span className="font-semibold text-red-600">₹{entry.penaltyPaid}</span>
                            ) : (
                                <span>-</span>
                            )}
                        </td>
                    )}
                </tr>
            ))}
            </tbody>
        </table>
    );
  };
  
  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddBookError('');
    setAddBookSuccess('');

    const finalCategory = selectedCat === 'new' ? newCategory.trim() : selectedCat;

    if (!title.trim() || !author.trim() || !finalCategory) {
      setAddBookError('All fields are required.');
      return;
    }

    onAddBook({ title: title.trim(), author: author.trim(), category: finalCategory });

    // Reset form and show success message
    setTitle('');
    setAuthor('');
    const firstCategory = categories.find(c => c.id !== 'all');
    setSelectedCat(firstCategory ? firstCategory.name : 'new');
    setNewCategory('');
    setAddBookSuccess(`Successfully added "${title.trim()}" to the library!`);
    
    // Clear success message after a few seconds
    setTimeout(() => setAddBookSuccess(''), 4000);
  };

  const renderAddBook = () => {
    const availableCategories = categories.filter(c => c.id !== 'all');

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Add a New Book</h3>
            <form onSubmit={handleAddBookSubmit} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62]" required autoFocus />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62]" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62]">
                        {availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        <option value="new">-- Add New Category --</option>
                    </select>
                </div>
                {selectedCat === 'new' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">New Category Name</label>
                        <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D1AC62] focus:border-[#D1AC62]" required />
                    </div>
                )}
                {addBookError && <p className="text-sm text-red-600">{addBookError}</p>}
                {addBookSuccess && <p className="text-sm text-green-600">{addBookSuccess}</p>}
                <div>
                    <button type="submit" className="px-4 py-2 bg-[#D1AC62] text-white rounded-md hover:bg-[#b99551]">Add Book</button>
                </div>
            </form>
        </div>
    );
  };

  const renderSettings = () => (
    <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Change Admin Passkey</h3>
        <form onSubmit={handlePasskeyChange} className="space-y-4 max-w-sm">
            <div>
                <label className="block text-sm font-medium text-gray-700">Old Passkey</label>
                <input type="password" value={oldPasskey} onChange={e => setOldPasskey(e.target.value)} className="mt-1 block w-full bg-black text-white rounded-md shadow-sm border-gray-600 focus:ring-[#D1AC62] focus:border-[#D1AC62]" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">New Passkey</label>
                <input type="password" value={newPasskey} onChange={e => setNewPasskey(e.target.value)} className="mt-1 block w-full bg-black text-white rounded-md shadow-sm border-gray-600 focus:ring-[#D1AC62] focus:border-[#D1AC62]" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Passkey</label>
                <input type="password" value={confirmPasskey} onChange={e => setConfirmPasskey(e.target.value)} className="mt-1 block w-full bg-black text-white rounded-md shadow-sm border-gray-600 focus:ring-[#D1AC62] focus:border-[#D1AC62]" required />
            </div>
            {passkeyMessage.text && (
                <p className={`text-sm ${passkeyMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{passkeyMessage.text}</p>
            )}
            <div>
                <button type="submit" className="px-4 py-2 bg-[#D1AC62] text-white rounded-md hover:bg-[#b99551]">Update Passkey</button>
            </div>
        </form>
    </div>
  );

  const borrowedHistory = history.filter(h => h.action === 'borrowed');
  const returnedHistory = history.filter(h => h.action === 'returned');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        </div>
        <div className="flex-grow flex">
            <nav className="w-48 border-r p-2">
                <ul className="space-y-1">
                    <li><button onClick={() => setActiveTab('borrow')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'borrow' ? 'bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Borrow History</button></li>
                    <li><button onClick={() => setActiveTab('return')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'return' ? 'bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Return History</button></li>
                    <li><button onClick={() => setActiveTab('add')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'add' ? 'bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Add Book</button></li>
                    <li><button onClick={() => setActiveTab('settings')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'settings' ? 'bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Settings</button></li>
                </ul>
            </nav>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'borrow' && renderHistoryTable(borrowedHistory, false)}
                {activeTab === 'return' && renderHistoryTable(returnedHistory, true)}
                {activeTab === 'add' && renderAddBook()}
                {activeTab === 'settings' && renderSettings()}
            </main>
        </div>
         <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
