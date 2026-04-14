import { Link } from 'react-router';
import { ArrowLeft, Home, Search, Phone } from 'lucide-react';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

export function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-xl w-full text-center">
        {/* 404 Number */}
        <div
          className="text-[8rem] font-black leading-none select-none mb-2"
          style={{
            color: 'transparent',
            WebkitTextStroke: `2px ${GOLD}`,
            opacity: 0.25,
          }}
        >
          404
        </div>

        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: NAVY }}
        >
          <span style={{ color: GOLD, fontWeight: 800, fontSize: '28px' }}>D</span>
        </div>

        <h1
          className="mb-3"
          style={{ fontSize: '2rem', fontWeight: 700, color: NAVY, letterSpacing: '-0.5px' }}
        >
          Page Not Found
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let us help you find what you need.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: NAVY }}
          >
            <Home size={16} />
            Back to Home
          </Link>
          <a
            href="tel:+97144441234"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:opacity-90"
            style={{ borderColor: GOLD, color: GOLD }}
          >
            <Phone size={16} />
            Call Us
          </a>
        </div>

        {/* Quick links */}
        <div
          className="rounded-2xl p-6 bg-white"
          style={{ border: '1px solid #e8edf2' }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: GOLD }}
          >
            Popular Services
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Free Zone Setup', href: '/free-zone' },
              { label: 'Mainland Company', href: '/mainland' },
              { label: 'Investor Visa', href: '/investor-visa' },
              { label: 'VAT Registration', href: '/vat-registration' },
              { label: 'Golden Visa', href: '/golden-visa' },
              { label: 'Corporate Tax', href: '/corporate-tax' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50"
                style={{ color: '#374151' }}
              >
                <ArrowLeft
                  size={12}
                  className="rotate-180"
                  style={{ color: GOLD }}
                />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
