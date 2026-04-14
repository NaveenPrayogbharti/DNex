import { Shield, Clock, DollarSign, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const TEAM_IMAGE =
  'https://images.unsplash.com/photo-1642522029693-20b2ab875b19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBjb3Jwb3JhdGUlMjBvZmZpY2V8ZW58MXx8fHwxNzcyMTc3NTE4fDA&ixlib=rb-4.1.0&q=80&w=1080';

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
      'Officially registered with DED, DIFC, DMCC, and other UAE free zone authorities.',
  },
];

const certifications = ['DED Registered', 'DMCC Certified', 'DIFC Approved', 'ISO 9001', 'FTA Registered'];

export function WhyChooseUs() {
  return (
    <section className="py-24" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: image + floating cards */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: '68%' }}>
              <img
                src={TEAM_IMAGE}
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

            <p className="text-gray-500 mb-10" style={{ lineHeight: 1.7 }}>
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
                    <p className="text-sm text-gray-500" style={{ lineHeight: 1.65 }}>
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Certifications &amp; Approvals
              </p>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <div
                    key={cert}
                    className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                    style={{ borderColor: '#dde3ea', color: '#374151', backgroundColor: '#fff' }}
                  >
                    {cert}
                  </div>
                ))}
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
