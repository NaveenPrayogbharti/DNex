import { useState } from 'react';
import { Link } from 'react-router';
import {
  CheckCircle, ArrowRight, FileText, Building2, Clock, Globe,
  Shield, DollarSign, TrendingUp, Users, Zap, Send,
  ChevronDown, Phone, MessageCircle, Mail, Star,
  MapPin, Briefcase, Award,
} from 'lucide-react';
import { ScrollNav } from '../components/ScrollNav';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const DUBAI_OFFICE =
  'https://images.unsplash.com/photo-1593523278268-f91d46d3d606?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGZyZWUlMjB6b25lJTIwYnVzaW5lc3MlMjBvZmZpY2UlMjBtb2Rlcm4lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzIxNzc1MjB8MA&ixlib=rb-4.1.0&q=80&w=1080';

const HANDSHAKE =
  'https://images.unsplash.com/photo-1549923746-c502d488b3ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGhhbmRzaGFrZSUyMGFncmVlbWVudCUyMGNvbnRyYWN0JTIwc2lnbmluZ3xlbnwxfHx8fDE3NzIxNzc1MjF8MA&ixlib=rb-4.1.0&q=80&w=1080';

// ─── Data ──────────────────────────────────────────────────────────────────

const benefits = [
  { icon: Globe, title: '100% Foreign Ownership', desc: 'No UAE local sponsor required. Own your company entirely.' },
  { icon: DollarSign, title: '0% Corporate Tax*', desc: 'Enjoy tax-free profits within qualifying free zone activities.' },
  { icon: Zap, title: '5-Day Setup', desc: 'Fast-track company registration in as little as 3–5 working days.' },
  { icon: Shield, title: 'Full Repatriation', desc: '100% repatriation of capital and profits with no restrictions.' },
  { icon: Users, title: 'Multiple Visa Quotas', desc: 'Sponsor employees, partners, and family on your company visa.' },
  { icon: TrendingUp, title: 'Global Trade Access', desc: "Trade internationally with access to UAE's major ports and airports." },
  { icon: Building2, title: '50+ Free Zones', desc: 'Choose from DMCC, DIFC, Jebel Ali, DAFZA, IFZA, and more.' },
  { icon: Clock, title: 'Low Maintenance Costs', desc: 'Minimal ongoing compliance requirements compared to mainland.' },
];

const freeZones = [
  { name: 'DMCC', full: 'Dubai Multi Commodities Centre', best: 'Trading, Commodities, Crypto' },
  { name: 'DIFC', full: 'Dubai International Financial Centre', best: 'Finance, FinTech, Fund Management' },
  { name: 'IFZA', full: 'International Free Zone Authority', best: 'General Business, Affordable' },
  { name: 'DAFZA', full: 'Dubai Airport Free Zone', best: 'Aviation, Logistics, Import/Export' },
  { name: 'Dubai South', full: 'Dubai South Free Zone', best: 'E-commerce, Aviation, Retail' },
  { name: 'RAKEZ', full: 'Ras Al Khaimah Economic Zone', best: 'Manufacturing, Startups, Cost-effective' },
];

const documents = [
  'Passport copies of all shareholders (valid for 6+ months)',
  'Passport-size photographs (white background)',
  'Completed application form (provided by us)',
  'Business activity description',
  'Proposed company name (3 options)',
  'Residential address proof (utility bill or bank statement)',
  'Business plan (for certain free zones like DIFC)',
  'No Objection Certificate (if employed in UAE)',
];

const steps = [
  { step: 1, title: 'Free Consultation', desc: 'Meet with our consultant to choose the right free zone and license type for your business.' },
  { step: 2, title: 'Name Reservation', desc: 'We submit your preferred company names and reserve the one approved by the authority.' },
  { step: 3, title: 'Document Submission', desc: 'Our team collects and submits all required documents to the free zone authority.' },
  { step: 4, title: 'Initial Approval', desc: 'Receive initial approval from the free zone within 2–3 working days.' },
  { step: 5, title: 'Pay Fees & Receive License', desc: 'Pay the authority fees and receive your trade license, company seal, and incorporation documents.' },
  { step: 6, title: 'Visa & Bank Setup', desc: 'We process investor visas, Emirates ID, and open your UAE corporate bank account.' },
];

