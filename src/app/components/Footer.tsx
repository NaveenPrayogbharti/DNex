import { Link } from 'react-router';
import {
  Phone, Mail, MapPin,
  Linkedin, Twitter, Facebook, Instagram, Youtube,
  ArrowRight, Shield,
} from 'lucide-react';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

const footerLinks = {
  'Business Setup': [
    { label: 'Mainland Company Formation', href: '/mainland' },
    { label: 'Offshore Company Formation', href: '/offshore' },
    { label: 'Holding Company Formation', href: '/offshore' },
    { label: 'Free Zone Company Setup', href: '/free-zone' },
    { label: 'Branch Office Setup', href: '/branch' },
    { label: 'Civil Companies', href: '/trade-license' },
    { label: 'Office Setup Services', href: '/license-renewal' },
  ],
  'Banking Support': [
    { label: 'Corporate Banking Assistance', href: '/investor-visa' },
    { label: 'Mortgage Banking', href: '/golden-visa' },
    { label: 'NRO Account Assistance', href: '/employment-visa' },
    { label: 'Overseas Direct Investment (ODI) Assistance', href: '/emirates-id' },
  ],
  'Our Services': [
    { label: 'VAT Registration', href: '/vat-registration' },
    { label: 'Corporate Tax Services', href: '/corporate-tax' },
    { label: 'Accounting & Bookkeeping', href: '/accounting' },
    { label: 'Document Attestation', href: '/attestation' },
    { label: 'Notary Services', href: '/notary' },
    { label: 'Compliance Services', href: '/compliance' },
  ],
};

export function Footer() {
  return (
    <footer style={{ backgroundColor: NAVY, fontFamily: "'Inter', sans-serif" }}>
      {/* Newsletter bar */}
      <div style={{ backgroundColor: '#0a1b2e', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-lg font-bold">Stay Updated on UAE Business Laws</h3>
              <p className="text-slate-400 text-sm mt-1">
                Get expert insights, regulatory updates, and business tips delivered to your inbox.
              </p>
            </div>
            <form
              className="flex w-full md:w-auto gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2.5 rounded-lg text-sm bg-white/10 text-white placeholder-slate-400 border border-white/15 focus:outline-none focus:border-[#C9963C] w-full md:w-64 transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shrink-0 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: GOLD }}
              >
                Subscribe
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
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}
              >
                <span style={{ color: GOLD, fontWeight: 800, fontSize: '18px' }}>D</span>
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-none">DNex Consulting</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: GOLD, letterSpacing: '1.2px' }}>
                  DEDICATION 'N' EXCELLENCE
                </div>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Dubai's one of the most trusted business setup and legal services platform. We help entrepreneurs,
              startups, and investors establish and grow their business in the UAE with confidence.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <a href="tel:+97144441234" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                <Phone size={15} style={{ color: GOLD }} />
                +971 555542841
              </a>
              <a href="tel:+97144441234" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                <Phone size={15} style={{ color: GOLD }} />
                +971 551251185
              </a>
              <a href="mailto:info@dubizsetup.ae" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                <Mail size={15} style={{ color: GOLD }} />
                info@dnex.ae
              </a>
              <div className="flex items-start gap-3 text-sm text-slate-300">
                <MapPin size={15} style={{ color: GOLD, flexShrink: 0, marginTop: '2px' }} />
                Business Centre,Sharjah Publishing City Free Zone,
                Sharjah, United Arab Emirates
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: Linkedin, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Facebook, href: 'https://www.facebook.com/share/1TLUVEXNWE/' },
                { Icon: Instagram, href: 'https://www.instagram.com/dnex_ae?utm_source=qr&igsh=MXBhMWc0YmRybDNrYQ==' },
                { Icon: Youtube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <Icon size={16} className="text-slate-300" />
                </a>
              ))}
            </div>
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
                      className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
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
      </div>

      {/* Trust badges strip */}
      <div style={{ backgroundColor: '#0a1b2e', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
              {[
                'DED Registered Partner',
                'DIFC Approved',
                'DMCC Certified',
                'ISO 9001 Certified',
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <Shield size={13} style={{ color: GOLD }} />
                  <span className="text-xs text-slate-400">{badge}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-5 text-xs text-slate-500">
              <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
              <Link to="/careers" className="hover:text-slate-300 transition-colors">Careers</Link>
              <Link to="/sitemap" className="hover:text-slate-300 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ backgroundColor: '#07121e' }}>
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