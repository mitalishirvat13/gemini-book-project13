
export interface BorrowRecord {
  userId: string;
  dueDate: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  available: boolean;
  borrowRecords: BorrowRecord[];
  count: number; // Total number of copies
  availableCount: number; // Number of copies currently available
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface HistoryEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  action: 'borrowed' | 'returned';
  timestamp: Date;
  penaltyPaid?: number;
}