const plans = [
  {
    name: 'Starter',
    price: 'AED 5,499',
    period: 'incl. authority fees',
    features: ['IFZA Free Zone License', '1 Share Activity', 'Company Seal', '1 Visa Quota', 'Investor Visa', 'Emirates ID'],
    cta: 'Choose Starter',
    featured: false,
  },
  {
    name: 'Business',
    price: 'AED 9,999',
    period: 'incl. authority fees',
    features: ['DMCC or DAFZA License', 'Up to 3 Activities', 'Company Seal + MOA', '3 Visa Quotas', 'Investor Visas (x2)', 'Emirates IDs', 'Bank Account Introduction', 'Dedicated Account Manager'],
    cta: 'Choose Business',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact for quote',
    features: ['DIFC or Premium Zones', 'Unlimited Activities', 'Full Legal Pack', 'Unlimited Visas', 'Banking Relationship', 'VAT + Tax Setup', 'Office Space Options', 'Priority Senior Consultant'],
    cta: 'Contact Sales',
    featured: false,
  },
];

const faqs = [
  {
    q: 'What is a Free Zone company in Dubai?',
    a: 'A Free Zone company (also called an FZE or FZCO) is a business entity registered within a designated free trade zone in Dubai or the UAE. These zones offer special incentives such as 100% foreign ownership, 0% corporate and income tax, and full profit repatriation.',
  },
  {
    q: 'Can I operate anywhere in the UAE with a Free Zone license?',
    a: 'Free Zone companies can trade internationally and within the free zone. To sell directly to UAE mainland customers, you\'ll need either a mainland distributor or a separate mainland license. We can advise on the best structure for your specific business model.',
  },
  {
    q: 'How long does it take to set up a Free Zone company?',
    a: 'Most free zone company setups are completed within 3–7 working days once all documents are submitted. Certain premium zones like DIFC may take slightly longer due to additional regulatory requirements.',
  },
  {
    q: 'What are the ongoing costs after setup?',
    a: 'Annual renewal fees vary by free zone (typically AED 8,000–25,000+ depending on the zone and license type). You\'ll also need to renew visas annually and maintain a registered address within the free zone.',
  },
  {
    q: 'Do I need to be physically present in Dubai to set up?',
    a: 'In most cases, no. We can handle the entire setup process remotely. However, visa stamping requires your physical presence in the UAE at some stage, which is a quick process.',
  },
  {
    q: 'Which free zone is best for my business?',
    a: 'It depends on your industry, budget, visa requirements, and whether you need physical office space. DMCC is best for trading and commodities, DIFC for financial services, IFZA for general cost-effective setups, and DAFZA for aviation/logistics. Our consultants provide a customized recommendation based on your specific situation.',
  },
  {
    q: 'Can I open a UAE bank account with a Free Zone license?',
    a: 'Yes. We have direct relationships with UAE banks and assist with the bank account opening process. Most accounts are set up within 2–4 weeks after company registration.',
  },
  {
    q: 'What activities can I register under a Free Zone license?',
    a: 'Activities vary by free zone. Common categories include: Trading, Consultancy, Technology, Media, E-commerce, Finance, Manufacturing, and Professional Services. Our consultants will advise on the correct activity codes for your business.',
  },
];

const testimonials = [
  {
    name: 'Leon Hartmann',
    role: 'E-commerce Entrepreneur, Germany',
    avatar: 'LH',
    color: '#3b82f6',
    text: 'DMCC setup done in 4 days. DubizSetup handled everything including my investor visa. Extremely professional and efficient.',
    stars: 5,
  },
  {
    name: 'Tanvir Ahmed',
    role: 'Tech Founder, Bangladesh',
    avatar: 'TA',
    color: '#10b981',
    text: 'Best decision was choosing DubizSetup for my IFZA company. The price was transparent and the service was excellent.',
    stars: 5,
  },
  {
    name: 'Sophie Laurent',
    role: 'Consultant, France',
    avatar: 'SL',
    color: '#8b5cf6',
    text: 'Set up a consulting firm in DIFC within a week. They even helped me open a bank account. Highly recommended!',
    stars: 5,
  },
];

const sections = [
  { id: "overview", label: "Overview" },
  { id: "eligibility", label: "Eligibility" },
  { id: "documents", label: "Documents Required" },
  { id: "process", label: "Process" },
  { id: "pricing", label: "Pricing" },
  { id: "faqs", label: "FAQs" },
];

