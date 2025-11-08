import { Book } from '../types';
import { initialBooks } from './bookData';

let books: Book[] = [...initialBooks]; // In-memory store of books

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchBooks = async (): Promise<Book[]> => {
  await delay(500);
  return [...books].sort((a, b) => a.title.localeCompare(b.title));
};

export const addBook = async (bookData: { title: string; author: string; category: string; count?: number }): Promise<Book> => {
    await delay(200);
    const id = crypto.randomUUID();
    const count = bookData.count || 1;
    const newBook: Book = {
        id,
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        available: true,
        cover: `https://picsum.photos/seed/${bookData.title.replace(/\s+/g, '-')}-${id}/400/600`,
        borrowRecords: [],
        count: count, // Total number of copies
        availableCount: count // Initially all copies are available
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
    let availableCount = originalBook.availableCount;
    let borrowRecords = [...originalBook.borrowRecords];

    if (!available) { // Book is being borrowed
        if (!userId) {
            throw new Error("User ID is required to borrow a book");
        }

        // Check if there are any copies available
        if (availableCount <= 0) {
            throw new Error("Sorry, no copies of this book are currently available.");
        }

        // Decrease the available count when borrowing
        availableCount--;
        
        // Add borrow record
        const newDueDate = new Date();
        newDueDate.setDate(newDueDate.getDate() + 15);
        borrowRecords.push({
            userId: userId,
            dueDate: newDueDate.toISOString()
        });

        const updatedBook = { 
            ...originalBook, 
            available: availableCount > 0,
            borrowRecords,
            availableCount
        };
        books[bookIndex] = updatedBook;
        return updatedBook;
    } else { // Book is being returned
        if (!userId) {
            throw new Error("User ID is required to return a book");
        }

        // Find the borrow record for this user
        const borrowRecordIndex = borrowRecords.findIndex(record => record.userId === userId);
        
        // BACKEND VALIDATION
        if (userId !== 'admin' && borrowRecordIndex === -1) {
            throw new Error("You cannot return a book you did not borrow.");
        }

        // Remove the borrow record
        if (borrowRecordIndex !== -1) {
            borrowRecords.splice(borrowRecordIndex, 1);
        }

        // Increase the available count when returning
        availableCount++;

        const updatedBook = { 
            ...originalBook, 
            available: true,
            borrowRecords,
            availableCount
        };
        books[bookIndex] = updatedBook;
        return updatedBook;
    }
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
