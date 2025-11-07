
import { Book, HistoryEntry, User } from '../types';

const HISTORY_STORAGE_KEY = 'library_history';

// Load initial history from localStorage
const loadHistory = (): HistoryEntry[] => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      // JSON.parse doesn't automatically revive dates
      return JSON.parse(storedHistory).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    }
  } catch (e) {
    console.error("Could not load history from localStorage.", e);
  }
  return [];
};

let historyLog: HistoryEntry[] = loadHistory();

// Save history to localStorage whenever it changes
const saveHistory = () => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyLog));
  } catch (e) {
    console.error("Could not save history to localStorage.", e);
  }
};


export const addHistoryEntry = async (book: Book, user: User, action: 'borrowed' | 'returned'): Promise<HistoryEntry> => {
  let penaltyPaid: number | undefined = undefined;

  if (action === 'returned' && book.dueDate) {
    const dueDate = new Date(book.dueDate);
    const returnDate = new Date();
    
    // Only calculate penalty if it's returned after the due date
    if (returnDate > dueDate) {
        const timeDiff = returnDate.getTime() - dueDate.getTime();
        // Calculate days, rounding up. e.g., 1 hour overdue is 1 day.
        const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
        penaltyPaid = daysOverdue * 10;
    } else {
        penaltyPaid = 0; // No penalty if returned on or before due date
    }
  }

  const newEntry: HistoryEntry = {
    id: crypto.randomUUID(),
    bookId: book.id,
    bookTitle: book.title,
    userId: user.id,
    userName: user.name,
    action,
    timestamp: new Date(),
    penaltyPaid, // Will be undefined for 'borrowed' actions
  };

  historyLog.unshift(newEntry); // Add to the top of the list
  saveHistory();
  return newEntry;
};

export const getFullHistory = async (): Promise<HistoryEntry[]> => {
  // Return a copy to prevent mutation
  return [...historyLog];
};

export const getUserHistory = async (userId: string): Promise<HistoryEntry[]> => {
  return historyLog.filter(entry => entry.userId === userId);
};
