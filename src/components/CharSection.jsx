import React, { useState } from 'react';

const CharSection = ({
  title,
  chars,
  state,
  setter,
  toggleAll,
  guaranteedChars,
  setGuaranteedChars,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const selectedCount = Object.values(state).filter((v) => v).length;

  return (
    <div className="border border-slate-700 rounded-lg p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-medium text-white hover:text-slate-300 transition"
      >
        <span>
          {title} ({selectedCount}/{chars.length} selected)
        </span>
        <span>{isOpen ? 'Collapse' : 'Expand'}</span>
      </button>

      {isOpen && (
        <div className="mt-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => toggleAll(state, setter, true)}
              className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
            >
              Select All
            </button>
            <button
              onClick={() => toggleAll(state, setter, false)}
              className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              Deselect All
            </button>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-13 gap-2">
            {chars.split('').map((char) => (
              <label
                key={char}
                className="text-white flex items-center justify-center w-10 h-10 rounded border border-slate-500 bg-slate-600 cursor-pointer transition has-[:checked]:bg-green-600 has-[:checked]:border-green-400"
              >
                <input
                  type="checkbox"
                  checked={state[char] || false}
                  onChange={(e) => {
                    setter({ ...state, [char]: e.target.checked });
                    if (!e.target.checked && guaranteedChars.includes(char)) {
                      setGuaranteedChars((prev) =>
                        prev.filter((c) => c !== char)
                      );
                    }
                  }}
                  className="sr-only"
                />
                <span className="text-sm font-mono select-none">{char}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharSection;
