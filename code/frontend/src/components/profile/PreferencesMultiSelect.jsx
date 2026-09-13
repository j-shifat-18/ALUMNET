'use client';

import React, { useState, useRef, useEffect } from 'react';

const ALL_OPTIONS = [
  // Software & Engineering Domains
  { id: 1, name: 'Full Stack Web Development', value: 'full-stack-web' },
  { id: 2, name: 'Frontend Web Development', value: 'frontend-web' },
  { id: 3, name: 'Backend Systems & API Architecture', value: 'backend-systems' },
  { id: 4, name: 'Mobile App Development', value: 'mobile-app-development' },
  { id: 5, name: 'Software Architecture & System Design', value: 'system-design' },
  { id: 6, name: 'Competitive Programming & Problem Solving', value: 'competitive-programming' },

  // AI & Data
  { id: 7, name: 'Artificial Intelligence & Deep Learning', value: 'ai-deep-learning' },
  { id: 8, name: 'Machine Learning Engineering', value: 'machine-learning' },
  { id: 9, name: 'Data Science & Big Data', value: 'data-science' },
  { id: 10, name: 'Data Analytics & Business Intelligence', value: 'data-analytics' },
  { id: 11, name: 'Natural Language Processing (NLP)', value: 'nlp' },
  { id: 12, name: 'Computer Vision', value: 'computer-vision' },

  // Cloud, Infrastructure & Security
  { id: 13, name: 'Cloud Computing & Solutions Architecture', value: 'cloud-computing' },
  { id: 14, name: 'DevOps & Site Reliability Engineering (SRE)', value: 'devops-sre' },
  { id: 15, name: 'Cybersecurity & Ethical Hacking', value: 'cybersecurity' },
  { id: 16, name: 'Computer Networking & Telecom', value: 'networking-telecom' },

  // Gaming, Media & Design
  { id: 17, name: 'Game Development', value: 'game-development' },
  { id: 18, name: 'Augmented Reality (AR)', value: 'augmented-reality' },
  { id: 19, name: 'Virtual Reality (VR)', value: 'virtual-reality' },
  { id: 20, name: 'UI/UX Design & User Research', value: 'ui-ux-design' },
  { id: 21, name: 'Product Management', value: 'product-management' },

  // Hardware, Electronics & Robotics
  { id: 22, name: 'Robotics & Automation', value: 'robotics-automation' },
  { id: 23, name: 'Embedded Systems & Internet of Things (IoT)', value: 'embedded-iot' },
  { id: 24, name: 'VLSI & Semiconductor Design', value: 'vlsi-design' },
  { id: 25, name: 'Power Systems & Electrical Grid', value: 'power-systems' },
  { id: 26, name: 'Renewable Energy & Sustainability', value: 'renewable-energy' },

  // Mechanical, Aerospace & Civil
  { id: 27, name: 'Automotive Engineering', value: 'automotive-engineering' },
  { id: 28, name: 'Aerospace & Aviation Engineering', value: 'aerospace-engineering' },
  { id: 29, name: 'Thermal & Fluid Engineering', value: 'thermal-fluid' },
  { id: 30, name: 'Industrial & Manufacturing Engineering', value: 'manufacturing-engineering' },
  { id: 31, name: 'Supply Chain Management & Logistics', value: 'supply-chain' },
  { id: 32, name: 'Structural Engineering & Design', value: 'structural-engineering' },
  { id: 33, name: 'Environmental Engineering & Water Resources', value: 'environmental-engineering' },
  { id: 34, name: 'Transportation & Geotechnical Engineering', value: 'transportation-engineering' },
  { id: 35, name: 'Construction Project Management', value: 'construction-management' },

  // Business, Academia & Career Pathways
  { id: 36, name: 'Tech Entrepreneurship & Startups', value: 'tech-startups' },
  { id: 37, name: 'Corporate Business Development & Strategy', value: 'business-strategy' },
  { id: 38, name: 'Fintech & Investment Banking', value: 'fintech-investment' },
  { id: 39, name: 'Management Consulting', value: 'management-consulting' },
  { id: 40, name: 'Higher Studies Abroad (Masters / PhD)', value: 'higher-studies' },
  { id: 41, name: 'Academic Research & Scientific Publications', value: 'research-publications' },
  { id: 42, name: 'Industry Mentorship & Career Guidance', value: 'mentorship-guidance' }
];

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

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

  const filteredOptions = ALL_OPTIONS.filter(option => 
    !selectedOptions.some(selected => selected.id === option.id) && 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="w-full" ref={wrapperRef}>
      <div className="relative">
        <div 
          className="flex flex-wrap items-center gap-2 p-2 min-h-10 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-black rounded-md shadow-sm cursor-text transition-colors focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-slate-100 focus-within:ring-offset-2" 
          onClick={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
            inputRef.current?.focus();
          }}
        >
          {selectedOptions.map(option => (
            <div key={option.id} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium px-2 py-1 rounded-md">
              {option.name}
              <button 
                type="button" 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:ring-offset-1" 
                onClick={e => {
                  e.stopPropagation();
                  removeOption(option);
                }}
              >
                <XIcon />
              </button>
            </div>
          ))}
          <input 
            ref={inputRef} 
            type="text" 
            value={searchTerm} 
            onChange={e => { setSearchTerm(e.target.value); setHighlightedIndex(0); }} 
            onFocus={() => { setIsOpen(true); setHighlightedIndex(0); }} 
            onKeyDown={handleKeyDown} 
            placeholder={selectedOptions.length === 0 ? "Select preferences" : ""} 
            className="grow bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm p-0" 
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-black rounded-md shadow-lg max-h-60 overflow-y-auto animate-popover-in">
            <ul className="p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li 
                    key={option.id} 
                    className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-colors duration-150 ${highlightedIndex === index ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`} 
                    onClick={() => toggleOption(option)} 
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.name}
                    {selectedOptions.some(o => o.id === option.id) && <CheckIcon />}
                  </li>
                ))
              ) : (
                <li className="p-2 text-center text-slate-500 dark:text-slate-400">No options found.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PreferencesMultiSelect({ selectedOptions = [], setSelectedOptions }) {
  return (
    <div className="font-sans">
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
    </div>
  );
}
