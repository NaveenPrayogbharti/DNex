import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

// ── Category colours ──────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  Leadership: '#0D2137',
  'Legal Team': '#1a3354',
  'Tax & Financial': '#2a4a6e',
  'Business Advisory': '#1e3a5f',
  'Client Support': '#0f2744',
};

// ── Team data ─────────────────────────────────────────────────────────────────
const teamMembers = [
  // ── Leadership ──────────────────────────────────────────────────────────────
  {
    name: 'Jitendra Rajput',
    role: 'Principal Consultant (India & UAE)',
    category: 'Leadership',
    expertise: 'Legal Advisory · Taxation · Business Consultancy · Compliance',
    bio: 'With over a decade of experience in legal advisory, taxation, and business consultancy, Mr. Rajput leads DNex with a strong focus on practical solutions and client-centric strategies. He specializes in handling complex compliance matters, litigation support, and cross-border business structuring.',
    initials: 'JR',
  },
  {
    name: 'Nitin Bhardwaj',
    role: 'Associate Partner, Business Operations',
    category: 'Leadership',
    expertise: 'Global Business · Entrepreneurship · Business Development · Scalable Models',
    bio: 'Mr. Bhardwaj brings valuable international exposure and business expertise. He possesses strong global business understanding and hands-on international working experience. His core expertise lies in mentoring new entrepreneurs, business development strategies, and creating scalable business models designed for long-term growth and success.',
    initials: 'NB',
  },
  {
    name: 'Harish Verma',
    role: 'Associate Partner, Business Operations (Overseas)',
    category: 'Leadership',
    expertise: 'Business Development · Strategic Partnerships · Visa & PRO · RBI Services',
    bio: 'Mr. Verma specializes in delivering reliable business and global mobility solutions with a strong focus on professionalism, trust, and customer satisfaction — backed by two decades of experience and an extensive international network. His leadership and expertise drive sustainable growth and trusted client relationships across global markets.',
    initials: 'HV',
  },

  // ── Legal Team ───────────────────────────────────────────────────────────────
  {
    name: 'S.P. Singh',
    role: 'Senior Legal Advisor',
    category: 'Legal Team',
    expertise: 'Corporate Law · Contract Management · Litigation · Dispute Resolution',
    bio: 'S.P. Singh brings over three decades of extensive legal experience in corporate law, contract management, and dispute resolution. His expertise includes handling complex litigation, drafting and vetting high-value commercial agreements, and providing strategic legal guidance to businesses with a strong understanding of evolving regulatory frameworks.',
    initials: 'SS',
  },
  {
    name: 'Srishti Verma',
    role: 'Associate, Litigation & Compliance',
    category: 'Legal Team',
    expertise: 'Litigation · Compliance · Legal Research · Case Management',
    bio: 'Supports litigation and compliance matters, guiding clients through legal procedures and regulatory requirements with diligence and precision. She assists in case preparation, legal research, drafting of pleadings, and coordination with various authorities — ensuring timely compliance and effective case management.',
    initials: 'SV',
  },

  // ── Tax & Financial Experts ──────────────────────────────────────────────────
  {
    name: 'Sanjeev Kumar',
    role: 'Tax Consultant (India & UAE)',
    category: 'Tax & Financial',
    expertise: 'GST · VAT · International Taxation · Cross-Border Tax',
    bio: 'Expert in GST, VAT, and international taxation with a strong focus on optimized and compliant tax strategies. He advises clients on cross-border tax implications, ensuring efficient structuring aligned with both Indian and UAE regulations — assisting in tax planning, return filings, and handling departmental queries.',
    initials: 'SK',
  },
  {
    name: 'Keshaw Prasad',
    role: 'Corporate & Legal Advisor (India)',
    category: 'Tax & Financial',
    expertise: 'Corporate Law · Entity Structuring · Regulatory Approvals · Compliance',
    bio: 'Advises clients on corporate and legal aspects of business setup in India, including entity structuring, regulatory approvals, and compliance requirements. He provides strategic guidance on corporate structuring, legal documentation, and ongoing compliance — helping startups and established enterprises manage risks effectively.',
    initials: 'KP',
  },

  // ── Business Advisory ────────────────────────────────────────────────────────
  {
    name: 'Kartikay',
    role: 'Business Setup Specialist (UAE)',
    category: 'Business Advisory',
    expertise: 'Company Incorporation · UAE Free Zones · Licensing · Marketing Strategy',
    bio: 'A professionally qualified consultant with expertise in company incorporation, licensing, and business expansion strategies across UAE mainland and free zone jurisdictions. He ensures a smooth setup process by guiding clients through regulatory requirements, documentation, and effective marketing strategies for sustainable UAE market entry.',
    initials: 'KA',
  },
  {
    name: 'Disha',
    role: 'Tax & Audit Compliance',
    category: 'Business Advisory',
    expertise: 'CT/VAT Filings · Audit Documentation · Reconciliations · Regulatory Compliance',
    bio: 'Manages tax and audit compliance functions with a strong focus on accuracy, transparency, and regulatory adherence. She handles CT/VAT filings, audit documentation, and ensures timely completion of statutory requirements. She also assists in audit coordination, reconciliations, and responding to regulatory queries.',
    initials: 'DI',
  },
  {
    name: 'Arpita',
    role: 'Compliance Manager',
    category: 'Business Advisory',
    expertise: 'Financial Reporting · Compliance · Legal Documentation · Transparency',
    bio: 'Handles financial reporting and compliance matters with a high level of accuracy and efficiency. She coordinates with various authorities and supports legal and documentation requirements, helping maintain transparency and timely compliance across all engagements.',
    initials: 'AR',
  },

  // ── Client Support ───────────────────────────────────────────────────────────
  {
    name: 'Priya',
    role: 'Client Relationship Manager',
    category: 'Client Support',
    expertise: 'Client Communication · Service Coordination · Client Satisfaction',
    bio: 'Ensures seamless communication and high levels of client satisfaction across all engagements. She understands client requirements and coordinates with internal teams for timely delivery of services — serving as the primary bridge between clients and the DNex team.',
    initials: 'PR',
  },
  {
    name: 'Yash',
    role: 'Operations Executive',
    category: 'Client Support',
    expertise: 'Documentation · Backend Operations · Admin Coordination · Task Management',
    bio: 'Handles documentation and backend operations with a focus on accuracy and efficiency. He supports day-to-day administrative functions, ensuring smooth coordination across teams and timely execution of tasks.',
    initials: 'YA',
  },
];

