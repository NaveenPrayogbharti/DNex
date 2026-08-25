import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight, Phone, MessageCircle, Send, CheckCircle, XCircle,
  Receipt, FileText, ClipboardCheck, BookOpen, Building,
  FileCheck, Landmark, Handshake, IdCard, RefreshCw, Edit3,
  FolderOpen, ShieldCheck, Building2, Globe, Anchor, GitBranch,
  Lightbulb, UserCog, Briefcase, Users, UserCheck, Laptop,
  Clock, Star, TrendingUp, Award, AlertCircle, Scale, Gavel,
} from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

// ─── Data ──────────────────────────────────────────────────────────────────

const serviceCategories = [
  {
    id: 'business-setup',
    label: 'Business Setup',
    badge: 'Company Formation',
    description: 'Establish your business in the UAE with full legal compliance and expert guidance across all entity types.',
    icon: Building2,
    services: [
      { icon: Building2, title: 'Mainland Company Formation', desc: 'A mainland company in UAE is an onshore business entity registered with D.E.D, allowed to operate anywhere within UAE and internationally.', href: '/mainland' },
      { icon: Anchor, title: 'Offshore Company Formation', desc: 'An offshore company in UAE is incorporated to conduct business outside UAE, mainly used for international business or asset holding.', href: '/offshore' },
      { icon: Lightbulb, title: 'Holding Company Formation', desc: 'A holding company owns sufficient voting stock in other companies to exercise control over their management and policies.', href: '/business-incubator' },
      { icon: Globe, title: 'Free Zone Company Setup', desc: 'Allows 100% foreign ownership with simplified setup and modern infrastructure. A flexible, cost-effective way to start.', href: '/free-zone' },
      { icon: GitBranch, title: 'Branch Office Setup', desc: "Allows international companies to expand their presence and operate under their parent company's brand with direct market access.", href: '/branch' },
      { icon: UserCog, title: 'Civil Companies', desc: 'A professional partnership formed by individuals to provide professional and intellectual services.', href: '/businessmen-services' },
      { icon: UserCog, title: 'Real Estate Business', desc: 'Engaged in activities related to the buying, selling, leasing, management, or development of real properties.', href: '/businessmen-services' },
      { icon: UserCog, title: 'Office Setup Services', desc: 'Professional services to assist in establishing a functional office space, including infrastructure and compliance.', href: '/businessmen-services' },
    ],
    featured: { title: 'Start in a Free Zone', desc: '100% ownership and fast registration in UAE\'s free zones. Free zone company formation offers entrepreneurs and businesses simplified setup procedures, tax advantages, full repatriation of profits, and access to world-class infrastructure. It is an ideal option for startups, SMEs, and international businesses looking to establish a strong presence in the UAE with minimal restrictions and faster business licensing processes.', cta: 'Explore Free Zones', href: '/free-zone' },
  },
  {
    id: 'banking',
    label: 'Banking Support',
    badge: 'Financial Services',
    description: 'Comprehensive banking and financial support services for businesses and individuals operating in the UAE.',
    icon: Briefcase,
    services: [
      { icon: Briefcase, title: 'Corporate Banking Assistance', desc: 'Assist businesses in opening corporate bank accounts in the UAE with the required documentation and compliance support.', href: '/investor-visa', sectionId: 'corporate-banking' },
      { icon: Users,     title: 'Mortgage Banking',            desc: 'Guidance and support for securing property financing in the UAE, helping obtain suitable mortgage solutions.',             href: '/partner-visa',    sectionId: 'mortgage' },
      { icon: UserCheck, title: 'NRO Account Assistance',       desc: 'Professional support services provided to Non-resident Indians (NRIs) for opening and managing an NRO bank account.',   href: '/employment-visa', sectionId: 'nro' },
      { icon: Laptop,    title: 'Overseas Direct Investment (ODI)', desc: 'Comprehensive assistance for ODI including RBI regulations guidance, documentation, and authorized dealer coordination.', href: '/freelance-visa', sectionId: 'odi' },
    ],
    featured: { title: 'Banking Support', desc: 'Banking Services for investors, professionals, and entrepreneurs. Seamless account opening, compliance support, and tailored banking solutions.', cta: 'Apply Now', href: '/leadform' },
  },
  {
    id: 'pro-services',
    label: 'PRO Services',
    badge: 'Government Relations',
    description: 'End-to-end professional PRO services — visa processing, trade licenses, immigration, and all government paperwork.',
    icon: ShieldCheck,
    services: [
      { icon: FileCheck, title: 'Visa Processing', desc: 'Expert handling of all visa processing requirements with speed and accuracy.', href: '/attestation' },
      { icon: Briefcase, title: 'Employment Visa', desc: 'Seamless employment visa issuance for your staff with minimal delays.', href: '/attestation' },
      { icon: Landmark, title: 'Investor Visa', desc: 'Secure your UAE residency through eligible investment schemes.', href: '/attestation' },
      { icon: Handshake, title: 'Partner Visa', desc: 'Business partner and shareholder visa services handled professionally.', href: '/attestation' },
      { icon: Users, title: 'Family Visa', desc: 'Sponsor your family members with ease — we manage every step.', href: '/attestation' },
      { icon: Globe, title: 'Labour & Immigration', desc: 'Full support for labour and immigration quotas and approvals.', href: '/attestation' },
      { icon: ClipboardCheck, title: 'Work Permits', desc: 'Fast-track work permit processing with expert documentation support.', href: '/attestation' },
      { icon: IdCard, title: 'Labour Cards', desc: 'Issuance and renewal of corporate labour cards efficiently handled.', href: '/attestation' },
      { icon: ShieldCheck, title: 'Immigration Approvals', desc: 'Clearing complex immigration hurdles quickly and effectively.', href: '/attestation' },
      { icon: Building2, title: 'Trade License Services', desc: 'New issuance and amendments to trade licenses across all emirates.', href: '/attestation' },
      { icon: RefreshCw, title: 'License Renewal', desc: 'Timely reminders and processing for license renewals without hassle.', href: '/attestation' },
      { icon: Edit3, title: 'Company Amendments', desc: 'Updating Memorandum, shares, and partnership structures with precision.', href: '/attestation' },
      { icon: FolderOpen, title: 'Document Clearing', desc: 'Dedicated PROs for fast and reliable document clearing services.', href: '/attestation' },
      { icon: ShieldCheck, title: 'Government Approvals', desc: 'End-to-end representation at various government bodies in the UAE.', href: '/attestation' },
    ],
    featured: { title: 'Full PRO Support', desc: 'Our dedicated PRO team handles all government paperwork, approvals, and administrative procedures.', cta: 'Learn More', href: '/leadform' },
  },
  {
    id: 'taxation',
    label: 'Taxation Services',
    badge: 'Tax & Compliance',
    description: 'Expert tax advisory and compliance services ensuring your business remains fully compliant with UAE regulations.',
    icon: Receipt,
    services: [
      { icon: Receipt, title: 'Corporate Tax Registration', desc: 'Expert registration services for UAE Corporate Tax compliance and filing.', href: '/vat-registration' },
      { icon: FileText, title: 'VAT Registration', desc: 'Complete support for standard VAT registration and ongoing compliance.', href: '/vat-filing' },
      { icon: ClipboardCheck, title: 'CT Filing', desc: 'Timely and accurate Corporate Tax return filing services.', href: '/audit' },
      { icon: BookOpen, title: 'VAT Filing', desc: 'Quarterly and monthly VAT return preparation and filings with precision.', href: '/accounting' },
    ],
    featured: { title: 'Corporate Tax 2024', desc: 'Navigate UAE\'s 9% corporate tax with our expert registration and filing services.', cta: 'Get Compliant', href: '/leadform' },
  },
  {
    id: 'accounting',
    label: 'Accounting & Audit',
    badge: 'Financial Management',
    description: 'Comprehensive accounting, bookkeeping, and audit services to keep your financial records accurate and compliant.',
    icon: BookOpen,
    services: [
      { icon: BookOpen, title: 'Accounting & Bookkeeping', desc: 'Comprehensive financial tracking, reporting, and book management services.', href: '/accounting' },
      { icon: ClipboardCheck, title: 'Audit Services', desc: 'Independent auditing to ensure complete financial accuracy and regulatory compliance.', href: '/audit' },
    ],
    featured: { title: 'Financial Clarity', desc: 'Maintain accurate books and stay compliant with our expert accounting and audit team.', cta: 'Get Started', href: '/leadform' },
  },
  {
    id: 'compliance',
    label: 'Compliance & Regulatory',
    badge: 'Regulatory Services',
    description: 'Stay ahead of regulatory requirements with our specialized compliance and AML services.',
    icon: Building,
    services: [
      { icon: Building, title: 'GoAML Registration', desc: 'Anti-Money Laundering compliance setup and registration with UAE authorities.', href: '/corporate-tax' },
      { icon: ClipboardCheck, title: 'APR Filing', desc: 'Annual Performance Report regulatory filings and compliance management.', href: '/audit' },
      { icon: BookOpen, title: 'FEMA Compliances', desc: 'Foreign Exchange Management Act advisory and legal compliance support.', href: '/accounting' },
    ],
    featured: { title: 'Stay Compliant', desc: 'Navigate UAE\'s regulatory landscape with confidence using our expert compliance services.', cta: 'Learn More', href: '/leadform' },
  },
];

