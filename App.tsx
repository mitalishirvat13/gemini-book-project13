
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, Category, User } from './types';
import { fetchBooks, addBook, updateBookAvailability, deleteBook } from './services/bookService';
import { addHistoryEntry } from './services/historyService';
import { verifyPasskey, setPasskey as setAdminPasskey, getPasskey } from './services/adminService';
import TopSearchBar from './components/TopSearchBar';
import ImageSlider from './components/ImageSlider';
import CategoryList from './components/CategoryList';
import BookCard from './components/BookCard';
import Spinner from './components/Spinner';
import UserLoginModal from './components/UserLoginModal';
import DashboardModal from './components/DashboardModal';
import MyHistoryModal from './components/MyHistoryModal';

const App: React.FC = () => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // New state for auth and modals
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState<boolean>(false);
  const [isMyHistoryModalOpen, setIsMyHistoryModalOpen] = useState<boolean>(false);
  
  const loadBooks = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const books = await fetchBooks();
      setAllBooks(books);
    } catch (err) {
      console.error("Error fetching books:", err);
      let message = "An unknown error occurred.";
      if (err instanceof Error) {
          message = err.message;
      }
      const userFriendlyError = `Failed to load books. Please try refreshing the page.\n\nDetails: ${message}`;
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);
  
  const categories = useMemo<Category[]>(() => {
    if (allBooks.length === 0) return [];
  
    const categoryCounts = allBooks.reduce((acc, book) => {
      if (typeof book.category === 'string') {
        acc[book.category] = (acc[book.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  
    const sortedCategories = Object.keys(categoryCounts).sort();
  
    return [
      { id: 'all', name: 'All Books', count: allBooks.length },
      ...sortedCategories.map(categoryName => ({
        id: categoryName.toLowerCase().replace(/\s*\/\s*/g, '-'),
        name: categoryName,
        count: categoryCounts[categoryName]
      }))
    ];
  }, [allBooks]);

  const filteredBooks = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return allBooks.filter(book => {
      const categoryId = book.category?.toLowerCase().replace(/\s*\/\s*/g, '-');
      const matchesCategoryFilter = selectedCategory === 'all' || categoryId === selectedCategory;
      
      const matchesSearch = 
        book.title.toLowerCase().includes(lowercasedQuery) || 
        book.author.toLowerCase().includes(lowercasedQuery) ||
        book.category.toLowerCase().includes(lowercasedQuery);
        
      return matchesCategoryFilter && matchesSearch;
    });
  }, [allBooks, selectedCategory, searchQuery]);
  
  const handleBorrowReturn = useCallback(async (bookId: string) => {
    const user = isAdmin ? { id: 'admin', name: 'Admin', email: 'admin@library.com' } : currentUser;
    if (!user) {
        alert("Please log in to borrow or return a book.");
        return;
    }

    const bookToUpdate = allBooks.find(b => b.id === bookId);
    if (!bookToUpdate) return;
    
    // If returning, check if the current user is the borrower or an admin
    if (!bookToUpdate.available && !isAdmin && bookToUpdate.borrowedBy !== user.id) {
        alert("This book was borrowed by another user. You can only return books that you have borrowed.");
        return;
    }

    const originalBooks = [...allBooks];
    setAllBooks(prevBooks => 
      prevBooks.map(book => {
        if (book.id === bookId) {
          const isBorrowing = book.available;
          let newDueDate: string | null = null;
          if (isBorrowing) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 15);
            newDueDate = dueDate.toISOString();
          }
          return { 
            ...book, 
            available: !book.available, 
            dueDate: newDueDate,
            borrowedBy: isBorrowing ? user.id : null // Set or clear the borrower
          };
        }
        return book;
      })
    );

    try {
      await updateBookAvailability(bookId, !bookToUpdate.available, user.id);
      const action = bookToUpdate.available ? 'borrowed' : 'returned';
      await addHistoryEntry(bookToUpdate, user, action);
    } catch (error) {
      console.error("Failed to update book status:", error);
      setAllBooks(originalBooks); // Revert on error
      if (error instanceof Error) {
        alert(error.message); // Use alert to show the specific error from the backend.
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  }, [allBooks, currentUser, isAdmin]);

  const handleDeleteBook = useCallback(async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        try {
            await deleteBook(bookId);
            setAllBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
        } catch (error) {
            console.error("Failed to delete book:", error);
            setError(`Failed to delete book. Please try again.`);
        }
    }
  }, []);


  const handleAdminLogin = (password: string) => {
    if (verifyPasskey(password)) {
      setIsAdmin(true);
      setCurrentUser(null);
      setIsLoginModalOpen(false);
    } else {
      alert('Incorrect passkey.');
    }
  };

  const handleStudentLogin = (user: User) => {
    setCurrentUser(user);
    setIsAdmin(false);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
  };
  
  const handleAddBook = async (bookData: { title: string; author: string; category: string }) => {
    try {
      const newBook = await addBook(bookData);
      setAllBooks(prevBooks => 
        [...prevBooks, newBook].sort((a, b) => a.title.localeCompare(b.title))
      );
    } catch (error) {
        console.error("Failed to add book:", error);
        setError(`Failed to add new book. Please try again.`);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-red-500 py-10 px-4 whitespace-pre-wrap">{error}</div>;
    }

    if (filteredBooks.length === 0) {
      return <div className="text-center text-gray-500 py-10">No books found. Try adjusting your search or filters.</div>;
    }

    const isLoggedIn = isAdmin || !!currentUser;
    const bestCollection = filteredBooks.slice(0, Math.ceil(filteredBooks.length / 2));
    const popularBooks = filteredBooks.slice(Math.ceil(filteredBooks.length / 2));

    return (
      <>
        {bestCollection.length > 0 && (
          <section>
            <div className="mt-6 mb-4 px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-800">Best Collection</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8">
              {bestCollection.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onBorrowReturn={handleBorrowReturn} 
                  isLoggedIn={isLoggedIn}
                  isAdmin={isAdmin}
                  onDeleteBook={handleDeleteBook}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </section>
        )}

        {popularBooks.length > 0 && (
          <section>
            <div className="mt-8 mb-4 px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-800">Our Popular Books</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8">
              {popularBooks.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onBorrowReturn={handleBorrowReturn} 
                  isLoggedIn={isLoggedIn}
                  isAdmin={isAdmin}
                  onDeleteBook={handleDeleteBook}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </section>
        )}
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8F8F8] font-sans">
        <header className="sticky top-0 z-30 bg-[#F8F8F8] shadow-md">
          <TopSearchBar 
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onLoginClick={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onDashboardClick={() => setIsDashboardModalOpen(true)}
            onMyHistoryClick={() => setIsMyHistoryModalOpen(true)}
          />
        </header>
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ImageSlider />

          <section>
            <div className="mt-8 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Explore Categories</h2>
            </div>
            <CategoryList 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </section>

          {renderContent()}
        </main>
        
        <UserLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onAdminLogin={handleAdminLogin}
            onStudentLogin={handleStudentLogin}
        />
        
        {isAdmin && <DashboardModal 
            isOpen={isDashboardModalOpen}
            onClose={() => setIsDashboardModalOpen(false)}
            onAddBook={handleAddBook}
            categories={categories}
        />}
        {currentUser && <MyHistoryModal 
            isOpen={isMyHistoryModalOpen}
            onClose={() => setIsMyHistoryModalOpen(false)}
            user={currentUser}
        />}
        
        <footer className="text-center py-8 mt-8 text-gray-500 text-sm">
          <p>Powered by Gemini. Designed with Tailwind CSS. Data from local source.</p>
        </footer>
      </div>
    </>
  );
};

export default App;
