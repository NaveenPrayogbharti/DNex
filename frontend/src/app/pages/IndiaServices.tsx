import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight, Phone, MessageCircle, Send, CheckCircle,
  Receipt, FileText, ClipboardCheck, BookOpen, Building,
  FileCheck, Landmark, Handshake, IdCard, RefreshCw, Edit3,
  FolderOpen, ShieldCheck, Building2, Globe, Users, Briefcase,
  Clock, Star, TrendingUp, AlertCircle, MapPin, Award,
} from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0D2137';
const INDIA_SAFFRON = '#FF9933';

// ─── Data ──────────────────────────────────────────────────────────────────

const proServices = [
  { icon: FileCheck, label: 'Visa Processing', desc: 'Expert handling of all visa processing requirements for Indian nationals in the UAE.', href: '/leadform' },
  { icon: Briefcase, label: 'Employment Visa', desc: 'Seamless employment visa issuance for Indian professionals working in UAE.', href: '/leadform' },
  { icon: Landmark, label: 'Investor Visa', desc: 'Secure your UAE residency through eligible investment schemes.', href: '/leadform' },
  { icon: Handshake, label: 'Partner Visa', desc: 'Business partner and shareholder visa services handled professionally.', href: '/leadform' },
  { icon: Users, label: 'Family Visa', desc: 'Sponsor your family members in India and UAE with ease.', href: '/leadform' },
  { icon: Globe, label: 'Labour & Immigration', desc: 'Full support for labour and immigration procedures for Indian nationals.', href: '/leadform' },
  { icon: ClipboardCheck, label: 'Work Permits', desc: 'Fast-track work permit processing with complete documentation support.', href: '/leadform' },
  { icon: IdCard, label: 'Labour Cards', desc: 'Issuance and renewal of labour cards with zero hassle.', href: '/leadform' },
  { icon: ShieldCheck, label: 'Immigration Approvals', desc: 'Clearing complex immigration requirements quickly and effectively.', href: '/leadform' },
  { icon: Building2, label: 'Trade License Services', desc: 'New issuance and amendments to trade licenses for India-origin businesses.', href: '/leadform' },
  { icon: RefreshCw, label: 'License Renewal', desc: 'Timely reminders and processing for all license renewals.', href: '/leadform' },
  { icon: Edit3, label: 'Company Amendments', desc: 'Updating Memorandum, shares, and partnership structures with precision.', href: '/leadform' },
  { icon: FolderOpen, label: 'Document Clearing', desc: 'Dedicated PROs for fast and reliable document clearing services.', href: '/leadform' },
  { icon: ShieldCheck, label: 'Government Approvals', desc: 'End-to-end representation at UAE and Indian government bodies.', href: '/leadform' },
];

const indiaServiceCategories = [
  {
    id: 'taxation',
    title: 'Taxation Services',
    desc: 'India-specific tax filings, registrations, and compliance services for NRIs and India-based entities.',
    items: [
      { icon: Receipt, label: 'ITR Filing', desc: 'Income Tax Return filing for individuals, HUFs, and companies in India.', href: '/leadform' },
      { icon: FileText, label: 'GST Registration', desc: 'Complete support for GST registration and compliance within India.', href: '/leadform' },
      { icon: ClipboardCheck, label: 'GST Filing', desc: 'Monthly, quarterly, and annual GST return preparation and filing.', href: '/leadform' },
      { icon: BookOpen, label: 'TDS Compliance', desc: 'TDS deduction, filing, and compliance management services.', href: '/leadform' },
    ],
  },
  {
    id: 'accounting',
    title: 'Accounting & Audit',
    items: [
      { icon: BookOpen, label: 'Accounting & Bookkeeping', desc: 'Comprehensive financial tracking, reporting, and book management for Indian entities.', href: '/leadform' },
      { icon: ClipboardCheck, label: 'Audit Services', desc: 'Statutory and internal auditing to ensure complete financial accuracy.', href: '/leadform' },
      { icon: FileText, label: 'ROC Filings', desc: 'Annual and event-based filings with the Registrar of Companies.', href: '/leadform' },
    ],
    desc: 'Maintain accurate books and stay fully compliant with Indian accounting standards.',
  },
  {
    id: 'compliance',
    title: 'Compliance & Regulatory',
    desc: 'Navigate India\'s complex regulatory landscape — FEMA, RBI, SEBI, and more handled by experts.',
    items: [
      { icon: Building, label: 'FEMA Compliance', desc: 'Foreign Exchange Management Act advisory and compliance support for NRIs and businesses.', href: '/leadform' },
      { icon: ClipboardCheck, label: 'RBI Filings', desc: 'Reserve Bank of India mandatory filings, FCTRS, and reporting requirements.', href: '/leadform' },
      { icon: BookOpen, label: 'ODI Compliance', desc: 'Overseas Direct Investment compliance for Indian entities investing abroad.', href: '/leadform' },
      { icon: ShieldCheck, label: 'NRI Services', desc: 'Comprehensive NRI advisory — NRO/NRE accounts, repatriation, and tax planning.', href: '/leadform' },
    ],
  },
  {
    id: 'company-setup',
    title: 'Company Setup in India',
    desc: 'Incorporate your business in India with full legal compliance and expert guidance.',
    items: [
      { icon: Building2, label: 'Private Limited Company', desc: 'Incorporate a Pvt Ltd company in India with complete registration and compliance support.', href: '/leadform' },
      { icon: Landmark, label: 'LLP Formation', desc: 'Form a Limited Liability Partnership with end-to-end documentation and ROC filing.', href: '/leadform' },
      { icon: FileCheck, label: 'OPC Registration', desc: 'One Person Company registration for solo entrepreneurs in India.', href: '/leadform' },
      { icon: Globe, label: 'Branch Office in India', desc: 'Set up a branch or liaison office in India for foreign companies.', href: '/leadform' },
    ],
  },
];