const stats = [
  { value: 'UAE Mainland', label: '& Free Zones' },
  { value: '15+', label: 'Years Experience' },
  { value: '4.9/5', label: 'Client Rating' },
];

// ─── India Services Data ───────────────────────────────────────────────────

const indiaProServices = [
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
    id: 'india-incorporation',
    title: 'Company Incorporation',
    desc: 'End-to-end company incorporation services in India — Private and Public company, LLP, OPC, Branch Office setup, and many more types.',
    items: [
      { icon: Building2, label: 'Private Limited Company', desc: 'Incorporate a Pvt Ltd company in India with complete registration, MOA/AOA drafting, and compliance support.', href: '/leadform' },
      { icon: Landmark, label: 'Public Limited Company', desc: 'End-to-end public company formation including prospectus, SEBI filing, and regulatory compliance.', href: '/leadform' },
      { icon: FileCheck, label: 'LLP Formation', desc: 'Form a Limited Liability Partnership with end-to-end documentation and ROC filing.', href: '/leadform' },
      { icon: Globe, label: 'OPC Registration', desc: 'One Person Company registration for solo entrepreneurs looking to operate in India.', href: '/leadform' },
      { icon: GitBranch, label: 'Branch Office in India', desc: 'Set up a branch or liaison office in India for foreign companies.', href: '/leadform' },
    ],
  },
  {
    id: 'india-gst',
    title: 'GST Compliances',
    desc: 'Complete GST lifecycle support — registration, filing, reconciliation, and audit.',
    items: [
      { icon: FileText, label: 'GST Registration', desc: 'New GST registration for businesses with complete documentation support.', href: '/leadform' },
      { icon: ClipboardCheck, label: 'GSTR Filing', desc: 'Preparation and filing of monthly, quarterly and annual GST returns (GSTR-1, GSTR-3B and GSTR-9 and 9C and many more).', href: '/leadform' },
      { icon: BookOpen, label: 'GST Reconciliation', desc: 'GSTR-2A/2B matching, ITC reconciliation, and mismatch resolution.', href: '/leadform' },
      { icon: Receipt, label: 'GST Audit', desc: 'GST audit support with preparation of GSTR-9 and 9C for businesses exceeding threshold limits.', href: '/leadform' },
    ],
  },
  {
    id: 'india-incometax',
    title: 'Income Tax Services',
    desc: 'Comprehensive income tax solutions for individuals, NRIs, HUFs, firms, LLPs, and companies, covering tax planning, compliance, assessments, and litigation support.',
    items: [
      { icon: Receipt, label: 'ITR Filing', desc: 'Income Tax Return filing for individuals, NRIs, HUFs, partnership firms, LLPs, trusts, and companies, ensuring accurate reporting and timely compliance.', href: '/leadform' },
      { icon: ClipboardCheck, label: 'TDS and TCS Compliance', desc: 'TDS and TCS registration, deduction, challan payment, quarterly return filing, correction statements, lower deduction certificates, and end-to-end compliance management.', href: '/leadform' },
      { icon: BookOpen, label: 'Advance Tax Planning', desc: 'Strategic tax planning, advance tax computation, tax optimization, and payment advisory to minimize interest and penalty exposure.', href: '/leadform' },
      { icon: ShieldCheck, label: 'Tax Notice & Assessment Handling', desc: 'Professional representation for income tax notices, scrutiny assessments, reassessments, faceless proceedings, rectifications, and appeals.', href: '/leadform' },
      { icon: FileText, label: 'Tax Audit & Compliance', desc: 'Assistance with Tax Audit under Section 44AB, compliance reviews, documentation support, and reporting requirements.', href: '/leadform' },
      { icon: TrendingUp, label: 'Capital Gains Advisory', desc: 'Expert guidance on capital gains tax arising from property transactions, securities, mutual funds, ESOPs, and other investments.', href: '/leadform' },
      { icon: Globe, label: 'NRI Taxation Services', desc: 'Specialized advisory on residential status, DTAA benefits, foreign income reporting, property transactions, and NRI return filing.', href: '/leadform' },
      { icon: IdCard, label: 'PAN, TAN & Tax Registrations', desc: 'PAN, TAN, lower withholding applications, tax registrations, and compliance-related documentation support.', href: '/leadform' },
      { icon: Gavel, label: 'Appeals & Litigation Support', desc: 'Representation before Income Tax Authorities, CIT(A), ITAT, and assistance in tax disputes and litigation matters.', href: '/leadform' },
      { icon: Lightbulb, label: 'Tax Planning & Structuring', desc: 'Business and personal tax planning, entity structuring, succession planning, and tax-efficient transaction advisory.', href: '/leadform' },
    ],
  },
  {
    id: 'india-roc',
    title: 'ROC & Corporate Compliance',
    desc: 'Comprehensive Registrar of Companies (ROC) compliance and corporate secretarial services for private and public companies, LLPs, startups, and other business entities, ensuring full compliance with the Companies Act, 2013 and MCA regulations.',
    items: [
      { icon: FileText, label: 'Annual ROC Filings', desc: 'Timely filing of AOC-4, MGT-7/MGT-7A, DPT-3, MSME Form-I, DIR-3 KYC, LLP Form-11, LLP Form-8, and other mandatory annual compliances.', href: '/leadform' },
      { icon: ClipboardCheck, label: 'Event-Based Filings', desc: 'Filing and compliance support for director appointments and resignations, share transfers, change in registered office, increase in authorized capital, allotment of shares, and other corporate events.', href: '/leadform' },
      { icon: Clock, label: 'Compliance Calendar & Due Date Management', desc: 'Proactive compliance monitoring, reminders, and tracking of statutory deadlines to avoid penalties and non-compliance.', href: '/leadform' },
      { icon: Users, label: 'Director & KMP Compliance', desc: 'DIR-3 KYC, DIN-related filings, appointment and resignation of directors, and compliance for Key Managerial Personnel (KMP).', href: '/leadform' },
      { icon: XCircle, label: 'Strike-Off & Closure Services', desc: 'Assistance with voluntary strike-off of companies and LLPs, closure compliances, and regulatory filings.', href: '/leadform' },
      { icon: Briefcase, label: 'Corporate Advisory', desc: 'Advisory on Companies Act matters, shareholder rights, corporate restructuring, mergers, acquisitions, and governance issues.', href: '/leadform' },
    ],
  },
  {
    id: 'india-advisory',
    title: 'Business Advisory',
    desc: 'Strategic business advisory services for startups, MSMEs, and growing enterprises in India.',
    items: [
      { icon: TrendingUp, label: 'Business Strategy', desc: 'Strategic planning, market entry advisory, and business model optimization for Indian market.', href: '/leadform' },
      { icon: Briefcase, label: 'Startup Advisory', desc: 'DPIIT registration, startup compliance, funding advisory, and growth roadmap consulting.', href: '/leadform' },
      { icon: Award, label: 'MSME Registration', desc: 'Udyam registration and MSME benefit advisory for small and medium enterprises.', href: '/leadform' },
    ],
  },
  {
    id: 'india-crossborder',
    title: 'Cross-Border Services (UAE–India)',
    desc: 'Seamlessly bridging the UAE and India through specialized services in FEMA compliance, NRI banking, company incorporation, tax filings, and end-to-end legal support across both jurisdictions.',
    items: [
      { icon: Globe, label: 'UAE–India Structuring', desc: 'Optimal business structuring for entities operating across both UAE and India jurisdictions.', href: '/leadform' },
      { icon: Building, label: 'FEMA & ODI Compliance', desc: 'Foreign Exchange Management Act advisory, ODI filings, and FCTRS reporting for outbound investments.', href: '/leadform' },
      { icon: ShieldCheck, label: 'NRI Advisory', desc: 'Comprehensive NRI tax planning, NRO/NRE account advisory, repatriation, and DTAA benefits.', href: '/leadform' },
      { icon: Laptop, label: 'Transfer Pricing', desc: 'Transfer pricing documentation, benchmarking, and compliance for related-party cross-border transactions.', href: '/leadform' },
    ],
  },
];

