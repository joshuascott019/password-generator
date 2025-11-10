import { useState, useEffect } from 'react';
import { Copy, Check, Settings } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Character pools (individual toggles)
  const [uppercase, setUppercase] = useState(
    Object.fromEntries(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => [c, true])
    )
  );
  const [lowercase, setLowercase] = useState(
    Object.fromEntries(
      'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => [c, true])
    )
  );
  const [numbers, setNumbers] = useState(
    Object.fromEntries('0123456789'.split('').map((c) => [c, true]))
  );
  const [symbols, setSymbols] = useState(
    Object.fromEntries(
      '!@#$%^&*()_+-=[]{}|;:,.<>?/'.split('').map((c) => [c, true])
    )
  );

  // Get allowed characters
  const getAllowedChars = () => {
    let chars = '';
    if (Object.values(uppercase).some((v) => v))
      chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        .split('')
        .filter((c) => uppercase[c])
        .join('');
    if (Object.values(lowercase).some((v) => v))
      chars += 'abcdefghijklmnopqrstuvwxyz'
        .split('')
        .filter((c) => lowercase[c])
        .join('');
    if (Object.values(numbers).some((v) => v))
      chars += '0123456789'
        .split('')
        .filter((c) => numbers[c])
        .join('');
    if (Object.values(symbols).some((v) => v))
      chars += '!@#$%^&*()_+-=[]{}|;:,.<>?/'
        .split('')
        .filter((c) => symbols[c])
        .join('');
    return chars;
  };

  // Generate password from allowed chars
  const generatePassword = () => {
    const allowed = getAllowedChars();
    if (!allowed) {
      setPassword('');
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += allowed[Math.floor(Math.random() * allowed.length)];
    }
    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols]);

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle all in a group
  const toggleAll = (group, setter, value) => {
    const keys = Object.keys(group);
    setter(Object.fromEntries(keys.map((k) => [k, value])));
  };

  return (
    <>
      <div className="min-h-screen bg-indigo-900 text-white flex flex-col items-center justify-center p-4 font-sans">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Password Generator
        </h2>

        <div className="bg-indigo-950 shadow-2xl p-6 rounded-lg w-full max-w-md">
          {/* Result */}
          <div className="bg-black bg-opacity-40 flex items-center justify-between rounded-md p-3 h-14 text-lg tracking-wider relative">
            <span className="break-all pr-12 max-w-full">
              {password || 'Click Generate'}
            </span>
            <button
              onClick={copyToClipboard}
              className="absolute right-1 top-1 w-10 h-10 bg-indigo-900 hover:bg-indigo-800 rounded flex items-center justify-center transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Length */}
          <div className="mt-6 flex justify-between items-center">
            <label className="text-sm md:text-base">Password Length</label>
            <input
              type="number"
              min="4"
              max="50"
              value={length}
              onChange={(e) =>
                setLength(Math.min(50, Math.max(4, +e.target.value)))
              }
              className="w-20 px-2 py-1 text-black rounded text-center"
            />
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full bg-indigo-800 hover:bg-indigo-700 text-white font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Character Settings
          </button>

          {/* Generate Button */}
          <button
            onClick={generatePassword}
            className="mt-4 w-full bg-indigo-900 hover:bg-indigo-800 text-white font-medium py-3 rounded transition-colors text-lg"
          >
            Generate Password
          </button>
        </div>
      </div>

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-indigo-950 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-2xl font-bold text-white mb-6">
                    Character Settings
                  </Dialog.Title>

                  <div className="space-y-6">
                    {/* Uppercase */}
                    <CharSection
                      title="Uppercase Letters"
                      chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                      state={uppercase}
                      setter={setUppercase}
                      toggleAll={toggleAll}
                    />

                    {/* Lowercase */}
                    <CharSection
                      title="Lowercase Letters"
                      chars="abcdefghijklmnopqrstuvwxyz"
                      state={lowercase}
                      setter={setLowercase}
                      toggleAll={toggleAll}
                    />

                    {/* Numbers */}
                    <CharSection
                      title="Numbers"
                      chars="0123456789"
                      state={numbers}
                      setter={setNumbers}
                      toggleAll={toggleAll}
                    />

                    {/* Symbols */}
                    <CharSection
                      title="Symbols"
                      chars="!@#$%^&*()_+-=[]{}|;:,.<>?/"
                      state={symbols}
                      setter={setSymbols}
                      toggleAll={toggleAll}
                    />
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

// Reusable Character Section Component
function CharSection({ title, chars, state, setter, toggleAll }) {
  const [isOpen, setIsOpen] = useState(true);
  const selectedCount = Object.values(state).filter((v) => v).length;

  return (
    <div className="border border-indigo-700 rounded-lg p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-medium text-white hover:text-indigo-300 transition"
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
              className="text-xs px-3 py-1 bg-indigo-700 hover:bg-indigo-600 rounded text-white"
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
                className="flex items-center justify-center w-10 h-10 rounded border border-indigo-500 cursor-pointer transition has-[:checked]:bg-indigo-600 has-[:checked]:border-indigo-400"
              >
                <input
                  type="checkbox"
                  checked={state[char] || false}
                  onChange={(e) =>
                    setter({ ...state, [char]: e.target.checked })
                  }
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
}

export default App;
