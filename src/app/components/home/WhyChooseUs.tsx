import { Shield, Clock, DollarSign, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import businessImage from '../../../assets/images/business_meeting.png';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const reasons = [
  {
    icon: Clock,
    title: 'Fast Processing',
    description:
      'Company setups in FreeZone completed within  business days. We prioritize speed without compromising accuracy.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description:
      'No hidden fees. No surprises. You see a full cost breakdown upfront before committing to any service.',
  },
  {
    icon: Users,
    title: 'Expert Consultants',
    description:
      'Our team includes former government officials, legal experts, and seasoned UAE business advisors.',
  },
  {
    icon: Shield,
    title: 'Government-Approved Partner',
    description:
      'Officially registered with ISO and other UAE free zone authorities.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: image + floating cards */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: '68%' }}>
              <img
                src={businessImage}
                alt="Expert Business Consultants"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(13,33,55,0.6) 0%, transparent 60%)' }}
              />
            </div>

            {/* Floating stat card */}
            <div
              className="absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-xl p-5 flex items-center gap-4"
              style={{ border: `1px solid #e8edf2` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,150,60,0.12)' }}
              >
                <Shield size={22} style={{ color: GOLD }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: NAVY }}>ISO 9001</div>
                <div className="text-xs text-gray-500">Certified Partner</div>
              </div>
            </div>

            {/* Floating trust card */}
            <div
              className="absolute -top-5 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-2"
              style={{ border: '1px solid #e8edf2' }}
            >
              <CheckCircle size={16} style={{ color: '#22c55e' }} />
              <span className="text-xs font-semibold text-gray-700">Government-licenced Partner</span>
            </div>
          </div>

          {/* Right: content */}
          <div className="order-1 lg:order-2">
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
            >
              Why Choose Us
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
              Dubai's One of the  Trusted<br />Business Setup Partner
            </h2>

            <p className="text-gray-500 mb-10 text-justify" style={{ lineHeight: 1.7 }}>
              With over a 15 of experience and a team of specialists, we've helped multiple organisations
              ,entrepreneurs, startups, and multinationals establish their presence in the UAE.
            </p>

            {/* Reasons grid */}
            <div className="space-y-6">
              {reasons.map((r) => (
                <div key={r.title} className="flex gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                  >
                    <r.icon size={20} style={{ color: GOLD }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>
                      {r.title}
                    </h4>
                    <p className="text-sm text-gray-500 text-justify" style={{ lineHeight: 1.65 }}>
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications - ISO only */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Certifications &amp; Approvals
              </p>
              <div className="flex flex-wrap gap-2">
                <div
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                  style={{ borderColor: '#dde3ea', color: '#374151', backgroundColor: '#fff' }}
                >
                  ISO 9001
                </div>
              </div>
            </div>

            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-sm group"
              style={{ color: NAVY }}
            >
              Learn More About Us
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