const indiaBenefits = [
  { icon: Globe, title: 'Dual Jurisdiction Experts', desc: 'Our team is fully conversant with both UAE and India regulatory frameworks.' },
  { icon: Users, title: 'Dedicated NRI Team', desc: 'Specialists who understand the unique challenges faced by Non-Resident Indians.' },
  { icon: TrendingUp, title: 'End-to-End Support', desc: 'From company setup to ongoing compliance we handle everything.' },
  { icon: ShieldCheck, title: 'Confidential & Secure', desc: 'Your financial and personal data is handled with utmost confidentiality.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Efficient processing with timely updates at every step of the process.' },
  { icon: Award, title: 'Trusted by 5,000+ NRIs', desc: 'A proven track record with thousands of satisfied Indian-origin clients.' },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function ConsultationSidebar() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `2px solid ${GOLD}` }}>
      <div className="p-6" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400">Consultants Online</span>
        </div>
        <h3 className="text-white font-bold text-lg">Get Consultation</h3>
        <p className="text-slate-400 text-xs mt-1">Response within 1 business hour</p>
      </div>
      <div className="p-6 bg-white">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle size={40} style={{ color: GOLD }} className="mx-auto mb-3" />
            <h4 className="font-bold" style={{ color: NAVY }}>We'll be in touch soon!</h4>
            <p className="text-xs text-gray-500 mt-2">Our consultant will contact you within 4 hours.</p>
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
                type="tel" required placeholder="+971 555 000 000"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Service Required</label>
              <textarea
                rows={3} placeholder="Which service are you interested in?"
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
              Start Now
            </button>
          </form>
        )}
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

