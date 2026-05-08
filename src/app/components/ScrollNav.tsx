import { useState, useEffect } from 'react';

export interface SectionItem {
  id: string;
  label: string;
}

interface ScrollNavProps {
  sections: SectionItem[];
}

export function ScrollNav({ sections }: ScrollNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      // Offset matches the sticky header height plus a little buffer
      const scrollPosition = window.scrollY + 150; 
      
      let currentSection = sections[0]?.id;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            currentSection = section.id;
          }
        }
      }
      
      setActiveId(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    // Call once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for the main navbar + this scroll nav
      const offset = 140; 
      const y = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-[80px] z-40 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide whitespace-nowrap">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleScrollTo(sec.id)}
              className={`relative pb-1 text-sm font-semibold transition-colors ${
                activeId === sec.id ? 'text-[#0D2137]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {sec.label}
              {activeId === sec.id && (
                <span className="absolute -bottom-[17px] left-0 w-full h-[3px] bg-[#C9963C] rounded-t-md transition-all duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
