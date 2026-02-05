import React from 'react';
import { CATEGORIES } from '../../constants/mapIcons';
import './CategoryTab.css';

interface CategoryTabProps {
  currentFilter: string;
  onFilterChange: (category: string) => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className='category-container'>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          className={`category-btn ${currentFilter === cat ? 'active' : ''}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryTab;