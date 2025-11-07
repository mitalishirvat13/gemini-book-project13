
import React from 'react';
import { Category } from '../types';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200
            ${selectedCategory === category.id 
              ? 'bg-[#D1AC62] text-white shadow' 
              : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
            }
          `}
        >
          <span>{category.name}</span>
          <span
            className={`ml-2.5 text-xs font-medium rounded-full px-2 py-0.5
              ${selectedCategory === category.id
                ? 'bg-white/25 text-white'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
              }
            `}
          >
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
