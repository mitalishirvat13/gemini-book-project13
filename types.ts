
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  available: boolean;
  dueDate: string | null;
  borrowedBy: string | null;
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