import React from 'react';
import './index.css';

export default function SearchBar({ inputRef, handleSearch }) {
  return (
    <>
      <input
        ref={inputRef}
        placeholder="$.user.address.city or $.items[0].name"
        className="search-input"
      />

      <button
        onClick={handleSearch}
        style={{
          width: '300px',
          marginTop: 10,
          padding: 10,
          background: '#06b6d4',
          color: 'white',
          border: 'none',
          borderRadius: 8,
        }}
      >
        Search
      </button>
    </>
  );
}
