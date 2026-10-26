'use client';

import React, { useState, useRef, useEffect } from 'react';

const ALL_OPTIONS = [
  // Programming Languages
  { id: 1, name: 'Python', value: 'python' },
  { id: 2, name: 'JavaScript', value: 'javascript' },
  { id: 3, name: 'TypeScript', value: 'typescript' },
  { id: 4, name: 'C++', value: 'c-plus-plus' },
  { id: 5, name: 'C', value: 'c' },
  { id: 6, name: 'C#', value: 'c-sharp' },
  { id: 7, name: 'Java', value: 'java' },
  { id: 8, name: 'Go (Golang)', value: 'go' },
  { id: 9, name: 'Rust', value: 'rust' },
  { id: 10, name: 'PHP', value: 'php' },
  { id: 11, name: 'Kotlin', value: 'kotlin' },
  { id: 12, name: 'Swift', value: 'swift' },
  { id: 13, name: 'SQL', value: 'sql' },
  { id: 14, name: 'R', value: 'r' },
  { id: 15, name: 'MATLAB', value: 'matlab' },
  { id: 16, name: 'Bash / Shell Scripting', value: 'bash' },

  // Web & Frontend
  { id: 17, name: 'HTML5', value: 'html5' },
  { id: 18, name: 'CSS3', value: 'css3' },
  { id: 19, name: 'Tailwind CSS', value: 'tailwind-css' },
  { id: 20, name: 'React.js', value: 'react' },
  { id: 21, name: 'Next.js', value: 'nextjs' },
  { id: 22, name: 'Vue.js', value: 'vuejs' },
  { id: 23, name: 'Angular', value: 'angular' },
  { id: 24, name: 'Sass / SCSS', value: 'sass' },
  { id: 25, name: 'Redux / Zustand', value: 'redux' },

  // Backend & APIs
  { id: 26, name: 'Node.js', value: 'nodejs' },
  { id: 27, name: 'Express.js', value: 'express' },
  { id: 28, name: 'NestJS', value: 'nestjs' },
  { id: 29, name: 'Django', value: 'django' },
  { id: 30, name: 'FastAPI', value: 'fastapi' },
  { id: 31, name: 'Flask', value: 'flask' },
  { id: 32, name: 'Spring Boot', value: 'spring-boot' },
  { id: 33, name: 'ASP.NET Core', value: 'aspnet-core' },
  { id: 34, name: 'REST APIs', value: 'rest-apis' },
  { id: 35, name: 'GraphQL', value: 'graphql' },
  { id: 36, name: 'gRPC', value: 'grpc' },
  { id: 37, name: 'Microservices', value: 'microservices' },

  // Databases & Storage
  { id: 38, name: 'PostgreSQL', value: 'postgresql' },
  { id: 39, name: 'MySQL', value: 'mysql' },
  { id: 40, name: 'MongoDB', value: 'mongodb' },
  { id: 41, name: 'Redis', value: 'redis' },
  { id: 42, name: 'Firebase', value: 'firebase' },
  { id: 43, name: 'Supabase', value: 'supabase' },
  { id: 44, name: 'Prisma ORM', value: 'prisma' },

  // Mobile App Development
  { id: 45, name: 'Flutter', value: 'flutter' },
  { id: 46, name: 'React Native', value: 'react-native' },
  { id: 47, name: 'Android Development', value: 'android-dev' },
  { id: 48, name: 'iOS Development', value: 'ios-dev' },

  // Cloud, DevOps & Infrastructure
  { id: 49, name: 'Git', value: 'git' },
  { id: 50, name: 'GitHub', value: 'github' },
  { id: 51, name: 'GitLab', value: 'gitlab' },
  { id: 52, name: 'Docker', value: 'docker' },
  { id: 53, name: 'Kubernetes', value: 'kubernetes' },
  { id: 54, name: 'Amazon Web Services (AWS)', value: 'aws' },
  { id: 55, name: 'Google Cloud Platform (GCP)', value: 'gcp' },
  { id: 56, name: 'Microsoft Azure', value: 'azure' },
  { id: 57, name: 'CI/CD Pipelines', value: 'ci-cd' },
  { id: 58, name: 'Linux System Administration', value: 'linux' },
  { id: 59, name: 'Terraform', value: 'terraform' },

  // AI, Machine Learning & Data Science
  { id: 60, name: 'Machine Learning', value: 'machine-learning' },
  { id: 61, name: 'Deep Learning', value: 'deep-learning' },
  { id: 62, name: 'TensorFlow', value: 'tensorflow' },
  { id: 63, name: 'PyTorch', value: 'pytorch' },
  { id: 64, name: 'Scikit-Learn', value: 'scikit-learn' },
  { id: 65, name: 'Pandas', value: 'pandas' },
  { id: 66, name: 'NumPy', value: 'numpy' },
  { id: 67, name: 'Natural Language Processing (NLP)', value: 'nlp' },
  { id: 68, name: 'Computer Vision', value: 'computer-vision' },
  { id: 69, name: 'Generative AI & LLMs', value: 'gen-ai' },
  { id: 70, name: 'Data Analytics', value: 'data-analytics' },
  { id: 71, name: 'Tableau', value: 'tableau' },
  { id: 72, name: 'Power BI', value: 'power-bi' },
  { id: 73, name: 'Advanced Excel', value: 'excel' },

  // EEE, Embedded Systems & Hardware
  { id: 74, name: 'Arduino', value: 'arduino' },
  { id: 75, name: 'Raspberry Pi', value: 'raspberry-pi' },
  { id: 76, name: 'Embedded C / C++', value: 'embedded-c' },
  { id: 77, name: 'Verilog', value: 'verilog' },
  { id: 78, name: 'VHDL', value: 'vhdl' },
  { id: 79, name: 'VLSI Design', value: 'vlsi' },
  { id: 80, name: 'FPGA Programming', value: 'fpga' },
  { id: 81, name: 'PCB Design & Layout', value: 'pcb-design' },
  { id: 82, name: 'Circuit Simulation (Proteus / Multisim)', value: 'circuit-simulation' },
  { id: 83, name: 'Simulink', value: 'simulink' },
  { id: 84, name: 'PLC Programming', value: 'plc' },
  { id: 85, name: 'SCADA Systems', value: 'scada' },
  { id: 86, name: 'Power Systems Analysis', value: 'power-systems' },
  { id: 87, name: 'Renewable Energy Systems', value: 'renewable-energy' },
  { id: 88, name: 'LabVIEW', value: 'labview' },

  // Mechanical & Manufacturing Engineering
  { id: 89, name: 'AutoCAD', value: 'autocad' },
  { id: 90, name: 'SolidWorks', value: 'solidworks' },
  { id: 91, name: 'CATIA', value: 'catia' },
  { id: 92, name: 'Ansys FEA', value: 'ansys-fea' },
  { id: 93, name: 'Computational Fluid Dynamics (CFD)', value: 'cfd' },
  { id: 94, name: 'Finite Element Analysis (FEA)', value: 'fea' },
  { id: 95, name: '3D Printing', value: '3d-printing' },
  { id: 96, name: 'Computer-Aided Manufacturing (CAM)', value: 'cam' },
  { id: 97, name: 'Computer-Aided Design (CAD)', value: 'cad' },
  { id: 98, name: 'Robotics & Automation', value: 'robotics' },
  { id: 99, name: 'HVAC Design', value: 'hvac' },
  { id: 100, name: 'Thermodynamics & Heat Transfer', value: 'thermodynamics' },

  // Civil & Environmental Engineering
  { id: 101, name: 'Autodesk Revit', value: 'revit' },
  { id: 102, name: 'ETABS', value: 'etabs' },
  { id: 103, name: 'STAAD Pro', value: 'staad-pro' },
  { id: 104, name: 'AutoCAD Civil 3D', value: 'civil-3d' },
  { id: 105, name: 'Structural Analysis & Design', value: 'structural-analysis' },
  { id: 106, name: 'Geotechnical Engineering', value: 'geotechnical' },
  { id: 107, name: 'GIS & Remote Sensing', value: 'gis' },
  { id: 108, name: 'Environmental Impact Assessment', value: 'eia' },

  // Design, Product & Architecture
  { id: 109, name: 'Figma', value: 'figma' },
  { id: 110, name: 'UI/UX Design', value: 'ui-ux' },
  { id: 111, name: 'Wireframing & Prototyping', value: 'prototyping' },
  { id: 112, name: 'Adobe XD', value: 'adobe-xd' },
  { id: 113, name: 'System Architecture', value: 'system-architecture' },
  { id: 114, name: 'Product Management', value: 'product-management' },
  { id: 115, name: 'Agile Methodology', value: 'agile' },
  { id: 116, name: 'Scrum', value: 'scrum' },
  { id: 117, name: 'JIRA', value: 'jira' },

  // Cybersecurity & Networking
  { id: 118, name: 'Network Security', value: 'network-security' },
  { id: 119, name: 'Penetration Testing & Ethical Hacking', value: 'penetration-testing' },
  { id: 120, name: 'Cryptography', value: 'cryptography' },
  { id: 121, name: 'Computer Networks (TCP/IP)', value: 'networking' },

  // Business, Management & Professional Skills
  { id: 122, name: 'Business Strategy', value: 'business-strategy' },
  { id: 123, name: 'Business Development', value: 'business-development' },
  { id: 124, name: 'Financial Modeling & Analysis', value: 'financial-modeling' },
  { id: 125, name: 'Supply Chain Optimization', value: 'supply-chain' },
  { id: 126, name: 'Project Management', value: 'project-management' },
  { id: 127, name: 'Public Speaking', value: 'public-speaking' },
  { id: 128, name: 'Technical Presentation', value: 'presentation-skills' },
  { id: 129, name: 'Technical Writing', value: 'technical-writing' },
  { id: 130, name: 'Tech Entrepreneurship', value: 'tech-entrepreneurship' }
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

const MultiSelect = ({ selectedOptions = [], setSelectedOptions, placeholder = "Your skills" }) => {
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

  const isSelected = (option) => {
    return selectedOptions.some(selected => {
      if (typeof selected === 'string') {
        return selected.toLowerCase() === option.name.toLowerCase();
      }
      return selected?.id === option.id || (selected?.name || '').toLowerCase() === option.name.toLowerCase();
    });
  };

  const filteredOptions = ALL_OPTIONS.filter(option => 
    !isSelected(option) && 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = option => {
    setSelectedOptions(prev => {
      const exists = prev.some(o => {
        if (typeof o === 'string') return o.toLowerCase() === option.name.toLowerCase();
        return o?.id === option.id || (o?.name || '').toLowerCase() === option.name.toLowerCase();
      });
      if (exists) {
        return prev.filter(o => {
          if (typeof o === 'string') return o.toLowerCase() !== option.name.toLowerCase();
          return o?.id !== option.id && (o?.name || '').toLowerCase() !== option.name.toLowerCase();
        });
      }
      return [...prev, option];
    });
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const removeOption = option => {
    setSelectedOptions(selectedOptions.filter(o => {
      if (typeof o === 'string') return o.toLowerCase() !== (option?.name || option).toLowerCase();
      return o.id !== option.id;
    }));
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
        } else if (searchTerm.trim()) {
          const custom = {
            id: `custom-${searchTerm.trim().toLowerCase()}`,
            name: searchTerm.trim(),
            value: searchTerm.trim().toLowerCase(),
          };
          if (!isSelected(custom)) {
            setSelectedOptions(prev => [...prev, custom]);
            setSearchTerm('');
          }
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
          className="flex flex-wrap items-center gap-2 p-2.5 min-h-11 text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-xl shadow-xs cursor-text transition-all focus-within:ring-2 focus-within:ring-blue-500" 
          onClick={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
            inputRef.current?.focus();
          }}
        >
          {selectedOptions.map(option => {
            const displayName = typeof option === 'string' ? option : option.name || option.value;
            const optionKey = typeof option === 'string' ? option : option.id || option.name;
            return (
              <div key={optionKey} className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold px-2.5 py-1 rounded-lg text-xs border border-blue-200 dark:border-blue-900/50">
                #{displayName}
                <button 
                  type="button" 
                  className="text-blue-400 hover:text-red-500 rounded-md p-0.5 transition-colors cursor-pointer" 
                  onClick={e => {
                    e.stopPropagation();
                    removeOption(option);
                  }}
                  title="Remove skill"
                >
                  <XIcon />
                </button>
              </div>
            );
          })}
          <input 
            ref={inputRef} 
            type="text" 
            value={searchTerm} 
            onChange={e => { setSearchTerm(e.target.value); setHighlightedIndex(0); }} 
            onFocus={() => { setIsOpen(true); setHighlightedIndex(0); }} 
            onKeyDown={handleKeyDown} 
            placeholder={selectedOptions.length === 0 ? placeholder : ""} 
            className="grow bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm p-1 min-w-[140px]" 
          />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-popover-in">
            <ul className="p-1.5 space-y-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li 
                    key={option.id} 
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg text-xs font-semibold transition-colors duration-150 ${highlightedIndex === index ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`} 
                    onClick={() => toggleOption(option)} 
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span>{option.name}</span>
                    {isSelected(option) && <CheckIcon />}
                  </li>
                ))
              ) : searchTerm.trim() ? (
                <li
                  className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer rounded-lg flex items-center justify-between"
                  onClick={() => {
                    const custom = {
                      id: `custom-${searchTerm.trim().toLowerCase()}`,
                      name: searchTerm.trim(),
                      value: searchTerm.trim().toLowerCase(),
                    };
                    if (!isSelected(custom)) {
                      setSelectedOptions(prev => [...prev, custom]);
                    }
                    setSearchTerm('');
                  }}
                >
                  <span>+ Add custom tech: &ldquo;{searchTerm.trim()}&rdquo;</span>
                </li>
              ) : (
                <li className="px-3 py-2 text-center text-gray-400 text-xs">No matching technologies.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SkillsMultiSelect({ selectedOptions = [], setSelectedOptions, placeholder = "Your skills" }) {
  return (
    <div className="font-sans">
      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popover-in {
          transform-origin: top;
          animation: popover-in 0.12s ease-out forwards;
        }
      `}</style>
      <div className="w-full">
        <MultiSelect selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} placeholder={placeholder} />
      </div>
    </div>
  );
}
