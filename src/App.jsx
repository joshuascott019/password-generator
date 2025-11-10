// src/App.jsx
import { useState, useEffect } from 'react';
import { Copy, Check, Settings } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import CharSection from './components/CharSection';
import GuaranteedSection from './components/GuaranteedSection';

// App version (bump this when you update!)
const APP_VERSION = '2.4.0';
// What's New content (easy to edit)
const CHANGELOG = [
  '✨ Bulk password generation (1-100)',
  '🔒 "Require 1" per character group',
  '📋 Copy all passwords in bulk mode',
  '💾 Full settings persistence',
  '📏 Improved strength meter',
  '❤️ For my sweetheart!',
].join('\n');

function App() {
  const [showChangelog, setShowChangelog] = useState(false);
  const [passwords, setPasswords] = useState([]);
  const [length, setLength] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guaranteedChars, setGuaranteedChars] = useState([]);
  const [bulkCount, setBulkCount] = useState(1);

  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSymbols, setRequireSymbols] = useState(true);

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
      setPasswords([]);
      return;
    }

    const validGuaranteed = guaranteedChars.filter((c) => allowed.includes(c));
    if (validGuaranteed.length > length) {
      setPasswords([]);
      return;
    }

    const result = [];

    // Build allowed pools per group
    const pools = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((c) => uppercase[c]),
      lower: 'abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => lowercase[c]),
      number: '0123456789'.split('').filter((c) => numbers[c]),
      symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?/'.split('').filter((c) => symbols[c]),
    };

    // Determine which groups must appear
    const mustInclude = [];
    if (requireUppercase && pools.upper.length > 0) mustInclude.push('upper');
    if (requireLowercase && pools.lower.length > 0) mustInclude.push('lower');
    if (requireNumbers && pools.number.length > 0) mustInclude.push('number');
    if (requireSymbols && pools.symbol.length > 0) mustInclude.push('symbol');

    if (mustInclude.length + validGuaranteed.length > length) {
      setPasswords([]);
      return;
    }

    for (let n = 0; n < bulkCount; n++) {
      const pwd = new Array(length);
      const used = new Set();

      // 1. Place guaranteed chars
      validGuaranteed.forEach((char) => {
        let pos;
        do {
          pos = Math.floor(Math.random() * length);
        } while (used.has(pos));
        pwd[pos] = char;
        used.add(pos);
      });

      // 2. Place one from each required group
      mustInclude.forEach((group) => {
        let pos;
        do {
          pos = Math.floor(Math.random() * length);
        } while (used.has(pos));
        pwd[pos] =
          pools[group][Math.floor(Math.random() * pools[group].length)];
        used.add(pos);
      });

      // 3. Fill rest with any allowed char
      for (let i = 0; i < length; i++) {
        if (pwd[i] === undefined) {
          pwd[i] = allowed[Math.floor(Math.random() * allowed.length)];
        }
      }

      result.push(pwd.join(''));
    }

    setPasswords(result);
  };
  useEffect(() => {
    generatePassword();
  }, [
    length,
    bulkCount,
    uppercase,
    lowercase,
    numbers,
    symbols,
    guaranteedChars,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSymbols,
  ]);
  // ── LOCAL STORAGE ─────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('pwdGenConfig');
    if (saved) {
      const cfg = JSON.parse(saved);
      setLength(cfg.length ?? 20);
      setBulkCount(cfg.bulkCount ?? 1);
      setUppercase(
        cfg.uppercase ??
          Object.fromEntries(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => [c, true])
          )
      );
      setLowercase(
        cfg.lowercase ??
          Object.fromEntries(
            'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => [c, true])
          )
      );
      setNumbers(
        cfg.numbers ??
          Object.fromEntries('0123456789'.split('').map((c) => [c, true]))
      );
      setSymbols(
        cfg.symbols ??
          Object.fromEntries(
            '!@#$%^&*()_+-=[]{}|;:,.<>?/'.split('').map((c) => [c, true])
          )
      );
      setGuaranteedChars(cfg.guaranteedChars ?? []);
      setRequireUppercase(cfg.requireUppercase ?? true);
      setRequireLowercase(cfg.requireLowercase ?? true);
      setRequireNumbers(cfg.requireNumbers ?? true);
      setRequireSymbols(cfg.requireSymbols ?? true);
    }
  }, []); // run once on mount

  // Save whenever any setting changes
  useEffect(() => {
    const config = {
      length,
      bulkCount,
      uppercase,
      lowercase,
      numbers,
      symbols,
      guaranteedChars,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSymbols,
    };
    localStorage.setItem('pwdGenConfig', JSON.stringify(config));
  }, [
    length,
    bulkCount,
    uppercase,
    lowercase,
    numbers,
    symbols,
    guaranteedChars,
  ]);

  // Check for updates on mount
  useEffect(() => {
    const savedVersion = localStorage.getItem('appVersion');
    if (savedVersion !== APP_VERSION) {
      setShowChangelog(true);
      localStorage.setItem('appVersion', APP_VERSION);
    }
  }, []);

  const copyToClipboard = async (text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeChangelog = () => {
    setShowChangelog(false);
  };

  // Toggle all in group
  const toggleAll = (group, setter, value) => {
    const keys = Object.keys(group);
    setter(Object.fromEntries(keys.map((k) => [k, value])));
  };

  // Password strength
  const calculateStrength = () => {
    const pwd = passwords[0] || '';
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-600' };

    let score = 0;
    const len = pwd.length;

    score += Math.min(len * 4, 40);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:",.<>?/]/.test(pwd);

    score += hasUpper ? 15 : 0;
    score += hasLower ? 15 : 0;
    score += hasNumber ? 15 : 0;
    score += hasSymbol ? 20 : 0;

    const charCount = {};
    pwd.split('').forEach((c) => (charCount[c] = (charCount[c] || 0) + 1));
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
          Password Generator <span className="text-xs">{APP_VERSION}</span>
        </h2>

        <div className="bg-slate-950 shadow-2xl p-6 rounded-lg w-full max-w-md">
          {/* Copy All Button – only when bulk > 1 */}
          {passwords.length > 1 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => copyToClipboard(passwords.join('\n'))}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-medium rounded flex items-center gap-2 transition"
              >
                {copied === passwords.join('\n') ? (
                  <>
                    <Check className="w-5 h-5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" /> Copy All
                  </>
                )}
              </button>
            </div>
          )}
          {/* Result List */}
          <div className="mt-6 bg-black bg-opacity-40 rounded-md p-3 max-h-60 overflow-y-auto">
            {passwords.length === 0 ? (
              <p className="text-center text-gray-400">Click Generate</p>
            ) : (
              <ul className="space-y-2">
                {passwords.map((pwd, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between text-sm md:text-base"
                  >
                    <span className="break-all pr-2">{pwd}</span>
                    <button
                      onClick={() => copyToClipboard(pwd)}
                      className="w-8 h-8 bg-indigo-900 hover:bg-indigo-800 rounded flex items-center justify-center transition"
                      title="Copy"
                    >
                      {copied === pwd ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Strength Meter – now uses first password (or hide if bulk) */}
          {passwords.length > 0 && bulkCount === 1 && (
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
          {/* Bulk Count */}
          <div className="mt-4 flex justify-between items-center">
            <label className="text-sm md:text-base">Generate Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={bulkCount}
              onChange={(e) =>
                setBulkCount(Math.min(100, Math.max(1, +e.target.value)))
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
                      title="Symbols"
                      chars="!@#$%^&*()_+-=[]{}|;:,.<>?/"
                      state={symbols}
                      setter={setSymbols}
                      toggleAll={toggleAll}
                      requireOne={requireSymbols}
                      setRequireOne={setRequireSymbols}
                      guaranteedChars={guaranteedChars}
                      setGuaranteedChars={setGuaranteedChars}
                    />
                    <CharSection
                      title="Numbers"
                      chars="0123456789"
                      state={numbers}
                      setter={setNumbers}
                      toggleAll={toggleAll}
                      requireOne={requireNumbers}
                      setRequireOne={setRequireNumbers}
                      guaranteedChars={guaranteedChars}
                      setGuaranteedChars={setGuaranteedChars}
                    />
                    <CharSection
                      title="Uppercase Letters"
                      chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                      state={uppercase}
                      setter={setUppercase}
                      toggleAll={toggleAll}
                      requireOne={requireUppercase}
                      setRequireOne={setRequireUppercase}
                      guaranteedChars={guaranteedChars}
                      setGuaranteedChars={setGuaranteedChars}
                    />
                    <CharSection
                      title="Lowercase Letters"
                      chars="abcdefghijklmnopqrstuvwxyz"
                      state={lowercase}
                      setter={setLowercase}
                      toggleAll={toggleAll}
                      requireOne={requireLowercase}
                      setRequireOne={setRequireLowercase}
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

      {/* Changelog Modal */}
      <Transition appear show={showChangelog} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeChangelog}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-indigo-950 p-6 text-left shadow-xl transition-all">
                  <Dialog.Title className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-400">🎉</span> What's New in v
                    {APP_VERSION}
                  </Dialog.Title>

                  <div className="bg-black bg-opacity-30 rounded p-4 mb-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">
                      {CHANGELOG}
                    </pre>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={closeChangelog}
                      className="px-6 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white transition"
                    >
                      Got it!
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