// ─── Banking Detail Data ───────────────────────────────────────────────
const bankingDetails = [
  {
    id: 'corporate-banking',
    icon: Briefcase,
    title: 'Corporate Banking Assistance',
    badge: 'Business Banking',
    summary: 'We assist businesses in opening corporate bank accounts with leading UAE banks — from document preparation to direct bank liaison.',
    points: [
      'End-to-end support for corporate account opening',
      'Liaison with ADCB, Emirates NBD, FAB, RAKBANK & more',
      'Compliance and KYC documentation preparation',
      'Multi-currency account setup for international businesses',
      'Dedicated account manager throughout the process',
    ],
    cta: 'Apply for Corporate Account',
  },
  {
    id: 'mortgage',
    icon: Users,
    title: 'Mortgage Banking',
    badge: 'Property Finance',
    summary: 'Comprehensive guidance to secure the best property financing deals in the UAE — residential and commercial mortgages handled by experts.',
    points: [
      'Eligibility assessment for UAE mortgage products',
      'Comparison across 15+ leading UAE banks',
      'Documentation preparation and submission',
      'NRI & expat mortgage advisory',
      'Pre-approval assistance for faster processing',
    ],
    cta: 'Explore Mortgage Options',
  },
  {
    id: 'nro',
    icon: UserCheck,
    title: 'NRO Account Assistance',
    badge: 'NRI Banking',
    summary: 'Helping Non-Resident Indians open and manage NRO accounts in India — our specialists handle all documentation and RBI compliance requirements.',
    points: [
      'NRO account opening for salaried and self-employed NRIs',
      'FEMA compliant documentation preparation',
      'Repatriation of funds advisory',
      'Tax implications and DTAA benefit guidance',
      'Online and offline account management support',
    ],
    cta: 'Open NRO Account',
  },
  {
    id: 'odi',
    icon: Laptop,
    title: 'Overseas Direct Investment (ODI)',
    badge: 'Cross-Border Investment',
    summary: 'End-to-end ODI assistance for Indian entities investing abroad — from RBI approval to authorized dealer coordination and ongoing compliance.',
    points: [
      'ODI regulatory framework advisory (RBI / FEMA)',
      'Filing of Form ODI with authorised dealer banks',
      'Annual Performance Report (APR) preparation',
      'Valuation reports and due-diligence support',
      'Step-down subsidiary structure planning',
    ],
    cta: 'Start ODI Process',
  },
];

