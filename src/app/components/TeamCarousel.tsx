import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Linkedin, Mail } from 'lucide-react';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

const teamMembers = [
  {
    name: 'CA Naveen Thakur',
    role: 'Founder & Managing Director',
    expertise: 'Taxation · Corporate Law · Business Advisory',
    bio: 'A qualified legal and financial professional with over 15+ years of experience in taxation, compliance, and business advisory. He has been actively assisting Indian and international clients in regulatory matters, business structuring, and cross-border transactions.',
    initials: 'NT',
    color: '#0D2137',
  },
  {
    name: 'CS Apurva Joshi',
    role: 'Company Secretary & Compliance Head',
    expertise: 'FEMA · ODI · RBI Filings · Corporate Governance',
    bio: 'A seasoned Company Secretary specializing in FEMA compliance, ODI structuring, and corporate governance for Indian and UAE entities. Expert in regulatory filings, ROC compliance, and cross-border investment structuring.',
    initials: 'AJ',
    color: '#1a3354',
  },
  {
    name: 'Adv. Riya Sharma',
    role: 'Legal Advisory Head',
    expertise: 'Corporate Law · Litigation · Contract Drafting',
    bio: 'An experienced advocate specializing in corporate law, contract drafting, and dispute resolution. Assists clients in managing regulatory proceedings, tax notices, and corporate disputes with precision and efficiency.',
    initials: 'RS',
    color: '#2a4a6e',
  },
  {
    name: 'CA Priya Mehta',
    role: 'UAE Taxation & Audit Lead',
    expertise: 'UAE Corporate Tax · VAT · Audit · Accounting',
    bio: 'A dedicated chartered accountant with deep expertise in UAE Corporate Tax, VAT compliance, GoAML registration, and financial auditing. Ensures all clients remain fully compliant with UAE federal tax regulations.',
    initials: 'PM',
    color: '#0D2137',
  },
  {
    name: 'Mr. Arjun Patel',
    role: 'PRO Services & Business Setup Manager',
    expertise: 'Company Formation · Visa Processing · Trade Licenses',
    bio: 'An expert in UAE business setup, PRO services, and government relations with hands-on experience handling mainland and free zone company formations, visa processing, and all government documentation.',
    initials: 'AP',
    color: '#1a3354',
  },
  {
    name: 'Ms. Fatima Al Hashimi',
    role: 'Banking & NRI Advisory Specialist',
    expertise: 'NRO/NRE Accounts · Corporate Banking · Mortgage',
    bio: 'Specializes in assisting NRIs and foreign investors in navigating UAE and Indian banking systems including NRO/NRE account setup, corporate banking facilitation, and mortgage advisory services.',
    initials: 'FH',
    color: '#2a4a6e',
  },
];

export function TeamCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || isPaused) return;

    const interval = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 420, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === 'right' ? 420 : -420, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p
            className="text-sm font-bold tracking-widest mb-2"
            style={{ color: GOLD }}
          >
            The People Behind DNex
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold"
            style={{ color: NAVY, letterSpacing: '-0.5px' }}
          >
            Meet Our Team
          </h2>
        </div>

        {/* Scroll Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:border-[#C9963C] hover:text-[#C9963C] group"
            style={{ borderColor: '#d1d5db', color: '#6b7280' }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:border-[#C9963C] hover:text-[#C9963C]"
            style={{ borderColor: '#d1d5db', color: '#6b7280' }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Cards — Larger */}
      <div
        ref={scrollRef}
        className="flex gap-7 overflow-x-auto pb-4 scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {teamMembers.map((member, i) => (
          <div
            key={i}
            className="shrink-0 w-[340px] rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 group"
            style={{ background: '#fff' }}
          >
            {/* Card Header */}
            <div
              className="flex flex-col items-center justify-center pt-12 pb-10 px-8 text-center"
              style={{ backgroundColor: member.color }}
            >
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white mb-5 border-4 border-white/20 shadow-lg"
                style={{ backgroundColor: GOLD }}
              >
                {member.initials}
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5 leading-tight">
                {member.name}
              </h3>
              <p
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: GOLD }}
              >
                {member.role}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-7">
              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {member.expertise.split(' · ').map((tag, j) => (
                  <span
                    key={j}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(201,150,60,0.1)',
                      color: GOLD,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p
                className="text-sm text-gray-500 leading-relaxed"
                style={{ textAlign: 'justify' }}
              >
                {member.bio}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100">
                <a
                  href="mailto:info@dnex.ae"
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#C9963C] transition-colors"
                >
                  <Mail size={14} />
                  Contact
                </a>
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#0A66C2] transition-colors"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile scroll hint */}
      <p className="sm:hidden text-center text-xs text-gray-400 mt-3">
        ← Swipe to explore the team →
      </p>
    </div>
  );
}
