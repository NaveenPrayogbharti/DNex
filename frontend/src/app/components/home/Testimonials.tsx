import { useRef } from 'react';
import { Link } from 'react-router';
import { Quote, ArrowRight } from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const testimonials = [
  {
    name: 'Marcus Heidler',
    role: 'CEO, FinTech Startup',
    company: 'Based in Frankfurt, Germany',
    avatar: 'MH',
    color: '#3b82f6',
    stars: 5,
    text: "DNex Consulting handled everything from our DIFC company formation to all documents seamlessly. The level of professionalism and communication was exceptional. I wouldn't trust anyone else with our UAE expansion.",
    service: 'Free Zone Company Setup',
  },
  {
    name: 'Priya Nair',
    role: 'Founder & MD',
    company: 'E-Commerce Business, India',
    avatar: 'PN',
    color: '#8b5cf6',
    stars: 5,
    text: "As a first-time business owner in Dubai, I was overwhelmed by the process. DNex Consulting made it completely stress-free. My mainland license was ready quickly, and their pricing was exactly as quoted — no hidden costs.",
    service: 'Mainland Company Formation',
  },
  {
    name: 'James Okafor',
    role: 'Managing Partner',
    company: 'Consulting Firm, Nigeria',
    avatar: 'JO',
    color: '#10b981',
    stars: 5,
    text: "The VAT registration and corporate tax compliance services have been a lifesaver. They proactively flagged issues I wasn't even aware of and resolved them quickly. Highly recommend for any international business owner.",
    service: 'Tax & Compliance',
  },
  {
    name: 'Sarah Al-Rashidi',
    role: 'Operations Director',
    company: 'Real Estate Investment, Kuwait',
    avatar: 'SR',
    color: '#f59e0b',
    stars: 5,
    text: "We needed a bank account for our holding company. DNex Consulting coordinated everything simultaneously and delivered ahead of schedule. Outstanding service quality and attention to detail.",
    service: 'Banking Support',
  },
  {
    name: 'Aleksei Petrov',
    role: 'Technology Entrepreneur',
    company: 'SaaS Company, Russia',
    avatar: 'AP',
    color: '#ef4444',
    stars: 5,
    text: "Set up my DMCC free zone company with DNex Consulting in record time. The dedicated account manager was available on WhatsApp round the clock. Best investment I made for my Dubai expansion.",
    service: 'DMCC Free Zone Setup',
  },
  {
    name: 'Amara Diallo',
    role: 'Director',
    company: "Trading Company, Côte d'Ivoire",
    avatar: 'AD',
    color: '#06b6d4',
    stars: 5,
    text: "The PRO services team is remarkable. Document attestation, government liaison, and license amendments all handled professionally. I've referred 4 of my business associates to DNex Consulting already.",
    service: 'PRO Services',
  },
];

// Duplicate for seamless infinite scroll
const duplicated = [...testimonials, ...testimonials];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-4 h-4" fill={i < count ? GOLD : '#e5e7eb'} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
          >
            Client Reviews
          </div>
          <h2
            className="mb-4"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              color: NAVY,
              letterSpacing: '-0.5px',
            }}
          >
            Trusted by Entrepreneurs Worldwide
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-justify" style={{ lineHeight: 1.7 }}>
            Over 10,000+ businesses from 50+ countries have chosen DNex Consulting to launch and grow in the UAE.
          </p>

          {/* Aggregate rating */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <StarRating count={5} />
            <span className="font-bold" style={{ color: NAVY }}>4.9/5</span>
            <span className="text-gray-400 text-sm">from 1,200+ verified reviews</span>
          </div>
        </div>
      </div>

      {/* CSS-animated infinite scroll marquee */}
      <div className="relative">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #F8FAFC, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #F8FAFC, transparent)' }} />

        <div
          ref={scrollRef}
          className="flex gap-6 testimonial-scroll"
          style={{
            animation: 'scrollTestimonials 40s linear infinite',
            width: 'max-content',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}
        >
          {duplicated.map((t, idx) => (
            <div
              key={`${t.name}-${idx}`}
              className="shrink-0 w-[85vw] sm:w-[380px] bg-white rounded-2xl p-7 relative hover:shadow-lg transition-all duration-300"
              style={{ border: '1px solid #e8edf2' }}
            >
              {/* Quote icon */}
              <div
                className="absolute top-6 right-6 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,150,60,0.08)' }}
              >
                <Quote size={16} style={{ color: GOLD }} />
              </div>

              {/* Stars */}
              <StarRating count={t.stars} />

              {/* Service tag */}
              <div
                className="mt-3 mb-4 inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(13,33,55,0.06)', color: NAVY }}
              >
                {t.service}
              </div>

              {/* Text */}
              <p className="text-sm text-gray-600 leading-relaxed mb-6 text-justify">"{t.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #f0f0f0' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: NAVY }}>{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-md"
            style={{ borderColor: NAVY, color: NAVY }}
          >
            More About Us
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/leadform"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Get Consultation Today
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Keyframes for infinite scroll */}
      <style>{`
        @keyframes scrollTestimonials {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}