// ─── Banking Section (with in-page scroll cards) ─────────────────────
function BankingSection() {
  const scrollToDetail = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 150;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const banking = serviceCategories.find(c => c.id === 'banking')!;

  return (
    <section id="banking" className="scroll-mt-40">
      {/* Section header */}
      <div
        className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
        style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
      >
        {banking.badge}
      </div>
      <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
        {banking.label}
      </h2>
      <p className="text-gray-500 mb-8 text-justify" style={{ lineHeight: 1.7 }}>
        {banking.description}
      </p>

      {/* Clickable overview cards — scroll to detail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {(banking.services as Array<typeof banking.services[0] & { sectionId?: string }>).map((service) => (
          <button
            key={service.title}
            onClick={() => service.sectionId && scrollToDetail(service.sectionId)}
            className="flex gap-4 p-5 rounded-xl border text-left transition-all duration-200 group cursor-pointer"
            style={{ borderColor: '#e8edf2' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,150,60,0.5)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(201,150,60,0.12)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e8edf2';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#C9963C]/20"
              style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
            >
              <service.icon size={18} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 group-hover:text-[#C9963C] transition-colors" style={{ color: NAVY }}>
                {service.title}
              </h4>
              <p className="text-xs text-gray-500 text-justify" style={{ lineHeight: 1.6 }}>{service.desc}</p>
            </div>
            <div className="shrink-0 mt-1 self-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}
              >
                <ArrowRight size={12} style={{ color: GOLD }} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detailed sub-sections */}
      <div className="space-y-10">
        {bankingDetails.map((detail, i) => (
          <section
            key={detail.id}
            id={detail.id}
            className="scroll-mt-40 rounded-2xl overflow-hidden border"
            style={{ borderColor: '#e8edf2' }}
          >
            {/* Coloured header stripe */}
            <div
              className="px-6 py-5 flex items-center gap-4"
              style={{
                background: i % 2 === 0
                  ? `linear-gradient(135deg, ${NAVY} 0%, #1a3354 100%)`
                  : `linear-gradient(135deg, #1a2e48 0%, ${NAVY} 100%)`,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(201,150,60,0.2)' }}
              >
                <detail.icon size={20} style={{ color: GOLD }} />
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: GOLD }}
                >
                  {detail.badge}
                </div>
                <h3 className="text-white font-bold text-base">{detail.title}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 bg-white">
              <p className="text-gray-600 text-sm mb-5 text-justify" style={{ lineHeight: 1.75 }}>
                {detail.summary}
              </p>
              <ul className="space-y-2.5 mb-6">
                {detail.points.map(pt => (
                  <li key={pt} className="flex items-start gap-3">
                    <CheckCircle size={15} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
                    <span className="text-sm text-gray-700">{pt}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/leadform"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                {detail.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        ))}
      </div>

      {/* Featured CTA strip */}
      <div
        className="mt-10 rounded-xl p-5 flex items-center justify-between gap-4"
        style={{ backgroundColor: 'rgba(13,33,55,0.04)', border: `1px dashed ${GOLD}40` }}
      >
        <div>
          <div className="text-sm font-bold mb-0.5" style={{ color: NAVY }}>{banking.featured.title}</div>
          <p className="text-xs text-gray-500">{banking.featured.desc}</p>
        </div>
        <Link
          to={banking.featured.href}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          {banking.featured.cta}
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

function ServiceSection({ category }: { category: typeof serviceCategories[0] }) {
  return (
    <section id={category.id} className="scroll-mt-40">
      <div
        className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
        style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
      >
        {category.badge}
      </div>
      <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
        {category.label}
      </h2>
      <p className="text-gray-500 mb-8 text-justify" style={{ lineHeight: 1.7 }}>
        {category.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {category.services.map((service) => {
          const validRoutes = ['/', '/free-zone', '/our-services', '/india-services', '/leadform', '/contact', '/about', '/privacy'];
          const isClickable = service.href && validRoutes.includes(service.href.split('#')[0]);

          if (isClickable) {
            return (
              <Link
                key={service.title}
                to={service.href!}
                className="flex gap-4 p-5 rounded-xl border transition-all hover:border-[#C9963C]/40 hover:shadow-md group"
                style={{ borderColor: '#e8edf2' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                >
                  <service.icon size={18} style={{ color: GOLD }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-[#C9963C] transition-colors" style={{ color: NAVY }}>
                    {service.title}
                  </h4>
                  <p className="text-xs text-gray-500 text-justify" style={{ lineHeight: 1.6 }}>{service.desc}</p>
                </div>
                <ArrowRight size={14} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: GOLD }} />
              </Link>
            );
          }

          return (
            <div
              key={service.title}
              className="flex gap-4 p-5 rounded-xl border"
              style={{ borderColor: '#e8edf2' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
              >
                <service.icon size={18} style={{ color: GOLD }} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>
                  {service.title}
                </h4>
                <p className="text-xs text-gray-500 text-justify" style={{ lineHeight: 1.6 }}>{service.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured CTA strip */}
      <div
        className="rounded-xl p-5 flex items-center justify-between gap-4"
        style={{ backgroundColor: 'rgba(13,33,55,0.04)', border: `1px dashed ${GOLD}40` }}
      >
        <div>
          <div className="text-sm font-bold mb-0.5" style={{ color: NAVY }}>{category.featured.title}</div>
          <p className="text-xs text-gray-500">{category.featured.desc}</p>
        </div>
        <Link
          to={category.featured.href}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          {category.featured.cta}
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

function IndiaServicesTabs() {
  const [activeTab, setActiveTab] = useState(indiaServiceCategories[0].id);
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Side-Tabs */}
      <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-1 md:border-r border-b md:border-b-0 border-gray-100 md:pr-4 pb-4 md:pb-0 overflow-x-auto">
        {indiaServiceCategories.map((cat) => (
          <button
            key={cat.id}
            onMouseEnter={() => window.innerWidth >= 768 && setActiveTab(cat.id)}
            onClick={() => setActiveTab(cat.id)}
            className={`text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap md:whitespace-normal ${activeTab === cat.id
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
            <p className="text-xs text-gray-500 mb-4 text-justify" style={{ lineHeight: 1.65 }}>{cat.desc}</p>
            <div className="grid grid-cols-1 gap-y-1">
              {cat.items.map((item) => {
                const validRoutes = ['/', '/free-zone', '/our-services', '/india-services', '/leadform', '/contact', '/about', '/privacy'];
                const isClickable = item.href && validRoutes.includes(item.href.split('#')[0]);

                if (isClickable) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href!}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                      >
                        <item.icon size={14} style={{ color: GOLD }} />
                      </div>
                      <div>
                        <div className="text-sm font-bold group-hover:text-[#0D2137] transition-colors mb-0.5" style={{ color: '#1a2a3a' }}>
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed text-justify">{item.desc}</div>
                      </div>
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-3 rounded-xl border border-transparent"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                    >
                      <item.icon size={14} style={{ color: GOLD }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold mb-0.5" style={{ color: '#1a2a3a' }}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed text-justify">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function OurServices() {
  const [activeCategory, setActiveCategory] = useState(serviceCategories[0].id);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <section
        className="relative pt-36 pb-20 overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3Jwb3JhdGUlMjBidWlsZGluZyUyMHNreXNjcmFwZXIlMjBEdWJhaXxlbnwxfHx8fDE3NzIxNzc1MjB8MA&ixlib=rb-4.1.0&q=80&w=1920"
            alt="Corporate Services"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(13,33,55,0.95) 0%, rgba(13,33,55,0.85) 50%, rgba(26,51,84,0.8) 100%)`,
            }}
          />
        </div>

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
            <span style={{ color: GOLD }}>Our Services</span>
          </div>

          <div
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
          >
            Complete Service Portfolio
          </div>

          <h1
            className="text-white mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.5px' }}
          >
            All Our Services
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl mb-10 text-justify" style={{ lineHeight: 1.65 }}>
            From company formation to tax compliance, PRO services to banking support we are your one stop
            solution for every business need in the UAE.
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


      {/* ── Main Content + Sidebar ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

          {/* ── Left: service sections ── */}
          <div className="space-y-20">
            {serviceCategories.map((cat) =>
              cat.id === 'banking'
                ? <BankingSection key="banking" />
                : <ServiceSection key={cat.id} category={cat} />
            )}

            {/* ── India Services Section ── */}
            <section id="india-services" className="scroll-mt-40">
              {/* Section Header */}
              <div
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                style={{ color: '#FF9933', backgroundColor: 'rgba(255,153,51,0.1)' }}
              >
                🇮🇳 India Services
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem', fontWeight: 700, color: NAVY }}>
                Expert Services for NRIs, Businesses &amp; Legal Support
              </h2>
              <p className="text-gray-500 mb-10 text-justify" style={{ lineHeight: 1.7 }}>
                Seamlessly bridging the UAE and India through specialized services in FEMA compliance, NRI banking, company incorporation, tax filings, and end-to-end legal support across both jurisdictions.
              </p>

              {/* Sub-section: Legal Services */}
              <div className="mb-12">
                <h3 className="text-xl font-bold mb-4" style={{ color: NAVY }}>⚖️ Legal Services &amp; Dispute Resolution</h3>
                
                {/* Featured Legal Banner */}
                <div
                  className="rounded-2xl overflow-hidden mb-6"
                  style={{ border: `2px solid ${GOLD}20` }}
                >
                  <div
                    className="px-6 py-6"
                    style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3354 100%)` }}
                  >
                    <div
                      className="inline-block text-[10px] font-bold uppercase tracking-widest mb-2 px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(201,150,60,0.2)', color: GOLD }}
                    >
                      Featured
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Protect Your Interests with the Right Legal Strategy
                    </h3>
                    <p className="text-slate-300 text-sm mb-4 max-w-2xl" style={{ lineHeight: 1.7 }}>
                      Whether you are facing a dispute or require proactive legal support, DNEX is here to assist you.
                      Our legal team combines deep regulatory knowledge with practical strategy to safeguard your interests
                      at every stage — from advisory to representation.
                    </p>
                    <Link
                      to="/leadform"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: GOLD }}
                    >
                      Schedule a Legal Consultation
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Legal Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Scale, title: 'Litigation & Dispute Resolution', desc: 'Expert legal representation in civil, criminal, commercial, and regulatory matters, including court proceedings, arbitration, dispute resolution, and legal risk management.' },
                    { icon: FileText, title: 'Contract Drafting & Vetting', desc: 'Professional drafting, review, and vetting of commercial contracts, agreements, MOUs, partnership deeds, employment contracts, and other legal documents to ensure compliance, mitigate risks, and protect your interests.' },
                    { icon: ShieldCheck, title: 'Regulatory Compliance', desc: 'Comprehensive compliance support for UAE and Indian businesses, including corporate filings, ROC compliances, FEMA regulations, tax obligations, licensing requirements, AML, ESR, UBO reporting, and other statutory requirements to ensure seamless business operations.' },
                    { icon: Gavel, title: 'Legal Advisory', desc: 'Expert legal advice on corporate, commercial, contractual, and regulatory matters, helping businesses make informed decisions, manage risks, and ensure legal compliance.' },
                    { icon: BookOpen, title: 'Legal Documentation', desc: 'Preparation and management of all legal documents including board resolutions, shareholder agreements, powers of attorney, and statutory registers.' },
                    { icon: ShieldCheck, title: 'Tax Notice & Legal Response', desc: 'Expert handling of income tax notices, show-cause notices, scrutiny assessments, faceless proceedings, and regulatory queries with professional representation.' },
                  ].map((service) => (
                    <Link
                      key={service.title}
                      to="/leadform"
                      className="flex gap-4 p-4 rounded-xl border transition-all hover:border-[#C9963C]/40 hover:shadow-md group"
                      style={{ borderColor: '#e8edf2' }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'rgba(13,33,55,0.08)' }}
                      >
                        <service.icon size={16} style={{ color: NAVY }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1 group-hover:text-[#C9963C] transition-colors" style={{ color: NAVY }}>
                          {service.title}
                        </h4>
                        <p className="text-xs text-gray-500 text-justify" style={{ lineHeight: 1.5 }}>{service.desc}</p>
                      </div>
                      <ArrowRight size={12} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: GOLD }} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sub-section: India Services */}
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: NAVY }}>🇮🇳 India Specific Services</h3>
                
                {/* Why Choose Us */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {indiaBenefits.map((b) => (
                      <div
                        key={b.title}
                        className="flex gap-4 p-4 rounded-xl border transition-all hover:border-[#C9963C]/40 hover:shadow-md"
                        style={{ borderColor: '#e8edf2' }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                        >
                          <b.icon size={16} style={{ color: GOLD }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>{b.title}</h4>
                          <p className="text-xs text-gray-500 text-justify" style={{ lineHeight: 1.5 }}>{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* India PRO Services */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-2" style={{ color: NAVY }}>India PRO &amp; Government Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {indiaProServices.map((service) => (
                      <Link
                        key={service.label}
                        to={service.href}
                        className="flex gap-4 p-4 rounded-xl border transition-all hover:border-[#C9963C]/40 hover:shadow-md group"
                        style={{ borderColor: '#e8edf2' }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                        >
                          <service.icon size={16} style={{ color: GOLD }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1 group-hover:text-[#C9963C] transition-colors" style={{ color: NAVY }}>
                            {service.label}
                          </h4>
                          <p className="text-xs text-gray-500 text-justify" style={{ lineHeight: 1.5 }}>{service.desc}</p>
                        </div>
                        <ArrowRight size={12} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: GOLD }} />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* India Tabbed Services */}
                <div className="mb-8">
                  <IndiaServicesTabs />
                </div>

                {/* NRI Advisory Note */}
                <div
                  className="rounded-xl p-5 flex gap-4 mb-8"
                  style={{ backgroundColor: 'rgba(201,150,60,0.06)', border: '1px solid rgba(201,150,60,0.3)' }}
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <div>
                    <h4 className="font-bold text-sm mb-1" style={{ color: NAVY }}>Important NRI Advisory</h4>
                    <p className="text-xs text-gray-600 text-justify" style={{ lineHeight: 1.6 }}>
                      As an NRI, your tax obligations span both India and your country of residence. Our experts
                      ensure you remain compliant with FEMA regulations, DTAA treaty benefits, and RBI guidelines
                      while optimizing your cross-border financial structure.
                    </p>
                  </div>
                </div>

                {/* Combined CTA strip */}
                <div
                  className="rounded-xl p-5 flex items-center justify-between gap-4"
                  style={{ backgroundColor: 'rgba(13,33,55,0.04)', border: `1px dashed ${GOLD}40` }}
                >
                  <div>
                    <div className="text-sm font-bold mb-0.5" style={{ color: NAVY }}>Need Assistance?</div>
                    <p className="text-xs text-gray-500 text-justify">Our experts are ready to assist with legal matters and India-UAE cross-border services.</p>
                  </div>
                  <Link
                    to="/contact"
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: GOLD }}
                  >
                    Contact Us
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* ── Right: sticky sidebar ── */}
          <div>
            <div className="sticky top-40">
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
                <p className="text-xs text-gray-500 mt-0.5">Based on 100+ client reviews</p>

                <div className="mt-4 space-y-2">
                  {[['Service Quality', 99], ['Communication', 97], ['Value for Money', 95], ['Expertise', 98]].map(([label, pct]) => (
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
                  href="https://wa.me/971551251185"
                  className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 mb-2"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+971551251185"
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
            Let's Build Your Business Together
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-justify" style={{ lineHeight: 1.7 }}>
            Join 100+ entrepreneurs who trusted DNEX to launch and grow their UAE business.
            Get expert guidance, transparent pricing, and end-to-end support.
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
