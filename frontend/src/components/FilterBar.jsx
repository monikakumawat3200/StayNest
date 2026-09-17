import React from 'react';
import { useSearchParams } from 'react-router-dom';

const categories = [
  {
    name: 'All',
    label: 'All Properties',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M4 6h24v2H4zm0 8h24v2H4zm0 8h24v2H4z"></path>
      </svg>
    ),
  },
  {
    name: 'Cabin',
    label: 'Cabins',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M16 1.33 1.33 13.33h4v16h21.34v-16h4zm8.67 25.34H7.33v-13.6l8.67-7.1 8.67 7.1zM11 16h10v2H11zm0 4h10v2H11z"></path>
      </svg>
    ),
  },
  {
    name: 'Beachfront',
    label: 'Beachfront',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M26 12A10 10 0 0 0 6 12c0 4.97 4 9 10 9s10-4.03 10-9zm-10 7c-4.41 0-8-3.13-8-7s3.59-7 8-7 8 3.13 8 7-3.59 7-8 7zm16 8.5v1.5H0v-1.5c0-2 4-3.5 16-3.5s16 1.5 16 3.5z"></path>
      </svg>
    ),
  },
  {
    name: 'Mansion',
    label: 'Mansions',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M2 28v-4h2v-8H2v-4h4V4h20v8h4v4h-2v8h2v4zm6-16h16V6H8zm2 12h3v-6h-3zm5 0h3v-6h-3zm5 0h3v-6h-3z"></path>
      </svg>
    ),
  },
  {
    name: 'Treehouse',
    label: 'Treehouses',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M16 2a10 10 0 0 0-8.9 14.6l-2.1 2.1 1.4 1.4 2-2a9.9 9.9 0 0 0 15.2 0l2 2 1.4-1.4-2.1-2.1A10 10 0 0 0 16 2zm4 11h-8v-3h8zm-1 6h-6v-2h6zM15 28v-4h2v-2h-2v-3h2v9z"></path>
      </svg>
    ),
  },
  {
    name: 'Countryside',
    label: 'Countryside',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M16 2.5 2.5 13h4v15h19V13h4zm7.5 23.5H8.5V11.8l7.5-5.8 7.5 5.8zM11 15h10v2H11zm0 4h6v2h-6z"></path>
      </svg>
    ),
  },
  {
    name: 'Desert',
    label: 'Desert',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M12 28v-9.5c0-1.4 1.1-2.5 2.5-2.5h3c1.4 0 2.5 1.1 2.5 2.5V28h2V18.5a4.5 4.5 0 0 0-4.5-4.5H16A4.5 4.5 0 0 0 11.5 18.5V28zM4 28v-6c0-2.2 1.8-4 4-4h2v2H8c-1.1 0-2 .9-2 2v6zm24 0v-8c0-2.2-1.8-4-4-4h-2v2h2c1.1 0 2 .9 2 2v8z"></path>
      </svg>
    ),
  },
  {
    name: 'Urban',
    label: 'Trending Cities',
    icon: (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '24px', width: '24px' }}>
        <path d="M2 30V8h6v6h4V4h8v12h4v-6h6v20zm8-14H4v12h6zm10-10h-6v22h6zm10 6h-6v16h6zm-24 6h2v2H4zm0 4h2v2H4zm10-14h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm10-4h2v2h-2zm0 4h2v2h-2z"></path>
      </svg>
    ),
  },
];

const FilterBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const handleCategoryClick = (categoryName) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryName);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="filter-bar">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className={`filter-item ${activeCategory === cat.name ? 'active' : ''}`}
          onClick={() => handleCategoryClick(cat.name)}
        >
          {cat.icon}
          <span className="filter-label">{cat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
