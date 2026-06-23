'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const q = query.trim();
    if (q) window.location.href = `/songs?q=${encodeURIComponent(q)}`;
  };

  return (
    <div className="wap-search" style={{ marginTop: 10 }}>
      <input
        className="wap-input"
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        placeholder="Search songs, artists..."
      />
      <button onClick={handleSearch}>GO</button>
    </div>
  );
}
