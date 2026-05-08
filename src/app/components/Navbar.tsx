import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import logo from "@/assets/images/logo.png";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  Building2,
  Globe,
  Anchor,
  GitBranch,
  Lightbulb,
  UserCog,
  Briefcase,
  Users,
  UserCheck,
  Laptop,
  Receipt,
  BookOpen,
  ClipboardCheck,
  FileText,
  Stamp,
  Building,
  ArrowRight,
  MessageCircle,
  Mail,
  FileCheck,
  Landmark,
  Handshake,
  IdCard,
  RefreshCw,
  Edit3,
  FolderOpen,
  ShieldCheck
} from "lucide-react";

const NAVY = "#0D2137";
const GOLD = "#C9963C";

interface MenuItem {
  icon: React.ComponentType<{
    size?: number;
    style?: React.CSSProperties;
  }>;
  label: string;
  desc: string;
  href: string;
}

interface MegaMenuCategory {
  title: string;
  items: MenuItem[];
}

interface MegaMenuConfig {
  items?: MenuItem[];
  categories?: MegaMenuCategory[];
  href?: string;
  featured: {
    title: string;
    desc: string;
    cta: string;
    href: string;
  };
}

const megaMenuConfig: Record<string, MegaMenuConfig> = {
  "Business Setup": {
    items: [
      { icon: Building2, label: "Mainland Company Formation",  desc: "A main land company in UAE is an onshore business entity registered with D.E.D, allowed to operate anywhere within in UAE and internationally.", href: "/our-services#business-setup" },
      { icon: Anchor,    label: "Offshore Company Formation",   desc: "An offshore company in UAE is incorporated to conduct business outside UAE, mainly used for international business or asset holding.",        href: "/our-services#business-setup" },
      { icon: Lightbulb, label: "Holding Company Formation",    desc: "A holding company owns sufficient voting stock in other companies to exercise control over their management and policies.",                   href: "/our-services#business-setup" },
      { icon: Globe,     label: "Free Zone Company Setup",      desc: "Allows 100% foreign ownership with simplified setup and modern infrastructure. A flexible, cost-effective way to start.",                    href: "/our-services#business-setup" },
      { icon: GitBranch, label: "Branch Office Setup",          desc: "Allows international companies to expand their presence and operate under their parent company's brand with direct market access.",           href: "/our-services#business-setup" },
      { icon: UserCog,   label: "Civil Companies",              desc: "A professional partnership formed by individuals to provide professional and intellectual services.",                                          href: "/our-services#business-setup" },
      { icon: UserCog,   label: "Real Estate Business",         desc: "Engaged in activities related to the buying, selling, leasing, management, or development of real properties.",                             href: "/our-services#business-setup" },
      { icon: UserCog,   label: "Office Setup Services",        desc: "Professional services to assist in establishing a functional office space, including infrastructure and compliance.",                        href: "/our-services#business-setup" },
    ],
    featured: {
      title: "Start in a Free Zone",
      desc: "100% ownership and fast registration in Dubai's premier free zones. Free zone company formation offers entrepreneurs and businesses simplified setup procedures, tax advantages, full repatriation of profits, and access to world-class infrastructure. It is an ideal option for startups, SMEs, and international businesses looking to establish a strong presence in the UAE with minimal restrictions and faster business licensing processes.Free zones also provide flexible office solutions, visa support, and industry-specific business environments tailored to different sectors. Businesses benefit from streamlined regulations, lower setup costs, and easier access to global markets.",
      cta: "Explore Free Zones",
      href: "/our-services#business-setup",
    },
  },
  "Banking Support": {
    items: [
      { icon: Briefcase,  label: "Corporate Banking Assistance",        desc: "Assist businesses in opening corporate bank accounts in the UAE with the required documentation and compliance support.", href: "/our-services#corporate-banking" },
      { icon: Users,      label: "Mortgage Banking",                     desc: "Guidance and support for securing property financing in the UAE, helping obtain suitable mortgage solutions.",         href: "/our-services#mortgage" },
      { icon: UserCheck,  label: "NRO Account Assistance",               desc: "Professional support services provided to Non-resident Indian (NRIs) for opening and managing an NRO bank account.",    href: "/our-services#nro" },
      { icon: Laptop,     label: "Overseas Direct Investment (ODI)",      desc: "Comprehensive assistance for ODI including RBI regulations guidance, documentation, and authorized dealer coordination.",href: "/our-services#odi" },
    ],
    featured: {
      title: "Banking Support",
      desc: "Banking Services for investors, professionals, and entrepreneurs. Seamless account opening, compliance support, and tailored banking solutions to help businesses manage finances efficiently.",
      cta: "Apply Now",
      href: "/our-services#banking",
    },
  },
  "PRO Services": {
    items: [
      { icon: FileCheck,   label: "Visa Processing",        desc: "Expert handling of all visa processing requirements.",           href: "/our-services#pro-services" },
      { icon: Briefcase,   label: "Employment Visa",        desc: "Seamless employment visa issuance for your staff.",              href: "/our-services#pro-services" },
      { icon: Landmark,    label: "Investor Visa",          desc: "Secure your UAE residency through investments.",                 href: "/our-services#pro-services" },
      { icon: Handshake,   label: "Partner Visa",           desc: "Business partner and shareholder visa services.",               href: "/our-services#pro-services" },
      { icon: Users,       label: "Family Visa",            desc: "Sponsor your family members with ease.",                        href: "/our-services#pro-services" },
      { icon: Globe,       label: "Labour & Immigration",   desc: "Full support for labour and immigration quotas.",               href: "/our-services#pro-services" },
      { icon: ClipboardCheck, label: "Work permits",        desc: "Fast-track work permit processing.",                           href: "/our-services#pro-services" },
      { icon: IdCard,      label: "Labour cards",           desc: "Issuance and renewal of corporate labour cards.",               href: "/our-services#pro-services" },
      { icon: Stamp,       label: "Immigration approvals",  desc: "Clearing complex immigration hurdles quickly.",                 href: "/our-services#pro-services" },
      { icon: Building2,   label: "Trade License Services", desc: "New issuance and amendments to trade licenses.",               href: "/our-services#pro-services" },
      { icon: RefreshCw,   label: "License renewal",        desc: "Timely reminders and processing for renewals.",                href: "/our-services#pro-services" },
      { icon: Edit3,       label: "Company Amendments",     desc: "Updating MOAs, shares, and partnerships.",                    href: "/our-services#pro-services" },
      { icon: FolderOpen,  label: "Document Clearing",      desc: "Dedicated PROs for fast document clearing.",                  href: "/our-services#pro-services" },
      { icon: ShieldCheck, label: "Govt. Approvals",        desc: "End-to-end representation at government bodies.",              href: "/our-services#pro-services" },
    ],
    featured: {
      title: "Full PRO Support",
      desc: "Our dedicated PRO team handles all government paperwork, approvals, and administrative procedures so you don't have to. From visa processing and trade license renewals to document attestation and immigration services, we ensure every step is completed smoothly and on time. Our team works closely with government departments to minimize delays and simplify complex procedures. This allows businesses to focus on growth while we manage the legal and administrative requirements.Our proactive support helps businesses stay compliant with changing government regulations and deadlines. With end-to-end PRO services, clients benefit from a hassle-free and efficient business setup experience.",
      cta: "Learn More",
      href: "/our-services#pro-services",
    },
  },
  "Our Services": {
    href: "/our-services",
    categories: [
      {
        title: "Taxation Services",
        items: [
          { icon: Receipt,        label: "Corporate Tax Registration", desc: "Expert registration services for UAE Corporate Tax compliance.",   href: "/our-services#taxation" },
          { icon: FileText,       label: "VAT Registration",            desc: "Complete support for standard VAT registration and compliance.",   href: "/our-services#taxation" },
          { icon: ClipboardCheck, label: "CT Filing",                   desc: "Timely and accurate Corporate Tax return filing.",                  href: "/our-services#taxation" },
          { icon: BookOpen,       label: "VAT Filing",                  desc: "Quarterly and monthly VAT return preparation and filings.",         href: "/our-services#taxation" },
        ],
      },
      {
        title: "Accounting & Audit",
        items: [
          { icon: BookOpen,       label: "Accounting & Bookkeeping",    desc: "Comprehensive financial tracking, reporting, and book management.", href: "/our-services#accounting" },
          { icon: ClipboardCheck, label: "Audit Services",              desc: "Independent auditing to ensure complete financial accuracy.",       href: "/our-services#accounting" },
        ],
      },
      {
        title: "Compliance & Regulatory",
        items: [
          { icon: Building,       label: "GoAML Registration",          desc: "Anti-Money Laundering compliance setup and registration.",          href: "/our-services#compliance" },
          { icon: ClipboardCheck, label: "APR Filling",                 desc: "Annual Percentage Rate regulatory filings and compliance.",          href: "/our-services#compliance" },
          { icon: BookOpen,       label: "FEMA Compliances",            desc: "Foreign Exchange Management Act advisory and legal support.",        href: "/our-services#compliance" },
        ],
      },
    ],
    featured: {
      title: "All Services",
      desc: "Explore our complete portfolio of UAE business and compliance services. From company formation and banking support to PRO services and licensing, we provide end-to-end solutions tailored to your business needs. Our expert team ensures a smooth process, helping you save time, reduce complexity, and focus on growth.",
      cta: "See All Services",
      href: "/our-services",
    },
  },
  "India Services": {
    href: "/our-services#india-services",
    categories: [
      {
        title: "Taxation Services",
        items: [
          { icon: Receipt,        label: "ITR Filing",              desc: "Income Tax Return filing for individuals, HUFs, and companies in India.",             href: "/our-services#india-services" },
          { icon: FileText,       label: "GST Registration",        desc: "Complete support for GST registration and compliance within India.",                   href: "/our-services#india-services" },
          { icon: ClipboardCheck, label: "GST Filing",              desc: "Monthly, quarterly, and annual GST return preparation and filing.",                    href: "/our-services#india-services" },
          { icon: BookOpen,       label: "TDS Compliance",          desc: "TDS deduction, filing, and compliance management services.",                          href: "/our-services#india-services" },
        ],
      },
      {
        title: "Accounting & Audit",
        items: [
          { icon: BookOpen,       label: "Accounting & Bookkeeping", desc: "Comprehensive financial tracking and book management for Indian entities.",           href: "/our-services#india-services" },
          { icon: ClipboardCheck, label: "Audit Services",           desc: "Statutory and internal auditing for Indian companies.",                               href: "/our-services#india-services" },
          { icon: FileText,       label: "ROC Filings",              desc: "Annual and event-based filings with the Registrar of Companies.",                     href: "/our-services#india-services" },
        ],
      },
      {
        title: "Compliance & Regulatory",
        items: [
          { icon: Building,       label: "FEMA Compliance",         desc: "Foreign Exchange Management Act advisory for NRIs and businesses.",                    href: "/our-services#india-services" },
          { icon: ClipboardCheck, label: "RBI Filings",             desc: "Reserve Bank of India mandatory filings and FCTRS reporting.",                         href: "/our-services#india-services" },
          { icon: BookOpen,       label: "NRI Services",            desc: "Comprehensive NRI advisory — NRO/NRE accounts, repatriation, tax planning.",           href: "/our-services#india-services" },
        ],
      },
    ],
    featured: {
      title: "🇮🇳 India Services",
      desc: "Expert services for NRIs and India-based businesses operating across UAE and India. We assist with NRO accounts, business expansion, documentation, compliance, taxation, and cross-border financial support. Our services are designed to simplify operations and help clients manage their business interests seamlessly in both countries.",
      cta: "Explore India Services",
      href: "/our-services#india-services",
    },
  },
};

