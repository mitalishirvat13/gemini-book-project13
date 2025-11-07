
import { Book } from '../types';
import { initialBooks } from './bookData';

let books: Book[] = [...initialBooks]; // In-memory store of books

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchBooks = async (): Promise<Book[]> => {
  await delay(500);
  return [...books].sort((a, b) => a.title.localeCompare(b.title));
};

export const addBook = async (bookData: { title: string; author: string; category: string }): Promise<Book> => {
    await delay(200);
    const id = crypto.randomUUID();
    const newBook: Book = {
        id,
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        available: true,
        cover: `https://picsum.photos/seed/${bookData.title.replace(/\s+/g, '-')}-${id}/400/600`,
        dueDate: null,
        borrowedBy: null,
    };
    books.unshift(newBook);
    return newBook;
};

export const updateBookAvailability = async (bookId: string, available: boolean, userId: string | null): Promise<Book> => {
    await delay(100);
    const bookIndex = books.findIndex(b => b.id === bookId);
    
    if (bookIndex === -1) {
        throw new Error("Book not found");
    }
    
    const originalBook = books[bookIndex];
    let dueDate: string | null = originalBook.dueDate;
    let borrowedBy: string | null = originalBook.borrowedBy;

    if (!available) { // Book is being borrowed
        const newDueDate = new Date();
        newDueDate.setDate(newDueDate.getDate() + 15);
        dueDate = newDueDate.toISOString();
        borrowedBy = userId;
    } else { // Book is being returned
        dueDate = null;
        borrowedBy = null;
    }

    const updatedBook = { ...originalBook, available, dueDate, borrowedBy };
    books[bookIndex] = updatedBook;
    
    return updatedBook;
};

export const deleteBook = async (bookId: string): Promise<void> => {
    await delay(200);
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
        throw new Error("Book not found");
    }
    books.splice(bookIndex, 1);
};