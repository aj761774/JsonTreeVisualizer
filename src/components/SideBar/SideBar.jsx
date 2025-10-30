import React, { useRef } from 'react';
import JsonInput from '../JsonInput/JsonInput';
import SearchBar from '../SearchBar/SearchBar';
import './index.css';

export default function SideBar({
  onJsonChange,
  generateTree,
  handleSearch,
  rfInstanceRef,
  inputRef,
}) {
  return (
    <div className="sidebar">
      <h1 style={{ margin: 0, marginBottom: 12 }}>JSON Tree Visualizer</h1>

      <JsonInput onJsonChange={onJsonChange} inputRef={inputRef} />

      <button onClick={generateTree} className="generate-button">
        Generate Tree
      </button>

      <SearchBar handleSearch={handleSearch} inputRef={inputRef} />

      <button
        onClick={() => rfInstanceRef.current?.fitView?.({ padding: 0.2 })}
        className="fitview-button"
      >
        Fit View
      </button>

      <div className="notes">
        Notes:
        <ul className="notes-list">
          <li>
            Paths shown on nodes match search input format (e.g.{' '}
            <code>$.user.address.city</code>).
          </li>
          <li>
            Array indices use brackets: <code>$.items[0].name</code>.
          </li>
        </ul>
      </div>
    </div>
  );
}