// ── Category labels for filter tabs ──────────────────────────────────────────
const CATEGORIES = ['All', 'Leadership', 'Legal Team', 'Tax & Financial', 'Business Advisory', 'Client Support'];

// ── Component ─────────────────────────────────────────────────────────────────
export function TeamCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? teamMembers
    : teamMembers.filter(m => m.category === activeCategory);

  // Auto-scroll effect (only when not paused)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || isPaused) return;

    const interval = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 380, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, activeCategory]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === 'right' ? 380 : -380, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">

      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sm font-bold tracking-widest mb-2" style={{ color: GOLD }}>
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
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:border-[#C9963C] hover:text-[#C9963C]"
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

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' }); }}
            className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
            style={{
              background: activeCategory === cat ? GOLD : 'transparent',
              color: activeCategory === cat ? '#fff' : NAVY,
              borderColor: activeCategory === cat ? GOLD : '#d1d5db',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {filtered.map((member, i) => {
          const cardColor = CAT_COLORS[member.category] ?? NAVY;
          return (
            <div
              key={i}
              className="shrink-0 w-[340px] rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 group"
              style={{ background: '#fff' }}
            >
              {/* Card Header */}
              <div
                className="flex flex-col items-center justify-center pt-10 pb-8 px-8 text-center relative"
                style={{ backgroundColor: cardColor }}
              >
                {/* Category pill */}
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                  style={{ background: 'rgba(201,150,60,0.2)', color: GOLD }}
                >
                  {member.category}
                </div>

                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold text-white mb-4 border-4 border-white/20 shadow-lg"
                  style={{ backgroundColor: GOLD }}
                >
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                  {member.name}
                </h3>
                <p
                  className="text-xs font-semibold tracking-wide text-center leading-snug"
                  style={{ color: GOLD }}
                >
                  {member.role}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.expertise.split(' · ').map((tag, j) => (
                    <span
                      key={j}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(201,150,60,0.1)', color: GOLD }}
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

                {/* Contact */}
                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
                  <a
                    href="mailto:info@dnexbusiness.com"
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#C9963C] transition-colors"
                  >
                    <Mail size={13} />
                    Contact
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile scroll hint */}
      <p className="sm:hidden text-center text-xs text-gray-400 mt-3">
        ← Swipe to explore the team →
      </p>
    </div>
  );
}
