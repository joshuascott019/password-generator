// src/App.jsx
import { useState, useEffect } from 'react';
import { Copy, Check, Settings } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import CharSection from './components/CharSection';
import GuaranteedSection from './components/GuaranteedSection';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guaranteedChars, setGuaranteedChars] = useState([]);

  // Character pools
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

  const generatePassword = () => {
    const allowed = getAllowedChars();
    if (!allowed) {
      setPassword('');
      return;
    }

    const validGuaranteed = guaranteedChars.filter((c) => allowed.includes(c));
    if (validGuaranteed.length > length) {
      setPassword('');
      return;
    }

    // start with an array – much easier than slicing strings
    const pwd = new Array(length);

    // place guaranteed characters in random distinct positions
    const positions = new Set();
    validGuaranteed.forEach((char) => {
      let pos;
      do {
        pos = Math.floor(Math.random() * length);
      } while (positions.has(pos));
      pwd[pos] = char;
      positions.add(pos);
    });

    // fill the rest with random allowed chars
    for (let i = 0; i < length; i++) {
      if (pwd[i] === undefined) {
        pwd[i] = allowed[Math.floor(Math.random() * allowed.length)];
      }
    }

    setPassword(pwd.join(''));
  };
  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols, guaranteedChars]);

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle all in group
  const toggleAll = (group, setter, value) => {
    const keys = Object.keys(group);
    setter(Object.fromEntries(keys.map((k) => [k, value])));
  };

  // Password strength
  const calculateStrength = () => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-600' };

    let score = 0;
    const len = password.length;

    score += Math.min(len * 4, 40);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:",.<>?/]/.test(password);

    score += hasUpper ? 15 : 0;
    score += hasLower ? 15 : 0;
    score += hasNumber ? 15 : 0;
    score += hasSymbol ? 20 : 0;

    const charCount = {};
    password.split('').forEach((c) => (charCount[c] = (charCount[c] || 0) + 1));
    const repeated = Object.values(charCount).some((count) => count > 1);
    if (repeated && len < 12) score -= 10;

    score = Math.max(0, Math.min(100, score));

    let label = '',
      color = '';
    if (score <= 25) {
      label = 'Weak';
      color = 'bg-red-600';
    } else if (score <= 50) {
      label = 'Fair';
      color = 'bg-orange-500';
    } else if (score <= 75) {
      label = 'Good';
      color = 'bg-yellow-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    return { score, label, color };
  };

  const strength = calculateStrength();

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Password Generator <span className="text-xs">v2</span>
        </h2>

        <div className="bg-slate-950 shadow-2xl p-6 rounded-lg w-full max-w-md">
          {/* Result */}
          <div className="bg-black bg-opacity-40 flex items-center justify-between rounded-md p-3 h-14 text-lg tracking-wider relative">
            <span className="break-all pr-12 max-w-full">
              {password || 'Click Generate'}
            </span>
            <button
              onClick={copyToClipboard}
              className="absolute right-1 top-1 w-10 h-10 bg-slate-900 hover:bg-slate-800 rounded flex items-center justify-center transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Strength Meter */}
          {password && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Strength</span>
                <span className="font-medium">{strength.label}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-500 ease-out`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}

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
              className="w-20 px-2 py-1 text-white bg-slate-800 rounded text-center"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePassword}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded transition-colors text-lg"
          >
            Generate Password
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>

          {/* Warning */}
          {guaranteedChars.length > length && (
            <p className="mt-2 text-red-400 text-sm text-center">
              Warning: Too many guaranteed characters for length {length}
            </p>
          )}
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-950 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-2xl font-bold text-white mb-6">
                    Character Settings
                  </Dialog.Title>

                  <div className="space-y-6">
                    <CharSection
                      title="Uppercase Letters"
                      chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                      state={uppercase}
                      setter={setUppercase}
                      toggleAll={toggleAll}
                      guaranteedChars={guaranteedChars}
                      setGuaranteedChars={setGuaranteedChars}
                    />
                    <CharSection
                      title="Lowercase Letters"
                      chars="abcdefghijklmnopqrstuvwxyz"
                      state={lowercase}
                      setter={setLowercase}
                      toggleAll={toggleAll}
                      guaranteedChars={guaranteedChars}
                      setGuaranteedChars={setGuaranteedChars}
                    />
                    <CharSection
                      title="Numbers"
                      chars="0123456789"
                      state={numbers}
                      setter={setNumbers}
                      toggleAll={toggleAll}
                      guaranteedChars={guaranteedChars}
                      setGuaranteedChars={setGuaranteedChars}
                    />
                    <CharSection
                      title="Symbols"
                      chars="!@#$%^&*()_+-=[]{}|;:,.<>?/"
                      state={symbols}
                      setter={setSymbols}
                      toggleAll={toggleAll}
                      guaranteedChars={guaranteedChars}
                      setGuaranteedChars={setGuaranteedChars}
                    />

                    <GuaranteedSection
                      selected={guaranteedChars}
                      onSelect={(char) => {
                        setGuaranteedChars((prev) =>
                          prev.includes(char)
                            ? prev.filter((c) => c !== char)
                            : [...prev, char]
                        );
                      }}
                      getAvailableChars={getAllowedChars}
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
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

export default App;
