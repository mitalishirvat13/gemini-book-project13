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
        // RACE CONDITION PREVENTION: Check if book is available right before updating.
        if (!originalBook.available) {
            throw new Error("Sorry, this book was just borrowed by another user.");
        }

        const newDueDate = new Date();
        newDueDate.setDate(newDueDate.getDate() + 15);
        dueDate = newDueDate.toISOString();
        borrowedBy = userId;
    } else { // Book is being returned
        // BACKEND VALIDATION: The frontend already prevents non-borrowers from returning,
        // but this backend check is crucial for data integrity. The admin has id 'admin'.
        if (userId !== 'admin' && originalBook.borrowedBy !== userId) {
            throw new Error("You cannot return a book you did not borrow.");
        }
        dueDate = null;
        borrowedBy = null;
    }

    const updatedBook = { ...originalBook, available, dueDate, borrowedBy };
    books[bookIndex] = updatedBook;
    
    return updatedBook;
};

export const deleteBook = async (bookId: string): Promise<void> => {
    await delay(200);
    // FIX: Corrected findIndex logic and syntax. The original code incorrectly compared a string `id` to the number `-1`
    // and contained a syntax error, which caused a scope issue for `bookIndex`.
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
        throw new Error("Book not found");
    }
    books.splice(bookIndex, 1);
};
