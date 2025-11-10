import React, { useState } from 'react';

const GuaranteedSection = ({ selected, onSelect, getAvailableChars }) => {
  const [search, setSearch] = useState('');
  const available = getAvailableChars();
  const filtered = available
    .split('')
    .filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="border border-slate-600 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-medium text-white mb-2">
        Guarantee Characters
      </h3>
      <p className="text-sm text-gray-300 mb-3">
        Selected: {selected.length} will appear in every password
      </p>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 bg-slate-900 text-white rounded text-sm mb-3"
      />

      <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto">
        {filtered.map((char) => (
          <label
            key={char}
            className={`flex items-center justify-center w-8 h-8 rounded cursor-pointer text-xs font-mono transition border
              ${
                selected.includes(char)
                  ? 'bg-green-600 border-green-400 text-white'
                  : 'bg-slate-800 border-slate-600 text-gray-300 hover:bg-slate-700'
              }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(char)}
              onChange={() => onSelect(char)}
              className="sr-only"
            />
            {char}
          </label>
        ))}
      </div>
    </div>
  );
};

export default GuaranteedSection;
