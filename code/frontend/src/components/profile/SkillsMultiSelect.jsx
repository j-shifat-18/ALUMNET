'use client';

import React, { useState, useRef, useEffect } from 'react';

const ALL_OPTIONS = [
  { id: 1, name: 'Python', value: 'python' },
  { id: 2, name: 'JavaScript', value: 'javascript' },
  { id: 3, name: 'TypeScript', value: 'typescript' },
  { id: 4, name: 'C++', value: 'c-plus-plus' },
  { id: 5, name: 'C', value: 'c' },
  { id: 6, name: 'Java', value: 'java' },
  { id: 7, name: 'Go (Golang)', value: 'go' },
  { id: 8, name: 'SQL', value: 'sql' },
  { id: 9, name: 'HTML5 / CSS3', value: 'html5-css3' },
  { id: 10, name: 'React.js', value: 'react' },
  { id: 11, name: 'Next.js', value: 'nextjs' },
  { id: 12, name: 'Node.js', value: 'nodejs' },
  { id: 13, name: 'Express', value: 'express' },
  { id: 14, name: 'Django', value: 'django' },
  { id: 15, name: 'FastAPI', value: 'fastapi' },
  { id: 16, name: 'Spring Boot', value: 'spring-boot' },
  { id: 17, name: 'Flutter', value: 'flutter' },
  { id: 18, name: 'React Native', value: 'react-native' },
  { id: 19, name: 'REST APIs / GraphQL', value: 'apis-graphql' },
  { id: 20, name: 'TensorFlow / PyTorch', value: 'tensorflow-pytorch' },
  { id: 21, name: 'Pandas / NumPy', value: 'pandas-numpy' },
  { id: 22, name: 'Data Analytics (Tableau/PowerBI)', value: 'data-analytics' },
  { id: 23, name: 'Excel (Advanced)', value: 'excel' },
  { id: 24, name: 'MATLAB / Simulink', value: 'matlab-simulink' },
  { id: 25, name: 'Verilog / VHDL (VLSI)', value: 'verilog-vhdl' },
  { id: 26, name: 'Arduino / Raspberry Pi', value: 'arduino-raspberrypi' },
  { id: 27, name: 'PLC Programming', value: 'plc-programming' },
  { id: 28, name: 'LabVIEW', value: 'labview' },
  { id: 29, name: 'AutoCAD', value: 'autocad' },
  { id: 30, name: 'SolidWorks', value: 'solidworks' },
  { id: 31, name: 'Ansys (FEA / CFD)', value: 'ansys' },
  { id: 32, name: 'Revit / ETABS', value: 'revit-etabs' },
  { id: 33, name: '3D Printing / CAM', value: '3d-printing-cam' },
  { id: 34, name: 'Git / GitHub', value: 'git-github' },
  { id: 35, name: 'Docker / Kubernetes', value: 'docker-kubernetes' },
  { id: 36, name: 'AWS / GCP', value: 'aws-gcp' },
  { id: 37, name: 'Figma (UI/UX Design)', value: 'figma' },
  { id: 38, name: 'System Architecture', value: 'system-architecture' },
  { id: 39, name: 'Project Management (Agile/Scrum)', value: 'project-management' },
  { id: 40, name: 'Public Speaking / Presentation', value: 'public-speaking' },
  { id: 41, name: 'Technical Writing', value: 'technical-writing' },
  { id: 42, name: 'Business Development & Strategy', value: 'business-development' }
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
            placeholder={selectedOptions.length === 0 ? "Your skills" : ""} 
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

export default function SkillsMultiSelect({ selectedOptions = [], setSelectedOptions }) {
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
