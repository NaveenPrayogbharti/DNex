import { Link } from 'react-router';
import { CheckCircle, ArrowRight } from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const plans = [
  {
    name: 'Basic',
    subtitle: 'For solo entrepreneurs & freelancers',
    price: 'AED *****',
    period: 'one-time setup',
    features: [
      'Trade License (Single Activity)',
      'Free Zone Registration',
      'Company Stamp',
      'Establishment Card',
      'Tax Consultancy',
      'Digital Document Delivery',
      'Email Support',
    ],
    notIncluded: ['Tax Consultancy', 'Bank Account Assistance', 'PRO Support'],
    cta: 'Get Started',
    href: '/contact',
    featured: false,
  },
  {
    name: 'Standard',
    subtitle: 'Most popular for startups & SMEs',
    price: 'AED *****',
    period: 'one-time setup',
    features: [
      'Trade License (Up to 3 Activities)',
      'Free Zone or Mainland',
      'Company Stamp & MOA',
      'Establishment Card',
      'Accounting and Bookkeeping',
      'Investor Document Processing',
      'Emirates ID Assistance',
      'Bank Account Introduction',
      'Dedicated Account Manager',
      'Priority Support',
    ],
    notIncluded: ['VAT Registration', 'Accounting Setup'],
    cta: 'Start Now',
    href: '/contact',
    featured: true,
  },
  {
    name: 'Premium',
    subtitle: 'Full-service for established businesses',
    price: 'AED *****',
    period: 'one-time setup',
    features: [
      'Trade License (Unlimited Activities)',
      'Mainland + Free Zone Options',
      'Company Stamp, MOA & AOA',
      'Establishment Card',
      'Accounting and Bookkeeping',
      'Tax Consultancy',
      'Emirates ID for All',
      'Bank Account Opening',
      'VAT Registration',
      'Accounting Setup (3 months)',
      'Dedicated Senior Consultant',
      'Priority + WhatsApp Support',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    href: '/contact',
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
          >
            Pricing
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
            Transparent, All-Inclusive Packages
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto" style={{ lineHeight: 1.7 }}>
            No hidden government fees. No surprise charges. Choose the package that fits your
            business stage and scale up anytime.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl overflow-hidden transition-all hover:shadow-xl"
              style={{
                border: plan.featured ? `2px solid ${GOLD}` : '1px solid #e8edf2',
                transform: plan.featured ? 'scale(1.03)' : 'scale(1)',
                boxShadow: plan.featured ? '0 20px 60px rgba(201,150,60,0.15)' : 'none',
              }}
            >
              {/* Featured badge */}
              {plan.featured && (
                <div
                  className="text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  ✦ Most Popular Choice
                </div>
              )}

              <div
                className="p-8"
                style={{ backgroundColor: plan.featured ? NAVY : '#fff' }}
              >
                {/* Plan name */}
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: GOLD }}
                >
                  {plan.name}
                </div>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: plan.featured ? '#fff' : NAVY }}
                >
                  {plan.subtitle}
                </h3>

                {/* Price */}
                <div className="my-6 pb-6" style={{ borderBottom: `1px solid ${plan.featured ? 'rgba(255,255,255,0.1)' : '#f0f0f0'}` }}>
                  <div
                    className="text-4xl font-bold"
                    style={{ color: plan.featured ? '#fff' : NAVY, letterSpacing: '-1px' }}
                  >
                    {plan.price}
                  </div>
                  <div
                    className="text-sm mt-1"
                    style={{ color: plan.featured ? '#94a3b8' : '#9ca3af' }}
                  >
                    {plan.period}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <CheckCircle
                        size={15}
                        className="shrink-0 mt-0.5"
                        style={{ color: GOLD }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: plan.featured ? '#cbd5e1' : '#374151' }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                      <span
                        className="text-sm line-through"
                        style={{ color: plan.featured ? '#94a3b8' : '#9ca3af' }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to={plan.href}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: plan.featured ? GOLD : 'transparent',
                    color: plan.featured ? '#fff' : NAVY,
                    border: plan.featured ? 'none' : `2px solid ${NAVY}`,
                  }}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-gray-400 mt-8">
          * Prices are exclusive of government/authority fees which vary by free zone and license type.
          <Link to="/contact" className="font-semibold ml-1" style={{ color: GOLD }}>
            Contact us for a custom quote.
          </Link>
        </p>
      </div>
    </section>
  );
}
