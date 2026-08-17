import { Link } from 'react-router';
import { ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import { useContentStore } from '../../../store/contentStore';
import banner from "../../../assets/images/dnex_bg.jpeg";

const GOLD = '#C9963C';
const NAVY = '#0D2137';



const stats = [
  { number: '15 Years', label: 'Experienced Management' },
  { number: '100%', label: 'Client Satisfaction' },
  { number: '7 Days', label: 'Avg. Setup Time' },
  { number: 'UAE', label: 'Mainland and Free Zones Covered' },
];

const badges = [
  '100% Client Satisfaction',
  'Government Licensed Partner',
  '7 Days Average Setup Time',
];

export function Hero() {
  const { getValue } = useContentStore();

  return (
    <section className="relative flex items-center" style={{ minHeight: '100vh' }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={banner}
          alt="Hero Banner"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(1.4)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(110deg, rgba(13,33,55,0.8) 0%, rgba(13,33,55,0.7) 55%, rgba(13,33,55,0.6) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-48">
        <div className="max-w-[640px]">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-7"
            style={{ borderColor: 'rgba(201,150,60,0.5)', backgroundColor: 'rgba(201,150,60,0.12)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GOLD }}></span>
            <span className="text-sm font-medium" style={{ color: GOLD }}>
              UAE's one of the trusted Business Setup Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-white mb-5 whitespace-pre-wrap"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-1px',
            }}
            dangerouslySetInnerHTML={{ __html: getValue('hero_headline', 'Start Your Business<br />in UAE <span style="color: #C9963C">The Right Way.</span>') }}
          />

          <p className="text-lg text-slate-300 mb-8 max-w-[520px]" style={{ lineHeight: 1.65 }}>
            {getValue('hero_subheadline', 'From company formation to setup, Tax compliance, Banking support and PRO services we handle everything so you can focus on building your UAE business.')}
          </p>

          {/* Trust bullets */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-10">
            {badges.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle size={15} style={{ color: GOLD }} />
                <span className="text-sm text-slate-300">{b}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/leadform"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95 shadow-lg"
              style={{ backgroundColor: GOLD }}
            >
              {getValue('hero_cta_primary', 'Start Your Business')}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/leadform"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border-2 text-white hover:bg-white transition-all group"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              <MessageCircle size={18} />
              <span className="group-hover:text-[#0D2137] transition-colors">
                {getValue('hero_cta_secondary', 'Talk to Consultant')}
              </span>
            </Link>
          </div>

          {/* Rating - removed */}

        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-t-2xl shadow-2xl grid grid-cols-2 md:grid-cols-4 overflow-hidden"
            style={{ backgroundColor: '#fff' }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`px-6 py-6 text-center ${i < stats.length - 1 ? 'border-r border-gray-100' : ''}`}
              >
                <div
                  className="text-4xl font-bold relative inline-block"
                  style={{ color: NAVY, letterSpacing: '-0.5px' }}
                >
                  {stat.number}
                  {stat.number === '15 Years' && (
                    <span
                      title="*T&C Apply"
                      style={{ color: GOLD, fontSize: '0.7rem', verticalAlign: 'super', cursor: 'default', marginLeft: '2px' }}
                    >
                      ★
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}