// ─── Scroll-Spy Tabs (Our Services page only) ──────────────────────────────
const SCROLL_TABS = [
  { id: 'business-setup', label: 'Business Setup' },
  { id: 'banking',        label: 'Banking Support' },
  { id: 'pro-services',  label: 'PRO Services' },
  { id: 'taxation',      label: 'Taxation Services' },
  { id: 'accounting',    label: 'Accounting & Audit' },
  { id: 'compliance',    label: 'Compliance & Regulatory' },
  { id: 'india-services',label: '🇮🇳 India Services' },
];

export function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>(SCROLL_TABS[0].id);
  const location = useLocation();
  const isServicesPage = location.pathname === '/our-services';

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabBarRef  = useRef<HTMLDivElement>(null);
  const tabRefs    = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Scroll-spy: IntersectionObserver watches each section
  useEffect(() => {
    if (!isServicesPage) return;
    const els = SCROLL_TABS
      .map(t => document.getElementById(t.id))
      .filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveTab(e.target.id);
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    els.forEach(el => obs.observe(el));
    return () => els.forEach(el => obs.unobserve(el));
  }, [isServicesPage]);

  // Auto-scroll tab bar so active tab stays centered
  useEffect(() => {
    const btn = tabRefs.current[activeTab];
    if (btn && tabBarRef.current) {
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTab]);

  const scrollToTab = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 150; // header (110px) + tab bar (40px)
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handleEnter = (menu: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(menu);
    setActiveCategoryIndex(0);
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };

  const handleDropdownEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <>
      <style>
        {`
          @keyframes ticker {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-ticker {
            display: inline-flex;
            animation: ticker 25s linear infinite;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
          /* Custom scrollbar for mega menu */
          .mega-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .mega-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .mega-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .mega-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          /* Hide scrollbar for tab bar */
          .tab-scroll::-webkit-scrollbar { display: none; }
          .tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top announcement bar */}
        <div style={{ backgroundColor: NAVY }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2">

            {/* 👇 NEW: Scrolling Updates Ticker 👇 */}
            <div className="hidden md:flex items-center gap-3 overflow-hidden w-1/2 relative pr-4">
              {/* Gold Badge */}
              <div
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shrink-0 z-10 relative"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                UAE Law Updates
              </div>

              {/* Scrolling Text */}
              <div className="overflow-hidden w-full relative">
                <div className="animate-ticker text-xs text-slate-300 flex items-center gap-10 whitespace-nowrap cursor-default">
                  <span className="hover:text-white transition-colors">
                    <strong style={{ color: GOLD }}>• Corporate Tax:</strong> New guidelines released for Free Zone entities (2026).
                  </span>
                  <span className="hover:text-white transition-colors">
                    <strong style={{ color: GOLD }}>• Golden Visa:</strong> Minimum property investment thresholds updated.
                  </span>
                  <span className="hover:text-white transition-colors">
                    <strong style={{ color: GOLD }}>• Emiratisation:</strong> Targets expanded for mainland companies with 20+ employees.
                  </span>
                </div>
              </div>
            </div>
            {/* 👆 END OF NEW TICKER 👆 */}

            {/* Contact Info (Right Side) */}
            <div className="flex items-center gap-5 ml-auto">
              <a
                href="tel:+971555542841"
                className="flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: GOLD }}
              >
                <Phone size={11} />
                +971 555542841
              </a>
              <a
                href="tel:+971551251185"
                className="flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: GOLD }}
              >
                <Phone size={11} />
                +971 551251185
              </a>
              <a
                href="https://wa.me/971501234567"
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <MessageCircle size={11} />
                WhatsApp Us
              </a>
              <a
                href="mailto:info@dnex.ae"
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <Mail size={11} />
                info@dnex.ae
              </a>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div
          className="bg-white"
          style={{
            boxShadow: activeMenu ? "none" : "0 2px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-[68px]">
              {/* Logo Section */}
              <Link to="/" className="flex items-center gap-3 shrink-0 h-full">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-full w-auto object-contain"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  to="/"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0D2137] transition-colors"
                >
                  Home
                </Link>

                {Object.keys(megaMenuConfig).map((menuName) => {
                  const config = megaMenuConfig[menuName];
                  return (
                    <div
                      key={menuName}
                      onMouseEnter={() => handleEnter(menuName)}
                      onMouseLeave={handleLeave}
                      className="relative"
                    >
                      {config.href ? (
                        <Link
                          to={config.href}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors"
                          style={{
                            color: activeMenu === menuName ? GOLD : "#374151",
                          }}
                        >
                          {menuName}
                          <ChevronDown
                            size={13}
                            className={`transition-transform duration-200 ${activeMenu === menuName ? "rotate-180" : ""}`}
                          />
                        </Link>
                      ) : (
                        <button
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors"
                          style={{
                            color: activeMenu === menuName ? GOLD : "#374151",
                          }}
                        >
                          {menuName}
                          <ChevronDown
                            size={13}
                            className={`transition-transform duration-200 ${activeMenu === menuName ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}

                <Link
                  to="/about"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#0D2137] transition-colors"
                >
                  About
                </Link>
              </nav>

              {/* CTA + Mobile Toggle */}
              <div className="flex items-center gap-3">
                <Link
                  to="/contact"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: GOLD }}
                >
                  Contact Us
                </Link>
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scroll-Spy Tab Bar (Our Services page only) ── */}
        {isServicesPage && (
          <div
            className="bg-white border-b border-gray-100"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div
                ref={tabBarRef}
                className="flex items-center gap-1 overflow-x-auto py-2.5 tab-scroll"
              >
                {SCROLL_TABS.map(tab => (
                  <button
                    key={tab.id}
                    ref={el => { tabRefs.current[tab.id] = el; }}
                    onClick={() => scrollToTab(tab.id)}
                    className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
                    style={{
                      backgroundColor: activeTab === tab.id ? NAVY : 'transparent',
                      color:           activeTab === tab.id ? '#fff' : '#6b7280',
                      border:          activeTab === tab.id ? 'none' : '1px solid #e5e7eb',
                      transform:       activeTab === tab.id ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mega Menu Dropdown */}
        {activeMenu && megaMenuConfig[activeMenu] && (
          <div
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleLeave}
            className="absolute left-0 right-0 bg-white"
            style={{
              top: "100%",
              maxHeight: "calc(100vh - 110px)",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              borderTop: `3px solid ${GOLD}`,
              zIndex: 100,
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
              <div className="grid grid-cols-3 gap-8">

                {/* --- Left Content --- */}
                <div className="col-span-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-4"
                    style={{ color: GOLD }}
                  >
                    {activeMenu} Services
                  </p>

                  {/* Check if this menu uses Categories (Our Services / India Services) */}
                  {megaMenuConfig[activeMenu].categories ? (
                    <div className="flex gap-6">
                      {/* Side-Tabs — fixed height, scrollable */}
                      <div
                        className="w-1/3 flex flex-col gap-1 border-r border-gray-100 pr-4 mega-scroll"
                        style={{ maxHeight: '52vh', overflowY: 'auto' }}
                      >
                        {megaMenuConfig[activeMenu].categories!.map((category, idx) => (
                          <button
                            key={category.title}
                            onMouseEnter={() => setActiveCategoryIndex(idx)}
                            onClick={() => setActiveCategoryIndex(idx)}
                            className={`text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                              activeCategoryIndex === idx
                                ? 'bg-slate-50 text-[#0D2137]'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50/50'
                            }`}
                          >
                            {category.title}
                          </button>
                        ))}
                      </div>

                      {/* Items panel — scrollable */}
                      <div
                        className="w-2/3 pl-2 mega-scroll"
                        style={{ maxHeight: '52vh', overflowY: 'auto' }}
                      >
                        <div className="grid grid-cols-1 gap-y-1 pr-2">
                          {megaMenuConfig[activeMenu].categories![activeCategoryIndex].items.map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setActiveMenu(null)}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                              >
                                <item.icon size={15} style={{ color: GOLD }} />
                              </div>
                              <div>
                                <div className="text-sm font-bold group-hover:text-[#0D2137] transition-colors mb-0.5" style={{ color: '#1a2a3a' }}>
                                  {item.label}
                                </div>
                                <div className="text-xs text-gray-500 leading-relaxed text-justify pr-2">
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Flat grid layout — scrollable */
                    <div
                      className="grid grid-cols-2 gap-x-6 gap-y-1 mega-scroll pr-2"
                      style={{ maxHeight: '52vh', overflowY: 'auto' }}
                    >
                      {megaMenuConfig[activeMenu].items?.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setActiveMenu(null)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                          >
                            <item.icon size={15} style={{ color: GOLD }} />
                          </div>
                          <div>
                            <div className="text-sm font-bold group-hover:text-[#0D2137] transition-colors mb-0.5" style={{ color: '#1a2a3a' }}>
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500 leading-relaxed text-justify pr-2">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- Featured Panel --- */}
                <div className="self-start">
                  <div
                    className="rounded-xl p-5 flex flex-col justify-between mega-scroll"
                    style={{ backgroundColor: NAVY, maxHeight: '52vh', overflowY: 'auto' }}
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                        Featured
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        {megaMenuConfig[activeMenu].featured.title}
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {megaMenuConfig[activeMenu].featured.desc}
                      </p>
                    </div>
                    <Link
                      to={megaMenuConfig[activeMenu].featured.href}
                      onClick={() => setActiveMenu(null)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 shrink-0"
                      style={{ backgroundColor: GOLD, color: 'white' }}
                    >
                      {megaMenuConfig[activeMenu].featured.cta}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom strip */}
              {/* REDUCED MARGIN/PADDING: mt-4 pt-3 */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  <Link
                    to="/contact"
                    className="font-semibold"
                    style={{ color: "#FFC000" }}
                    onClick={() => setActiveMenu(null)}
                  >
                    Talk to our expert consultants →
                  </Link>
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Consultants Available
                  </span>
                  <span>Mon–Sat</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Mobile Menu --- */}
        {mobileOpen && (
          <div
            className="lg:hidden bg-white border-t border-gray-100 fixed left-0 right-0 bottom-0 z-50 mega-scroll"
            style={{ top: '110px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="px-4 py-4 space-y-1 pb-24">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-800 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>

              {Object.keys(megaMenuConfig).map((menuName) => {
                const config = megaMenuConfig[menuName];
                const isExpanded = mobileExpanded === menuName;
                return (
                  <div key={menuName} className="rounded-xl overflow-hidden">
                    {/* Row: Link + Toggle */}
                    <div className="flex items-stretch">
                      {config.href && (
                        <Link
                          to={config.href}
                          className="flex-1 flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-800 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {menuName}
                        </Link>
                      )}
                      <button
                        className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold text-gray-800 hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                          config.href ? 'border-l border-gray-100' : 'w-full justify-between'
                        }`}
                        onClick={() => setMobileExpanded(isExpanded ? null : menuName)}
                        aria-expanded={isExpanded}
                      >
                        {!config.href && <span>{menuName}</span>}
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 shrink-0 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          style={{ color: isExpanded ? GOLD : '#6b7280' }}
                        />
                      </button>
                    </div>

                    {/* Expandable content */}
                    {isExpanded && (
                      <div className="bg-slate-50/60 border-t border-gray-100 px-3 py-3 space-y-1">
                        {config.categories ? (
                          config.categories.map((category) => (
                            <div key={category.title} className="mb-4">
                              <div
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md mb-1"
                                style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.08)' }}
                              >
                                {category.title}
                              </div>
                              <div className="space-y-0.5">
                                {category.items.map((item) => (
                                  <Link
                                    key={item.label}
                                    to={item.href}
                                    className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 rounded-xl hover:bg-white active:bg-white transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    <div
                                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                                    >
                                      <item.icon size={13} style={{ color: GOLD }} />
                                    </div>
                                    <span className="font-medium">{item.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="space-y-0.5">
                            {config.items?.map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 rounded-xl hover:bg-white active:bg-white transition-colors"
                                onClick={() => setMobileOpen(false)}
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
                                >
                                  <item.icon size={13} style={{ color: GOLD }} />
                                </div>
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                to="/about"
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-800 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>

              <div className="pt-4 pb-2">
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 w-full px-5 py-4 rounded-xl text-sm font-semibold text-white active:opacity-80 transition-opacity"
                  style={{ backgroundColor: GOLD }}
                  onClick={() => setMobileOpen(false)}
                >
                  Contact Us
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mega menu backdrop overlay */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40"
          style={{
            backgroundColor: "rgba(0,0,0,0.25)",
            top: "110px",
          }}
          onMouseEnter={() => setActiveMenu(null)}
        />
      )}
    </>
  );
}