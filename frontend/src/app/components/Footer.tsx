import { Link } from 'react-router';
import {
  Phone, Mail, MapPin,
  Linkedin, Twitter, Facebook, Instagram, Youtube,
  ArrowRight, Shield, CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import logo from '../../assets/images/website_logo.png';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

const footerLinks = {
  'Business Setup': [
    { label: 'Mainland Company Formation', href: '/our-services' },
    { label: 'Offshore Company Formation', href: '/our-services' },
    { label: 'Holding Company Formation', href: '/our-services' },
    { label: 'Free Zone Company Setup', href: '/our-services' },
    { label: 'Branch Office Setup', href: '/our-services' },
    { label: 'Civil Companies', href: '/our-services' },
    { label: 'Office Setup Services', href: '/our-services' },
  ],
  'Banking Support': [
    { label: 'Corporate Banking Assistance', href: '/our-services' },
    { label: 'Mortgage Banking', href: '/our-services' },
    { label: 'NRO Account Assistance', href: '/our-services' },
    { label: 'Overseas Direct Investment (ODI)', href: '/our-services' },
  ],
  'Our Services': [
    { label: 'VAT Registration', href: '/our-services' },
    { label: 'Corporate Tax Services', href: '/our-services' },
    { label: 'Accounting & Bookkeeping', href: '/our-services' },
    { label: 'Audit Services', href: '/our-services' },
    { label: 'GoAML Registration', href: '/our-services' },
    { label: 'Compliance Services', href: '/our-services' },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <footer style={{ backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      {/* Newsletter bar */}
      <div style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-lg font-bold">Stay Updated on UAE Business Laws</h3>
              <p className="text-slate-400 text-sm mt-1 text-justify">
                Get expert insights, regulatory updates, and business tips delivered to your inbox.
              </p>
            </div>
            <form
              className="flex w-full md:w-auto gap-2"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading' || status === 'success'}
                className="px-4 py-2.5 rounded-lg text-sm bg-white/10 text-white placeholder-slate-400 border border-white/15 focus:outline-none focus:border-[#C9963C] w-full md:w-64 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shrink-0 transition-opacity flex items-center justify-center min-w-[110px]"
                style={{ backgroundColor: status === 'success' ? '#10b981' : GOLD, opacity: status === 'loading' ? 0.7 : 1 }}
              >
                {status === 'loading' ? 'Sending...' : status === 'success' ? <><CheckCircle2 size={16} className="mr-1"/> Subscribed</> : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo - same as navbar */}
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img
                src={logo}
                alt="DNex Consulting Logo"
                className="h-[54px] w-auto object-contain"
              />
            </Link>

            <p className="text-gray-500 text-sm leading-relaxed max-w-xs text-justify">
              UAE's one of the most trusted business setup and legal services platform. We help entrepreneurs,
              startups, and investors establish and grow their business in the UAE with confidence.
            </p>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-sm font-bold uppercase tracking-wider mb-5"
                style={{ color: GOLD }}
              >
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-500 hover:text-[#0D2137] transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"
                        style={{ color: GOLD }}
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Full-width Contact & Social Section */}
        <div className="mt-12">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
            
            {/* Contact */}
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-8 gap-y-4 flex-1">
              <a href="tel:+971551251185" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0D2137] transition-colors">
                <Phone size={15} style={{ color: GOLD }} />
                <span>+971 551251185</span>
              </a>
              <a href="mailto:info@dnex.ae" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0D2137] transition-colors">
                <Mail size={15} style={{ color: GOLD }} />
                <span>info@dnex.ae</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-600 max-w-full">
                <MapPin size={15} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
                <span>Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 max-w-full">
                <MapPin size={15} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
                <span>116. Al Khaleez Centre. Bur Dubai.</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 max-w-full">
                <MapPin size={15} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
                <span>B-89, Madinat Al Mataar Dubai South, Dubai UAE.</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 shrink-0">
              {[
                { Icon: Linkedin, href: 'https://www.linkedin.com/company/dnex-ae/' },
                { Icon: Twitter, href: '#' },
                { Icon: Facebook, href: 'https://www.facebook.com/share/1TLUVEXNWE/' },
                { Icon: Instagram, href: 'https://www.instagram.com/dnex.ae?igsh=MXgxd3ltNHQyYXBuYw%3D%3D&utm_source=qr' },
                { Icon: Youtube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgba(13,33,55,0.08)' }}
                >
                  <Icon size={16} style={{ color: NAVY }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower footer - Blue background */}
      <div style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Shield size={13} style={{ color: GOLD }} />
                <span className="text-xs text-slate-300">ISO 9001 Certified</span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ backgroundColor: '#0a1b2e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} DNex Consulting FZC. All rights reserved.
            <br />
            * Prices and Time promised are exclusive of government/authority fees  and depends on type of license and vary by free zone and license type.
          </p>
        </div>
      </div>
    </footer>
  );
}
