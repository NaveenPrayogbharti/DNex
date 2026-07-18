import { useState, useEffect } from 'react';
import { Send, CheckCircle, Phone, Mail, MessageCircle } from 'lucide-react';
// No Supabase client needed — form data goes to our own Express backend.
// Backend: POST /api/leads → Prisma → Supabase PostgreSQL (server-side, no RLS issues)

const GOLD = '#C9963C';
const NAVY = '#0D2137';



const countries = [
  'India', 'Pakistan', 'United Kingdom', 'USA', 'Germany', 'France',
  'Russia', 'China', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Egypt',
  'Nigeria', 'South Africa', 'Australia', 'Canada', 'Singapore', 'Other',
];



import { getStoredServices } from '../../../lib/servicesStore';

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    service: "",
    message: "",
  });

  useEffect(() => {
    const services = getStoredServices().filter(s => s.active).map(s => s.title);
    setActiveServices(services);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // VITE_BACKEND_API_URL is '' in production (same-origin Express server).
    // Falls back to localhost:3001 only in dev when variable is absent.
    const apiBase = import.meta.env.VITE_BACKEND_API_URL !== undefined
      ? import.meta.env.VITE_BACKEND_API_URL   // '' in prod → relative URLs
      : 'http://localhost:3001';               // dev fallback

    try {
      const res = await fetch(`${apiBase}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          service_needed: formData.service,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Lead submit error:', err);
      alert('Could not connect to the server. Please try again later.');
    }
  };




  return (
    <section className="pt-40 pb-24 min-h-screen" style={{ backgroundColor: NAVY }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div>
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
            >
              Get Consultation
            </div>

            <h2
              className="text-white mb-4"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              Start Your UAE Business Journey Today
            </h2>
            <p className="text-slate-400 mb-10" style={{ lineHeight: 1.7 }}>
              Get a free consultation with our senior UAE business consultant. We'll advise on
              the best structure, economic zone, and setup strategy tailored to your business goals.
            </p>

            {/* Contact options */}
            <div className="space-y-4 mb-10">
              {[
                { icon: Phone, label: 'Call Us', value: '+971 555542841', href: 'tel:+971 555542841' },
                { icon: Phone, label: 'Call Us', value: '+91 8851742425', href: 'tel:+91 8851742425' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+971 555542841', href: 'https://wa.me/971555542841' },
                { icon: Mail, label: 'Email', value: 'info@dnex.ae', href: 'mailto:info@dnex.ae' },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:opacity-90 group"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}
                  >
                    <c.icon size={18} style={{ color: GOLD }} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{c.label}</div>
                    <div className="text-white font-medium text-sm">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Trust points */}
            <div className="space-y-2">
              {[
                'Response within 1 business hour',
                'No commitment required',
                'Completely confidential',
                'Expert consultant assigned to you',
              ].map((t) => (
                <div key={t} className="flex items-center gap-2.5">
                  <CheckCircle size={15} style={{ color: GOLD }} />
                  <span className="text-sm text-slate-300">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                >
                  <CheckCircle size={32} style={{ color: GOLD }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: NAVY }}>
                  Thank You!
                </h3>
                <p className="text-gray-500 text-sm">
                  Your consultation request has been received. Our expert will contact you within 4 business hour.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-semibold"
                  style={{ color: GOLD }}
                >
                  Submit another inquiry →
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
                  Get Consultation
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Fill out the form and we'll get back to you within 4 hour.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Smith"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 555 000 0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Country of Residence *
                      </label>
                      <select
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors bg-white text-gray-700"
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Service Needed *
                    </label>
                    <select
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors bg-white text-gray-700"
                    >
                      <option value="">Select a service</option>
                      {activeServices.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your business idea or any specific requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: GOLD }}
                  >
                    <Send size={16} />
                    Get Consultation
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    By submitting, you agree to our{' '}
                    <a href="#" className="underline">Privacy Policy</a>.
                    We never share your data with third parties.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
