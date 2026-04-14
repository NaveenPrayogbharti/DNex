          import { Quote } from 'lucide-react';
          
          const GOLD = '#C9963C';
          const NAVY = '#0D2137';
          
          const testimonials = [
            {
              name: 'Marcus Heidler',
              role: 'CEO, FinTech Startup',
              company: 'Based in Frankfurt, Germany',
              avatar: 'MH',
              color: '#3b82f6',
              stars: 5,
              text: "DNex Consultancy handled everything from our DIFC company formation to all documents within **. The level of professionalism and communication was exceptional. I wouldn't trust anyone else with our UAE expansion.",
              service: 'Free Zone Company Setup',
            },
            {
              name: 'Priya Nair',
              role: 'Founder & MD',
              company: 'E-Commerce Business, India',
              avatar: 'PN',
              color: '#8b5cf6',
              stars: 5,
              text: "As a first-time business owner in Dubai, I was overwhelmed by the process. DNex Consultancy made it completely stress-free. My mainland license was ready in * days, and their pricing was exactly as quoted — no hidden costs.",
              service: 'Mainland Company Formation',
            },
            {
              name: 'James Okafor',
              role: 'Managing Partner',
              company: 'Consulting Firm, Nigeria',
              avatar: 'JO',
              color: '#10b981',
              stars: 5,
              text: "The VAT registration and corporate tax compliance services have been a lifesaver. They proactively flagged issues I wasn't even aware of and resolved them quickly. Highly recommend for any international business owner.",
              service: 'Tax & Compliance',
            },
            {
              name: 'Sarah Al-Rashidi',
              role: 'Operations Director',
              company: 'Real Estate Investment, Kuwait',
              avatar: 'SR',
              color: '#f59e0b',
              stars: 5,
              text: "We needed a bank account for our holding company.DNex Consultancy coordinated everything simultaneously and delivered ahead of schedule. Outstanding service.",
              service: 'Banking',
            },
            {
              name: 'Aleksei Petrov',
              role: 'Technology Entrepreneur',
              company: 'SaaS Company, Russia',
              avatar: 'AP',
              color: '#ef4444',
              stars: 5,
              text: "Set up my DMCC free zone company with DNex Consultancy in just * days. The dedicated account manager was available on WhatsApp round the clock. Best investment I made for my Dubai expansion.",
              service: 'DMCC Free Zone Setup',
            },
            {
              name: 'Amara Diallo',
              role: 'Director',
              company: "Trading Company, Côte d'Ivoire",
              avatar: 'AD',
              color: '#06b6d4',
              stars: 5,
              text: "The PRO services team is remarkable. Document attestation, government liaison, and license amendments all handled professionally. I've referred 4 of my business associates to DNex Consultancy already.",
              service: 'PRO Services',
            },
          ];
          
          function StarRating({ count }: { count: number }) {
            return (
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill={i < count ? GOLD : '#e5e7eb'} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            );
          }
          
          export function Testimonials() {
            return (
              <section className="py-24" style={{ backgroundColor: '#F8FAFC' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  {/* Header */}
                  <div className="text-center mb-16">
                    <div
                      className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                      style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
                    >
                      Client Reviews
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
                      Trusted by Entrepreneurs Worldwide
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto" style={{ lineHeight: 1.7 }}>
                      Over ** businesses from ** countries have chosen DNex Consultancy to launch and grow in the UAE.
                    </p>
          
                    {/* Aggregate rating */}
                    <div className="flex items-center justify-center gap-3 mt-5">
                      <StarRating count={5} />
                      <span className="font-bold" style={{ color: NAVY }}>4.9/5</span>
                      <span className="text-gray-400 text-sm">from **** verified reviews</span>
                    </div>
                  </div>
          
                  {/* Testimonials grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                      <div
                        key={t.name}
                        className="bg-white rounded-2xl p-7 relative hover:shadow-lg transition-shadow"
                        style={{ border: '1px solid #e8edf2' }}
                      >
                        {/* Quote icon */}
                        <div
                          className="absolute top-6 right-6 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(201,150,60,0.08)' }}
                        >
                          <Quote size={16} style={{ color: GOLD }} />
                        </div>
          
                        {/* Stars */}
                        <StarRating count={t.stars} />
          
                        {/* Service tag */}
                        <div
                          className="mt-3 mb-4 inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: 'rgba(13,33,55,0.06)', color: NAVY }}
                        >
                          {t.service}
                        </div>
          
                        
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">"{t.text}"</p>
          
                        
                        <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #f0f0f0' }}>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ backgroundColor: t.color }}
                          >
                            {t.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: NAVY }}>{t.name}</div>
                            <div className="text-xs text-gray-400">{t.role} · {t.company}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
          
                  {/* View all reviews link */}
                  <div className="text-center mt-10">
                    <a
                      href="#"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: NAVY }}
                    >
                      View All **** Reviews on Google &amp; Trustpilot
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
            );
          } 