const stats = [
  { value: '5,000+', label: 'NRI Clients Served' },
  { value: '15+', label: 'Years Experience' },
  { value: 'UAE & India', label: 'Dual Jurisdiction' },
  { value: '4.9/5', label: 'Client Rating' },
];

const benefits = [
  { icon: Globe, title: 'Dual Jurisdiction Experts', desc: 'Our team is fully conversant with both UAE and India regulatory frameworks.' },
  { icon: Users, title: 'Dedicated NRI Team', desc: 'Specialists who understand the unique challenges faced by Non-Resident Indians.' },
  { icon: TrendingUp, title: 'End-to-End Support', desc: 'From company setup to ongoing compliance — we handle everything.' },
  { icon: ShieldCheck, title: 'Confidential & Secure', desc: 'Your financial and personal data is handled with utmost confidentiality.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Efficient processing with timely updates at every step of the process.' },
  { icon: Award, title: 'Trusted by 5,000+ NRIs', desc: 'A proven track record with thousands of satisfied Indian-origin clients.' },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function ConsultationSidebar() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '' });

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `2px solid ${GOLD}` }}>
      <div className="p-6" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400">Consultants Online</span>
        </div>
        <h3 className="text-white font-bold text-lg">India Services Consultation</h3>
        <p className="text-slate-400 text-xs mt-1">Response within 1 business hour</p>
      </div>
      <div className="p-6 bg-white">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle size={40} style={{ color: GOLD }} className="mx-auto mb-3" />
            <h4 className="font-bold" style={{ color: NAVY }}>We'll be in touch soon!</h4>
            <p className="text-xs text-gray-500 mt-2">Our India services consultant will contact you within 4 hours.</p>
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
                type="tel" required placeholder="+91 99999 00000"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Service Required</label>
              <textarea
                rows={3} placeholder="Which India service are you interested in?"
                value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              <Send size={15} />
              Get Free Consultation
            </button>
          </form>
        )}
        <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
          <a href="tel:+971555542841" className="flex items-center gap-2.5 text-xs font-medium text-gray-600 hover:text-[#0D2137] transition-colors">
            <Phone size={13} style={{ color: GOLD }} /> +971 555542841 (UAE)
          </a>
          <a href="https://wa.me/971555542841" className="flex items-center gap-2.5 text-xs font-medium text-gray-600 hover:text-[#0D2137] transition-colors">
            <MessageCircle size={13} style={{ color: GOLD }} /> WhatsApp Chat
          </a>
          <div className="flex items-center gap-2.5 text-xs text-gray-500">
            <MapPin size={13} style={{ color: GOLD }} /> Serving UAE & India
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function IndiaServices() {
  const [activeTab, setActiveTab] = useState(indiaServiceCategories[0].id);

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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: GOLD }}>India Services</span>
          </div>

          {/* India flag accent */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
            >
              🇮🇳 India Services
            </div>
          </div>

          <h1
            className="text-white mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.5px' }}
          >
            Expert Services for<br />
            <span style={{ color: GOLD }}>NRIs & India-Based Businesses</span>
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl mb-10 text-justify" style={{ lineHeight: 1.65 }}>
            Seamlessly bridging the UAE and India through specialized services in FEMA compliance,
            NRI banking, company incorporation, tax filings, and end-to-end legal support across both jurisdictions.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

          {/* ── Left: main content ── */}
          <div className="space-y-20">

            {/* Why Choose Us */}
            <section>
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                Why Choose Us
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                Your Trusted Partner for India-UAE Services
              </h2>
              <p className="text-gray-500 mb-8 text-justify" style={{ lineHeight: 1.7 }}>
                With deep expertise in both UAE and Indian regulatory frameworks, we provide seamless
                cross-border services that help you stay compliant and grow your business.
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
                      <p className="text-xs text-gray-500 text-justify" style={{ lineHeight: 1.6 }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRO Services — Full Grid like PRO Services tab */}
            <section>
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                PRO Services
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                India PRO & Government Services
              </h2>
              <p className="text-gray-500 mb-8 text-justify" style={{ lineHeight: 1.7 }}>
                Our dedicated PRO team handles all government paperwork, approvals, and administrative
                procedures for Indian nationals and India-based businesses — so you don't have to.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proServices.map((service) => (
                  <Link
                    key={service.label}
                    to={service.href}
                    className="flex items-start gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                    >
                      <service.icon size={16} style={{ color: GOLD }} />
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-sm font-bold group-hover:text-[#0D2137] transition-colors mb-0.5"
                        style={{ color: '#1a2a3a' }}
                      >
                        {service.label}
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed text-justify">
                        {service.desc}
                      </div>
                    </div>
                    <ArrowRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 mt-1 transition-opacity" style={{ color: GOLD }} />
                  </Link>
                ))}
              </div>

              {/* Featured CTA strip */}
              <div
                className="mt-6 rounded-xl p-5 flex items-center justify-between gap-4"
                style={{ backgroundColor: NAVY }}
              >
                <div>
                  <div className="text-sm font-bold mb-0.5 text-white">Full PRO Support for India</div>
                  <p className="text-xs text-slate-400">Our dedicated PRO team handles all government paperwork, approvals, and administrative procedures.</p>
                </div>
                <Link
                  to="/leadform"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: GOLD }}
                >
                  Learn More
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            {/* Tabbed India-specific Services */}
            <section>
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                Specialized India Services
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                India-Specific Expertise
              </h2>
              <p className="text-gray-500 mb-8 text-justify" style={{ lineHeight: 1.7 }}>
                Comprehensive services tailored for Indian regulations, NRI requirements, and cross-border business needs.
              </p>

              {/* Side-tabs layout (like Our Services mega menu) */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Side-Tabs */}
                <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-1 md:border-r border-b md:border-b-0 border-gray-100 md:pr-4 pb-4 md:pb-0 overflow-x-auto">
                  {indiaServiceCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => window.innerWidth >= 768 && setActiveTab(cat.id)}
                      onClick={() => setActiveTab(cat.id)}
                      className={`text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap md:whitespace-normal ${
                        activeTab === cat.id
                          ? 'bg-slate-50 text-[#0D2137]'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50/50'
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>

                {/* Items panel */}
                <div className="w-full md:w-2/3 md:pl-2">
                  {indiaServiceCategories.filter(c => c.id === activeTab).map((cat) => (
                    <div key={cat.id}>
                      <p className="text-xs text-gray-500 mb-4" style={{ lineHeight: 1.65 }}>{cat.desc}</p>
                      <div className="grid grid-cols-1 gap-y-1">
                        {cat.items.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                            >
                              <item.icon size={14} style={{ color: GOLD }} />
                            </div>
                            <div>
                              <div
                                className="text-sm font-bold group-hover:text-[#0D2137] transition-colors mb-0.5"
                                style={{ color: '#1a2a3a' }}
                              >
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500 leading-relaxed">
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* NRI Advisory Note */}
            <section>
              <div
                className="rounded-xl p-6 flex gap-4"
                style={{ backgroundColor: 'rgba(201,150,60,0.06)', border: `1px solid rgba(201,150,60,0.3)` }}
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
                <div>
                  <h4 className="font-bold text-sm mb-2" style={{ color: NAVY }}>Important NRI Advisory</h4>
                  <p className="text-sm text-gray-600 text-justify" style={{ lineHeight: 1.7 }}>
                    As an NRI, your tax obligations span both India and your country of residence. Our experts
                    ensure you remain compliant with FEMA regulations, DTAA treaty benefits, and RBI guidelines
                    while optimizing your cross-border financial structure. Contact us for a personalized assessment.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* ── Right: sticky sidebar ── */}
          <div>
            <div className="sticky top-28">
              <ConsultationSidebar />

              {/* Rating box */}
              <div className="mt-5 rounded-xl p-5 bg-white border" style={{ borderColor: '#e8edf2' }}>
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
                <p className="text-xs text-gray-500 mt-0.5">Based on 800+ India services reviews</p>

                <div className="mt-4 space-y-2">
                  {[['NRI Expertise', 99], ['Communication', 97], ['FEMA Compliance', 98], ['Turnaround Time', 95]].map(([label, pct]) => (
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
              <div className="mt-5 rounded-xl p-5" style={{ backgroundColor: NAVY }}>
                <h4 className="text-white font-semibold text-sm mb-3">Prefer to talk directly?</h4>
                <a
                  href="https://wa.me/971555542841"
                  className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 mb-2"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+971555542841"
                  className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <Phone size={16} />
                  Call +971 555542841
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
          >
            🇮🇳 India Services — Ready to Start?
          </div>
          <h2
            className="text-white mb-4"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.5px' }}
          >
            Your India-UAE Business Partner
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-justify" style={{ lineHeight: 1.7 }}>
            Whether you're an NRI managing investments in India, an Indian company expanding to the UAE,
            or seeking cross-border compliance support — we are your trusted partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: GOLD }}
            >
              Contact Us Today
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/leadform"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border-2 border-white/30 text-white hover:border-white/60 transition-all"
            >
              <Star size={15} />
              Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