const eligibilityCriteria = [
  { title: 'Minimum Age', desc: 'Shareholders and directors must be at least 18 years old (some zones require 21).' },
  { title: 'Valid Passport', desc: 'A valid passport with at least 6 months validity is required for all shareholders.' },
  { title: 'Business Plan', desc: 'Certain activities and premium free zones (like DIFC) require a comprehensive business plan.' },
  { title: 'Initial Capital', desc: 'Varies by free zone; some require no upfront capital, while others require proof of funds.' },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" fill={i < count ? GOLD : '#e5e7eb'} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: open ? GOLD : '#e8edf2' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50"
      >
        <span className="font-semibold text-sm pr-4" style={{ color: NAVY }}>{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: GOLD }}
        />
      </button>
      {open && (
        <div className="px-6 pb-5" style={{ borderTop: '1px solid #f0f0f0' }}>
          <p className="text-sm text-gray-600 leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

function ConsultationSidebar() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{ border: `2px solid ${GOLD}` }}
    >
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400">Consultants Online</span>
        </div>
        <h3 className="text-white font-bold text-lg">Get Free Consultation</h3>
        <p className="text-slate-400 text-xs mt-1">Response within 1 business hour</p>
      </div>

      <div className="p-6 bg-white">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle size={40} style={{ color: GOLD }} className="mx-auto mb-3" />
            <h4 className="font-bold" style={{ color: NAVY }}>We'll be in touch soon!</h4>
            <p className="text-xs text-gray-500 mt-2">Our consultant will contact you within 4 hour.</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 text-xs font-semibold" style={{ color: GOLD }}>
              Submit another →
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
              <input
                type="text" required placeholder="Your full name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
              <input
                type="email" required placeholder="your@email.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp / Phone *</label>
              <input
                type="tel" required placeholder="+1 555 000 0000"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Your Business Idea</label>
              <textarea
                rows={3} placeholder="Brief description of your business..."
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              <Send size={15} />
              Start Now — It's Free
            </button>
          </form>
        )}

        {/* Or contact directly */}
        <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
          <a href="tel:+971551251185" className="flex items-center gap-2.5 text-xs font-medium text-gray-600 hover:text-[#0D2137] transition-colors">
            <Phone size={13} style={{ color: GOLD }} /> +971 551251185
          </a>
          <a href="https://wa.me/971551251185" className="flex items-center gap-2.5 text-xs font-medium text-gray-600 hover:text-[#0D2137] transition-colors">
            <MessageCircle size={13} style={{ color: GOLD }} /> WhatsApp Chat
          </a>
          <div className="flex items-center gap-2.5 text-xs text-gray-500">
            <Clock size={13} style={{ color: GOLD }} /> Mon–Sat
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function FreeZone() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <section
        className="relative pt-36 pb-20 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3354 100%)` }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#C9963C 1px, transparent 1px), linear-gradient(90deg, #C9963C 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-center">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-300">Business Setup</span>
                <span>/</span>
                <span style={{ color: GOLD }}>Free Zone Company Setup</span>
              </div>

              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
              >
                Business Setup
              </div>

              <h1
                className="text-white mb-5"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.5px' }}
              >
                Free Zone Company Setup in Dubai
              </h1>

              <p className="text-slate-300 text-lg max-w-lg mb-8" style={{ lineHeight: 1.65 }}>
                Register your company in one of Dubai's 50+ free zones with 100% foreign ownership,
                zero taxes, and full profit repatriation — in as little as 3 days.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {['100% Foreign Ownership', '0% Corporate Tax', '5-Day Setup', 'Full Profit Repatriation'].map((b) => (
                  <div key={b} className="flex items-center gap-1.5 text-sm text-slate-300">
                    <CheckCircle size={14} style={{ color: GOLD }} />
                    {b}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/leadform"
                  /*onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}*/
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: GOLD }}
                >
                  Start Now
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="tel:+97144441234"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border-2 border-white/30 text-white hover:border-white/60 transition-all"
                >
                  <Phone size={15} />
                  Talk to Expert
                </a>
              </div>
            </div>

            {/* Hero image */}
            <div className="hidden lg:block relative">
              <div className="rounded-2xl overflow-hidden" style={{ paddingBottom: '100%', position: 'relative' }}>
                <img
                  src={DUBAI_OFFICE}
                  alt="Dubai Free Zone Office"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,33,55,0.4) 0%, transparent 60%)' }} />
              </div>
              {/* Floating stat */}
              <div
                className="absolute -bottom-5 -left-5 bg-white rounded-xl p-4 shadow-xl flex items-center gap-3"
                style={{ border: '1px solid #e8edf2' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}>
                  <Award size={20} style={{ color: GOLD }} />
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: NAVY }}>5,000+</div>
                  <div className="text-xs text-gray-500">Free Zone Companies Setup</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section Quick-Nav ───────────────────────────────── */}
      <ScrollNav sections={sections} />

      {/* ── Main Content + Sidebar ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          {/* ── Left: main content ── */}
          <div className="space-y-20">

            {/* Key Benefits */}
            <section id="overview" className="scroll-mt-32">
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                Key Benefits
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                Why Set Up in a Dubai Free Zone?
              </h2>
              <p className="text-gray-500 mb-8" style={{ lineHeight: 1.7 }}>
                Dubai free zones are among the world's most business-friendly environments,
                designed specifically for international investors and entrepreneurs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((b) => (
                  <div
                    key={b.title}
                    className="flex gap-4 p-5 rounded-xl border transition-all hover:border-[#C9963C]/40 hover:shadow-md"
                    style={{ borderColor: '#e8edf2' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                    >
                      <b.icon size={18} style={{ color: GOLD }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>{b.title}</h4>
                      <p className="text-xs text-gray-500" style={{ lineHeight: 1.6 }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Popular Free Zones */}
            <section>
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                Free Zones
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                Popular Free Zones We Work With
              </h2>
              <p className="text-gray-500 mb-8" style={{ lineHeight: 1.7 }}>
                We assist with company formation in 50+ UAE free zones. Here are our most popular:
              </p>

              <div className="space-y-3">
                {freeZones.map((fz, i) => (
                  <div
                    key={fz.name}
                    className="flex items-center justify-between p-5 rounded-xl border transition-all hover:border-[#C9963C]/40 hover:shadow-sm"
                    style={{ borderColor: '#e8edf2' }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: NAVY }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: NAVY }}>{fz.name}</div>
                        <div className="text-xs text-gray-400">{fz.full}</div>
                      </div>
                    </div>
                    <div
                      className="text-xs font-medium px-3 py-1.5 rounded-full hidden sm:block"
                      style={{ backgroundColor: 'rgba(201,150,60,0.1)', color: GOLD }}
                    >
                      {fz.best}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Eligibility */}
            <section id="eligibility" className="scroll-mt-32">
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                Eligibility
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                Setup Requirements
              </h2>
              <p className="text-gray-500 mb-8" style={{ lineHeight: 1.7 }}>
                Before proceeding with your free zone company setup, ensure you meet these standard requirements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eligibilityCriteria.map((crit) => (
                  <div
                    key={crit.title}
                    className="flex gap-4 p-5 rounded-xl border transition-all hover:border-[#C9963C]/40 hover:shadow-md"
                    style={{ borderColor: '#e8edf2' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                    >
                      <CheckCircle size={18} style={{ color: GOLD }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>{crit.title}</h4>
                      <p className="text-xs text-gray-500" style={{ lineHeight: 1.6 }}>{crit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Required Documents */}
            <section id="documents" className="scroll-mt-32">
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                Required Documents
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                Documents You'll Need
              </h2>
              <p className="text-gray-500 mb-6" style={{ lineHeight: 1.7 }}>
                Most documents can be submitted digitally. We review and prepare everything on your behalf.
              </p>

              <div
                className="rounded-xl p-6"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #e8edf2' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div key={doc} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0" style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}>
                        <FileText size={11} style={{ color: GOLD }} />
                      </div>
                      <span className="text-sm text-gray-700">{doc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Note:</span> Additional documents may be required depending on your chosen free zone, business activity, and shareholder nationality. Our team will provide a personalized document checklist.
                  </p>
                </div>
              </div>
            </section>

            {/* Step-by-Step Process */}
            <section id="process" className="scroll-mt-32">
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                Our Process
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                How We Set Up Your Free Zone Company
              </h2>
              <p className="text-gray-500 mb-8" style={{ lineHeight: 1.7 }}>
                A streamlined 6-step process — we handle the complexity while you focus on your business.
              </p>

              <div className="space-y-4">
                {steps.map((s, i) => (
                  <div
                    key={s.step}
                    className="flex gap-5 p-5 rounded-xl border transition-all hover:shadow-md"
                    style={{ borderColor: '#e8edf2' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ backgroundColor: NAVY, color: '#fff' }}
                    >
                      {s.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>{s.title}</h4>
                      <p className="text-sm text-gray-500" style={{ lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="self-end hidden sm:flex items-center" style={{ color: GOLD }}>
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ── Right: sticky sidebar ── */}
          <div>
            <div className="sticky top-28">
              <ConsultationSidebar />

              {/* Trustpilot-style rating box */}
              <div
                className="mt-5 rounded-xl p-5 bg-white border"
                style={{ borderColor: '#e8edf2' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Client Reviews</div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} className="w-3.5 h-3.5" fill={GOLD} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: NAVY }}>4.9/5</p>
                <p className="text-xs text-gray-500 mt-0.5">Based on 1,200+ Free Zone setup reviews</p>

                <div className="mt-4 space-y-2">
                  {[['Service Speed', 98], ['Communication', 97], ['Value for Money', 95], ['Expertise', 99]].map(([label, pct]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{label}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: GOLD }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct contact */}
              <div
                className="mt-5 rounded-xl p-5"
                style={{ backgroundColor: NAVY }}
              >
                <h4 className="text-white font-semibold text-sm mb-3">Prefer to talk directly?</h4>
                <a
                  href="https://wa.me/971551251185"
                  className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 mb-2"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+97144441234"
                  className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <Phone size={16} />
                  Call +971 551251185
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pricing Section ─────────────────────────────────── */}
      <section id="pricing" className="py-20 scroll-mt-32" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
            >
              Pricing
            </div>
            <h2 className="mb-3" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.25rem)', fontWeight: 700, color: NAVY, letterSpacing: '-0.3px' }}>
              Transparent Free Zone Setup Packages
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto" style={{ lineHeight: 1.7 }}>
              All-inclusive pricing with government fees. No hidden charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl overflow-hidden"
                style={{
                  border: plan.featured ? `2px solid ${GOLD}` : '1px solid #e8edf2',
                  transform: plan.featured ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: plan.featured ? '0 20px 60px rgba(201,150,60,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
                  backgroundColor: '#fff',
                }}
              >
                {plan.featured && (
                  <div className="text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: GOLD }}>
                    ✦ Most Popular
                  </div>
                )}
                <div className="p-7">
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: GOLD }}>{plan.name}</div>
                  <div className="text-3xl font-bold my-4" style={{ color: NAVY, letterSpacing: '-0.5px' }}>{plan.price}</div>
                  <div className="text-xs text-gray-400 mb-6">{plan.period}</div>
                  <div className="space-y-2.5 mb-7">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircle size={14} style={{ color: GOLD }} />
                        <span className="text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/contact"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{
                      backgroundColor: plan.featured ? GOLD : 'transparent',
                      color: plan.featured ? '#fff' : NAVY,
                      border: plan.featured ? 'none' : `2px solid ${NAVY}`,
                    }}
                  >
                    {plan.cta}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            * Prices include government authority fees for listed zones. Premium zones (DIFC, ADGM) have additional fees. 
            <Link to="/contact" className="font-semibold ml-1" style={{ color: GOLD }}>Contact us for exact pricing.</Link>
          </p>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────── */}
      <section id="faqs" className="py-20 bg-white scroll-mt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
            >
              FAQ
            </div>
            <h2 className="mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 700, color: NAVY }}>
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto" style={{ lineHeight: 1.7 }}>
              Everything you need to know about setting up a free zone company in Dubai.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-500 text-sm mb-4">Still have questions?</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              Talk to Our Expert
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section id="testimonials" className="py-20 scroll-mt-32" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 700, color: NAVY }}>
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6"
                style={{ border: '1px solid #e8edf2' }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill={GOLD} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: NAVY }}>{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
          >
            Ready to Get Started?
          </div>
          <h2
            className="text-white mb-4"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.5px' }}
          >
            Start Your Dubai Free Zone Company Today
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10" style={{ lineHeight: 1.7 }}>
            Join 10,000+ entrepreneurs who trusted DubizSetup to launch their UAE business.
            Get expert guidance, transparent pricing, and end-to-end support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              Start Now — Free Consultation
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/971501234567"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border-2 border-white/30 text-white hover:border-white/60 transition-all"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
