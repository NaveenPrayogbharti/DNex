const GOLD = '#C9963C';
const NAVY = '#0D2137';

// ── Partner Logos (text-based for now, replace src with real logos) ─────────
const partners = [
  { name: 'DMCC', tagline: 'Dubai Multi Commodities Centre' },
  { name: 'DIFC', tagline: 'Dubai International Financial Centre' },
  { name: 'IFZA', tagline: 'International Free Zone Authority' },
  { name: 'DAFZA', tagline: 'Dubai Airport Free Zone' },
  { name: 'RAKEZ', tagline: 'Ras Al Khaimah Economic Zone' },
  { name: 'SHAMS', tagline: 'Sharjah Media City' },
  { name: 'ADGM', tagline: 'Abu Dhabi Global Market' },
  { name: 'DED', tagline: "Dubai Dept. of Economic Development" },
];

// ── Client Testimonials / Logos ───────────────────────────────────────────
const clients = [
  { initials: 'TF', name: 'TechFlow FZE',         country: 'Germany',      sector: 'Technology'    },
  { initials: 'AS', name: 'AlphaStone LLC',        country: 'India',        sector: 'Trading'       },
  { initials: 'BG', name: 'Brightgate Group',      country: 'UK',           sector: 'Finance'       },
  { initials: 'NV', name: 'NovaTrade FZCO',        country: 'Russia',       sector: 'Commodities'   },
  { initials: 'MH', name: 'Meridian Holdings',     country: 'UAE',          sector: 'Real Estate'   },
  { initials: 'PL', name: 'PrimeLink Corp',        country: 'Nigeria',      sector: 'Logistics'     },
  { initials: 'CE', name: 'CloudEdge Tech',        country: 'USA',          sector: 'SaaS'          },
  { initials: 'GW', name: 'GreenWave Global',      country: 'Netherlands',  sector: 'Sustainability' },
];

const AVATAR_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b',
  '#ef4444','#06b6d4','#ec4899','#84cc16',
];

export function PartnersClients() {
  return (
    <section className="py-20 bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Our Partners ── */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
            >
              Official Partners
            </div>
            <h2
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 700, color: NAVY, letterSpacing: '-0.5px' }}
            >
              Our Registered Partners
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-3" style={{ lineHeight: 1.7 }}>
              We are an approved and registered partner with UAE's leading free zones and regulatory authorities,
              enabling fast-tracked approvals and direct access to government channels.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {partners.map((p, i) => (
              <div
                key={p.name}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border transition-all hover:shadow-md hover:border-[#C9963C]/40 group"
                style={{ borderColor: '#e8edf2', backgroundColor: '#FAFBFC' }}
              >
                {/* Logo placeholder — replace with <img> when you have real logos */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-3 font-extrabold text-sm group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: NAVY, color: GOLD, letterSpacing: '-0.5px' }}
                >
                  {p.name}
                </div>
                <div className="text-xs text-gray-400 text-center leading-snug">{p.tagline}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 mb-20" />

        {/* ── Our Clients ── */}
        <div>
          <div className="text-center mb-12">
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
            >
              Trusted Clients
            </div>
            <h2
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 700, color: NAVY, letterSpacing: '-0.5px' }}
            >
              Businesses We've Helped Build
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-3" style={{ lineHeight: 1.7 }}>
              From first-time entrepreneurs to multinational expansions — here's a snapshot of the companies
              that trusted DNEX to get them started in the UAE.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {clients.map((c, i) => (
              <div
                key={c.name}
                className="p-5 rounded-2xl border transition-all hover:shadow-md hover:border-[#C9963C]/40"
                style={{ borderColor: '#e8edf2', backgroundColor: '#FAFBFC' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: NAVY }}>{c.name}</div>
                    <div className="text-xs text-gray-400">{c.country}</div>
                  </div>
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(201,150,60,0.1)', color: GOLD }}
                >
                  {c.sector}
                </span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '10,000+', label: 'Businesses Served' },
              { number: '50+',     label: 'Countries Represented' },
              { number: '15 yrs',  label: 'Industry Experience' },
              { number: '98%',     label: 'Client Retention Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold mb-1" style={{ color: GOLD, letterSpacing: '-0.5px' }}>
                  {stat.number}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
