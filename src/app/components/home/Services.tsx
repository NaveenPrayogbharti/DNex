import { Link } from 'react-router';
import { Globe, Building2, Briefcase, Receipt, Calculator, CreditCard, ArrowRight } from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const services = [
  {
    icon: Globe,
    title: 'Free Zone Company Setup',
    description:
      "A free zone company is a business entity incorporated within a designated free zone in UAE that allows 100% foreign ownership with simplified setup and modern infrastructure. It offers a flexible and cost-effective way to start a business in UAE.",
    highlight: false,
    badge: 'Most Popular',
  },
  {
    icon: Building2,
    title: 'Mainland Company Formation',
    description:
      'A main land company in UAE is an onshore business entity registered with Department of Economic Development (D.E.D) of the respective emirate, allowed to operate anywhere within in UAE and internationally without geo-graphical resistance.',
    highlight: false,
  },
  {
    icon: Briefcase,
    title: 'Offshore Company Formation',
    description:
      'An offshore company in UAE is a legal business entity incorporated for the purpose of conducting business activities outside UAE, mainly used for international business, asset holding or investment outside the country.',
    highlight: false,
  },
  {
    icon: Receipt,
    title: 'NRO ACCOUNT ASSISTANCE',
    description:
      'NRO account assistance refers to professional support services provided to Non-resident Indian (NRIs) for opening, managing and complying with requirements related to a Non-Resident ordinary NRO bank account. These services include guidance on documentation, account opening procedures, fund transfers, tax-related compliance, repatriation rules, and handling income earned in India such as rent, dividends, pensions, or investments. NRO account assistance helps NRIs manage their finances.',
    highlight: false,
  },
  {
    icon: Calculator,
    title: 'OVERSEAS DIRECT INVESTMENT (ODI) ASSISTANCE',
    description:
      'We provide comprehensive assistance for Overseas Direct Investment (ODI) to individuals and companies intending to expand their business internationally. Our services include guidance on RBI regulations, preparation of required documentation, coordination with the authorized dealer banks, filing of forms related to ODI and compliance with applicable regulatory requirements for setting up or investing in foreign entities.',
    highlight: false,
  },
  {
    icon: CreditCard,
    title: 'Corporate Banking Assistance',
    description:
      'Banking setup services assist businesses in opening corporate bank accounts in the UAE with the required documentation and compliance support. This ensures a smooth banking process for new and existing companies.Corporate banking assistance may also include support for multi-currency accounts, trade finance, payroll services, merchant facilities, online banking setup, foreign exchange transactions, and cash management solutions. These services help businesses maintain seamless operations.',
    highlight: false,
  },
];

export function Services() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
          >
            Our Services
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
            Everything You Need to Launch &amp; Grow
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-justify" style={{ lineHeight: 1.7 }}>
            From company registration to ongoing compliance  our end-to-end services cover every
            aspect of doing business in the UAE.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.title}
              to="/our-services"
              className="group relative rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: s.highlight ? NAVY : '#fff',
                borderColor: s.highlight ? 'transparent' : '#e8edf2',
              }}
            >
              {s.badge && (
                <div
                  className="absolute top-5 right-5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: GOLD, color: '#fff' }}
                >
                  {s.badge}
                </div>
              )}

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  backgroundColor: s.highlight ? 'rgba(201,150,60,0.15)' : 'rgba(201,150,60,0.08)',
                }}
              >
                <s.icon size={24} style={{ color: GOLD }} />
              </div>

              <h3
                className="text-lg font-bold mb-3"
                style={{ color: s.highlight ? '#fff' : NAVY }}
              >
                {s.title}
              </h3>

              <p
                className="text-sm mb-5 leading-relaxed text-justify"
                style={{ color: s.highlight ? '#94a3b8' : '#6b7280' }}
              >
                {s.description}
              </p>

              <div
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: GOLD }}
              >
                Learn More
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-500 mb-4">Looking for something specific?</p>
          <Link
            to="/our-services"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: NAVY }}
          >
            View All Services
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}