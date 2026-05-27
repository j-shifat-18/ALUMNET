'use client';

import React, { useState, useRef, useEffect } from 'react';
const ALL_OPTIONS = [
  { id: 1, name: 'Web Development', value: 'web-development' },
  { id: 2, name: 'Mobile App Development', value: 'mobile-app-development' },
  { id: 3, name: 'AI & Machine Learning', value: 'ai-machine-learning' },
  { id: 4, name: 'Cloud Computing & DevOps', value: 'cloud-devops' },
  { id: 5, name: 'Cybersecurity & Networking', value: 'cybersecurity-networking' },
  { id: 6, name: 'Game Development & AR/VR', value: 'game-dev-ar-vr' },
  { id: 7, name: 'Competitive Programming', value: 'competitive-programming' },
  { id: 8, name: 'Robotics & Embedded Systems', value: 'robotics-embedded' },
  { id: 9, name: 'VLSI & Chip Design', value: 'vlsi-chip-design' },
  { id: 10, name: 'Power & Renewable Energy', value: 'power-renewable-energy' },
  { id: 11, name: 'Structural & Environmental Engineering', value: 'structural-environmental' },
  { id: 12, name: 'Automotive & Aerospace Engineering', value: 'automotive-aerospace' },
  { id: 13, name: 'Supply Chain & Manufacturing', value: 'supply-chain-manufacturing' },
  { id: 14, name: 'Product Management', value: 'product-management' },
  { id: 15, name: 'Data Analytics & Business Intelligence', value: 'data-analytics-bi' },
  { id: 16, name: 'Tech Entrepreneurship & Startups', value: 'tech-startups' },
  { id: 17, name: 'Finance & Investment Banking', value: 'finance-investment' },
  { id: 18, name: 'Higher Studies Abroad', value: 'higher-studies-abroad' },
  { id: 19, name: 'Academic Research & Publications', value: 'research-publications' }
];
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M20 6 9 17l-5-5" />
    </svg>;
const MultiSelect = ({ selectedOptions, setSelectedOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const filteredOptions = ALL_OPTIONS.filter(option => !selectedOptions.some(selected => selected.id === option.id) && option.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const toggleOption = option => {
    setSelectedOptions(prev => prev.some(o => o.id === option.id) ? prev.filter(o => o.id !== option.id) : [...prev, option]);
    setSearchTerm('');
    inputRef.current?.focus();
  };
  const removeOption = option => {
    setSelectedOptions(selectedOptions.filter(o => o.id !== option.id));
  };
  const handleKeyDown = e => {
    if (e.key === 'Backspace' && searchTerm === '' && selectedOptions.length > 0) {
      removeOption(selectedOptions[selectedOptions.length - 1]);
    }
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (filteredOptions.length > 0)
          setHighlightedIndex(prev => (prev + 1) % filteredOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (filteredOptions.length > 0)
          setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          toggleOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return <div className="w-full" ref={wrapperRef}>
            <div className="relative">
                <div className="flex flex-wrap items-center gap-2 p-2 min-h-10 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-black rounded-md shadow-sm cursor-text transition-colors focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-slate-100 focus-within:ring-offset-2" onClick={() => {
        setIsOpen(true);
        setHighlightedIndex(0);
        inputRef.current?.focus();
      }}>
                    {selectedOptions.map(option => <div key={option.id} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium px-2 py-1 rounded-md">
                            {option.name}
                            <button type="button" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:ring-offset-1" onClick={e => {
            e.stopPropagation();
            removeOption(option);
          }}>
                                <XIcon />
                            </button>
                        </div>)}
                    <input ref={inputRef} type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setHighlightedIndex(0); }} onFocus={() => { setIsOpen(true); setHighlightedIndex(0); }} onKeyDown={handleKeyDown} placeholder={selectedOptions.length === 0 ? "Select preferences" : ""} className="grow bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm p-0" />
                </div>

                {isOpen && <div className="absolute z-10 w-full mt-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-black rounded-md shadow-lg max-h-60 overflow-y-auto animate-popover-in">
                        <ul className="p-1">
                            {filteredOptions.length > 0 ? filteredOptions.map((option, index) => <li key={option.id} className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-colors duration-150 ${highlightedIndex === index ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`} onClick={() => toggleOption(option)} onMouseEnter={() => setHighlightedIndex(index)}>
                                        {option.name}
                                        {selectedOptions.some(o => o.id === option.id) && <CheckIcon />}
                                    </li>) : <li className="p-2 text-center text-slate-500 dark:text-slate-400">No options found.</li>}
                        </ul>
                    </div>}
            </div>
        </div>;
};
export default function PreferencesMultiSelect({ selectedOptions = [], setSelectedOptions }) {
  return <div className="font-sans">
        <style>{`
            @keyframes popover-in {
                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-popover-in {
                transform-origin: top;
                animation: popover-in 0.1s ease-out forwards;
            }
        `}</style>
        <div className="w-full">
            <MultiSelect selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
        </div>
    </div>;
}