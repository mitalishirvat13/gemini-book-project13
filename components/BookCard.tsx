
import React from 'react';
import { Book, User } from '../types';

interface BookCardProps {
  book: Book;
  onBorrowReturn: (bookId: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onDeleteBook: (bookId: string) => void;
  currentUser: User | null;
}

const placeholderSvg = `
<svg width="400" height="600" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="600" fill="#E5E7EB"/>
    <path 
        d="M233.333 133.333H166.667C148.318 133.333 133.333 148.318 133.333 166.667V433.333C133.333 451.682 148.318 466.667 166.667 466.667H233.333C251.682 466.667 266.667 451.682 266.667 433.333V166.667C266.667 148.318 251.682 133.333 233.333 133.333Z"
        stroke="#9CA3AF" 
        stroke-width="16.6667" 
        stroke-linecap="round" 
        stroke-linejoin="round"
    />
    <path 
        d="M200 400V200"
        stroke="#9CA3AF"
        stroke-width="16.6667"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>`;

const placeholderDataUrl = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;

const BookCard: React.FC<BookCardProps> = ({ book, onBorrowReturn, isLoggedIn, isAdmin, onDeleteBook, currentUser }) => {

  const getStatusTextAndColor = () => {
    const availableText = book.availableCount > 0 
      ? `Available (${book.availableCount}/${book.count} copies)` 
      : 'No copies available';
    
    if (book.available) {
      return { text: availableText, color: 'text-green-600' };
    }

    // Check if current user has borrowed this book
    const userBorrowRecord = book.borrowRecords.find(record => record.userId === currentUser?.id);
    if (userBorrowRecord) {
      const dueDate = new Date(userBorrowRecord.dueDate);
      const now = new Date();
      const isOverdue = now > dueDate;
      
      const formattedDueDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (isOverdue) {
        const timeDiff = now.getTime() - dueDate.getTime();
        const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const penalty = daysOverdue * 10;
        return { text: `Overdue! Penalty: ₹${penalty}`, color: 'text-red-600' };
      } else {
        return { text: `Due: ${formattedDueDate}`, color: 'text-yellow-600' };
      }
    }

    return { text: 'Borrowed', color: 'text-red-600' };
  };

  const getButtonProps = () => {
    if (!isLoggedIn) {
      return {
        text: book.available ? 'Borrow' : 'Borrowed',
        disabled: true,
        title: 'Please log in to borrow or return',
        color: 'bg-gray-300 cursor-not-allowed'
      };
    }

    if (book.availableCount > 0) {
      return {
        text: 'Borrow',
        disabled: false,
        title: '',
        color: 'bg-[#D1AC62] hover:bg-[#b99551]'
      };
    }

    const userBorrowRecord = book.borrowRecords.find(record => record.userId === currentUser?.id);
    const isBorrowedByMe = !!userBorrowRecord;
    
    if (isBorrowedByMe || isAdmin) {
      let buttonText = 'Return';
      if (userBorrowRecord) {
        const dueDate = new Date(userBorrowRecord.dueDate);
        const now = new Date();
        if (now > dueDate) {
          const timeDiff = now.getTime() - dueDate.getTime();
          const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
          const penalty = daysOverdue * 10;
          buttonText = `Return (Pay ₹${penalty})`;
        }
      }
      return {
        text: buttonText,
        disabled: false,
        title: isAdmin && !isBorrowedByMe ? 'Admin override' : '',
        color: 'bg-gray-500 hover:bg-gray-600'
      };
    } else {
      return {
        text: 'Borrowed',
        disabled: true,
        title: 'This book is borrowed by another user.',
        color: 'bg-gray-300 cursor-not-allowed'
      };
    }
  };

  const status = getStatusTextAndColor();
  const buttonProps = getButtonProps();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (e.currentTarget.src !== placeholderDataUrl) {
      e.currentTarget.src = placeholderDataUrl;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 h-full">
      <div className="w-full aspect-[2/3] mb-4 bg-gray-200 rounded-md">
        <img 
          src={book.cover} 
          alt={book.title} 
          className="w-full h-full object-cover rounded-md"
          onError={handleImageError}
        />
      </div>
      <h3 className="text-base font-bold text-gray-800 text-center mb-1 h-12 overflow-hidden" title={book.title}>
        {book.title}
      </h3>
      <p className="text-sm text-gray-500 text-center mb-3 h-5 overflow-hidden" title={book.author}>
        {book.author}
      </p>
      <p className={`text-xs font-bold ${status.color}`}>
        {status.text}
      </p>

      <div className="w-full mt-auto pt-4 space-y-2">
        <button 
          onClick={() => onBorrowReturn(book.id)}
          disabled={buttonProps.disabled}
          title={buttonProps.title}
          className={`w-full text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ${buttonProps.color}`}
        >
          {buttonProps.text}
        </button>
        {isAdmin && (
          <button 
              onClick={() => onDeleteBook(book.id)}
              className="w-full text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 bg-red-600 hover:bg-red-700"
          >
              Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;