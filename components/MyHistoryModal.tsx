
import React, { useState, useEffect } from 'react';
import { User, HistoryEntry } from '../types';
import { getUserHistory } from '../services/historyService';
import Spinner from './Spinner';

interface MyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const MyHistoryModal: React.FC<MyHistoryModalProps> = ({ isOpen, onClose, user }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      getUserHistory(user.id)
        .then(data => setHistory(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="history-title" className="text-xl font-bold text-gray-800">My Activity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        <div className="h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full"><Spinner /></div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-10">You have no borrowing history yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map(entry => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.bookTitle}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${entry.action === 'borrowed' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.timestamp.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.action === 'returned' ? (
                        entry.penaltyPaid != null && entry.penaltyPaid > 0 ? (
                          <span className="font-semibold text-red-600">₹{entry.penaltyPaid}</span>
                        ) : (
                          <span>On Time</span>
                        )
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyHistoryModal;
