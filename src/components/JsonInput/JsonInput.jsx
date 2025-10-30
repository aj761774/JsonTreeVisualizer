import React from 'react';
import './index.css';

export default function JsonInput({ onJsonChange }) {
  const sample = `{
  "user": {
    "name": "Alice",
    "address": { "city": "Wonderland", "zip": 12345 }
  },
  "items": [
    { "name": "item1" },
    { "name": "item2" }
  ]
}`;

  return (
    <textarea
      className="json-input"
      defaultValue={sample}
      onChange={onJsonChange}
    />
  );
}
